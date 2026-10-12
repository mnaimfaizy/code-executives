/**
 * The script that runs inside the sandbox iframe.
 *
 * It is a string because it is embedded in the iframe's srcdoc, so it is plain
 * ES5-style JavaScript with no imports. It receives the learner's code by
 * postMessage, runs it, and reports once nothing is pending any more: it wraps
 * the timer functions to know which timers are still due, and lets promise
 * work drain before it checks. A run that still has timers at the execution
 * timeout (an interval that is never cleared) ends there with what it has
 * collected and a note in the Console.
 *
 * A traced run also gets the tracer runtime as source and its limits. The script
 * builds the tracer, hands it to the instrumented code, and sends the trace back
 * with the report. A trace that has stopped (the step limit, or an error nothing
 * caught) ends the run there, with the steps recorded so far.
 *
 * In a traced run the timers are the tracer's own, on a virtual clock: instrumented
 * code never reaches the wrappers below, and a timer takes no real time. The script
 * gives the tracer a way to run one turn of its event loop as a task, and the run
 * is finished once the tracer has no turn left to run.
 *
 * A run with a check (an exercise) gets one more argument, the check hook. The code
 * the host sends ends by handing the entry function to the hook; the hook calls it
 * once with the check's arguments and compares what it returns with the expected
 * value, here, in this script's own scope. The verdict travels in the report, never
 * through the Console, and the learner's code cannot read the expected value. Such a
 * run ends with its synchronous part: a check does not wait for timers or promises.
 */
