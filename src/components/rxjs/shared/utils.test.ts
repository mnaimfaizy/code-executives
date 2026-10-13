import { describe, expect, it } from 'vitest';
import {
  applyOperator,
  applyOperators,
  createMarbleStream,
  describeOperator,
  describeStream,
  operatorConfigs,
  parseMarbleString,
} from './utils';
import type { OperatorSettings } from './utils';
import type { MarbleStream } from './types';

const stream = (marbles: string): MarbleStream => createMarbleStream('input', 'Input', marbles);

/** A stream as "value@time" tokens, with "|" for completion and "#" for error. */
const shape = (result: MarbleStream): string[] =>
  result.events.map((event) => {
    const mark =
      event.type === 'complete' ? '|' : event.type === 'error' ? '#' : String(event.value);
    return `${mark}@${event.time}`;
  });

const run = (marbles: string, ...operators: OperatorSettings[]): string[] =>
  shape(applyOperators(stream(marbles), operators));

describe('parseMarbleString', () => {
  it('reads values, time and completion', () => {
    expect(shape(stream('--a--b--|'))).toEqual(['a@20', 'b@50', '|@80']);
    expect(stream('--a--b--|')).toMatchObject({ isComplete: true, hasError: false });
  });

  it('reads an error and ignores what follows it', () => {
    expect(shape(stream('--1--#--2'))).toEqual(['1@20', '#@50']);
    expect(stream('--1--#--2')).toMatchObject({ isComplete: false, hasError: true });
  });

  it('gives no events for an empty string', () => {
    expect(parseMarbleString('')).toEqual([]);
    expect(stream('')).toMatchObject({ events: [], isComplete: false, hasError: false });
  });
});

describe('offered operators', () => {
  it('are exactly the ones the tool implements', () => {
    expect(operatorConfigs.map((config) => config.name)).toEqual([
      'map',
      'filter',
      'take',
      'skip',
      'distinctUntilChanged',
    ]);
  });

  it('give map and filter a fixed list of choices', () => {
    const labels = (name: string) =>
      operatorConfigs
        .find((config) => config.name === name)
        ?.choices?.options.map((option) => option.label);
    expect(labels('map')).toEqual(['× 2', 'to upper case', '+ 1']);
    expect(labels('filter')).toEqual(['even only', 'greater than 0', 'odd only']);
  });

  it.each(operatorConfigs.map((config) => config.name))(
    '%s leaves an empty stream empty',
    (name) => {
      // take is the exception below: it completes by itself.
      if (name === 'take') return;
      expect(run('', { name })).toEqual([]);
    }
  );

  it.each(operatorConfigs.map((config) => config.name))(
    '%s does not change the stream it is given',
    (name) => {
      const input = stream('--1--1--2--|');
      const before = structuredClone(input);
      applyOperator(input, { name });
      expect(input).toEqual(before);
    }
  );
});

describe('map', () => {
  it('doubles each value and keeps completion', () => {
    expect(run('--1--2--3--|', { name: 'map', choice: 'double' })).toEqual([
      '2@20',
      '4@50',
      '6@80',
      '|@110',
    ]);
  });

  it('adds one to each value', () => {
    expect(run('-1-9|', { name: 'map', choice: 'increment' })).toEqual(['2@10', '10@30', '|@40']);
  });

  it('turns each value into upper case', () => {
    expect(run('-a-b|', { name: 'map', choice: 'upperCase' })).toEqual(['A@10', 'B@30', '|@40']);
  });

  it('gives NaN for arithmetic on a marble that is not a number', () => {
    expect(run('-a|', { name: 'map', choice: 'double' })).toEqual(['NaN@10', '|@20']);
  });

  it('passes an error through', () => {
    const result = applyOperator(stream('-1-#'), { name: 'map', choice: 'double' });
    expect(shape(result)).toEqual(['2@10', '#@30']);
    expect(result.hasError).toBe(true);
  });

  it('uses the first choice when none is given', () => {
    expect(run('-3|', { name: 'map' })).toEqual(['6@10', '|@20']);
  });
});

describe('filter', () => {
  it('keeps even values', () => {
    expect(run('-1-2-3-4|', { name: 'filter', choice: 'even' })).toEqual(['2@30', '4@70', '|@80']);
  });

  it('keeps odd values', () => {
    expect(run('-1-2-3-4|', { name: 'filter', choice: 'odd' })).toEqual(['1@10', '3@50', '|@80']);
  });

  it('keeps values greater than 0', () => {
    expect(run('-0-1-2|', { name: 'filter', choice: 'positive' })).toEqual([
      '1@30',
      '2@50',
      '|@60',
    ]);
  });

  it('drops marbles that are not numbers', () => {
    expect(run('-a-2|', { name: 'filter', choice: 'even' })).toEqual(['2@30', '|@40']);
  });

  it('passes an error through', () => {
    expect(run('-1-#', { name: 'filter', choice: 'even' })).toEqual(['#@30']);
  });
});

