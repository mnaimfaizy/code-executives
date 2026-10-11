import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { decodeVlq, decodeLineMap, createLineMapper } from './sourceMapLines';
import { examples } from '../utils/examples';

/** Strip types the way the Playground asks Monaco's worker to: no down-levelling, with a map */
function emit(source: string): { lines: string[]; mapLine: (line: number) => number } {
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      sourceMap: true,
    },
  });
  const mappings = (JSON.parse(output.sourceMapText ?? '{}') as { mappings: string }).mappings;
  return { lines: output.outputText.split('\n'), mapLine: createLineMapper(mappings) };
}

/** 1-based line of the first line that contains `text` */
function lineOf(lines: string[], text: string): number {
  const index = lines.findIndex((line) => line.includes(text));
  expect(index).toBeGreaterThanOrEqual(0);
  return index + 1;
}

describe('decodeVlq', () => {
  it('decodes single-character values and their signs', () => {
    expect(decodeVlq('AAAA')).toEqual([0, 0, 0, 0]);
    expect(decodeVlq('AAKA')).toEqual([0, 0, 5, 0]);
    expect(decodeVlq('D')).toEqual([-1]);
  });

  it('decodes values that continue into the next character', () => {
    expect(decodeVlq('gB')).toEqual([16]);
    expect(decodeVlq('hB')).toEqual([-16]);
    expect(decodeVlq('ggB')).toEqual([512]);
  });

  it('rejects characters outside base64', () => {
    expect(() => decodeVlq('A*')).toThrow();
  });
});

describe('decodeLineMap', () => {
  it('maps each emitted line to the source line of its first segment', () => {
    // line 1 ← source 1; line 2 ← source 2, then a later segment from source 4
    expect(decodeLineMap('AAAA;AACA,IAEA')).toEqual(
      new Map([
        [1, 1],
        [2, 2],
      ])
    );
  });

  it('carries the source line across lines and skips lines with no segment', () => {
    // line 1 ← source 3; line 2 has nothing; line 3 ← source 3 + 2 = 5
    expect(decodeLineMap('AAEA;;AAEA')).toEqual(
      new Map([
        [1, 3],
        [3, 5],
      ])
    );
  });

  it('ignores segments that carry only a column', () => {
    expect(decodeLineMap('A,AACA')).toEqual(new Map([[1, 2]]));
  });
});

describe('createLineMapper', () => {
  it('passes lines through when there is no map', () => {
    expect(createLineMapper(null)(7)).toBe(7);
    expect(createLineMapper('')(7)).toBe(7);
  });

  it('gives an unmapped line the nearest mapped line above it, else the first one', () => {
    const mapLine = createLineMapper(';AAEA;;AAEA');
    expect(mapLine(2)).toBe(3);
    expect(mapLine(3)).toBe(3);
    expect(mapLine(4)).toBe(5);
    expect(mapLine(1)).toBe(3);
    expect(mapLine(99)).toBe(5);
  });

  it('finds the TypeScript line after declarations that emit nothing', () => {
    const source = [
      'interface User {',
      '  name: string;',
      '}',
      '',
      'type Id = number;',
      'const id: Id = 1;',
      'function greet(',
      '  user: User,',
      '  times: number',
      '): string {',
      '  return user.name.repeat(times);',
      '}',
      'console.log(greet({ name: "a" }, id));',
    ];
    const { lines, mapLine } = emit(source.join('\n'));

    // The emitted code is shorter, so its line numbers are not the source's
    expect(lineOf(lines, 'const id = 1;')).not.toBe(6);
    expect(mapLine(lineOf(lines, 'const id = 1;'))).toBe(6);
    expect(mapLine(lineOf(lines, 'function greet('))).toBe(7);
    expect(mapLine(lineOf(lines, 'return user.name.repeat(times);'))).toBe(11);
    expect(mapLine(lineOf(lines, 'console.log(greet('))).toBe(13);
  });

  it('maps the statements of the TypeScript examples back to the same text', () => {
    const typescriptExamples = examples.filter((example) => example.language === 'typescript');
    expect(typescriptExamples.length).toBeGreaterThan(0);

    for (const example of typescriptExamples) {
      const sourceLines = example.code.split('\n');
      const { lines, mapLine } = emit(example.code);

      lines.forEach((text, index) => {
        if (!/^\s*(console\.|return |if \()/.test(text)) return;
        expect(sourceLines[mapLine(index + 1) - 1].trim()).toBe(text.trim());
      });
    }
  });
});
