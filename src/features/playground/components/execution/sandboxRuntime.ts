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

  /** The run in progress: { id, timers, done, failed, error, checkQueued, capId } */
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

  // Line of the code that was run where an error came from, when it can be known.
  // Traced code is rewritten, so its stack lines mean nothing: the line of the last
  // step is used instead, and only while the synchronous part runs, because
  // callbacks inside expressions record no steps.
  function errorLine(err, isSync) {
    if (typeof window.__tracker__ !== 'undefined' && window.__tracker__) {
      if (!isSync) return undefined;
      try {
        var snapshots = window.__tracker__.getSnapshots();
        return snapshots.length > 0 ? snapshots[snapshots.length - 1].line || undefined : undefined;
      } catch (e) {
        return undefined;
      }
    }
    var line = stackLine(err);
    return line && line > WRAPPER_LINES ? line - WRAPPER_LINES : undefined;
  }

  function describeError(err) {
    if (err instanceof Error) return (err.name || 'Error') + ': ' + err.message;
    return String(err);
  }

  function uncaught(r, err, prefix, isSync) {
    if (r !== run || r.done) return;
    var message = describeError(err);
    r.failed = true;
    if (!r.error) r.error = message;
    entries.push({ type: 'error', args: [prefix + message], line: errorLine(err, isSync) });
  }

  function finish(r, type, error) {
    if (r.done) return;
    r.done = true;
    _clearTimeout(r.capId);
    r.timers.forEach(function(kind, id) {
      if (kind === 'interval') _clearInterval(id); else _clearTimeout(id);
    });
    r.timers.clear();
    if (r !== run) return;

    // If instrumented code injected a __tracker__, include its snapshots
    var snapshots = null;
    var totalSteps = 0;
    if (typeof window.__tracker__ !== 'undefined' && window.__tracker__) {
      try {
        snapshots = window.__tracker__.getSnapshots();
        totalSteps = window.__tracker__.getStepCount();
      } catch(e) { /* tracker may not be available */ }
    }
    _hostWindow.postMessage({
      type: type,
      runId: r.id,
      error: error,
      entries: entries,
      snapshots: snapshots,
      totalSteps: totalSteps
    }, '*');
  }

  // Report once no timer is pending. The check runs as a task of its own, so all
  // promise work queued so far has drained before it looks.
  function settleSoon(r) {
    if (r !== run || r.done || r.checkQueued) return;
    r.checkQueued = true;
    _setTimeout(function() {
      r.checkQueued = false;
      if (r.done || r.timers.size > 0) return;
      // One more turn, so a promise rejection reported after this task still lands
      _setTimeout(function() {
        if (r.done || r.timers.size > 0) return;
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
      try { callHandler(handler, args); } catch (err) { if (r) uncaught(r, err, 'Uncaught ', false); }
      if (r) settleSoon(r);
    }, delay);
    if (r && !r.done) r.timers.set(id, 'timeout');
    return id;
  };

  window.setInterval = function(handler, delay) {
    var args = Array.prototype.slice.call(arguments, 2);
    var r = run;
    var id = _setInterval(function() {
      try { callHandler(handler, args); } catch (err) { if (r) uncaught(r, err, 'Uncaught ', false); }
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
    uncaught(run, event.reason, 'Uncaught (in promise) ', false);
    if (event.preventDefault) event.preventDefault();
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

    entries = [];
    installConsole();
    try { window.__tracker__ = undefined; } catch(e) {}

    var r = { id: msg.runId, timers: new Map(), done: false, failed: false, error: null, checkQueued: false, capId: 0 };
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
      fn = new Function(msg.code);
    } catch (err) {
      // The code did not parse, so nothing ran
      var parseError = describeError(err);
      entries.push({ type: 'error', args: [parseError] });
      finish(r, 'error', parseError);
      return;
    }

    try {
      fn();
    } catch (err) {
      uncaught(r, err, 'Uncaught ', true);
    }
    settleSoon(r);
  });

  _hostWindow.postMessage({ type: 'ready' }, '*');
})();
`;
