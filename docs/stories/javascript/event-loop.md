# The Event Loop: What Runs Next?

- Module / section: javascript › Event Loop & Coordination
- Question: When several callbacks are waiting, how does the event loop decide which one runs next?
- Sources: `docs/RESEARCH/JavaScript Execution Flow Report.md` › 4.1 to 4.3 (one call stack, run to completion, callbacks wait in queues), 5.1 (callbacks move to the stack only when it is empty), 5.2 (timers feed the macrotask queue, FIFO), 5.3 (promises, `async`/`await` and `queueMicrotask` feed the microtask queue; all microtasks run, including ones added meanwhile, before the first macrotask; one macrotask per cycle). The HTML Standard (event loop processing model, "perform a microtask checkpoint", timers, `queueMicrotask`) and ECMA-262 (`Await`, `PerformPromiseThen`, `HostEnqueuePromiseJob`) for the ordering rules the report does not spell out; see "Claim sources". Quiz ids: javascript-q03 (microtasks drain after the current task), q07 (promise reactions and `queueMicrotask` are microtasks, a 0 ms `setTimeout` is a task), q10 (the code after `await` re-enters through the microtask queue), q11 and q31 (handler runs, microtasks are drained, the timer callback runs on a later task), q23 and q29 (microtasks queued by microtasks run before the next task).
- Status: approved (2026-10-12). Owner decisions: a 0 ms timer is in the task queue right after `setTimeout` returns; captions say "task queue"; only beat 7 asks the learner to predict; the section's wrong `queueMicrotask` scenario is fixed in the story PR.

Wording: the research report and the section's prose say "macrotask queue"; the HTML Standard and the snapshot contract say "task queue" (`tasks`). The story says **task queue** and **task**, and each caption that first names it can add "(also called the macrotask queue)".

## Code

```js
function onTimeout() { console.log('timeout'); }
function onQueued() { console.log('queued'); }
function onResolved() {
  console.log('promise');
  queueMicrotask(onQueued);
}
async function main() {
  setTimeout(onTimeout, 0);
  Promise.resolve().then(onResolved);
  console.log('before await');
  await null;
  console.log('after await');
}
main();
console.log('script end');
```

15 lines. It prints, in this order (checked by running it in Node 2026-10-12; a browser follows the same two specifications):

```
before await
script end
promise
after await
queued
timeout
```

Why this program: every callback is a named function, so a queue entry's label is a name the learner can find in the code. No variable holds an object, so the heap stays empty and nothing competes with the queues. The timer is set **first** and asks for 0 ms, so a learner's best guess ("first asked, no delay, runs first") is as wrong as it can be: `timeout` prints last.

## Regions and shots

Four regions, exactly the snapshot contract's (`src/shared/snapshot/types.ts`). The heap (`objects`) is empty on every beat and is not drawn.

- **stack** (`frames`): the call stack, bottom first. Frames: `global`, `main`, `onResolved`, `onQueued`, `onTimeout`.
- **microtasks**: the microtask queue, first to run first.
- **tasks**: the task queue, first to run first.
- **timers**: timers still counting down. Not a queue.

Entities and ids. A callback keeps **one id** from the region where it waits to the frame it becomes, so a view can move it instead of removing one thing and adding another:

| id | As a queue entry (`label`, `source`, `delay`) | As a frame (`name`) | Path through the regions |
|---|---|---|---|
| `global` | never queued | `global` | stack only |
| `main` | `main`, `await` | `main()` | stack → microtasks → stack |
| `onTimeout` | `onTimeout`, `timeout`, `0` | `onTimeout()` | timers → tasks → stack |
| `onResolved` | `onResolved`, `promise` | `onResolved()` | microtasks → stack |
| `onQueued` | `onQueued`, `queueMicrotask` | `onQueued()` | microtasks → stack |

Slots. `global` has four: `onTimeout`, `onQueued`, `onResolved`, `main`, each with value `ƒ` (as in the Stack ↔ Heap story). No other frame has slots: no function here takes a parameter or declares a variable.

