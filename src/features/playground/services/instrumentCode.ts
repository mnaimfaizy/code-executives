/**
 * JavaScript Code Instrumentation Service
 *
 * Uses acorn to parse user code into an AST, then injects tracking calls
 * at key points (statements, function entry/exit, variable changes, async boundaries).
 * Uses astring to regenerate the instrumented code.
 *
 * The injected tracker calls communicate with a __tracker__ runtime object
 * that collects StateSnapshot data during execution.
 *
 * Security: Code is parsed (not eval'd) — syntax errors are caught at parse time.
 * The tracker is a pure data collector with no eval or dynamic code generation.
 */

import * as acorn from 'acorn';
import { generate } from 'astring';
import type { Node } from 'acorn';

/** Result of instrumenting code */
export interface InstrumentationResult {
  /** The instrumented code string ready for execution */
  instrumentedCode: string;
  /** Maps instrumented line numbers → original line numbers */
  sourceMap: Map<number, number>;
  /** Whether instrumentation succeeded */
  success: boolean;
  /** Error message if instrumentation failed */
  error?: string;
}

/** Maximum number of snapshots to prevent memory exhaustion */
const MAX_SNAPSHOTS = 1000;

/**
 * The tracker runtime code injected at the top of instrumented code.
 * This runs inside the sandbox iframe and collects execution state.
 */
function getTrackerRuntime(): string {
  return `
window.__tracker__ = (function() {
  var snapshots = [];
  var callStack = [];
  var stepCounter = 0;
  var MAX_STEPS = ${MAX_SNAPSHOTS};
  var consoleEntries = [];

  function safeClone(val, depth) {
    if (depth === undefined) depth = 0;
    if (depth > 3) return '(deep)';
    if (val === null) return null;
    if (val === undefined) return undefined;
    var t = typeof val;
    if (t === 'number' || t === 'string' || t === 'boolean') return val;
    if (t === 'function') return '(function ' + (val.name || 'anonymous') + ')';
    if (t === 'symbol') return val.toString();
    if (t === 'bigint') return val.toString() + 'n';
    if (Array.isArray(val)) {
      if (val.length > 20) return val.slice(0, 20).map(function(v) { return safeClone(v, depth + 1); }).concat(['...(' + val.length + ' total)']);
      return val.map(function(v) { return safeClone(v, depth + 1); });
    }
    if (t === 'object') {
      var result = {};
      var keys = Object.keys(val);
      var limit = Math.min(keys.length, 20);
      for (var i = 0; i < limit; i++) {
        try { result[keys[i]] = safeClone(val[keys[i]], depth + 1); } catch(e) { result[keys[i]] = '(error)'; }
      }
      if (keys.length > 20) result['...'] = '(' + keys.length + ' keys total)';
      return result;
    }
    return String(val);
  }

  function getType(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  }

  function captureVars(varsObj) {
    var result = [];
    var keys = Object.keys(varsObj);
    for (var i = 0; i < keys.length; i++) {
      var name = keys[i];
      var val = varsObj[name];
      result.push({ name: name, value: safeClone(val), type: getType(val) });
    }
    return result;
  }

  return {
    step: function(line, varsObj) {
      if (stepCounter >= MAX_STEPS) return;
      snapshots.push({
        step: stepCounter++,
        line: line,
        timestamp: Date.now(),
        callStack: callStack.slice(),
        variables: captureVars(varsObj || {}),
        heapObjects: [],
        microtaskQueue: [],
        macrotaskQueue: [],
        consoleOutput: consoleEntries.slice()
      });
    },
    enterFunction: function(name, line) {
      callStack.push({ functionName: name || '(anonymous)', line: line });
    },
    exitFunction: function() {
      callStack.pop();
    },
    logConsole: function(type, args) {
      consoleEntries.push({ id: 'c' + consoleEntries.length, type: type, args: args, timestamp: Date.now() });
    },
    getSnapshots: function() { return snapshots; },
    getStepCount: function() { return stepCounter; }
  };
})();

// Override console to also feed the tracker
(function() {
  var origLog = console.log, origWarn = console.warn, origError = console.error, origInfo = console.info;
  console.log = function() { var a = Array.prototype.slice.call(arguments); __tracker__.logConsole('log', a); if (origLog) origLog.apply(console, arguments); };
  console.warn = function() { var a = Array.prototype.slice.call(arguments); __tracker__.logConsole('warn', a); if (origWarn) origWarn.apply(console, arguments); };
  console.error = function() { var a = Array.prototype.slice.call(arguments); __tracker__.logConsole('error', a); if (origError) origError.apply(console, arguments); };
  console.info = function() { var a = Array.prototype.slice.call(arguments); __tracker__.logConsole('info', a); if (origInfo) origInfo.apply(console, arguments); };
})();
`;
}

