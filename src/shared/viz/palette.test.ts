import { describe, expect, it } from 'vitest';
import { ENTITY_ROLES, vizPalette, type EntityRole, type VizTheme } from './palette';

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

const TEXT_MIN = 4.5;
const GRAPHIC_MIN = 3;

/**
 * Light reproduces the colours the Stack & Heap views shipped with, and three of those fall
 * short of 3:1 against the pale surface. They are kept as they are (this palette must not
 * change how the stories look), so light asserts today's measured value for them instead.
 * Do not add to this list: a new colour meets the threshold.
 */
const LIGHT_STROKE_FLOOR: Partial<Record<EntityRole, number>> = {
  object: 2.42, // #10b981 on #f8fafc
  array: 2.64, // #0ea5e9 on #f8fafc
};
const LIGHT_FOCUS_FLOOR = 2.05; // #f59e0b on #f8fafc

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

    it('keeps every entity stroke visible against the surface', () => {
      for (const role of ENTITY_ROLES) {
        const min = (theme === 'light' ? LIGHT_STROKE_FLOOR[role] : undefined) ?? GRAPHIC_MIN;
        expect(contrast(p[role].stroke, p.surface), role).toBeGreaterThanOrEqual(min);
      }
    });

    it('keeps focus visible against the surface', () => {
      const min = theme === 'light' ? LIGHT_FOCUS_FLOOR : GRAPHIC_MIN;
      expect(contrast(p.focus, p.surface)).toBeGreaterThanOrEqual(min);
    });

    it('gives every entity role its own fill and its own solid', () => {
      for (const key of ['fill', 'solid'] as const) {
        const values = ENTITY_ROLES.map((role) => p[role][key]);
        expect(new Set(values).size, key).toBe(values.length);
      }
    });
  });

  it('pins only light colours that really are below the threshold', () => {
    const p = vizPalette.light;
    for (const role of ENTITY_ROLES) {
      if (!LIGHT_STROKE_FLOOR[role]) continue;
      expect(contrast(p[role].stroke, p.surface), role).toBeLessThan(GRAPHIC_MIN);
    }
    expect(contrast(p.focus, p.surface)).toBeLessThan(GRAPHIC_MIN);
  });

  it('keeps every kind of dark text readable on every dark entity fill', () => {
    // The Playground is dark. Light keeps the muted greys the stories shipped with.
    const p = vizPalette.dark;
    for (const [name, colour] of Object.entries(p.text)) {
      for (const role of ENTITY_ROLES) {
        expect(contrast(colour, p[role].fill), `text.${name} on ${role}`).toBeGreaterThanOrEqual(
          TEXT_MIN
        );
      }
      expect(contrast(colour, p.label.bg), `text.${name} on label`).toBeGreaterThanOrEqual(
        TEXT_MIN
      );
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
