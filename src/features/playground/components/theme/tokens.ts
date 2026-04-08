/** Playground Design Tokens — Space Theme */

export const playgroundTokens = {
  colors: {
    /** Deep space backgrounds */
    bg: {
      primary: '#0a0a1a',
      secondary: '#0f0f2e',
      tertiary: '#1a1a3e',
      surface: '#12122a',
      surfaceHover: '#1e1e42',
    },
    /** Accent / interactive colors */
    accent: {
      electricBlue: '#00d4ff',
      electricBlueHover: '#33ddff',
      nebulaPurple: '#8b5cf6',
      successGreen: '#00ff88',
      errorRed: '#ff4466',
      warningAmber: '#ffaa00',
      infoBlue: '#3b82f6',
    },
    /** Text colors */
    text: {
      primary: '#e0e0ff',
      secondary: '#a0a0cc',
      muted: '#6b6b99',
      inverse: '#0a0a1a',
    },
    /** Border colors */
    border: {
      default: '#2a2a4e',
      hover: '#3a3a6e',
      focus: '#00d4ff',
    },
    /** Editor specific */
    editor: {
      background: '#0d0d22',
      gutter: '#1a1a3e',
      lineHighlight: '#1e1e42',
      selection: 'rgba(0, 212, 255, 0.15)',
      cursor: '#00d4ff',
    },
    /** Console */
    console: {
      log: '#e0e0ff',
      warn: '#ffaa00',
      error: '#ff4466',
      info: '#3b82f6',
    },
  },
  fonts: {
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    sans: "'Inter', 'system-ui', 'sans-serif'",
  },
  spacing: {
    toolbarHeight: '48px',
    panePadding: '12px',
    gap: '4px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    glow: '0 0 12px rgba(0, 212, 255, 0.3)',
    panel: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
  transitions: {
    default: '200ms ease',
    slow: '400ms ease',
  },
} as const;
