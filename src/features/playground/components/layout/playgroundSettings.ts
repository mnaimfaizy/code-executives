export interface PlaygroundSettings {
  fontSize: number;
  wordWrap: boolean;
}

const STORAGE_KEY = 'pg-settings';

export const DEFAULT_SETTINGS: PlaygroundSettings = {
  fontSize: 14,
  wordWrap: false,
};

/**
 * The stored settings, read key by key: a stored object may hold settings that no longer
 * exist (`executionTimeoutMs`, `animationsEnabled`) or a value of the wrong type, and
 * neither may reach the page.
 */
export function loadSettings(): PlaygroundSettings {
  const settings = { ...DEFAULT_SETTINGS };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : null;
    if (parsed && typeof parsed === 'object') {
      const { fontSize, wordWrap } = parsed as Record<string, unknown>;
      if (typeof fontSize === 'number' && Number.isFinite(fontSize)) settings.fontSize = fontSize;
      if (typeof wordWrap === 'boolean') settings.wordWrap = wordWrap;
    }
  } catch {
    // corrupt
  }
  return settings;
}

export function saveSettings(settings: PlaygroundSettings): void {
  try {
    const { fontSize, wordWrap } = settings;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize, wordWrap }));
  } catch {
    // full
  }
}