describe('take', () => {
  it('completes right after the last value it takes', () => {
    const result = applyOperator(stream('--a--b--c--d--|'), { name: 'take', count: 2 });
    expect(shape(result)).toEqual(['a@20', 'b@50', '|@60']);
    expect(result.isComplete).toBe(true);
  });

  it('completes even when the source never does', () => {
    const result = applyOperator(stream('-a-b-c-'), { name: 'take', count: 1 });
    expect(shape(result)).toEqual(['a@10', '|@20']);
    expect(result.isComplete).toBe(true);
  });

  it('take(0) emits nothing and completes at once', () => {
    const result = applyOperator(stream('--a--b--|'), { name: 'take', count: 0 });
    expect(shape(result)).toEqual(['|@0']);
    expect(result.isComplete).toBe(true);
  });

  it('take(0) completes an empty stream too', () => {
    expect(run('', { name: 'take', count: 0 })).toEqual(['|@0']);
  });

  it('leaves an empty stream empty when it waits for values', () => {
    expect(run('', { name: 'take', count: 3 })).toEqual([]);
  });

  it('keeps the source completion when there are fewer values than the count', () => {
    expect(run('-a-b-|', { name: 'take', count: 5 })).toEqual(['a@10', 'b@30', '|@50']);
  });

  it('passes an error that comes before the count is reached', () => {
    const result = applyOperator(stream('-a-#'), { name: 'take', count: 5 });
    expect(shape(result)).toEqual(['a@10', '#@30']);
    expect(result).toMatchObject({ isComplete: false, hasError: true });
  });

  it('never reaches an error that comes after the count', () => {
    const result = applyOperator(stream('-a-b-#'), { name: 'take', count: 1 });
    expect(shape(result)).toEqual(['a@10', '|@20']);
    expect(result).toMatchObject({ isComplete: true, hasError: false });
  });
});

describe('skip', () => {
  it('drops the first values and keeps completion', () => {
    expect(run('-a-b-c-|', { name: 'skip', count: 2 })).toEqual(['c@50', '|@70']);
  });

  it('skip(0) changes nothing', () => {
    expect(run('-a-b|', { name: 'skip', count: 0 })).toEqual(['a@10', 'b@30', '|@40']);
  });

  it('skipping more values than there are leaves only the completion', () => {
    const result = applyOperator(stream('-a-b-|'), { name: 'skip', count: 10 });
    expect(shape(result)).toEqual(['|@50']);
    expect(result.isComplete).toBe(true);
  });

  it('passes an error through', () => {
    expect(run('-a-#', { name: 'skip', count: 5 })).toEqual(['#@30']);
  });
});

describe('distinctUntilChanged', () => {
  it('drops a value equal to the one before it', () => {
    expect(run('-1-1-2-2-2-3-1-|', { name: 'distinctUntilChanged' })).toEqual([
      '1@10',
      '2@50',
      '3@110',
      '1@130',
      '|@150',
    ]);
  });

  it('keeps a stream without repeats as it is', () => {
    expect(run('-a-b-#', { name: 'distinctUntilChanged' })).toEqual(['a@10', 'b@30', '#@50']);
  });
});

describe('applyOperators', () => {
  it('applies the chain first to last', () => {
    expect(
      run(
        '-1-2-3-4-5-6|',
        { name: 'filter', choice: 'even' },
        { name: 'map', choice: 'double' },
        { name: 'take', count: 2 }
      )
    ).toEqual(['4@30', '8@70', '|@80']);
  });

  it('returns the stream unchanged for an empty chain', () => {
    expect(run('-a|')).toEqual(['a@10', '|@20']);
  });
});

describe('describeOperator', () => {
  it('writes the choice or the count the operator uses', () => {
    expect(describeOperator({ name: 'map', choice: 'upperCase' })).toBe('map(to upper case)');
    expect(describeOperator({ name: 'filter', choice: 'odd' })).toBe('filter(odd only)');
    expect(describeOperator({ name: 'take', count: 0 })).toBe('take(0)');
    expect(describeOperator({ name: 'skip' })).toBe('skip(2)');
    expect(describeOperator({ name: 'distinctUntilChanged' })).toBe('distinctUntilChanged()');
  });
});

describe('describeStream', () => {
  it('puts the stream in words', () => {
    expect(describeStream(stream('-a-|'))).toBe('a at 10ms, completes at 30ms');
    expect(describeStream(stream('-#'))).toBe('error at 10ms');
    expect(describeStream(stream(''))).toBe('no events');
  });
});