// Acorn node types with body arrays that contain statements
interface AcornNode extends Node {
  type: string;
  body?: AcornNode[] | AcornNode;
  consequent?: AcornNode | AcornNode[];
  alternate?: AcornNode | null;
  expression?: AcornNode;
  declarations?: AcornNode[];
  init?: AcornNode | null;
  id?: AcornNode | null;
  name?: string;
  params?: AcornNode[];
  argument?: AcornNode | null;
  callee?: AcornNode;
  object?: AcornNode;
  property?: AcornNode;
  arguments?: AcornNode[];
  left?: AcornNode;
  right?: AcornNode;
  test?: AcornNode;
  update?: AcornNode | null;
  block?: AcornNode;
  handler?: AcornNode | null;
  finalizer?: AcornNode | null;
  cases?: AcornNode[];
  elements?: (AcornNode | null)[];
  properties?: AcornNode[];
  key?: AcornNode;
  value?: AcornNode;
  kind?: string;
  start: number;
  end: number;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
}

/**
 * Collect variable names visible in scope at a given statement.
 * Walks up from the statement finding all declared variables in enclosing scopes.
 */
function collectScopeVars(node: AcornNode, ancestors: AcornNode[]): string[] {
  const vars = new Set<string>();

  // Check the current scope and parent scopes for variable declarations
  for (const ancestor of ancestors) {
    const body = Array.isArray(ancestor.body) ? ancestor.body : [];
    for (const stmt of body) {
      if (stmt.type === 'VariableDeclaration' && stmt.declarations) {
        for (const decl of stmt.declarations) {
          if (decl.id?.type === 'Identifier' && decl.id.name) {
            vars.add(decl.id.name);
          }
        }
      }
      if (stmt.type === 'FunctionDeclaration' && stmt.id?.name) {
        vars.add(stmt.id.name);
      }
    }

    // Function parameters
    if (
      (ancestor.type === 'FunctionDeclaration' ||
        ancestor.type === 'FunctionExpression' ||
        ancestor.type === 'ArrowFunctionExpression') &&
      ancestor.params
    ) {
      for (const param of ancestor.params) {
        if (param.type === 'Identifier' && param.name) {
          vars.add(param.name);
        }
      }
    }
  }

  // Also add variables declared in current node
  if (node.type === 'VariableDeclaration' && node.declarations) {
    for (const decl of node.declarations) {
      if (decl.id?.type === 'Identifier' && decl.id.name) {
        vars.add(decl.id.name);
      }
    }
  }

  return Array.from(vars);
}

/**
 * Build a tracker step call expression as an AST-like string.
 */
function buildStepCall(line: number, vars: string[]): string {
  if (vars.length === 0) {
    return `__tracker__.step(${line}, {});`;
  }
  const varCaptures = vars
    .map((v) => {
      // Wrap in try-catch for variables that may not be initialized yet (TDZ)
      return `try { __vars__["${v}"] = ${v}; } catch(e) {}`;
    })
    .join(' ');
  return `var __vars__ = {}; ${varCaptures} __tracker__.step(${line}, __vars__);`;
}

/**
 * Instrument an array of statement nodes by inserting tracker calls.
 */
function instrumentStatements(
  statements: AcornNode[],
  ancestors: AcornNode[],
  sourceMap: Map<number, number>
): AcornNode[] {
  const result: AcornNode[] = [];

  for (const stmt of statements) {
    const line = stmt.loc?.start.line ?? 0;

    // Insert a step call before each statement
    const vars = collectScopeVars(stmt, ancestors);
    const stepCode = buildStepCall(line, vars);

    // Parse the step call into an AST node
    const stepAst = acorn.parse(stepCode, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    }) as unknown as AcornNode;

    const stepStatements = Array.isArray(stepAst.body) ? stepAst.body : [];
    result.push(...stepStatements);

    // Track source mapping
    if (line > 0) {
      sourceMap.set(result.length, line);
    }

    // Instrument nested blocks
    const instrumented = instrumentNode(stmt, [...ancestors], sourceMap);
    result.push(instrumented);
  }

  return result;
}

/**
 * Recursively instrument a single AST node.
 * Handles function declarations, if/else, loops, try/catch, etc.
 */
