# Step model template

Skeleton for `src/features/<module>/utils/<storyId>Story.ts`. Rename the entity types to the story's literal concepts. Compare with `src/features/javascript/utils/stackHeapStory.ts`.

```ts
/**
 * <Story title>: one step model, rendered by both the 2D (SVG) and 3D (R3F) views.
 * Spec: docs/stories/<module>/<story-id>.md
 */

export type ShotId = 'overview' | '<regionA>' | '<regionB>' | 'bridge';

export interface Slot {
  name: string;
  value?: string; // primitive shown inline
  refId?: string; // reference to another entity
}

export interface Entity {
  id: string;
  label: string;
  slots: Slot[];
  state: 'live' | '<other lifecycle states>';
  cell: { col: number; row: number };
}

export interface StoryStep {
  id: string;
  title: string;
  caption: string;
  line: number;
  shot: ShotId;
  entities: Entity[]; // one array per region if the story has several
  focus: string[];
  phase?: '<optional stage>';
}

export const STORY_CODE = `...`;

export const slotKey = (owner: string, slot: string) => `${owner}.${slot}`;

// Small factories keep snapshots short and identical across steps.
const entity = (id: string, label: string, slots: Slot[], cell: Entity['cell'], state: Entity['state'] = 'live'): Entity => ({ id, label, slots, cell, state });

export const STORY_STEPS: StoryStep[] = [
  {
    id: 'start',
    title: '...',
    caption: '...',
    line: 1,
    shot: 'overview',
    entities: [],
    focus: [],
  },
];

// Pure helpers shared by views and tests: derive facts, never store them twice.
export const isFocused = (step: StoryStep, key: string) => step.focus.includes(key);
```

Test skeleton, `<storyId>Story.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { STORY_CODE, STORY_STEPS } from './<storyId>Story';

describe('<story> model', () => {
  it('tells the approved <n> beats', () => {
    expect(STORY_STEPS).toHaveLength(<n>);
    expect(new Set(STORY_STEPS.map((s) => s.id)).size).toBe(<n>);
  });

  it.each(STORY_STEPS)('$id is internally consistent', (s) => {
    expect(s.line).toBeLessThanOrEqual(STORY_CODE.split('\n').length);
    // every ref target exists, every focus key exists, no shared cells
  });

  it('<aha beat claim, proven through a helper>', () => {
    // e.g. expect(getReachable(step('bob-null'))).toContain('bob');
  });
});
```
