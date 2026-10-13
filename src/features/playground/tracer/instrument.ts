/**
 * The rewrite: turns the learner's JavaScript into the same program with calls to the tracer
 * runtime (`runtime.ts`) around its statements, functions, loops and scopes.
 *
 * The program still runs on the browser's own engine (ADR 0004); the calls only report what
 * happens. Each frame and block scope hands the runtime getters, closures that read its
 * variables live, so a snapshot can be taken at any step without copying values around.
 *
 * Two things are reshaped so the runtime can model the event loop. The program runs inside a
 * function whose parameters are the runtime's own timers, `Promise` and clock. And an async
 * function becomes a plain function that calls an async arrow holding its body, which hands
 * the runtime the promise the call returns; `length` is 0 for such a function.
 */

import * as acorn from 'acorn';
import { generate } from 'astring';

/** The name instrumented code uses for the runtime. The sandbox must provide it. */
export const TRACER_NAME = '__t';

export type InstrumentResult =
  { ok: true; code: string } | { ok: false; error: { message: string; line?: number } };

/**
 * An ESTree node. The rewrite builds and reshapes nodes freely, which the precise acorn types
 * do not allow, so it works on this loose shape.
 */
interface Node {
  type: string;
  loc?: { start: { line: number }; end: { line: number } } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Context {
  /** The variable holding the frame the code runs in. */
  frame: string;
  /** The variable holding the innermost scope: a block scope, else the frame. */
  scope: string;
  inFunction: boolean;
  /** Inside an async function: its `return` values resolve the promise its call returned. */
  asyncFn?: boolean;
  /** Inside an async generator: the engine schedules its `yield` where the runtime cannot see. */
  asyncGen?: boolean;
  className?: string;
  /** A variable name not used before in this program. */
  fresh: () => string;
}

const T = TRACER_NAME;
/** The globals a program gets from the runtime, in the order `globals()` returns them. */
const GLOBALS = [
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'queueMicrotask',
  'Promise',
  'Date',
  'performance',
];
const SKIP = new Set(['type', 'loc', 'start', 'end']);
const LOOPS = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);
/** Statements that only group or declare: nothing runs on their own line. */
const NO_STEP = new Set([
  'FunctionDeclaration',
  'EmptyStatement',
  'BlockStatement',
  'TryStatement',
]);

const statement = (source: string): Node =>
  (
    acorn.parse(source, {
      ecmaVersion: 'latest',
      allowReturnOutsideFunction: true,
    }) as unknown as Node
  ).body[0];
const expression = (source: string): Node =>
  acorn.parseExpressionAt(source, 0, { ecmaVersion: 'latest' }) as unknown as Node;
const block = (body: Node[]): Node => ({ type: 'BlockStatement', body });
const asBlock = (node: Node): Node =>
  node.type === 'BlockStatement' ? node : { type: 'BlockStatement', body: [node], loc: node.loc };
const lineOf = (node: Node): number => node.loc?.start.line ?? 1;
const isFunction = (node: Node | null | undefined): boolean =>
  !!node &&
  (node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression');
const keyName = (key: Node | null | undefined): string | undefined => {
  if (!key) return undefined;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'PrivateIdentifier') return `#${key.name}`;
  if (key.type === 'Literal') return String(key.value);
  if (key.type === 'MemberExpression' && !key.computed) return keyName(key.property);
  return undefined;
};

/** Every name a binding pattern declares. */
function patternNames(pattern: Node | null | undefined, out: string[] = []): string[] {
  if (!pattern) return out;
  switch (pattern.type) {
    case 'Identifier':
      out.push(pattern.name);
      break;
    case 'ObjectPattern':
      for (const property of pattern.properties) {
        patternNames(property.value ?? property.argument, out);
      }
      break;
    case 'ArrayPattern':
      for (const element of pattern.elements) patternNames(element, out);
      break;
    case 'AssignmentPattern':
      patternNames(pattern.left, out);
      break;
    case 'RestElement':
      patternNames(pattern.argument, out);
      break;
  }
  return out;
}

/** `var` names declared anywhere below, without crossing into another function. */
function hoistedVars(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const child of node) hoistedVars(child, out);
    return out;
  }
  const current = node as Node;
  if (isFunction(current) || current.type === 'StaticBlock') return out;
  if (current.type === 'VariableDeclaration' && current.kind === 'var') {
    for (const declarator of current.declarations) patternNames(declarator.id, out);
  }
  for (const key of Object.keys(current)) {
    if (!SKIP.has(key)) hoistedVars(current[key], out);
  }
  return out;
}

