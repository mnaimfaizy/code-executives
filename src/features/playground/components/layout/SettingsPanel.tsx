import React from 'react';
import { X } from 'lucide-react';
import { saveSettings, type PlaygroundSettings } from './playgroundSettings';

interface SettingsPanelProps {
  settings: PlaygroundSettings;
  onChange: (settings: PlaygroundSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onClose }) => {
  const update = <K extends keyof PlaygroundSettings>(
    key: K,
    value: PlaygroundSettings[K]
  ): void => {
    const next = { ...settings, [key]: value };
    onChange(next);
    saveSettings(next);
  };

  return (
    <div
      className="absolute top-full right-0 mt-1 z-50 w-72 rounded-lg shadow-2xl overflow-hidden"
      style={{
        border: '1px solid var(--pg-border)',
        background: 'var(--pg-bg-secondary)',
      }}
      role="dialog"
      aria-label="Playground settings"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: '1px solid var(--pg-border)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--pg-text-primary)' }}>
          Settings
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded transition-colors duration-100"
          style={{ color: 'var(--pg-text-muted)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--pg-text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'var(--pg-text-muted)';
          }}
          aria-label="Close settings"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Font size */}
        <div>
          <label
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--pg-text-secondary)' }}
          >
            <span>Font Size</span>
            <span className="tabular-nums font-mono" style={{ color: 'var(--pg-text-primary)' }}>
              {settings.fontSize}px
            </span>
          </label>
          <input
            type="range"
            min={10}
            max={22}
            step={1}
            value={settings.fontSize}
            onChange={(e) => update('fontSize', Number(e.target.value))}
            className="w-full mt-1.5 accent-blue-500"
            aria-label={`Font size: ${settings.fontSize}px`}
          />
          <div
            className="flex justify-between text-[10px] mt-0.5"
            style={{ color: 'var(--pg-text-muted)' }}
          >
            <span>10</span>
            <span>22</span>
          </div>
        </div>

        {/* Word wrap */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs" style={{ color: 'var(--pg-text-secondary)' }}>
            Word Wrap
          </span>
          <input
            type="checkbox"
            checked={settings.wordWrap}
            onChange={(e) => update('wordWrap', e.target.checked)}
            className="accent-blue-500"
          />
        </label>

        {/* Execution timeout */}
        <div>
          <label
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--pg-text-secondary)' }}
          >
            <span>Timeout</span>
            <span className="tabular-nums font-mono" style={{ color: 'var(--pg-text-primary)' }}>
              {settings.executionTimeoutMs / 1000}s
            </span>
          </label>
          <input
            type="range"
            min={1000}
            max={30000}
            step={1000}
            value={settings.executionTimeoutMs}
            onChange={(e) => update('executionTimeoutMs', Number(e.target.value))}
            className="w-full mt-1.5 accent-blue-500"
            aria-label={`Execution timeout: ${settings.executionTimeoutMs / 1000} seconds`}
          />
          <div
            className="flex justify-between text-[10px] mt-0.5"
            style={{ color: 'var(--pg-text-muted)' }}
          >
            <span>1s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Animations */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs" style={{ color: 'var(--pg-text-secondary)' }}>
            Animations
          </span>
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => update('animationsEnabled', e.target.checked)}
            className="accent-blue-500"
          />
        </label>
      </div>
    </div>
  );
};

export default SettingsPanel;
