import { afterEach, describe, expect, it, vi } from 'vitest';
import { instrument, TRACER_NAME } from './instrument';
import { startTrace } from './trace';

afterEach(() => {
  vi.useRealTimers();
});

const instrumented = (code: string): string => {
  const result = instrument(code);
  if (!result.ok) throw new Error(result.error.message);
  return result.code;
};

/** What the code prints when it runs as written, with no tracer anywhere near it. */
async function printsUntraced(code: string): Promise<string[]> {
  const printed: string[] = [];
  const print = (...args: unknown[]) => {
    printed.push(args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' '));
  };
  new Function('console', code)({ log: print });
  await vi.advanceTimersByTimeAsync(5000);
  return printed;
}

async function printsTraced(code: string): Promise<string[]> {
  const run = startTrace(code);
  await vi.advanceTimersByTimeAsync(5000);
  const trace = run.getTrace();
  expect(trace.error).toBeUndefined();
  expect(trace.outcome).toBe('completed');
  return run.console;
}

describe('instrument', () => {
  it('reports the lines of the original source, whatever the rewrite adds', () => {
    const code = instrumented(`// a comment

function add(a, b) {

  return a + b;
}


add(1, 2);`);
    expect(code).toContain(`${TRACER_NAME}.start(9, `);
    expect(code).toContain(`${TRACER_NAME}.enter("add", 3, `);
    expect(code).toMatch(/\.step\(5, __s1\)/);
    expect(code).toMatch(/\.step\(9, __s0\)/);
  });

  it('reports a syntax error with its line instead of rewriting', () => {
    expect(instrument('const a = 1;\nfunction (')).toEqual({
      ok: false,
      error: { message: 'Unexpected token', line: 2 },
    });
    expect(instrument('let a;\nlet a;')).toEqual({
      ok: false,
      error: { message: "Identifier 'a' has already been declared", line: 2 },
    });
  });

  it('reports a top-level await as a syntax error: the code runs as a script', () => {
    const result = instrument('const a = 1;\nconst b = 2;\nawait a;');
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.line).toBe(3);
  });

  it('refuses a program the rewrite cannot keep legal, instead of producing a broken one', () => {
    const result = instrument(`function f() {
  var twice = 1;
  function twice() {}
}`);
    expect(result).toEqual({
      ok: false,
      error: { message: expect.stringContaining('cannot be traced') },
    });
  });

  it('guards every catch clause, also one without a binding or with a pattern', () => {
    const code = instrumented(`try { a(); } catch (e) { b(); }
try { a(); } catch { b(); }
try { a(); } catch ({ message }) { b(message); }`);
    expect(code.match(/catch \(/g)).toHaveLength(3);
    expect(code.match(/\.guard\(/g)).toHaveLength(3);
    for (const clause of code.split('catch (').slice(1)) {
      expect(clause).toMatch(/^\w+\) \{\s+__t\.guard\(/);
    }
  });
});

describe('the instrumented program behaves like the original', () => {
  const programs: Record<string, string> = {
    'strict mode directives': `function loose() { return typeof this; }
function strict() { 'use strict'; return typeof this; }
console.log(loose(), strict());`,

    'inferred function names': `const add = (a, b) => a + b;
const named = function inner() {};
const object = { method() {}, arrow: () => {}, fn: function () {} };
let later;
later = () => {};
console.log(add.name, named.name, object.method.name, object.arrow.name, object.fn.name, later.name);
console.log((() => {}).name === '', [1].map((x) => x * 2).join());`,

    'hoisting and closures': `console.log(early(2));
function early(n) {
  const secret = 10;
  function inner() { return secret * n; }
  return inner();
}
var late = typeof notYet;
var notYet = 1;
console.log(late);`,

    'labels, break and continue': `const out = [];
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) continue outer;
    if (i === 2) break outer;
    out.push(i + ':' + j);
  }
}
let n = 0;
do { n++; if (n === 2) continue; } while (n < 4);
block: { out.push('in'); if (n) break block; out.push('never'); }
console.log(out.join(), n);`,

    'switch with declarations': `function kind(x) {
  switch (typeof x) {
    case 'number': { const doubled = x * 2; return 'n' + doubled; }
    case 'string':
      return 's' + x;
    default:
      return '?';
  }
}
console.log(kind(2), kind('a'), kind(null));`,

    'classes: inheritance, accessors, fields, statics': `class Animal {
  #secret = 1;
  legs = 4;
  static count = 0;
  static { Animal.count = 10; }
  constructor(name) { this.name = name; Animal.count++; }
  get label() { return this.name + '/' + this.legs + '/' + this.#secret; }
  set label(value) { this.name = value; }
  speak() { return this.name + ' makes a sound'; }
  onTick = () => this.name;
}
class Dog extends Animal {
  constructor(name) { super(name); this.tricks = []; }
  speak() { return super.speak() + ': woof'; }
  static create(name) { return new Dog(name); }
}
const dog = Dog.create('Rex');
dog.label = 'Max';
const tick = dog.onTick;
console.log(dog.speak(), dog.label, Animal.count, tick(), dog instanceof Animal);`,

    'object methods, accessors and super': `const base = { hello() { return 'base'; } };
const child = {
  __proto__: base,
  hello() { return super.hello() + '>child'; },
  get size() { return 3; },
  set size(value) { this.stored = value; },
  ['computed' + 1]: function () { return this.size; },
};
child.size = 7;
console.log(child.hello(), child.size, child.stored, child.computed1());`,

    'parameters: defaults, patterns and rest': `function f(a, b = a + 1, { c, d = () => c } = { c: 5 }, ...rest) {
  return [a, b, c, d(), rest.length].join();
}
const g = ({ x }, [y, z = 9]) => x + y + z;
console.log(f(1), f(1, 2, { c: 3 }, 4, 5), g({ x: 1 }, [2]));`,

    'try, catch and finally': `function f() {
  try { return 'try'; } finally { console.log('finally'); }
}
function g() {
  try { throw new Error('x'); } catch ({ message }) { return message; } finally { console.log('g'); }
}
function h() {
  for (const n of [1, 2, 3]) { try { if (n === 2) return n; } finally { console.log('h' + n); } }
}
let rethrown;
try { try { null.x; } catch (e) { throw e; } } catch (e) { rethrown = e instanceof TypeError; }
console.log(f(), g(), h(), rethrown);`,

    generators: `function* inner() { const got = yield 1; yield got * 2; return 'inner'; }
function* outer() { const result = yield* inner(); yield result; }
const it = outer();
console.log(it.next().value, it.next(21).value, it.next().value, it.next().done);
function* forever() { let n = 0; try { while (true) yield n++; } finally { console.log('closed'); } }
for (const n of forever()) { if (n === 2) break; }
console.log([...inner()].join());`,

    'this, call, bind and arrows': `const counter = {
  n: 0,
  add(list) { list.forEach((x) => { this.n += x; }); return this; },
};
function who() { return this.name; }
console.log(counter.add([1, 2]).n, who.call({ name: 'call' }), who.bind({ name: 'bind' })());
console.log(new (function Point(x) { this.x = x; })(3).x, (function () { return arguments.length; })(1, 2));`,

    'a return at the top level': `console.log('before');
if (true) return;
console.log('never');`,

    'modern syntax': `const user = { profile: null, list: [1, 2] };
user.count ??= 5;
const tag = (strings, ...keys) => strings.raw.join('|') + keys.join();
console.log(user.profile?.name ?? 'none', user.count, tag\`a\${1}b\${2}\`, 1_000n + 1n, 2 ** 3);
console.log([...user.list, ...'ab'].join(), /a+/gi.flags, { ...user }.count);`,

    'the order of promises, await and timers': `const log = (x) => console.log(x);
async function first() { log('first start'); await null; log('first after await'); return 'first'; }
async function second() { log('second start'); const value = await first(); log('second got ' + value); }
setTimeout(() => log('timeout 0'), 0);
second().then(() => log('second done'));
Promise.resolve().then(() => log('micro 1')).then(() => log('micro 2'));
queueMicrotask(() => log('micro 3'));
(async () => { for await (const x of [1, Promise.resolve(2)]) log('for await ' + x); })();
setTimeout(() => log('timeout 10'), 10);
log('sync end');`,

    'async generators and rejections': `async function* feed() { yield 1; await null; yield 2; }
async function read() {
  const seen = [];
  for await (const item of feed()) seen.push(item);
  try { await Promise.reject(new Error('no')); } catch (error) { seen.push(error.message); }
  return seen.join();
}
read().then((seen) => console.log(seen));`,
  };

  for (const [name, code] of Object.entries(programs)) {
    it(name, async () => {
      vi.useFakeTimers();
      const untraced = await printsUntraced(code);
      expect(untraced.length).toBeGreaterThan(0);
      expect(await printsTraced(code)).toEqual(untraced);
    });
  }
});
