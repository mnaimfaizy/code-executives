/**
 * Line mapping for code that was compiled before it ran (TypeScript → JavaScript).
 *
 * Reads the `mappings` field of a version 3 source map and answers one question:
 * which line of the learner's source produced this line of the emitted code?
 * Columns and names are decoded only as far as needed to keep the line count right.
 */

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decode one segment of base64 VLQ numbers, e.g. "AAKA" → [0, 0, 5, 0] */
export function decodeVlq(segment: string): number[] {
  const values: number[] = [];
  let value = 0;
  let shift = 0;

  for (const char of segment) {
    const digit = BASE64.indexOf(char);
    if (digit === -1) throw new Error(`Invalid source map character "${char}"`);
    value += (digit & 31) * 2 ** shift;
    if (digit & 32) {
      // Continuation bit: the number goes on in the next character
      shift += 5;
    } else {
      // The lowest bit is the sign
      const magnitude = Math.floor(value / 2);
      values.push(value % 2 === 1 ? -magnitude : magnitude);
      value = 0;
      shift = 0;
    }
  }

  return values;
}

/**
 * Build a table of emitted line → source line (both 1-based) from a `mappings` string.
 * A line takes the source line of its first segment: that is where a statement
 * that starts the line came from. Lines with no segment are left out.
 */
export function decodeLineMap(mappings: string): Map<number, number> {
  const lines = new Map<number, number>();
  // Source lines are stored as differences that run on across the whole file
  let sourceLine = 0;

  mappings.split(';').forEach((group, index) => {
    if (group === '') return;
    for (const segment of group.split(',')) {
      const fields = decodeVlq(segment);
      // A segment with one field has a column and no source position
      if (fields.length < 4) continue;
      sourceLine += fields[2];
      if (!lines.has(index + 1)) lines.set(index + 1, sourceLine + 1);
    }
  });

  return lines;
}

/**
 * Make a function that turns an emitted line into the source line.
 * A line the map says nothing about takes the nearest mapped line above it,
 * then the nearest below; with no map at all, lines pass through unchanged.
 */
export function createLineMapper(mappings: string | null | undefined): (line: number) => number {
  if (!mappings) return (line) => line;

  const table = decodeLineMap(mappings);
  if (table.size === 0) return (line) => line;
  const mapped = Array.from(table.keys()).sort((a, b) => a - b);

  return (line) => {
    const exact = table.get(line);
    if (exact !== undefined) return exact;

    let above: number | undefined;
    for (const candidate of mapped) {
      if (candidate > line) break;
      above = candidate;
    }
    return table.get(above ?? mapped[0]) ?? line;
  };
}
