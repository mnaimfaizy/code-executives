import type { AppliedOperator, MarbleEvent, MarbleStream, OperatorConfig } from './types';

/** Milliseconds one character of marble notation stands for. */
export const TIME_UNIT = 10;

/**
 * Parse a marble diagram string into events
 */
export function parseMarbleString(marbleString: string): MarbleEvent[] {
  const events: MarbleEvent[] = [];
  let time = 0;

  for (let i = 0; i < marbleString.length; i++) {
    const char = marbleString[i];

    if (char === '-') {
      time += TIME_UNIT;
    } else if (char === '|') {
      events.push({
        id: `complete-${time}`,
        value: null,
        time,
        type: 'complete',
      });
      break;
    } else if (char === '#') {
      events.push({
        id: `error-${time}`,
        value: 'Error',
        time,
        type: 'error',
      });
      break;
    } else if (char !== ' ') {
      // It's a value
      events.push({
        id: `value-${char}-${time}`,
        value: char,
        time,
        type: 'next',
        color: getValueColor(char),
      });
      time += TIME_UNIT;
    }
  }

  return events;
}

/**
 * Get a consistent color for a value
 */
export function getValueColor(value: string | number | boolean): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
  ];

  const hash = String(value)
    .split('')
    .reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Create a marble stream from a marble string
 */
export function createMarbleStream(id: string, name: string, marbleString: string): MarbleStream {
  const events = parseMarbleString(marbleString);
  const hasComplete = events.some((e) => e.type === 'complete');
  const hasError = events.some((e) => e.type === 'error');
  const maxTime = events.length > 0 ? Math.max(...events.map((e) => e.time)) : 0;

  return {
    id,
    name,
    events,
    duration: maxTime + 50, // Add some padding
    isComplete: hasComplete,
    hasError,
  };
}

/**
 * Generate sample marble strings for different scenarios
 */
export const sampleMarbles = {
  simple: '--a--b--c--|',
  fast: '-a-b-c-d-e|',
  sparse: '----a------b------|',
  burst: '-abc---def----|',
  withError: '--a--b--#',
  empty: '------|',
  numbers: '--1--2--3--|',
  mixed: '-a-1-b-2-c|',
};

/**
 * The operators the tool offers. `map` and `filter` take one of a fixed list
 * of choices: the tool never reads or runs code the learner types.
 */
export const operatorConfigs: OperatorConfig[] = [
  {
    name: 'map',
    displayName: 'Map',
    description: 'Transform each value',
    category: 'transformation',
    choices: {
      label: 'Transformation',
      options: [
        { id: 'double', label: '× 2' },
        { id: 'upperCase', label: 'to upper case' },
        { id: 'increment', label: '+ 1' },
      ],
    },
  },
  {
    name: 'filter',
    displayName: 'Filter',
    description: 'Only emit values that pass a test',
    category: 'filtering',
    choices: {
      label: 'Test',
      options: [
        { id: 'even', label: 'even only' },
        { id: 'positive', label: 'greater than 0' },
        { id: 'odd', label: 'odd only' },
      ],
    },
  },
  {
    name: 'take',
    displayName: 'Take',
    description: 'Emit only the first N values, then complete',
    category: 'filtering',
    count: { label: 'Number of values to take', defaultValue: 3 },
  },
  {
    name: 'skip',
    displayName: 'Skip',
    description: 'Skip the first N values',
    category: 'filtering',
    count: { label: 'Number of values to skip', defaultValue: 2 },
  },
  {
    name: 'distinctUntilChanged',
    displayName: 'Distinct Until Changed',
    description: 'Only emit when the value differs from the previous one',
    category: 'filtering',
  },
];

/**
 * Get operator config by name
 */
export function getOperatorConfig(name: string): OperatorConfig | undefined {
  return operatorConfigs.find((config) => config.name === name);
}

/** The part of an applied operator that decides what it does. */
export type OperatorSettings = Pick<AppliedOperator, 'name' | 'choice' | 'count'>;

/** The choice an operator uses when none (or an unknown one) is given. */
function resolveChoice(operator: OperatorSettings): string | undefined {
  const options = getOperatorConfig(operator.name)?.choices?.options;
  if (!options) return undefined;
  return (options.find((option) => option.id === operator.choice) ?? options[0]).id;
}

/** A whole, non-negative count. 0 is a valid count and is kept. */
function resolveCount(operator: OperatorSettings): number {
  const count = operator.count;
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    return getOperatorConfig(operator.name)?.count?.defaultValue ?? 0;
  }
  return Math.max(0, Math.floor(count));
}