export const SANDBOX_RUNTIME_SOURCE = String.raw`
(function() {
  'use strict';

  // Block network APIs with helpful error messages
  function blockedNetwork(name) {
    return function() {
      throw new Error(name + ' is blocked in the sandbox for security. Network access is not allowed.');
    };
  }
  Object.defineProperty(window, 'fetch', { get: blockedNetwork('fetch'), configurable: false });
  Object.defineProperty(window, 'XMLHttpRequest', { get: blockedNetwork('XMLHttpRequest'), configurable: false });
  Object.defineProperty(window, 'WebSocket', { get: blockedNetwork('WebSocket'), configurable: false });
  Object.defineProperty(window, 'EventSource', { get: blockedNetwork('EventSource'), configurable: false });

  // Block additional dangerous APIs
  Object.defineProperty(window, 'importScripts', { get: blockedNetwork('importScripts'), configurable: false });
  window.open = blockedNetwork('window.open');
  navigator.sendBeacon = blockedNetwork('navigator.sendBeacon');

  // Capture real parent reference for postMessage before we lock it down
  var _hostWindow = window.parent;

  // Block access to parent/opener (defense-in-depth beyond sandbox attr)
  try { Object.defineProperty(window, 'parent', { get: function() { return window; }, configurable: false }); } catch(e) {}
  try { Object.defineProperty(window, 'top', { get: function() { return window; }, configurable: false }); } catch(e) {}
  try { Object.defineProperty(window, 'opener', { get: function() { return null; }, configurable: false }); } catch(e) {}

  // The real timer functions. The learner's code gets the tracking wrappers below.
  var _setTimeout = window.setTimeout.bind(window);
  var _clearTimeout = window.clearTimeout.bind(window);
  var _setInterval = window.setInterval.bind(window);
  var _clearInterval = window.clearInterval.bind(window);

  var entries = [];
  var MAX_ENTRIES = 500;
  var MAX_ENTRY_LENGTH = 10240;

  // Taken before any learner code runs, so a check does not compare with replaced built-ins
  var _isArray = Array.isArray;
  var _keys = Object.keys;
  var _hasOwn = Object.prototype.hasOwnProperty;
  var _toString = Object.prototype.toString;
  var _stringify = JSON.stringify;
  var _parse = JSON.parse;

  /**
   * The run in progress: { id, timers, done, failed, error, checkQueued, capId, tracer,
   * maxSteps, channel, check, checkResult }
   */
  var run = null;

  function safeStringify(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'function') return val.toString();
    if (typeof val === 'symbol') return val.toString();
    try {
      var seen = new WeakSet();
      return JSON.stringify(val, function(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        if (typeof value === 'bigint') return value.toString() + 'n';
        return value;
      }, 2);
    } catch (e) {
      return String(val);
    }
  }

  function truncate(str) {
    if (str.length > MAX_ENTRY_LENGTH) return str.slice(0, MAX_ENTRY_LENGTH) + '... (truncated)';
    return str;
  }

  function captureConsole(type) {
    return function() {
      if (entries.length >= MAX_ENTRIES) return;
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        // A string prints as written, like a browser console; inside an object it keeps its quotes
        var arg = arguments[i];
        args.push(truncate(typeof arg === 'string' ? arg : safeStringify(arg)));
      }
      entries.push({ type: type, args: args });
    };
  }

  function installConsole() {
    console.log = captureConsole('log');
    console.warn = captureConsole('warn');
    console.error = captureConsole('error');
    console.info = captureConsole('info');
  }
  installConsole();

  // Line of the top frame that belongs to code made by new Function
  function stackLine(err) {
    if (!(err instanceof Error) || !err.stack) return undefined;
    var match = err.stack.match(/<anonymous>:(\d+):\d+/) || err.stack.match(/Function:(\d+):\d+/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  // Engines put a wrapper above the body of new Function; measure how many lines it takes
  var WRAPPER_LINES = (function() {
    try {
      new Function('throw new Error("probe")')();
    } catch (e) {
      var line = stackLine(e);
      return line ? line - 1 : 0;
    }
    return 0;
  })();

  // Line of the code that was run where an error came from, when it can be known
  function errorLine(err) {
    var line = stackLine(err);
    return line && line > WRAPPER_LINES ? line - WRAPPER_LINES : undefined;
  }

  function describeError(err) {
    if (err instanceof Error) return (err.name || 'Error') + ': ' + err.message;
    return String(err);
  }

  function uncaught(r, err, prefix) {
    if (r !== run || r.done) return;
    var line;
    if (r.tracer) {
      // The tracer's own signal is how it stops a run, and after the first error it
      // stops everything that still runs: neither is an error of the learner's code
      if (r.failed || r.tracer.stopped(err)) return;
      r.tracer.fail(err);
      // Traced code is rewritten, so its stack lines mean nothing: the tracer knows the line
      var failure = r.tracer.getTrace().error;
      line = failure ? failure.line : undefined;
    } else {
      line = errorLine(err);
    }
    var message = describeError(err);
    r.failed = true;
    if (!r.error) r.error = message;
    entries.push({ type: 'error', args: [prefix + message], line: line });
  }

  // ---- Exercise checks ----

  // Structural equality: primitives by value (NaN equals NaN), arrays by position,
  // plain objects by their own keys. The expected value is plain data without cycles,
  // and the walk follows it, so it ends even when the actual value has a cycle.
  function sameValue(actual, expected) {
    if (actual === expected) return true;
    if (typeof actual === 'number' && typeof expected === 'number') {
      return actual !== actual && expected !== expected;
    }
    if (!actual || !expected || typeof actual !== 'object' || typeof expected !== 'object') return false;
    var i;
    if (_isArray(expected)) {
      if (!_isArray(actual) || actual.length !== expected.length) return false;
      for (i = 0; i < expected.length; i++) {
        if (!sameValue(actual[i], expected[i])) return false;
      }
      return true;
    }
    if (_isArray(actual) || _toString.call(actual) !== '[object Object]') return false;
    var keys = _keys(expected);
    if (_keys(actual).length !== keys.length) return false;
    for (i = 0; i < keys.length; i++) {
      if (!_hasOwn.call(actual, keys[i])) return false;
      if (!sameValue(actual[keys[i]], expected[keys[i]])) return false;
    }
    return true;
  }

  // For an exercise whose task says "any order": the same items, each as many times
  function sameInAnyOrder(actual, expected) {
    if (!_isArray(actual) || !_isArray(expected) || actual.length !== expected.length) return false;
    var used = [];
    for (var i = 0; i < expected.length; i++) {
      var found = false;
      for (var j = 0; j < actual.length && !found; j++) {
        if (!used[j] && sameValue(actual[j], expected[i])) { used[j] = true; found = true; }
      }
      if (!found) return false;
    }
    return true;
  }

  // What the learner's function returned, on one line, for the task panel
  function showValue(val) {
    if (val === undefined) return 'undefined';
    if (typeof val === 'function') return 'function ' + (val.name || '(anonymous)');
    if (typeof val === 'number' && (val !== val || val === Infinity || val === -Infinity)) return String(val);
    if (typeof val === 'symbol') return val.toString();
    if (typeof val === 'bigint') return val.toString() + 'n';
    if (val && typeof val === 'object' && !_isArray(val)) {
      var tag = _toString.call(val).slice(8, -1);
      if (tag !== 'Object') return tag;
    }
    try {
      var seen = new WeakSet();
      var shown = _stringify(val, function(key, value) {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        if (value === undefined) return '[undefined]';
        if (typeof value === 'function') return '[function]';
        if (typeof value === 'bigint') return value.toString() + 'n';
        return value;
      });
      return truncate(String(shown));
    } catch (e) {
      return String(val);
    }
  }

  // The hook a check run's code calls with the entry function. Only its first call counts.
  function checkHook(r) {
    return function(entry) {
      if (r.checkResult || r.done) return;
      if (typeof entry !== 'function') {
        r.checkResult = { status: 'missing' };
        return;
      }
      var actual;
      try {
        // A copy of its own, so nothing the function does to its arguments outlives the call
        actual = entry.apply(undefined, _parse(_stringify(r.check.args)));
      } catch (err) {
        if (r.tracer && r.tracer.stopped(err)) {
          // The step limit ended the call: the signal goes on and ends the run
          r.checkResult = { status: 'step-limit' };
          throw err;
        }
        r.checkResult = { status: 'threw', message: describeError(err) };
        return;
      }
      var pass = r.check.anyOrder
        ? sameInAnyOrder(actual, r.check.expected)
        : sameValue(actual, r.check.expected);
      r.checkResult = { status: pass ? 'pass' : 'fail', actual: showValue(actual) };
    };
  }

  // The verdict of a check run, also when the code never reached the hook
  function checkReport(r, trace) {
    if (r.checkResult) return r.checkResult;
    if (trace && trace.outcome === 'step-limit') return { status: 'step-limit' };
    if (r.error) return { status: 'threw', message: r.error, beforeCall: true };
    return { status: 'not-reached' };
  }

  function finish(r, type, error) {
    if (r.done) return;
    r.done = true;
    _clearTimeout(r.capId);
    r.timers.forEach(function(kind, id) {
      if (kind === 'interval') _clearInterval(id); else _clearTimeout(id);
    });
    r.timers.clear();
    // The tracer drops its own timers and takes its hooks off Promise.prototype
    var trace = null;
    if (r.tracer) {
      trace = r.tracer.getTrace();
      r.tracer.dispose();
    }
    if (r.channel) {
      r.channel.port1.close();
      r.channel = null;
    }
    if (r !== run) return;

    _hostWindow.postMessage({
      type: type,
      runId: r.id,
      error: error,
      entries: entries,
      // A check run's steps are not shown: the learner watches a check as a run of its own
      trace: r.check ? null : trace,
      check: r.check ? checkReport(r, trace) : undefined
    }, '*');
  }

  // Runs one turn of a traced run's event loop as a task of its own. A message is
  // not held back the way nested timers are (4 ms each), so a run with many timer
  // turns stays fast.
  function deferTurn(r) {
    return function(turn) {
      if (r.done) return;
      if (typeof MessageChannel !== 'function') {
        _setTimeout(turn, 0);
        return;
      }
      if (!r.channel) r.channel = new MessageChannel();
      r.channel.port1.onmessage = function() { if (!r.done) turn(); };
      r.channel.port2.postMessage(0);
    };
  }

  // True while a traced run's own event loop still has a turn to run
  function tracerBusy(r) {
    return !!r.tracer && r.tracer.pending();
  }

  // A trace that has stopped ends the run: nothing more can be recorded, and the
  // tracer stops whatever the code still tries to run
  function endStoppedTrace(r) {
    if (!r.tracer || r !== run || r.done) return false;
    var trace = r.tracer.getTrace();
    if (trace.outcome === 'completed') return false;
    if (trace.outcome === 'step-limit') {
      // The limit also counts loop turns and calls that record no step, such as an empty loop
      var limit = r.maxSteps.toLocaleString('en-US');
      entries.push({
        type: 'warn',
        args: [(trace.steps.length >= r.maxSteps
          ? 'Stopped after ' + limit + ' steps.'
          : 'Stopped after ' + limit + ' loop turns or calls that recorded no step.') +
          ' The steps recorded so far are kept.']
      });
    }
    finish(r, r.failed ? 'error' : 'result', r.error || undefined);
    return true;
  }

  // Report once no timer is pending, and a traced run's event loop has settled. The
  // check runs as a task of its own, so all promise work queued so far has drained
  // before it looks.
  function settleSoon(r) {
    if (endStoppedTrace(r)) return;
    if (r !== run || r.done || r.checkQueued) return;
    r.checkQueued = true;
    _setTimeout(function() {
      r.checkQueued = false;
      if (r.done || r.timers.size > 0 || tracerBusy(r)) return;
      // One more turn, so a promise rejection reported after this task still lands
      _setTimeout(function() {
        if (r.done || r.timers.size > 0 || tracerBusy(r)) return;
        finish(r, r.failed ? 'error' : 'result', r.error || undefined);
      }, 0);
    }, 0);
  }

  function callHandler(handler, args) {
    if (typeof handler === 'function') return handler.apply(window, args);
    return (0, eval)(String(handler));
  }

  window.setTimeout = function(handler, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var r = run;
    var id = _setTimeout(function() {
      if (r) r.timers.delete(id);
      try { callHandler(handler, args); } catch (err) { if (r) uncaught(r, err, 'Uncaught '); }
      if (r) settleSoon(r);
    }, delay);
    if (r && !r.done) r.timers.set(id, 'timeout');
    return id;
  };

  window.setInterval = function(handler, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var r = run;
    var id = _setInterval(function() {
      try { callHandler(handler, args); } catch (err) { if (r) uncaught(r, err, 'Uncaught '); }
      if (r) settleSoon(r);
    }, delay);
    if (r && !r.done) r.timers.set(id, 'interval');
    return id;
  };

  // Browsers keep timeouts and intervals in one list, so either clear function clears both
  function clearTimer(id) {
    _clearTimeout(id);
    if (run && run.timers.delete(id)) settleSoon(run);
  }
  window.clearTimeout = clearTimer;
  window.clearInterval = clearTimer;

  window.addEventListener('unhandledrejection', function(event) {
    if (!run || run.done) return;
    uncaught(run, event.reason, 'Uncaught (in promise) ');
    if (event.preventDefault) event.preventDefault();
    endStoppedTrace(run);
  });

  window.addEventListener('message', function(event) {
    var msg = event.data;
    if (!msg) return;

    // A run that is stopped or replaced ends without reporting
    if ((msg.type === 'cancel' || msg.type === 'execute') && run && !run.done) {
      var previous = run;
      run = null;
      finish(previous);
    }
    if (msg.type !== 'execute') return;
    // A listener the learner's code left behind in an earlier run does not see this
    // message, which may carry a check's expected value
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    entries = [];
    installConsole();

    var r = {
      id: msg.runId, timers: new Map(), done: false, failed: false, error: null,
      checkQueued: false, capId: 0, tracer: null, maxSteps: 0, channel: null,
      check: msg.check || null, checkResult: null
    };
    run = r;

    // The cap: a run that still has timers by now ends with what it has collected
    r.capId = _setTimeout(function() {
      if (r.done) return;
      var pending = r.timers.size;
      if (pending > 0) {
        entries.push({
          type: 'warn',
          args: ['Stopped after ' + (msg.timeout / 1000) + 's with ' + pending +
            (pending === 1 ? ' timer' : ' timers') +
            ' still pending. An interval that is never cleared keeps a run going.']
        });
      }
      finish(r, r.failed ? 'error' : 'result', r.error || undefined);
    }, msg.timeout);

    var fn;
    try {
      if (msg.tracer) {
        // Each step notes how many Console entries had been printed by then
        var createTracer = new Function('return (' + msg.tracer.runtime + ');')();
        r.tracer = createTracer(msg.tracer.limits, function() { return entries.length; }, {
          defer: deferTurn(r),
          uncaught: function(err) { uncaught(r, err, 'Uncaught '); },
          settled: function() { settleSoon(r); }
        });
        r.maxSteps = msg.tracer.limits.maxSteps;
        fn = r.check
          ? new Function(msg.tracer.name, msg.check.hook, msg.code)
          : new Function(msg.tracer.name, msg.code);
      } else {
        fn = r.check ? new Function('__untraced', msg.check.hook, msg.code) : new Function(msg.code);
      }
    } catch (err) {
      // The code did not parse, so nothing ran
      var parseError = describeError(err);
      r.error = parseError;
      entries.push({ type: 'error', args: [parseError] });
      finish(r, 'error', parseError);
      return;
    }

    try {
      if (r.check) fn(r.tracer, checkHook(r)); else fn(r.tracer);
    } catch (err) {
      uncaught(r, err, 'Uncaught ');
    }
    if (r.check) {
      // The verdict is in: timers and promises the code left behind are dropped
      finish(r, r.failed ? 'error' : 'result', r.error || undefined);
      return;
    }
    settleSoon(r);
  });

  _hostWindow.postMessage({ type: 'ready' }, '*');
})();
`;
