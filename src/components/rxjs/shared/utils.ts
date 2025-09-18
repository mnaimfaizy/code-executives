import type { MarbleEvent, MarbleStream, OperatorConfig } from './types';

/**
 * Parse a marble diagram string into events
 */
export function parseMarbleString(marbleString: string): MarbleEvent[] {
  const events: MarbleEvent[] = [];
  let time = 0;

  for (let i = 0; i < marbleString.length; i++) {
    const char = marbleString[i];

    if (char === '-') {
      time += 10; // Each dash represents 10ms
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
      time += 10;
    }
  }

  return events;
}

/**
 * Convert events back to a marble string
 */
export function eventsToMarbleString(events: MarbleEvent[]): string {
  if (events.length === 0) return '';

  let marbleString = '';
  let currentTime = 0;

  const sortedEvents = [...events].sort((a, b) => a.time - b.time);

  for (const event of sortedEvents) {
    // Add dashes for time gaps
    while (currentTime < event.time) {
      marbleString += '-';
      currentTime += 10;
    }

    // Add the event
    if (event.type === 'next') {
      marbleString += event.value;
    } else if (event.type === 'complete') {
      marbleString += '|';
    } else if (event.type === 'error') {
      marbleString += '#';
    }

    currentTime = event.time + 10;
  }

  return marbleString;
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
 * Predefined operator configurations
 */
export const operatorConfigs: OperatorConfig[] = [
  {
    name: 'map',
    displayName: 'Map',
    description: 'Transform each value using a function',
    example: 'map(x => x.toUpperCase())',
    category: 'transformation',
    parameters: [
      {
        name: 'transform',
        type: 'function',
        defaultValue: 'x => x.toUpperCase()',
        description: 'Function to transform each value',
        required: true,
      },
    ],
  },
  {
    name: 'filter',
    displayName: 'Filter',
    description: 'Only emit values that pass a test',
    example: 'filter(x => x > 5)',
    category: 'filtering',
    parameters: [
      {
        name: 'predicate',
        type: 'function',
        defaultValue: 'x => x % 2 === 0',
        description: 'Function that returns true for values to keep',
        required: true,
      },
    ],
  },
  {
    name: 'take',
    displayName: 'Take',
    description: 'Take only the first N values',
    example: 'take(3)',
    category: 'filtering',
    parameters: [
      {
        name: 'count',
        type: 'number',
        defaultValue: 3,
        description: 'Number of values to take',
        required: true,
      },
    ],
  },
  {
    name: 'skip',
    displayName: 'Skip',
    description: 'Skip the first N values',
    example: 'skip(2)',
    category: 'filtering',
    parameters: [
      {
        name: 'count',
        type: 'number',
        defaultValue: 2,
        description: 'Number of values to skip',
        required: true,
      },
    ],
  },
  {
    name: 'debounceTime',
    displayName: 'Debounce Time',
    description: 'Emit only after a pause in emissions',
    example: 'debounceTime(300)',
    category: 'filtering',
    parameters: [
      {
        name: 'delay',
        type: 'number',
        defaultValue: 300,
        description: 'Time in milliseconds to wait',
        required: true,
      },
    ],
  },
  {
    name: 'distinctUntilChanged',
    displayName: 'Distinct Until Changed',
    description: 'Only emit when value is different from previous',
    example: 'distinctUntilChanged()',
    category: 'filtering',
  },
];

/**
 * Get operator config by name
 */
export function getOperatorConfig(name: string): OperatorConfig | undefined {
  return operatorConfigs.find((config) => config.name === name);
}

/**
 * Apply an operator to a marble stream (simplified simulation)
 */
export function applyOperatorSimulation(
  stream: MarbleStream,
  operatorName: string,
  parameters: Record<string, string | number | boolean> = {}
): MarbleStream {
  const newEvents = [...stream.events];

  switch (operatorName) {
    case 'map':
      return {
        ...stream,
        id: `${stream.id}-mapped`,
        name: `${stream.name}.map()`,
        events: newEvents.map((event) => {
          if (event.type === 'next') {
            // Simple transformation simulation
            const transform = (parameters.transform as string) || 'x => x.toUpperCase()';
            let newValue = event.value;

            if (transform.includes('toUpperCase')) {
              newValue = String(event.value).toUpperCase();
            } else if (transform.includes('* 2')) {
              newValue = Number(event.value) * 2;
            }

            return {
              ...event,
              value: newValue,
              color: newValue !== null ? getValueColor(newValue) : undefined,
            };
          }
          return event;
        }),
      };

    case 'filter':
      return {
        ...stream,
        id: `${stream.id}-filtered`,
        name: `${stream.name}.filter()`,
        events: newEvents.filter((event) => {
          if (event.type === 'next') {
            const predicate = (parameters.predicate as string) || 'x => x % 2 === 0';

            if (predicate.includes('% 2 === 0')) {
              return Number(event.value) % 2 === 0;
            } else if (predicate.includes('> 0')) {
              return Number(event.value) > 0;
            }

            return true;
          }
          return true;
        }),
      };

    case 'take': {
      const takeCount = Number(parameters.count) || 3;
      let takenCount = 0;
      return {
        ...stream,
        id: `${stream.id}-taken`,
        name: `${stream.name}.take(${takeCount})`,
        events: newEvents.filter((event) => {
          if (event.type === 'next') {
            if (takenCount < takeCount) {
              takenCount++;
              return true;
            }
            return false;
          }
          return takenCount < takeCount;
        }),
      };
    }

    default:
      return stream;
  }
}
