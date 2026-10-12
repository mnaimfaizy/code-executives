/**
 * What the Event Loop story's program has printed by each beat.
 *
 * The beat model holds the whole run's output (`STORY_OUTPUT`) and each beat's line, but not how
 * much of the output a beat has reached. Until it does, this derives it: the output is in order,
 * so only the next line can print, and it has printed once a beat's line reaches its
 * `console.log`, either by standing on it or by moving forward past it since the beat before.
 */
import { STORY_BEATS, STORY_CODE, STORY_OUTPUT, type StoryBeat } from './eventLoopStory';

const CODE_LINES = STORY_CODE.split('\n');

/** 1-based line of the `console.log` that prints `text`; 0 when the code has none. */
const logLine = (text: string) =>
  CODE_LINES.findIndex((line) => line.includes(`console.log('${text}')`)) + 1;

/** For each beat, how many lines of `output` the run has printed by then. */
export function printedCounts(
  beats: readonly Pick<StoryBeat, 'line'>[] = STORY_BEATS,
  output: readonly string[] = STORY_OUTPUT
): number[] {
  let printed = 0;
  let previous = Infinity;
  return beats.map(({ line }) => {
    // A jump backwards (a call, a callback starting) reaches only the line it lands on.
    const from = line > previous ? previous + 1 : line;
    while (printed < output.length) {
      const at = logLine(output[printed]);
      if (at < from || at > line) break;
      printed++;
    }
    previous = line;
    return printed;
  });
}

const COUNTS = printedCounts();

export interface ConsoleSoFar {
  /** Every line printed by this beat, oldest first. */
  lines: readonly string[];
  /** How many of them, counted from the end, this beat itself printed. */
  fresh: number;
}

/** The Console as it stands on `beat`, a beat of this story. */
export function consoleAt(beat: StoryBeat): ConsoleSoFar {
  const index = STORY_BEATS.indexOf(beat);
  const count = COUNTS[index] ?? 0;
  return { lines: STORY_OUTPUT.slice(0, count), fresh: count - (COUNTS[index - 1] ?? 0) };
}
