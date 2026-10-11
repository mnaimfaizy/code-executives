# Code Executives

A site that teaches programming by showing, step by step, what code and tools do to state you can't see. This glossary fixes the words used for its visualizations.

## Visualizations

**Story**:
A visualization of one concept, told as a sequence of beats and drawn literally (frames, objects, commits, refs), never as an everyday metaphor.
_Avoid_: Animation, demo, walkthrough

**Snapshot**:
The full state at one moment: every entity present, with its values and references. A snapshot is what a view draws.
_Avoid_: State, frame, diff

**Beat**:
One authored moment of a story: a snapshot with a title, a caption and a shot.
_Avoid_: Slide, frame, stage, step (a step is recorded, not authored)

**Beat model**:
The pure data behind a story: its beats in order, or for a scenario its paths, each beat holding one snapshot.
_Avoid_: Step model (the old name), script, storyboard

**Region**:
A fixed area of the scene that holds one kind of entity, such as the stack or the heap, or one cast member's copy of the system.
_Avoid_: Zone, panel, layer

**Entity**:
One thing drawn in a snapshot, such as a frame, an object or a commit, with an identity that stays the same from one snapshot to the next.
_Avoid_: Node, item, element

**Cell**:
An entity's fixed position within its region, the same in every view.
_Avoid_: Coordinate, grid position

**Slot**:
A named place in an entity that holds either a value or a reference.
_Avoid_: Field, property, variable

**Reference**:
A link from a slot to another entity.
_Avoid_: Pointer, edge, arrow

**Focus**:
The entities and slots a beat or step spotlights. An author chooses a beat's focus; a step's focus is whatever that step changed.
_Avoid_: Highlight, selection

**View**:
One way of drawing a snapshot: 2D (the default) or 3D. Switching views keeps the beat or step.
_Avoid_: Mode, renderer (for the user-facing concept)

**Shot**:
A part of the scene that the author named and framed a beat on. An overview, one region and a bridge between regions are the common kinds. Steps have no shot.
_Avoid_: Camera angle, zoom level

**Scenario**:
A story that follows a whole workplace workflow instead of one concept, told through a cast and a timeline, with choice points.
_Avoid_: Case study, simulation, use case

**Cast**:
The actors in a scenario: you, teammates, a reviewer, bots, and servers.
_Avoid_: Characters, users, personas

**Choice point**:
A beat in a scenario where the learner picks what the developer does next; each option leads down its own path.
_Avoid_: Branch (overloaded with Git), fork, decision

**Path**:
The linear run of beats that follows one option of a choice point.
_Avoid_: Branch, route, track

**Timeline**:
The clock times at which a scenario's cast acts, in order.
_Avoid_: Schedule; never the steps of a trace

**Transcript**:
The running log of a scenario: at each beat, who acted, when, the command they ran or the action they took, and what it printed.
_Avoid_: Log, terminal, console (the Console belongs to the Playground)

**Hold view**:
The learner's choice to keep their own camera across beats instead of each beat's shot.
_Avoid_: Free camera, lock camera

## Playground

**Playground**:
The one place where a learner runs their own code and watches what it does to state. There is exactly one; no module has a playground of its own.
_Avoid_: Sandbox, editor, IDE, code lab

**Trace**:
The record of one run of the learner's code in the Playground: a sequence of steps. A trace is recorded, never authored or approved, so it is not a story.
_Avoid_: Story, timeline, recording, execution

**Step**:
One moment of a trace: the snapshot recorded when one statement ran, with the line that ran.
_Avoid_: Beat, snapshot (the snapshot is the state a step holds)

**Console**:
What the learner's code printed during a run, in order. It has no cast and no clock times, so it is not a transcript.
_Avoid_: Transcript, output, log

**Lens**:
The learner's choice of which part of a snapshot the Playground draws, such as the stack and heap or the stack and queues. A lens is independent of the view: any lens can be drawn in 2D or 3D.
_Avoid_: View, mode, visualization

**Example**:
Prebuilt code the learner can load into the Playground to run and watch, with a suggested lens and no goal.
_Avoid_: Snippet, template, scenario, demo

**Exercise**:
A task in the Playground with a goal, checks that pass or fail on the learner's code, and hints.
_Avoid_: Problem, challenge, kata, test

## Modules

**Marble diagram tool**:
The RxJS module's interactive diagram: the learner writes a stream as marbles, picks an operator and sees the stream it produces. It does not run the learner's code, so it is not a playground.
_Avoid_: RxJS playground, marble playground
