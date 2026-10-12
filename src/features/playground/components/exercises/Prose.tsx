import React from 'react';

/** Prose with `backticks` for code and an empty line between paragraphs. */
const Prose: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/\n\s*\n/).map((paragraph, index) => (
      <p key={index} className="text-xs leading-relaxed mb-2 last:mb-0">
        {paragraph.split('`').map((part, at) =>
          at % 2 === 1 ? (
            <code
              key={at}
              className="px-1 py-0.5 rounded text-[11px]"
              style={{
                fontFamily: 'var(--pg-font-mono)',
                background: 'var(--pg-bg-tertiary)',
                color: 'var(--pg-text-primary)',
              }}
            >
              {part}
            </code>
          ) : (
            <React.Fragment key={at}>{part}</React.Fragment>
          )
        )}
      </p>
    ))}
  </>
);

export default Prose;
