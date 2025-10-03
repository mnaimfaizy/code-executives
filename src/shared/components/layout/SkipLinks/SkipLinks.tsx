import React from 'react';

/**
 * SkipLinks component for accessibility
 * Provides keyboard shortcuts to skip navigation and jump to main content.
 * Links are visually hidden but become visible when focused with keyboard.
 *
 * @component
 * @example
 * ```tsx
 * <SkipLinks />
 * ```
 *
 * **WCAG 2.1 Guideline**: Provides a mechanism for bypassing blocks of
 * content that are repeated on multiple Web pages (Success Criterion 2.4.1 Level A)
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */
export const SkipLinks: React.FC = () => {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipLinks;
