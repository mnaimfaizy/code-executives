import type { PlaygroundLink } from '../../playground/utils/playgroundLink';
import {
  ALL_QUEUE_TYPES_CODE,
  ASYNC_AWAIT_ORDER_CODE,
  BETWEEN_MACROTASKS_CODE,
  CALL_STACK_CODE,
  CIRCULAR_REFERENCES_SOLUTION_CODE,
  CLEARED_TIMERS_SOLUTION_CODE,
  MICROTASK_STARVATION_CODE,
  NESTED_PROMISES_CODE,
  PROMISE_VS_TIMEOUT_CODE,
  QUEUE_MICROTASK_CODE,
  TIMER_APIS_CODE,
} from './sectionSampleCode';

/**
 * A code sample a JavaScript section shows that is also a Playground example.
 *
 * A sample is here only if it runs unchanged in the Playground without an error and its lens
 * has something to draw (`playground/tracer/examples.test.ts` proves both for each one). The
 * section shows `code` and links to the example; the Playground loads the same `code` and links
 * back to the section. Pure data, so neither side pulls the other's components in.
 */
export interface SectionSample {
  /** Id of the Playground example (`playground/utils/examples.ts`). */
  example: string;
  /** The section's label, exactly as the sidebar and `moduleNavigation.ts` spell it. */
  section: string;
  /** The sample's name in its section. */
  title: string;
  /** One line for the Playground's Examples menu. */
  description: string;
  /** The lens the Playground opens with. */
  lens: NonNullable<PlaygroundLink['lens']>;
  code: string;
  /** The rest of the link's sentence: what the learner will see, and one change to try. */
  tryIt: string;
}

export const callStackSample: SectionSample = {
  example: 'js-call-stack',
  section: 'Call Stack & Execution',
  title: 'main → foo → baz, then bar',
  description: 'Four functions that call one another: frames stack up, then pop',
  lens: 'stack-heap',
  code: CALL_STACK_CODE,
  tryIt:
    'step through this program and watch main, foo and baz stack up, then pop one by one. Then call bar() from inside baz and see how deep the stack gets.',
};

export const promiseVsTimeoutSample: SectionSample = {
  example: 'js-event-loop-promise-vs-timeout',
  section: 'Event Loop & Coordination',
  title: 'Promise vs setTimeout',
  description: 'Two promise callbacks run before a 0 ms timer’s callback',
  lens: 'stack-queues',
  code: PROMISE_VS_TIMEOUT_CODE,
  tryIt:
    'watch each promise callback pass through the microtask queue while the timer’s callback waits in the task queue. Then move the setTimeout line to the top and see that the order stays.',
};

export const nestedPromisesSample: SectionSample = {
  example: 'js-event-loop-nested-promises',
  section: 'Event Loop & Coordination',
  title: 'Nested Promises',
  description: 'A chain of .then() callbacks drains before the timer’s callback',
  lens: 'stack-queues',
  code: NESTED_PROMISES_CODE,
  tryIt:
    'watch every .then() take its turn in the microtask queue while the timer’s callback waits. Then add a fourth .then() and see the timer’s callback wait one turn more.',
};

export const asyncAwaitOrderSample: SectionSample = {
  example: 'js-event-loop-async-await',
  section: 'Event Loop & Coordination',
  title: 'async/await Order',
  description: 'await suspends fetchData; the rest of it waits as a microtask',
  lens: 'stack-queues',
  code: ASYNC_AWAIT_ORDER_CODE,
  tryIt:
    'watch fetchData leave the stack at await and its continuation wait in the microtask queue. Then add a second await before the last log and see it wait twice.',
};

export const queueMicrotaskSample: SectionSample = {
  example: 'js-event-loop-queue-microtask',
  section: 'Event Loop & Coordination',
  title: 'queueMicrotask',
  description: 'queueMicrotask() and Promise.then() share one queue, first in, first out',
  lens: 'stack-queues',
  code: QUEUE_MICROTASK_CODE,
  tryIt:
    'see both callbacks wait in the microtask queue in the order they were scheduled. Then swap lines 1 and 2 and watch the queue follow.',
};

export const allQueueTypesSample: SectionSample = {
  example: 'js-task-queues-all-queue-types',
  section: 'Task Queues & Priority',
  title: 'All Queue Types',
  description: 'Script, two microtasks, then a timer’s callback, in priority order',
  lens: 'stack-queues',
  code: ALL_QUEUE_TYPES_CODE,
  tryIt:
    'watch two microtasks and one task wait while the script finishes, then run in that order. Then change the delay from 0 to 100 and see the callback wait under Timers first.',
};

export const microtaskStarvationSample: SectionSample = {
  example: 'js-task-queues-microtask-starvation',
  section: 'Task Queues & Priority',
  title: 'Microtask Starvation',
  description: 'Each microtask schedules the next while a timer’s callback waits',
  lens: 'stack-queues',
  code: MICROTASK_STARVATION_CODE,
  tryIt:
    'watch the microtask queue refill five times while the timer’s callback waits in the task queue. Then raise the limit from 5 to 8 and see it wait longer.',
};

export const betweenMacrotasksSample: SectionSample = {
  example: 'js-task-queues-between-macrotasks',
  section: 'Task Queues & Priority',
  title: 'Microtasks Between Macrotasks',
  description: 'The microtask queue drains after each timer callback, before the next',
  lens: 'stack-queues',
  code: BETWEEN_MACROTASKS_CODE,
  tryIt:
    'watch two callbacks wait in the task queue, and a microtask run between them. Then add a second .then() inside the first timeout and see it also run before macrotask 2.',
};

export const timerApisSample: SectionSample = {
  example: 'js-web-apis-timers',
  section: 'Web APIs & Platform',
  title: 'Timer APIs',
  description: 'A 0 ms setTimeout callback still runs after a promise callback',
  lens: 'stack-queues',
  code: TIMER_APIS_CODE,
  tryIt:
    'watch the promise callback leave the microtask queue before the timer’s callback leaves the task queue. Then change the delay from 0 to 50 and see the callback wait under Timers.',
};

export const circularReferencesSolutionSample: SectionSample = {
  example: 'js-memory-leaks-circular-references',
  section: 'Memory Leaks',
  title: 'Breaking a circular reference',
  description: 'Two objects point at each other until cleanup() sets both references to null',
  lens: 'stack-heap',
  code: CIRCULAR_REFERENCES_SOLUTION_CODE,
  tryIt:
    'watch parent and child point at each other, then cleanup() set both references to null. Then delete the last line and see the cycle stay.',
};

export const clearedTimersSolutionSample: SectionSample = {
  example: 'js-memory-leaks-cleared-timers',
  section: 'Memory Leaks',
  title: 'Clearing timers',
  description: 'An interval and a timeout wait under Timers until stopPolling() clears them',
  lens: 'stack-queues',
  code: CLEARED_TIMERS_SOLUTION_CODE,
  tryIt:
    'watch the interval and the timeout appear under Timers, then vanish when stopPolling() runs. Then replace the last line with setTimeout(stopPolling, 2500) and see the interval fire twice first.',
};

/** Every section sample, in the order the Playground's Examples menu lists them. */
export const sectionSamples: readonly SectionSample[] = [
  callStackSample,
  promiseVsTimeoutSample,
  nestedPromisesSample,
  asyncAwaitOrderSample,
  queueMicrotaskSample,
  allQueueTypesSample,
  microtaskStarvationSample,
  betweenMacrotasksSample,
  timerApisSample,
  circularReferencesSolutionSample,
  clearedTimersSolutionSample,
];
