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
  icon: React.ComponentType<{ className?: string }>;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'javascript', label: 'JavaScript', icon: Code2 },
  { id: 'typescript', label: 'TypeScript', icon: FileCode2 },
  { id: 'python', label: 'Python', icon: Terminal },
];

const LanguagePicker: React.FC<LanguagePickerProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Language selector">
      {LANGUAGES.map(({ id, label, icon: Icon }) => {
        const isActive = language === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              color: isActive ? 'var(--pg-accent-blue)' : 'var(--pg-text-secondary)',
              background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--pg-accent-blue)' : 'var(--pg-border)'}`,
            }}
            onClick={() => onLanguageChange(id)}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguagePicker;
