import { describe, it, expect } from 'vitest';
import { codeTemplates } from './codeTemplates';
import type { PlaygroundLanguage } from '../types';

const ALL_LANGUAGES: PlaygroundLanguage[] = ['javascript', 'typescript', 'python'];

describe('codeTemplates', () => {
  it('has templates for all supported languages', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(codeTemplates[lang]).toBeDefined();
      expect(typeof codeTemplates[lang]).toBe('string');
      expect(codeTemplates[lang].length).toBeGreaterThan(0);
    }
  });

  it('javascript template contains valid-looking JS', () => {
    const template = codeTemplates.javascript;
    expect(template).toContain('function');
    expect(template).toContain('console.log');
  });

  it('typescript template contains TypeScript-specific syntax', () => {
    const template = codeTemplates.typescript;
    expect(template).toContain('interface');
    expect(template).toContain(': string');
  });

  it('python template contains valid-looking Python', () => {
    const template = codeTemplates.python;
    expect(template).toContain('def ');
    expect(template).toContain('print(');
  });

  it('templates are non-trivial (more than just a comment)', () => {
    for (const lang of ALL_LANGUAGES) {
      const lines = codeTemplates[lang]
        .split('\n')
        .filter((l) => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('#'));
      expect(lines.length).toBeGreaterThan(3);
    }
  });
});
