export interface PlaygroundSettings {
  fontSize: number;
  wordWrap: boolean;
  executionTimeoutMs: number;
  animationsEnabled: boolean;
}

const STORAGE_KEY = 'pg-settings';

export const DEFAULT_SETTINGS: PlaygroundSettings = {
  fontSize: 14,
  wordWrap: false,
  executionTimeoutMs: 10_000,
  animationsEnabled: true,
};

export function loadSettings(): PlaygroundSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<PlaygroundSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // corrupt
  }

  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: PlaygroundSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // full
  }
}