/** A new stream with these events; the completion and error flags follow the events. */
function withEvents(stream: MarbleStream, events: MarbleEvent[]): MarbleStream {
  return {
    ...stream,
    events,
    isComplete: events.some((event) => event.type === 'complete'),
    hasError: events.some((event) => event.type === 'error'),
  };
}

/**
 * A marble is one character, so "1" stands for the number 1. A marble that is
 * not a number gives NaN, as it would in JavaScript arithmetic.
 */
function toNumber(value: MarbleEvent['value']): number {
  return typeof value === 'string' ? Number.parseFloat(value) : Number(value);
}

const mapChoices: Record<string, (value: MarbleEvent['value']) => string | number> = {
  double: (value) => toNumber(value) * 2,
  upperCase: (value) => String(value).toUpperCase(),
  increment: (value) => toNumber(value) + 1,
};

const filterChoices: Record<string, (value: MarbleEvent['value']) => boolean> = {
  even: (value) => toNumber(value) % 2 === 0,
  positive: (value) => toNumber(value) > 0,
  odd: (value) => Math.abs(toNumber(value) % 2) === 1,
};

/** Keep the values that pass `keep`; completion and error always pass through. */
function keepValues(stream: MarbleStream, keep: (event: MarbleEvent) => boolean): MarbleStream {
  return withEvents(
    stream,
    stream.events.filter((event) => event.type !== 'next' || keep(event))
  );
}

function take(stream: MarbleStream, count: number): MarbleStream {
  if (count === 0) {
    // take(0) emits nothing and completes at once.
    return withEvents(stream, [{ id: 'complete-0', value: null, time: 0, type: 'complete' }]);
  }

  const events: MarbleEvent[] = [];
  let taken = 0;
  for (const event of stream.events) {
    events.push(event);
    if (event.type !== 'next') break;
    taken += 1;
    if (taken === count) {
      // take completes with its last value. It is drawn one time unit later,
      // as in "--1--2--3|", so that the marble stays visible.
      const time = event.time + TIME_UNIT;
      events.push({ id: `complete-${time}`, value: null, time, type: 'complete' });
      break;
    }
  }
  return withEvents(stream, events);
}

/**
 * The stream an operator produces from `stream`. Pure: the result is worked
 * out from the marbles, no RxJS code is run.
 */
export function applyOperator(stream: MarbleStream, operator: OperatorSettings): MarbleStream {
  switch (operator.name) {
    case 'map': {
      const transform = mapChoices[resolveChoice(operator) ?? 'double'];
      return withEvents(
        stream,
        stream.events.map((event) => {
          if (event.type !== 'next') return event;
          const value = transform(event.value);
          return { ...event, value, color: getValueColor(value) };
        })
      );
    }

    case 'filter': {
      const passes = filterChoices[resolveChoice(operator) ?? 'even'];
      return keepValues(stream, (event) => passes(event.value));
    }

    case 'take':
      return take(stream, resolveCount(operator));

    case 'skip': {
      let toSkip = resolveCount(operator);
      return keepValues(stream, () => {
        if (toSkip === 0) return true;
        toSkip -= 1;
        return false;
      });
    }

    case 'distinctUntilChanged': {
      let hasPrevious = false;
      let previous: MarbleEvent['value'] = null;
      return keepValues(stream, (event) => {
        const changed = !hasPrevious || !Object.is(event.value, previous);
        hasPrevious = true;
        previous = event.value;
        return changed;
      });
    }
  }
}

/** Apply a chain of operators, first to last. */
export function applyOperators(stream: MarbleStream, operators: OperatorSettings[]): MarbleStream {
  return operators.reduce(applyOperator, stream);
}

/** How an applied operator is written in the chain, e.g. "map(× 2)" or "take(3)". */
export function describeOperator(operator: OperatorSettings): string {
  const config = getOperatorConfig(operator.name);
  if (config?.choices) {
    const choice = resolveChoice(operator);
    const label = config.choices.options.find((option) => option.id === choice)?.label ?? '';
    return `${operator.name}(${label})`;
  }
  if (config?.count) return `${operator.name}(${resolveCount(operator)})`;
  return `${operator.name}()`;
}

/** A stream in words, for assistive technology: "a at 20ms, completes at 80ms". */
export function describeStream(stream: MarbleStream): string {
  if (stream.events.length === 0) return 'no events';
  return stream.events
    .map((event) => {
      if (event.type === 'complete') return `completes at ${event.time}ms`;
      if (event.type === 'error') return `error at ${event.time}ms`;
      return `${event.value} at ${event.time}ms`;
    })
    .join(', ');
}