Placement. A queue entry has no authored cell (the contract gives it none): its place is its index in the queue, and moving up as the queue empties is the point. Frames stack in order. No region ever holds more than two entries or two frames.

| Shot | Must keep in frame |
|---|---|
| overview | all four regions: stack, microtasks, tasks, timers |
| stack | the stack region, room for two frames |
| timers-tasks | the timers region and the tasks region, and the path an entry takes between them |
| stack-microtasks | the stack and the microtasks region, and the path between them; tasks may fall out of frame |
| stack-tasks | the stack, the tasks region and the (empty) microtasks region between or beside them |

In 2D all four regions fit at once, so a shot only decides what is emphasised; the 3D view uses it to frame the camera.

## Beats

Each beat is the snapshot **after** the named line has had its effect. "Prints" is what the run has written to the Console by that beat; the snapshot does not hold it.

| # | id | Line | Shot | Focus | What is on screen (literal) | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|
| 1 | script-starts | 14 | overview | `global` | stack: `global` (4 slots, all `ƒ`). microtasks, tasks, timers: empty. | The script starts as one task. The engine pushes the global frame, which holds the four functions. Nothing is waiting anywhere yet: the microtask queue, the task queue and the timers are empty. |
| 2 | call-main | 14 | stack | `main` | stack: `global`, `main()`. Queues and timers empty. | `main()` is called. An async function starts like any other: it gets a frame on top of the stack and runs right away, on the same stack as its caller. |
| 3 | timer-set | 8 | timers-tasks | `onTimeout` | stack: `global`, `main()`. timers: `onTimeout` (timeout, 0 ms). microtasks, tasks: empty. | `setTimeout(onTimeout, 0)` does not call `onTimeout`. It starts a timer that holds the callback and returns at once. `main` continues to the next line. |
| 4 | timer-fires | 8 | timers-tasks | `onTimeout` | stack: `global`, `main()`. timers: empty. tasks: `onTimeout`. microtasks: empty. | Zero milliseconds are already over, so the timer fires. Firing does not run the callback either: it puts `onTimeout` in the task queue. It is first in line, and it has to wait, because the stack is not empty. |
| 5 | reaction-queued | 9 | stack-microtasks | `onResolved` | stack: `global`, `main()`. microtasks: `onResolved` (promise). tasks: `onTimeout`. timers: empty. | `Promise.resolve()` is already fulfilled, so `.then(onResolved)` queues its reaction straight away, in a different queue: the microtask queue. Two callbacks now wait, and `onTimeout` has waited longer. |
| 6 | await-splits-main | 11 | stack-microtasks | `main` | stack: `global` only. microtasks: `onResolved`, `main` (await). tasks: `onTimeout`. Prints so far: `before await`. | `main` prints `before await` and reaches `await null`. `await` does not hold the stack. It cuts `main` in two: the frame leaves the stack, and the rest of the function joins the microtask queue, behind `onResolved`. Control goes back to the caller. |
| 7 | stack-empties | 15 | overview | `onResolved`, `main`, `onTimeout` | stack: empty. microtasks: `onResolved`, `main`. tasks: `onTimeout`. Prints so far: `before await`, `script end`. | The script prints `script end`, before `after await`, and ends. The global frame is popped and the stack is empty. Three callbacks wait: two microtasks and one task. `onTimeout` has waited longest. Which one runs next? |
| 8 | microtask-before-task | 4 | stack-microtasks | `onResolved`, `onTimeout` | stack: `onResolved()`. microtasks: `main`. tasks: `onTimeout` (unmoved). Prints: `promise`. | Not the timer. With the stack empty, the event loop takes the first microtask: `onResolved` gets a frame and prints `promise`. The task queue is not looked at while a microtask is waiting, however long its task has waited. |
| 9 | microtask-queues-microtask | 5 | stack-microtasks | `onQueued` | stack: `onResolved()`. microtasks: `main`, `onQueued` (queueMicrotask). tasks: `onTimeout`. | Still inside `onResolved`, `queueMicrotask(onQueued)` adds a new microtask at the back of the queue. It did not exist when the stack became empty. `onTimeout` is still waiting. |
| 10 | main-resumes | 12 | stack-microtasks | `main` | stack: `main()`. microtasks: `onQueued`. tasks: `onTimeout`. Prints: `after await`. | `onResolved` returns and the stack is empty again. The next microtask is the rest of `main`: its frame goes back on the stack and it continues after the `await`, printing `after await`. Resuming an async function is one more microtask. |
| 11 | late-microtask-still-first | 2 | stack-microtasks | `onQueued`, `onTimeout` | stack: `onQueued()`. microtasks: empty. tasks: `onTimeout` (unmoved). Prints: `queued`. | `main` returns. The queue is not empty: `onQueued`, added during this same round, runs now and prints `queued`. The event loop does not stop at the microtasks it started with. It keeps going until the queue is empty. |
| 12 | task-runs-last | 1 | stack-tasks | `onTimeout` | stack: `onTimeout()`. microtasks, tasks, timers: empty. Prints: `timeout`. | Only now, with the stack and the microtask queue both empty, does the event loop take one task. `onTimeout` runs and prints `timeout`: asked for first, with 0 ms, and last to run. When it returns, nothing is left to run. |

