# 0005: Progress and milestones, not gamification

- Status: accepted (2026-10-12)
- Glossary: [CONTEXT.md](../../CONTEXT.md) (progress, milestone)
- Settles: the open item of [ADR 0004](0004-playground-traces-share-the-snapshot.md), "whether exercises carry achievements"

## Context

The Playground now has exercises with checks, and modules have quizzes. Both produce something a check has proved: an exercise was passed, a quiz was completed with a score. The site has no accounts and no server, so anything recorded about a learner lives in one browser.

The only "achievements" on the site were in the Big-O module's Gamification Hub, and none of them were real:

- Every visitor was shown an invented score of 1,250, 42 completed challenges and a 7-day streak.
- Its 13 achievements could never unlock, and its leaderboard was a list of made-up names.
- Its buttons only wrote to the browser console.

The owner wants learners to see where they are and to have real milestones to reach, without the site rewarding anything other than understanding.

## Decision

1. **Progress is a plain record; a milestone is earned on top of it.** Progress lists what the learner has done that a check proved. A milestone is a named point in that record. The words "achievement" and "gamification" are not used.
2. **Only what a check proves counts.** Milestones are earned from exercises passed and quiz results. Reading a section, playing a story to its last beat and using a feature of the Playground earn nothing, because they prove only that something was clicked.
3. **Nothing depends on a clock or a calendar, and nothing is a score.** No points, levels, streaks, speed or time-of-day milestones, and no leaderboard.
4. **Two kinds of milestone, never combined.**
   - Exercises: one per module that has at least three exercises, earned by passing all of them, and one for passing every exercise.
   - Quizzes: one per module that has a quiz, earned by a completed attempt that scores 80% or more. An attempt that timed out does not count.
   - There is no milestone for a module as a whole. Two checks cannot support the claim that a module has been learned.
5. **Seeing a solution takes nothing away.** An exercise passed after its solution was shown counts the same. The record still says the solution was seen.
6. **A milestone is stored when it is earned and is never taken back.** When exercises are added later, the learner keeps the milestone and the page says there is something new.
7. **Milestones are plain and all visible.** A name that states the act and the date it was earned; no rarity, no emoji. A milestone not yet earned is shown with what is left and links to it. Earning one shows one quiet line where it happened, with no animation.
8. **Progress belongs to the whole site**, on one page at `/progress`, linked from the header. No module has a progress or achievements section of its own.
9. **Progress lives in this browser only**, and the page says so. One control, with a confirmation, clears passed marks, solution-seen marks, milestones and quiz results. It does not clear the code the learner wrote.
10. **The Gamification Hub is removed**, with its fake numbers and its leaderboard. The score and streak inside one sitting of Big-O's Practice Challenges stay: they are the state of one game, are not stored, and claim nothing about the learner.
11. **The quiz shows no points and no tiers.** A result is the correct answers out of the total, a percentage and the time taken. The quiz keeps its time limit: it is a condition of the test, not a reward, and finishing sooner earns nothing. The quiz says what its milestone asks for. (Added 2026-10-13.)

## Considered options

- **Points, streaks, levels and daily goals.** Rejected: they reward showing up, not understanding. Without accounts a streak also ends when the browser's site data is cleared, which punishes the learner for something they did not do.
- **A record with no milestones.** Rejected as too flat: a learner gets no named point to aim for, and the page works less well as a guide to what to do next.
- **A leaderboard.** Rejected for good: it needs accounts, a server and moderation of names, and comparing learners is not what the site is for.
- **Milestones worked out from the record on every visit.** Rejected: publishing a new exercise would take a milestone away from everyone who had earned it.
- **Not counting an exercise passed after its solution was seen**, or a separate milestone for passing without one. Rejected: both turn the solution into a penalty and teach learners not to look.
- **Achievements per module**, as Big-O had. Rejected: the learner is one person across modules, and exercises already belong to lessons in several of them.
- **Waiting for accounts.** Rejected: it blocks everything on a backend the site does not have.

## Consequences

- **A learner can lose their progress** by clearing site data or changing browser. An export and import of a progress file is the answer if learners ask for it; it is not built now.
- **Two stored things, where a naive design has one.** The record of earned milestones is kept beside the exercise record, and the best quiz score per module is kept with it, because a quiz keeps only its last 8 results.
- **Existing learners** get their milestones worked out from what is already recorded on their first visit, dated that day, without the "reached" line.
- **A module gains its exercise milestone when its third exercise is written.** A test holds the minimum.
- **Big-O loses a section.** Its sidebar and navigation entries, the page case, the README line and the quiz references to it are removed.
- **`AGENTS.md` gains a Progress block** with rules 2 to 6 and 8, and links here.
