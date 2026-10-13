import { describe, expect, it } from 'vitest';
import {
  ENTITY_ROLES as HEAP_AND_STACK_ROLES,
  QUEUE_ROLES,
  vizPalette,
  type EntityRole,
  type QueueRole,
  type VizTheme,
} from './palette';

/** Every role drawn as an entity: the stack and heap ones, and the event loop's entries. */
const ENTITY_ROLES: readonly (EntityRole | QueueRole)[] = [...HEAP_AND_STACK_ROLES, ...QUEUE_ROLES];

const THEMES: VizTheme[] = ['light', 'dark'];

/** Every leaf of a palette as `path -> value`. */
function leaves(node: unknown, path = ''): Map<string, unknown> {
  const out = new Map<string, unknown>();
  if (typeof node === 'object' && node !== null) {
    for (const [key, value] of Object.entries(node)) {
      for (const [p, v] of leaves(value, path ? `${path}.${key}` : key)) out.set(p, v);
    }
  } else {
    out.set(path, node);
  }
  return out;
}

/** WCAG 2.x relative luminance of a 6-digit hex. */
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG 2.x contrast ratio between two hex colours. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `top` at `alpha` over `under`, as the 6-digit hex the eye gets. */
function over(top: string, under: string, alpha: number): string {
  const mix = (i: number) =>
    Math.round(
      parseInt(top.slice(i, i + 2), 16) * alpha + parseInt(under.slice(i, i + 2), 16) * (1 - alpha)
    )
      .toString(16)
      .padStart(2, '0');
  return `#${mix(1)}${mix(3)}${mix(5)}`;
}

const TEXT_MIN = 4.5;
const GRAPHIC_MIN = 3;

