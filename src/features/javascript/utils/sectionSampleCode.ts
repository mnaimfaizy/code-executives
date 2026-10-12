/**
 * The code of the JavaScript sections' samples that also open in the Playground, moved here
 * character for character from the sections that show them. A section and the Playground both
 * read these constants, so the two cannot drift apart. Pure data: nothing here runs.
 */

export const CALL_STACK_CODE = `// Write JavaScript. We'll instrument function bodies to emit push/pop events.
function main() {
  foo();
  bar();
}

function foo() {
  baz();
}

function bar() {
  // work
}

function baz() {
  // work
}

main();`;

export const PROMISE_VS_TIMEOUT_CODE = `console.log('1 – sync start');

setTimeout(() => console.log('4 – macrotask'), 0);

Promise.resolve()
  .then(() => console.log('2 – microtask A'))
  .then(() => console.log('3 – microtask B'));

console.log('end of sync');

// Output order:
// 1 – sync start
// end of sync
// 2 – microtask A
// 3 – microtask B
// 4 – macrotask`;

export const NESTED_PROMISES_CODE = `Promise.resolve()
  .then(() => {
    console.log('microtask 1');
    return Promise.resolve();
  })
  .then(() => console.log('microtask 2'))
  .then(() => console.log('microtask 3'));

setTimeout(() => console.log('macrotask'), 0);

// Output:
// microtask 1
// microtask 2
// microtask 3
// macrotask`;

export const ASYNC_AWAIT_ORDER_CODE = `async function fetchData() {
  console.log('A – fetchData start');
  await Promise.resolve(); // suspends here
  console.log('C – fetchData resume');
}

console.log('1 – before call');
fetchData();
console.log('B – after call (sync)');

// Output:
// 1 – before call
// A – fetchData start
// B – after call (sync)
// C – fetchData resume`;

export const QUEUE_MICROTASK_CODE = `queueMicrotask(() => console.log('queueMicrotask'));
Promise.resolve().then(() => console.log('Promise.then'));
setTimeout(() => console.log('setTimeout'), 0);

// Output:
// queueMicrotask
// Promise.then
// setTimeout`;

export const ALL_QUEUE_TYPES_CODE = `console.log('1 sync start');

// Macrotask
setTimeout(() => console.log('5 macrotask: setTimeout'), 0);

// Microtasks
Promise.resolve().then(() => console.log('3 microtask: Promise.then'));
queueMicrotask(() => console.log('4 microtask: queueMicrotask'));

console.log('2 sync end');

// Output order:
// 1 sync start
// 2 sync end
// 3 microtask: Promise.then
// 4 microtask: queueMicrotask
// 5 macrotask: setTimeout`;

export const MICROTASK_STARVATION_CODE = `let count = 0;

function scheduleMicrotask() {
  if (count < 5) {
    count++;
    Promise.resolve().then(() => {
      console.log(\`microtask #\${count}\`);
      scheduleMicrotask(); // schedules another!
    });
  } else {
    console.log('microtasks done');
  }
}

setTimeout(() => console.log('macrotask (never starved here)'), 0);
scheduleMicrotask();

// Output:
// microtask #1 through #5 all run
// microtask #5
// microtasks done
// macrotask (never starved here)`;

export const BETWEEN_MACROTASKS_CODE = `setTimeout(() => {
  console.log('macrotask 1');
  Promise.resolve().then(() => console.log('  micro after macro 1'));
}, 0);

setTimeout(() => {
  console.log('macrotask 2');
  Promise.resolve().then(() => console.log('  micro after macro 2'));
}, 0);

// Output:
// macrotask 1
//   micro after macro 1  ← drained before macrotask 2
// macrotask 2
//   micro after macro 2`;

export const TIMER_APIS_CODE = `// setTimeout is a macrotask — it runs after microtasks.
console.log('sync: start');

setTimeout(() => console.log('macro: timeout'), 0);

Promise.resolve().then(() => console.log('micro: promise'));

console.log('sync: end');

// Console output:
// sync: start
// sync: end
// micro: promise   ← microtask runs first
// macro: timeout   ← macrotask runs last`;

export const CIRCULAR_REFERENCES_SOLUTION_CODE = `// SOLUTION: Break circular references
function createCircularReference() {
  const parent = { name: 'Parent' };
  const child = { name: 'Child' };
  
  parent.child = child;
  child.parent = parent;
  
  // Cleanup function to break cycles
  const cleanup = () => {
    parent.child = null;
    child.parent = null;
  };
  
  return { parent, child, cleanup };
}

// Proper cleanup
const { parent, child, cleanup } = createCircularReference();
// When done:
cleanup(); // Breaks the cycle for GC`;

export const CLEARED_TIMERS_SOLUTION_CODE = `// SOLUTION: Always clear timers and manage lifecycle
function startDataPolling() {
  let largeDataSet = new Array(100000).fill('data');
  
  // Store timer IDs for cleanup
  const intervalId = setInterval(() => {
    console.log('Data size:', largeDataSet.length);
    largeDataSet.push(new Date().toISOString());
  }, 1000);
  
  const timeoutId = setTimeout(() => {
    processData(largeDataSet);
  }, 5000);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    largeDataSet = null; // Clear reference
  };
}

// Proper usage with cleanup
const stopPolling = startDataPolling();

// Later, when component unmounts or feature disabled:
stopPolling(); // Clean up all timers and references`;