Aha beats:

- #6 `await-splits-main`: breaks "`await` pauses the program until the value is ready" and "the code after `await` just carries on in the same frame" (javascript-q10). The frame leaves the stack, `script end` prints before `after await`, and the rest of `main` is an ordinary entry in the microtask queue.
- #8 `microtask-before-task`: breaks "`setTimeout(fn, 0)` runs straight away" and "callbacks run in the order they were scheduled". `onTimeout` entered a queue two beats before `onResolved` and is at the front of its queue, and it does not run. This is the beat the learner is asked to predict (beat 7 ends with the question).
- #11 `late-microtask-still-first`: breaks "a microtask queued now waits for the next turn, after the timer". `onQueued` was queued after the stack emptied, and it still runs before the task that has waited since beat 4.

## Key claim the beat model's test must prove

**From the beat where the stack empties to the beat where the task runs, the microtask queue is emptied completely, including a microtask queued along the way, and only then does the task leave the task queue.**

Proved from the data through helpers, not by restating captions. Suggested helpers: `whereIs(beat, id)` returning `'stack' | 'microtasks' | 'tasks' | 'timers' | undefined`, and `running(beat)` returning the id of the top frame.

1. **No task runs over a waiting microtask.** In every beat where the top frame's id was in `tasks` on the beat before, that earlier beat's `microtasks` is empty. In this story that singles out beat 12, whose earlier beat (11) has an empty microtask queue and the last microtask's frame on the stack.
2. **The timer waits through the whole drain (aha #8, #11).** `whereIs(beat, 'onTimeout')` is `'tasks'` on every beat from 4 to 11, and `'stack'` only on 12. Between 7 and 12 the entries that reach the stack are, in order, `onResolved`, `main`, `onQueued`.
3. **The late microtask is really late (aha #11).** `onQueued` is in no region on beat 7 (when the stack empties), is in `microtasks` on beat 9, and is on the stack on beat 11, which is before beat 12.
4. **`await` splits the function (aha #6).** On beat 6, `main` is not in `frames` and is in `microtasks` with `source: 'await'`, behind `onResolved`; on beat 10 it is the top frame again, with the same id.
5. **Queues are first in, first out.** Entries leave `microtasks` in the order they entered: `onResolved`, `main`, `onQueued`.
6. **One id, one place.** On every beat, no id is in two regions at once.

Besides this, the usual model checks (12 beats, unique ids, `line` within the code, every focus key exists) and the trace comparison: running `STORY_CODE` through the Playground's tracer gives the six Console lines above in that order, and holds every beat's four regions, in order.

## What this replaces in the section

`src/features/javascript/components/sections/EventLoop.tsx` (label "Event Loop & Coordination"). This spec changes no code; it records the intent for the builders.

**Replaced by the story:**

- The "Interactive Simulation" block: the `EventLoop2D` drawing, its Next Step / Reset buttons, the "Event Loop Explained" side panel, the colour legend, and the state behind them (`initialStack`, `initialMicrotasks`, `initialMacrotasks`, `SimulationState`, `nextStep`, `reset`, `animating`). That simulation starts from a stack and queues filled with labels that no program produced (`main()`, `Promise.then()`, `DOM Event`), pops them in a fixed order, and lights a traffic light per phase. The story shows the same rule on one real program, and the traffic light, a stand-in, goes.
- `components/visualizations/2d/EventLoop2D.tsx` is then unused by this section. Whether the file is deleted is the architect's call (check for other importers first).

**Stays as prose:**

- The hero, "How JavaScript Achieves Concurrency" (single thread, run to completion), "The Loop Phases" (including the render step, which the story does not show), "Queues in Detail", "Common Gotchas", "Key Takeaways" and the navigation buttons.
- "Execution Order Scenarios" (the tabbed code and output). It complements the story with other small programs. Suggested placement: the story directly after "The Loop Phases", the scenarios after the story.

**Found while grounding, for the architect (not part of this story):**

- The `queueMicrotask` scenario is wrong. Its code calls `queueMicrotask` before `Promise.resolve().then`, so it prints `queueMicrotask`, `Promise.then`, `setTimeout` (checked in Node), not the listed `Promise.then`, `queueMicrotask`, `setTimeout`. Its description, "queueMicrotask() is lower priority than Promise.then()", is also false: both go to the same queue, first in, first out, which is exactly what beats 9 to 11 show.
- The gotcha "subject to a minimum 4 ms clamp in browsers" is too broad: the HTML Standard clamps to 4 ms only once timers are nested more than five deep. The story's timer is not nested.

## Claim sources

"Report" is `docs/RESEARCH/JavaScript Execution Flow Report.md`. Specification clauses are cited by algorithm name, from the writer's knowledge of the texts; section numbers were not checked against the live documents and are left out.

| Beat | Claim | Source |
|---|---|---|
| 1, 2 | One call stack; a call pushes a frame and must finish before the next thing runs | Report › 4.1, 4.2 |
| 1 | Running a script is itself a task | HTML › event loop processing model (script execution is queued as a task). Report silent |
| 2 | An async function runs synchronously up to its first `await` | ECMA-262 › AsyncFunctionStart / AsyncBlockStart. Report silent |
| 3 | `setTimeout` hands the callback to the timers and returns without running it | Report › 4.3 ("passes the task off"; the callback "is not immediately pushed back onto the Call Stack") |
| 4 | When the timer completes, its callback is placed in the (macro)task queue, not on the stack | Report › 4.3, 5.2, 5.4 step 5; HTML › timers ("run steps after a timeout", which queues a task) |
| 4 | With 0 ms the callback is in the task queue before the script has finished | HTML › timers: the wait happens in parallel, then a task is queued. **The exact moment is not observable**; see Contract gaps |
| 5 | Promise `.then` callbacks go to the microtask queue, a separate, higher-priority queue | Report › 5.3; quiz q07 |
| 5 | A reaction on an already fulfilled promise is queued at the `.then` call | ECMA-262 › PerformPromiseThen (fulfilled state → HostEnqueuePromiseJob). Report silent |
| 6, 10 | The code after `await` resumes through the microtask queue; the frame leaves the stack and the caller continues | Report › 5.3 lists `async/await` as a microtask source; quiz q10 ("the current execution unwinds"); ECMA-262 › Await (PerformPromiseThen on the awaited value, then the async function's execution context is removed from the stack) |
| 6 | `await null` costs exactly one microtask | ECMA-262 › Await: PromiseResolve wraps the non-promise value in a fulfilled promise, so one reaction job is queued at once. Report silent |
| 7, 8 | The event loop moves a callback to the stack only when the stack is empty | Report › 5.1 |
| 8, 12 | With the stack empty, all microtasks run before the first task | Report › 5.3 steps 2 and 3, and its table; HTML › "perform a microtask checkpoint"; quiz q03, q07, q11, q31 |
| 9, 11 | A microtask added by a microtask runs in the same round, before the next task | Report › 5.3 step 2 ("If a microtask adds new microtasks to the queue, they are executed immediately within the same cycle"); HTML › microtask checkpoint loops "while the microtask queue is not empty" |
| 9 | `queueMicrotask` puts its callback in the microtask queue | Report › 5.3; quiz q07 |
| 8 to 11 | Both queues are first in, first out | Report › 5.2 (macrotask queue is FIFO). For the microtask queue: HTML › microtask checkpoint dequeues the oldest microtask. Report does not say FIFO for microtasks |
| 12 | One task is taken per cycle, after the microtask queue is clear | Report › 5.3 step 3 and table |

## UNSOURCED

Not backed by the research report; each rests on the specifications as cited above, from memory and not re-read for this spec. The architect may want them verified against the live texts before approval.

- Beat 1: the script's own run is a task.
- Beat 2: an async function's body runs synchronously until the first `await`.
- Beat 4: **when** a 0 ms timer's callback joins the task queue relative to the running script (see Contract gaps).
- Beat 5: a reaction on an already fulfilled promise is queued immediately at `.then`.
- Beat 6: `await null` takes exactly one microtask, and the rest of `main` therefore queues behind `onResolved` and ahead of `onQueued`. The printed order (`promise`, `after await`, `queued`) confirms the outcome; the mechanism is from ECMA-262.
- Beats 8 to 11: the microtask queue is first in, first out (the report says so only for the macrotask queue).

Nothing in the story depends on rendering, the 4 ms clamp, Node's `process.nextTick` or `MutationObserver`; none is claimed.

## Contract gaps

The story is expressible in the contract as it stands; no field is missing. Three points need a shared convention, not a new field:

1. **When a timer moves from `timers` to `tasks` (beat 4).** The snapshot has no clock, and a running program cannot see the moment a timer fires; it can only see that its callback ran later. The story uses: *a timer is in `tasks` from the first snapshot taken after its delay has passed*. For 0 ms that is the snapshot right after `setTimeout` returns, while `main` is still on the stack. The tracer must use the same rule or beats 3 to 6 will not match a trace. If the tracer instead moves timers only when the stack empties, beat 4 has to move to after beat 7, and the aha weakens ("first in line and still waiting" is lost). If the tracer never shows a 0 ms timer in `timers` at all, beat 3 is unobservable and should be marked so in the test, like `gc-sweep`.
2. **A callback's id across regions.** The contract says an entity keeps one id as it moves between the three queue regions. The story also reuses that id for the **frame** the callback becomes (and, for `main`, for the frame it was). The types allow it (`StackFrame.id` and `QueueEntry.id` are both strings); the tracer and the views have to agree to it.
3. **The stack after the script ends.** Beats 7 to 12 need `frames` to be empty, or to hold only a callback's frame, with no `global` frame underneath. In a trace, the four functions' scope may then appear on the heap as a `scope` object kept alive by the callbacks; the story leaves `objects` empty, so the trace comparison should compare frames and the three queue regions, and ignore `objects`.

The Console is not part of the snapshot. The captions state what has printed; the test checks the order against the trace's Console.

## Open questions for the owner

1. **Beat 4's convention** (Contract gaps 1): accept "a 0 ms timer is already in the task queue while the script still runs"? It is the strongest version of the aha and agrees with the HTML Standard's model, but it is a convention, not an observation.
2. **Three aha beats or one?** The request asked for one predict-wrongly moment; beat 8 is it, and beat 7 asks the question. Beats 6 and 11 are marked aha too because each breaks its own wrong model and each gets a test. Say so if only beat 8 should be presented as the prediction prompt.
3. **"Task" or "macrotask"** in captions. The spec uses "task queue" to match the contract and the HTML Standard; the section's prose says "macrotask queue" throughout.
4. **The wrong `queueMicrotask` scenario** in the existing section: fix it in the same PR as the story, or separately?

## Try it in the Playground

The story's code is an **example** a learner should be able to open in the Playground with the **Stack & Queues** lens, run, and step through: the trace's steps hold the same four regions as these beats, in 2D or 3D. A trace has no captions and no shots, so the story stays the place where the order is explained and the Playground the place to change the program and see what moves: swap lines 8 and 9, raise the delay, add a second `await`. A later PR adds the link from the story to the Playground.
