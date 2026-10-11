import React from 'react';
import { Code2, FileCode2, Terminal } from 'lucide-react';
import type { PlaygroundLanguage } from '../../types';

interface LanguagePickerProps {
  language: PlaygroundLanguage;
  onLanguageChange: (language: PlaygroundLanguage) => void;
}

interface LanguageOption {
  id: PlaygroundLanguage;
  label: string;
  /** Shown instead of the label below lg, where the toolbar is tight */
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'javascript', label: 'JavaScript', shortLabel: 'JS', icon: Code2 },
  { id: 'typescript', label: 'TypeScript', shortLabel: 'TS', icon: FileCode2 },
  { id: 'python', label: 'Python', shortLabel: 'PY', icon: Terminal },
];

const LanguagePicker: React.FC<LanguagePickerProps> = ({ language, onLanguageChange }) => {
  return (
    <div
      className="flex items-center gap-1 shrink-0"
      role="radiogroup"
      aria-label="Language selector"
    >
      {LANGUAGES.map(({ id, label, shortLabel, icon: Icon }) => {
        const isActive = language === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors lg:px-3"
            style={{
              color: isActive ? 'var(--pg-accent-blue)' : 'var(--pg-text-secondary)',
              background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--pg-accent-blue)' : 'var(--pg-border)'}`,
            }}
            onClick={() => onLanguageChange(id)}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{label}</span>
            <span className="lg:hidden">{shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguagePicker;
