# Code Executives

A site that teaches programming by showing, step by step, what code and tools do to state you can't see. This glossary fixes the words used for its visualizations.

## Visualizations

**Story**:
A visualization of one concept, told as a sequence of beats and drawn literally (frames, objects, commits, refs), never as an everyday metaphor.
_Avoid_: Animation, demo, walkthrough

**Beat**:
One moment of a story: a full snapshot of every entity present, with a title, a caption and a shot.
_Avoid_: Slide, frame, stage

**Step model**:
The pure data behind a story, one snapshot per beat, that every view renders.
_Avoid_: Script, storyboard

**View**:
One rendering of a step model: 2D (the default) or 3D. Switching views keeps the beat.
_Avoid_: Mode, renderer (for the user-facing concept)

**Shot**:
The part of the scene a beat is framed on: an overview, one region, or a bridge between regions.
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

**Transcript**:
The running log of a scenario: at each beat, who acted, when, the command they ran, and what it printed.
_Avoid_: Console, log, terminal

**Hold view**:
The learner's choice to keep their own camera across beats instead of each beat's shot.
_Avoid_: Free camera, lock camera