describe('vizPalette', () => {
  it('has exactly the same keys in both variants', () => {
    expect([...leaves(vizPalette.dark).keys()].sort()).toEqual(
      [...leaves(vizPalette.light).keys()].sort()
    );
  });

  describe.each(THEMES)('%s', (theme) => {
    const p = vizPalette[theme];

    it('uses only 6-digit hex colours', () => {
      for (const [path, value] of leaves(p)) {
        expect(value, path).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('keeps primary text readable on every entity fill and on the label background', () => {
      for (const role of ENTITY_ROLES) {
        expect(contrast(p.text.primary, p[role].fill), role).toBeGreaterThanOrEqual(TEXT_MIN);
      }
      expect(contrast(p.text.primary, p.label.bg), 'label.bg').toBeGreaterThanOrEqual(TEXT_MIN);
    });

    it('keeps every entity stroke visible against the surface, with no exception', () => {
      for (const role of ENTITY_ROLES) {
        expect(contrast(p[role].stroke, p.surface), role).toBeGreaterThanOrEqual(GRAPHIC_MIN);
      }
    });

    it('keeps the queue entries to the threshold', () => {
      for (const role of QUEUE_ROLES) {
        // A card's outline is also read against its own fill.
        expect(contrast(p[role].stroke, p[role].fill), role).toBeGreaterThanOrEqual(GRAPHIC_MIN);
        expect(contrast(p.text.secondary, p[role].fill), role).toBeGreaterThanOrEqual(TEXT_MIN);
        // Focus and the collector's root are amber: no entry may be mistaken for either.
        for (const key of ['fill', 'stroke', 'solid'] as const) {
          expect(p[role][key], `${role}.${key}`).not.toBe(p.focus);
          expect(p[role][key], `${role}.${key}`).not.toBe(p.root);
        }
      }
    });

    it('keeps the region captions readable on the region', () => {
      expect(contrast(p.region.label, p.region.fill)).toBeGreaterThanOrEqual(TEXT_MIN);
      expect(contrast(p.region.note, p.region.fill)).toBeGreaterThanOrEqual(TEXT_MIN);
      expect(p.region.note).not.toBe(p.region.label);
    });

    it('keeps focus visible against the surface', () => {
      expect(contrast(p.focus, p.surface)).toBeGreaterThanOrEqual(GRAPHIC_MIN);
    });

    it('gives every entity role its own fill, its own stroke and its own solid', () => {
      for (const key of ['fill', 'stroke', 'solid'] as const) {
        const values = ENTITY_ROLES.map((role) => p[role][key]);
        expect(new Set(values).size, key).toBe(values.length);
      }
    });
  });

  /*
   * Light is what the stories are drawn in. Every (colour, background) pair the 2D and 3D
   * views draw in it is listed here and held to WCAG: 4.5:1 for text, 3:1 for a mark.
   * A view that draws a new pair adds it here.
   *
   * Not listed, because the palette does not decide what reaches the eye:
   * - the 3D solids, the plinth's and the floor's sides: they are lit, so their colour on
   *   screen depends on the lights. Every solid carries a label card, and those are listed.
   * - the translucent focus and root halos under a 3D block: their opacity is the view's. The
   *   focus is also the border of the block's card, which is listed.
   * - an object the collector reclaimed: the 2D view fades it to 18% on purpose.
   * - `region.stroke`, `label.border` and `label.frameBorder`: the quiet edge of a panel or a
   *   card. Each is told apart by its caption and its ground, not by that edge.
   */
  describe('light: every pair the story views draw', () => {
    const p = vizPalette.light;
    type Grounds = Record<string, string>;

    const HEAP = ['object', 'array', 'function', 'scope', 'unreachable'] as const;
    const STACK = ['frame', 'frameActive'] as const;

    /** The pale fills of 2D entities. */
    const fills = (...roles: readonly (EntityRole | QueueRole)[]): Grounds =>
      Object.fromEntries(roles.map((role) => [`${role}.fill`, p[role].fill]));
    /** A 3D label card: `label.bg` at 95% (`cardStyle`) over the solid it stands on. */
    const cards = (...roles: readonly (EntityRole | QueueRole)[]): Grounds => ({
      'label.bg': p.label.bg,
      ...Object.fromEntries(
        roles.map((role) => [`card over ${role}.solid`, over(p.label.bg, p[role].solid, 0.95)])
      ),
    });
    const panel: Grounds = { 'region.fill': p.region.fill };
    const scene: Grounds = { surface: p.surface };
    /** A lane's floor, plain and under the tint of a queue's head cell (28%). */
    const lanes: Grounds = {
      'region.floor': p.region.floor,
      'head cell of microtasks': over(p.microtask.solid, p.region.floor, 0.28),
      'head cell of tasks': over(p.task.solid, p.region.floor, 0.28),
    };

    const TEXT: [name: string, colour: string, grounds: Grounds][] = [
      // 2D: an object's heading, an entry's label, a head tag. 3D: the same on their cards.
      [
        'text.primary',
        p.text.primary,
        {
          ...fills('object', 'array', 'function', 'unreachable', ...QUEUE_ROLES),
          ...cards(...HEAP, ...QUEUE_ROLES),
        },
      ],
      // 2D: where an entry came from. 3D: that, and every slot that is not in focus.
      [
        'text.secondary',
        p.text.secondary,
        { ...fills(...QUEUE_ROLES), ...cards(...STACK, ...HEAP, ...QUEUE_ROLES) },
      ],
      // An object's `#id`, "(empty)", and "+N more" on a frame's card.
      ['text.muted', p.text.muted, { ...fills(...HEAP), ...cards(...STACK, ...HEAP) }],
      // A slot in focus, of a frame or of a heap object.
      ['text.onFocus', p.text.onFocus, { ...fills('frame', ...HEAP), ...cards(...STACK, ...HEAP) }],
      // A frame's name, and a retained scope's (which can be unmarked).
      [
        'text.frameName',
        p.text.frameName,
        { ...fills('frame', 'scope', 'unreachable'), ...cards(...STACK) },
      ],
      ['text.slot', p.text.slot, fills('frame', ...HEAP)],
      ['text.root', p.text.root, { ...fills('frame'), ...cards(...STACK) }],
      ['text.unreachable', p.text.unreachable, { ...fills('unreachable'), ...cards(...HEAP) }],
      // StackHeapView3D still writes UNMARKED in the stroke: it must hold as text there too.
      ['unreachable.stroke as text', p.unreachable.stroke, cards(...HEAP)],
      ['text.microtask', p.text.microtask, cards(...STACK)],
      ['text.task', p.text.task, cards(...STACK)],
      // A region's caption and its order number: on the 2D panel, and on the 3D scene.
      ['region.label', p.region.label, { ...panel, ...scene }],
      // The line under a caption, "empty" on a floor or on the plinth, "+N more" on its card.
      [
        'region.note',
        p.region.note,
        {
          ...panel,
          ...scene,
          ...lanes,
          'region.plinth': p.region.plinth,
          'label.bg': p.label.bg,
          'card over region.floor': over(p.label.bg, p.region.floor, 0.95),
        },
      ],
    ];

    it.each(TEXT)('%s reaches 4.5:1 on everything it is written on', (name, colour, grounds) => {
      for (const [ground, hex] of Object.entries(grounds)) {
        expect(
          contrast(colour, hex),
          `${name} ${colour} on ${ground} ${hex}`
        ).toBeGreaterThanOrEqual(TEXT_MIN);
      }
    });

    const allFills = fills('frame', ...HEAP, ...QUEUE_ROLES);
    const MARKS: [name: string, colour: string, grounds: Grounds][] = [
      // An entity's outline: against the panel it stands on and against its own fill.
      ...ENTITY_ROLES.map((role): [string, string, Grounds] => [
        `${role}.stroke`,
        p[role].stroke,
        { ...panel, ...fills(role) },
      ]),
      // 3D: the border of an entry's card and of its head tag, the timers' dashed edges.
      ...QUEUE_ROLES.map((role): [string, string, Grounds] => [
        `${role}.stroke in 3D`,
        p[role].stroke,
        { ...cards(role), ...fills(role), ...scene, 'region.floor': p.region.floor },
      ]),
      // The focus ring of any entity, the focused arrow and its head; the root pulse in 3D.
      ['focus', p.focus, { ...panel, ...allFills, ...scene, 'region.floor': p.region.floor }],
      // A root frame's dashed outline.
      ['root', p.root, { ...panel, ...fills('frame'), ...scene, 'region.floor': p.region.floor }],
      ['reference.stroke', p.reference.stroke, panel],
      ['reference.solid', p.reference.solid, { ...scene, 'region.floor': p.region.floor }],
      // The circle round an order number, and the outline of a region the beat is about.
      ['region.label as a mark', p.region.label, { ...panel, ...scene }],
      ['label.focusBorder', p.label.focusBorder, cards(...STACK, ...HEAP, ...QUEUE_ROLES)],
      ['label.unreachableBorder', p.label.unreachableBorder, cards(...HEAP)],
    ];

    it.each(MARKS)('%s reaches 3:1 on everything it is drawn on', (name, colour, grounds) => {
      for (const [ground, hex] of Object.entries(grounds)) {
        expect(
          contrast(colour, hex),
          `${name} ${colour} on ${ground} ${hex}`
        ).toBeGreaterThanOrEqual(GRAPHIC_MIN);
      }
    });

    it('keeps amber for focus and root, and each role in its own hue', () => {
      /** Hue in degrees, 0 to 360. */
      const hue = (hex: string) => {
        const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
        const max = Math.max(r, g, b);
        const d = max - Math.min(r, g, b);
        const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return (h * 60 + 360) % 360;
      };
      // [first, last] degree of the hue family; red wraps round 0.
      const within = (hex: string, [from, to]: [number, number]) =>
        from <= to ? hue(hex) >= from && hue(hex) <= to : hue(hex) >= from || hue(hex) <= to;
      const FAMILY: [name: string, colours: string[], range: [number, number]][] = [
        ['amber', [p.focus, p.root, p.text.onFocus, p.text.root, p.label.focusBorder], [20, 45]],
        ['emerald', [p.object.fill, p.object.stroke, p.object.solid], [145, 165]],
        ['sky', [p.array.fill, p.array.stroke, p.array.solid], [195, 205]],
        [
          'rose',
          [
            p.unreachable.fill,
            p.unreachable.stroke,
            p.unreachable.solid,
            p.text.unreachable,
            p.label.unreachableBorder,
          ],
          [340, 356],
        ],
        [
          'fuchsia',
          [p.microtask.fill, p.microtask.stroke, p.microtask.solid, p.text.microtask],
          [285, 300],
        ],
        ['teal', [p.task.fill, p.task.stroke, p.task.solid, p.text.task], [165, 180]],
        ['slate', [p.text.muted, p.text.secondary, p.region.label, p.region.note], [205, 225]],
      ];
      for (const [name, colours, range] of FAMILY) {
        for (const colour of colours) {
          expect(within(colour, range), `${colour} (${Math.round(hue(colour))}°) is ${name}`).toBe(
            true
          );
        }
      }
    });
  });

  it('keeps every kind of dark text readable on every dark entity fill', () => {
    // The Playground is dark. A tag that names a role is written only on that role's ground.
    const p = vizPalette.dark;
    const { unreachable, microtask, task, ...everywhere } = p.text;
    for (const [name, colour] of Object.entries(everywhere)) {
      for (const role of ENTITY_ROLES) {
        expect(contrast(colour, p[role].fill), `text.${name} on ${role}`).toBeGreaterThanOrEqual(
          TEXT_MIN
        );
      }
      expect(contrast(colour, p.label.bg), `text.${name} on label`).toBeGreaterThanOrEqual(
        TEXT_MIN
      );
    }
    expect(contrast(unreachable, p.unreachable.fill)).toBeGreaterThanOrEqual(TEXT_MIN);
    for (const tag of [unreachable, microtask, task]) {
      expect(contrast(tag, p.label.bg), tag).toBeGreaterThanOrEqual(TEXT_MIN);
    }
  });

  it('keeps the dark regions apart from the surface they sit on', () => {
    // Seen in the Playground: a floor as dark as the surface vanishes, leaving a bare grid.
    const { region, surface } = vizPalette.dark;
    expect(contrast(region.floor, surface)).toBeGreaterThanOrEqual(1.15);
    expect(contrast(region.plinth, surface)).toBeGreaterThanOrEqual(1.5);
    // The outline of a 2D region and the 3D floor grid share one colour.
    expect(contrast(region.stroke, region.fill)).toBeGreaterThanOrEqual(1.5);
    expect(contrast(region.stroke, region.floor)).toBeGreaterThanOrEqual(1.5);
  });
});