function instrumentNode(
  node: AcornNode,
  ancestors: AcornNode[],
  sourceMap: Map<number, number>
): AcornNode {
  const clone = { ...node };

  switch (node.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression': {
      const funcName = node.id?.name ?? '(anonymous)';
      const line = node.loc?.start.line ?? 0;

      if (clone.body && !Array.isArray(clone.body) && clone.body.type === 'BlockStatement') {
        const bodyStmts = Array.isArray(clone.body.body) ? clone.body.body : [];

        // Build enter/exit calls
        const enterCode = `__tracker__.enterFunction("${funcName}", ${line});`;
        const enterAst = acorn.parse(enterCode, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        }) as unknown as AcornNode;
        const enterStmts = Array.isArray(enterAst.body) ? enterAst.body : [];

        const exitCode = `__tracker__.exitFunction();`;
        const exitAst = acorn.parse(exitCode, {
          ecmaVersion: 'latest',
          sourceType: 'module',
        }) as unknown as AcornNode;
        const exitStmts = Array.isArray(exitAst.body) ? exitAst.body : [];

        // Instrument the function body
        const instrumentedBody = instrumentStatements(bodyStmts, [...ancestors, clone], sourceMap);

        // Wrap in try/finally to ensure exitFunction is always called
        clone.body = {
          ...clone.body,
          body: [
            ...enterStmts,
            {
              type: 'TryStatement',
              start: node.start,
              end: node.end,
              block: {
                type: 'BlockStatement',
                start: node.start,
                end: node.end,
                body: instrumentedBody,
              },
              handler: null,
              finalizer: {
                type: 'BlockStatement',
                start: node.start,
                end: node.end,
                body: exitStmts,
              },
            } as unknown as AcornNode,
          ],
        };
      }
      break;
    }

    case 'BlockStatement': {
      if (Array.isArray(clone.body)) {
        clone.body = instrumentStatements(clone.body as AcornNode[], ancestors, sourceMap);
      }
      break;
    }

    case 'IfStatement': {
      if (clone.consequent) {
        clone.consequent = instrumentNode(clone.consequent as AcornNode, ancestors, sourceMap);
      }
      if (clone.alternate) {
        clone.alternate = instrumentNode(clone.alternate as AcornNode, ancestors, sourceMap);
      }
      break;
    }

    case 'ForStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'WhileStatement':
    case 'DoWhileStatement': {
      if (clone.body) {
        const bodyNode = clone.body as AcornNode;
        if (bodyNode.type === 'BlockStatement') {
          clone.body = instrumentNode(bodyNode, ancestors, sourceMap);
        } else {
          // Wrap single-statement body in a block
          clone.body = {
            type: 'BlockStatement',
            start: bodyNode.start,
            end: bodyNode.end,
            body: instrumentStatements([bodyNode], ancestors, sourceMap),
          } as unknown as AcornNode;
        }
      }
      break;
    }

    case 'SwitchStatement': {
      if (clone.cases && Array.isArray(clone.cases)) {
        clone.cases = clone.cases.map((c: AcornNode) => {
          const caseClone = { ...c };
          if (caseClone.consequent && Array.isArray(caseClone.consequent)) {
            caseClone.consequent = instrumentStatements(
              caseClone.consequent as AcornNode[],
              ancestors,
              sourceMap
            );
          }
          return caseClone;
        });
      }
      break;
    }

    case 'TryStatement': {
      if (clone.block) {
        clone.block = instrumentNode(clone.block as AcornNode, ancestors, sourceMap);
      }
      if (clone.handler) {
        const handler = { ...clone.handler } as AcornNode;
        if (handler.body) {
          handler.body = instrumentNode(handler.body as AcornNode, ancestors, sourceMap);
        }
        clone.handler = handler;
      }
      if (clone.finalizer) {
        clone.finalizer = instrumentNode(clone.finalizer as AcornNode, ancestors, sourceMap);
      }
      break;
    }

    default:
      break;
  }

  return clone;
}

/**
 * Instrument JavaScript source code for step-by-step execution tracing.
 *
 * Parses the code with acorn, injects __tracker__ calls at each statement,
 * function entry/exit, and regenerates the code with astring.
 *
 * @param code - Raw JavaScript source code
 * @returns InstrumentationResult with instrumented code and source map
 */
export function instrumentCode(code: string): InstrumentationResult {
  const sourceMap = new Map<number, number>();

  try {
    // Parse with acorn
    const ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    }) as unknown as AcornNode;

    // Instrument the top-level body
    if (Array.isArray(ast.body)) {
      ast.body = instrumentStatements(ast.body as AcornNode[], [ast], sourceMap);
    }

    // Generate the instrumented code
    const instrumentedBody = generate(ast as unknown as acorn.Node);

    // Prepend the tracker runtime
    const instrumentedCode = getTrackerRuntime() + '\n' + instrumentedBody;

    return {
      instrumentedCode,
      sourceMap,
      success: true,
    };
  } catch (err) {
    return {
      instrumentedCode: '',
      sourceMap,
      success: false,
      error: err instanceof Error ? err.message : 'Failed to instrument code',
    };
  }
}