/** Names that `let`, `const`, `class` and function declarations give a statement list. */
function lexicalNames(statements: Node[]): string[] {
  const out: string[] = [];
  for (const node of statements) {
    if (node.type === 'VariableDeclaration' && node.kind !== 'var') {
      for (const declarator of node.declarations) patternNames(declarator.id, out);
    }
    if ((node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration') && node.id) {
      out.push(node.id.name);
    }
  }
  return out;
}

const headNames = (declaration: Node | null | undefined): string[] =>
  declaration?.type === 'VariableDeclaration' && declaration.kind !== 'var'
    ? declaration.declarations.flatMap((declarator: Node) => patternNames(declarator.id))
    : [];

/** Source of `[["a", () => a], ...]`: one live reader per variable. */
function gettersSource(names: string[], withThis = false): string {
  const entries = [...new Set(names)].map((name) => `[${JSON.stringify(name)},()=>${name}]`);
  if (withThis) entries.push('["this",()=>this]');
  return `[${entries.join(',')}]`;
}

/** Does `super` appear in this function's own body (arrows included, they share it)? */
function usesSuper(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(usesSuper);
  const current = node as Node;
  if (current.type === 'Super') return true;
  if (current.type === 'FunctionDeclaration' || current.type === 'FunctionExpression') return false;
  if (current.type === 'ClassDeclaration' || current.type === 'ClassExpression') return false;
  return Object.keys(current).some((key) => !SKIP.has(key) && usesSuper(current[key]));
}

/** Directives such as 'use strict' must stay the first statements of their body. */
function splitDirectives(statements: Node[]): [Node[], Node[]] {
  let count = 0;
  while (count < statements.length && typeof statements[count].directive === 'string') count++;
  return [statements.slice(0, count), statements.slice(count)];
}

/**
 * A statement list with a step call before each statement that runs, and each function
 * declaration registered first, because declarations are hoisted.
 */
function instrumentList(statements: Node[], ctx: Context): Node[] {
  const out: Node[] = [];
  for (const node of statements) {
    if (node.type === 'FunctionDeclaration' && node.id) {
      const name = node.id.name;
      out.push(statement(`${T}.fn(${name}, ${ctx.scope}, ${JSON.stringify(name)});`));
    }
  }
  for (const node of statements) {
    if (!NO_STEP.has(node.type)) out.push(statement(`${T}.step(${lineOf(node)}, ${ctx.frame});`));
    out.push(visit(node, ctx));
  }
  return out;
}

/**
 * A statement list that is a block scope. When it declares names (or `extra` ones belong to
 * it, such as a loop's own variable), the runtime is told about the scope while it is open.
 */
function instrumentBlock(
  statements: Node[],
  ctx: Context,
  extra: string[] = [],
  isLoopBody = false
): Node[] {
  const names = [...extra, ...lexicalNames(statements)];
  if (names.length === 0) return instrumentList(statements, ctx);
  const scope = ctx.fresh();
  // The getters are created inside the `try` block, where the block's own declarations are
  // in scope. `let` outside it keeps the handle visible to `finally`.
  const wrapper = statement(
    `{ let ${scope}; try { ${scope} = ${T}.block(${ctx.frame}, ${gettersSource(names)}, ${ctx.scope}${isLoopBody ? ', true' : ''}); }` +
      ` finally { ${T}.unblock(${scope}); } }`
  );
  wrapper.body[1].block.body.push(...instrumentList(statements, { ...ctx, scope }));
  return wrapper.body;
}

/** How many leading parameters can be shown in the frame's name; -1 when they are patterns. */
function shownArguments(params: Node[]): number {
  const simple = params.every(
    (param) =>
      param.type === 'Identifier' ||
      (param.type === 'AssignmentPattern' && param.left.type === 'Identifier')
  );
  return simple ? params.length : -1;
}

/** Wraps a function's body so that every call pushes a frame and every exit pops it. */
function transformFunction(node: Node, ctx: Context, name: string, withThis: boolean): void {
  const frame = ctx.fresh();
  const line = lineOf(node);
  node.params = node.params.map((param: Node) => visit(param, ctx));
  if (node.body.type !== 'BlockStatement') {
    const returned: Node = { type: 'ReturnStatement', argument: node.body, loc: node.body.loc };
    node.body = block([returned]);
    node.expression = false;
  }
  const [directives, statements] = splitDirectives(node.body.body);
  const names = [
    ...node.params.flatMap((param: Node) => patternNames(param)),
    ...lexicalNames(statements),
    ...hoistedVars(statements),
  ];
  const isAsync: boolean = node.async && !node.generator;
  const promise = isAsync ? ctx.fresh() : '';
  const inner: Context = {
    ...ctx,
    frame,
    scope: frame,
    inFunction: true,
    asyncFn: isAsync,
    asyncGen: node.async && node.generator,
    className: undefined,
  };
  const wrapper = statement(
    `{ let ${frame}; try { ${frame} = ${T}.enter(${JSON.stringify(name)}, ${line}, ` +
      `${gettersSource(names, withThis)}, ${ctx.scope}, ${shownArguments(node.params)}` +
      `${isAsync ? `, ${promise}` : ''}); }` +
      ` catch (__e) { throw ${T}.thrown(__e, ${frame}); } finally { ${T}.leave(${frame}); } }`
  );
  wrapper.body[1].block.body.push(...instrumentList(statements, inner));
  if (!isAsync) {
    node.body = block([...directives, ...wrapper.body]);
    return;
  }
  // The body moves into an async arrow, which keeps `this`, `arguments` and `super`. The
  // function around it is no longer async: it returns the arrow's promise, the very one the
  // engine made, after showing it to the runtime.
  const isArrow = node.type === 'ArrowFunctionExpression';
  const args = isArrow ? ctx.fresh() : 'arguments';
  const returned = statement(`return ${T}.made(${promise}, f(...${args}));`);
  returned.argument.arguments[1].callee = {
    type: 'ArrowFunctionExpression',
    async: true,
    expression: false,
    params: node.params,
    body: block(wrapper.body),
  };
  node.async = false;
  node.params = isArrow
    ? [{ type: 'RestElement', argument: { type: 'Identifier', name: args } }]
    : [];
  node.body = block([...directives, statement(`const ${promise} = ${T}.async();`), returned]);
}

/** A function expression, wrapped so the runtime learns which scope it was created in. */
function wrapFunction(node: Node, ctx: Context, hint: string | undefined, withThis: boolean): Node {
  const name: string = node.id?.name ?? hint ?? '';
  transformFunction(node, ctx, name || 'anonymous', withThis);
  const call = expression(`${T}.fn(0, ${ctx.scope}, ${JSON.stringify(name)})`);
  call.arguments[0] = node;
  return call;
}

function visitChildren(node: Node, ctx: Context): Node {
  for (const key of Object.keys(node)) {
    if (SKIP.has(key)) continue;
    const child = node[key];
    if (Array.isArray(child)) node[key] = child.map((item) => visit(item, ctx));
    else if (child && typeof child.type === 'string') node[key] = visit(child, ctx);
  }
  return node;
}

function visitLoop(node: Node, ctx: Context, extra: string[]): Node {
  const body = asBlock(node.body);
  const inner = instrumentBlock(body.body, ctx, extra, true);
  const turn = statement(`${T}.loop(${lineOf(node)}, ${ctx.frame});`);
  if (node.type === 'ForOfStatement' && node.await) {
    // `for await` waits between turns without an `await` expression to wrap.
    const waiting = statement(`try {} finally { ${T}.suspend(${ctx.frame}, void 0, true); }`);
    waiting.block.body = inner;
    body.body = [turn, waiting];
    const right = expression(`${T}.suspend(${ctx.frame}, 0, true)`);
    right.arguments[1] = node.right;
    node.right = right;
  } else {
    body.body = [turn, ...inner];
  }
  node.body = body;
  return node;
}

function visit(node: Node | null | undefined, ctx: Context, hint?: string): Node {
  if (!node || typeof node.type !== 'string') return node as Node;
  switch (node.type) {
    case 'FunctionDeclaration':
      transformFunction(node, ctx, node.id?.name ?? 'anonymous', false);
      return node;

    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      return wrapFunction(node, ctx, hint, false);

    case 'Property': {
      const name = node.computed ? undefined : keyName(node.key);
      if (node.computed) node.key = visit(node.key, ctx);
      if (!isFunction(node.value)) {
        node.value = visit(node.value, ctx, name);
      } else if (node.kind !== 'init') {
        // A getter or setter must stay one: traced, but its scope is not registered.
        transformFunction(node.value, ctx, `${node.kind} ${name ?? 'anonymous'}`, true);
      } else if (node.method && usesSuper(node.value.body)) {
        // `super` only works in a method, so this one cannot become a plain function.
        transformFunction(node.value, ctx, name ?? 'anonymous', true);
      } else {
        const isArrow = node.value.type === 'ArrowFunctionExpression';
        node.method = false;
        node.shorthand = false;
        node.value = wrapFunction(node.value, ctx, name, !isArrow);
      }
      return node;
    }

    case 'ClassDeclaration':
    case 'ClassExpression': {
      const className: string = node.id?.name ?? hint ?? 'class';
      node.superClass = visit(node.superClass, ctx);
      node.body = visitChildren(node.body, { ...ctx, className });
      return node;
    }

    case 'MethodDefinition': {
      if (node.computed) node.key = visit(node.key, ctx);
      const owner = ctx.className ?? 'class';
      const key = node.computed ? 'anonymous' : (keyName(node.key) ?? 'anonymous');
      const accessor = node.kind === 'get' || node.kind === 'set' ? `${node.kind} ` : '';
      const name = node.kind === 'constructor' ? `new ${owner}` : `${accessor}${owner}.${key}`;
      transformFunction(node.value, ctx, name, true);
      return node;
    }

    case 'PropertyDefinition':
      if (node.computed) node.key = visit(node.key, ctx);
      node.value = visit(node.value, ctx, node.computed ? undefined : keyName(node.key));
      return node;

    case 'VariableDeclarator':
      node.id = visit(node.id, ctx);
      node.init = visit(node.init, ctx, keyName(node.id));
      return node;

    case 'AssignmentExpression':
    case 'AssignmentPattern':
      node.left = visit(node.left, ctx);
      node.right = visit(node.right, ctx, keyName(node.left));
      return node;

    case 'BlockStatement':
      node.body = instrumentBlock(node.body, ctx);
      return node;

    case 'IfStatement':
      node.test = visit(node.test, ctx);
      node.consequent = visit(asBlock(node.consequent), ctx);
      if (node.alternate) node.alternate = visit(asBlock(node.alternate), ctx);
      return node;

    case 'ForStatement': {
      const extra = headNames(node.init);
      node.init = visit(node.init, ctx);
      node.test = visit(node.test, ctx);
      node.update = visit(node.update, ctx);
      return visitLoop(node, ctx, extra);
    }

    case 'ForInStatement':
    case 'ForOfStatement': {
      const extra = headNames(node.left);
      node.right = visit(node.right, ctx);
      return visitLoop(node, ctx, extra);
    }

    case 'WhileStatement':
    case 'DoWhileStatement':
      node.test = visit(node.test, ctx);
      return visitLoop(node, ctx, []);

    case 'LabeledStatement':
      // A loop keeps its label; any other labelled statement becomes a block of its own.
      node.body = visit(LOOPS.has(node.body.type) ? node.body : asBlock(node.body), ctx);
      return node;

    case 'TryStatement': {
      node.block = visit(node.block, ctx);
      const handler: Node | null = node.handler;
      if (handler) {
        // Every catch clause starts with the guard, or it could swallow the signal that
        // stops a run at the step limit.
        const pattern: Node | null = handler.param;
        const caught: string = pattern?.type === 'Identifier' ? pattern.name : ctx.fresh();
        const prefix = [statement(`${T}.guard(${caught}, ${ctx.frame});`)];
        if (pattern && pattern.type !== 'Identifier') {
          const bound = statement(`let [x] = ${caught};`);
          bound.declarations[0].id = visit(pattern, ctx);
          prefix.push(bound);
        }
        handler.param = { type: 'Identifier', name: caught };
        handler.body.body = [
          ...prefix,
          ...instrumentBlock(handler.body.body, ctx, patternNames(pattern)),
        ];
      }
      if (node.finalizer) node.finalizer = visit(node.finalizer, ctx);
      return node;
    }

    case 'SwitchStatement':
      node.discriminant = visit(node.discriminant, ctx);
      for (const switchCase of node.cases) {
        switchCase.test = visit(switchCase.test, ctx);
        switchCase.consequent = instrumentList(switchCase.consequent, ctx);
      }
      return node;

    case 'AwaitExpression':
    case 'YieldExpression': {
      node.argument = visit(node.argument, ctx);
      // `yield*` hands control to another generator: its frame stays, so nothing to tell.
      if (!ctx.inFunction || node.delegate) return node;
      let leaving: Node;
      if (node.type === 'AwaitExpression') {
        leaving = expression(`${T}.wait(${ctx.frame}, 0)`);
        leaving.arguments[1] = node.argument;
      } else if (ctx.asyncGen) {
        leaving = expression(`${T}.suspend(${ctx.frame}, void 0, true)`);
        if (node.argument) leaving.arguments[1] = node.argument;
      } else {
        leaving = expression(`${T}.suspend(${ctx.frame})`);
        if (node.argument) leaving.arguments.push(node.argument);
      }
      node.argument = leaving;
      const back = expression(`${T}.resume(${ctx.frame}, 0)`);
      back.arguments[1] = node;
      return back;
    }

    case 'ReturnStatement':
      node.argument = visit(node.argument, ctx);
      // A `return` at the top level ends the program.
      if (!ctx.inFunction) return block([statement(`${T}.done(${ctx.frame});`), node]);
      if (ctx.asyncFn && node.argument) {
        const settled = expression(`${T}.ret(${ctx.frame}, 0)`);
        settled.arguments[1] = node.argument;
        node.argument = settled;
      }
      return node;

    default:
      return visitChildren(node, ctx);
  }
}

function rewrite(program: Node): void {
  let count = 0;
  const fresh = () => `__s${count++}`;
  const frame = fresh();
  const ctx: Context = { frame, scope: frame, inFunction: false, fresh };
  const [directives, statements] = splitDirectives(program.body);
  const names = [...lexicalNames(statements), ...hoistedVars(statements)];
  const first = statements.find((node) => !NO_STEP.has(node.type));
  // Two functions: the outer one's parameters replace the globals, and the program is the
  // body of the inner one, where it may declare those names itself.
  const shell = statement(
    `(function (${GLOBALS.join(', ')}) { return (function () {}).call(this); })` +
      `.apply(this, ${T}.globals());`
  );
  shell.expression.callee.object.body.body[0].argument.callee.object.body.body = [
    ...directives,
    statement(
      `const ${frame} = ${T}.start(${first ? lineOf(first) : 1}, ${gettersSource(names)});`
    ),
    ...instrumentList(statements, ctx),
    statement(`${T}.done(${frame});`),
  ];
  program.body = [shell];
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** A parsed program: an ESTree node with `start`, `end` and `loc` on every node. */
export type ProgramNode = Node;

/**
 * Parses the learner's code the way a run takes it: a script that may `return` at the top
 * level, as the body of `new Function` may. A syntax error comes back with its line.
 * The tracer's rewrite and the loop guard (`loopGuard.ts`) both start here.
 */
export function parseLearnerCode(
  code: string
): { ok: true; program: ProgramNode } | { ok: false; error: { message: string; line?: number } } {
  try {
    const program = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      locations: true,
      allowReturnOutsideFunction: true,
    }) as unknown as Node;
    return { ok: true, program };
  } catch (error) {
    const line = (error as { loc?: { line?: number } }).loc?.line;
    const message = messageOf(error).replace(/\s*\(\d+:\d+\)$/, '');
    return { ok: false, error: line === undefined ? { message } : { message, line } };
  }
}

/**
 * Instruments the learner's code. The result runs as a script (or a `new Function` body)
 * with the runtime in scope as `__t`; it takes its timers, `Promise` and clock from the runtime. Line numbers reported to the runtime are lines of
 * `code` itself. A syntax error is reported with its line and nothing is rewritten.
 */
export function instrument(code: string): InstrumentResult {
  const parsed = parseLearnerCode(code);
  if (!parsed.ok) return parsed;
  const program = parsed.program;
  try {
    rewrite(program);
    const instrumented = generate(program as unknown as Parameters<typeof generate>[0]);
    // The rewrite moves a function's statements into a block, which a few legal programs
    // do not survive (a `var` and a function declaration sharing a name). Check, don't guess.
    acorn.parse(instrumented, { ecmaVersion: 'latest', allowReturnOutsideFunction: true });
    return { ok: true, code: instrumented };
  } catch (error) {
    return { ok: false, error: { message: `This code cannot be traced: ${messageOf(error)}` } };
  }
}
