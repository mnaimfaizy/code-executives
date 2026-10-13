import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './playgroundSettings';

const KEY = 'pg-settings';

describe('playground settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has only the settings something reads', () => {
    expect(Object.keys(DEFAULT_SETTINGS).sort()).toEqual(['fontSize', 'wordWrap']);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('loads settings stored before Timeout and Animations were removed', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        fontSize: 18,
        wordWrap: true,
        executionTimeoutMs: 30_000,
        animationsEnabled: false,
      })
    );
    expect(loadSettings()).toEqual({ fontSize: 18, wordWrap: true });
  });

  it('keeps the default for a stored value of the wrong type, and for corrupt storage', () => {
    localStorage.setItem(KEY, JSON.stringify({ fontSize: 'big', wordWrap: true }));
    expect(loadSettings()).toEqual({ fontSize: DEFAULT_SETTINGS.fontSize, wordWrap: true });
    localStorage.setItem(KEY, '{not json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('stores what it loads back', () => {
    saveSettings({ fontSize: 16, wordWrap: true });
    expect(JSON.parse(localStorage.getItem(KEY) ?? '')).toEqual({ fontSize: 16, wordWrap: true });
    expect(loadSettings()).toEqual({ fontSize: 16, wordWrap: true });
  });
});
