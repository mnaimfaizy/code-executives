import React from 'react';
import { ArrowLeft } from 'lucide-react';

const BackToSiteLink: React.FC = () => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    // If opened via target="_blank", close the tab; otherwise navigate
    if (window.opener) {
      e.preventDefault();
      window.close();
    }
    // Fall through to href="/" for normal navigation
  };

  return (
    <a
      href="/"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md shrink-0 lg:px-3"
      aria-label="Back to Code Executives"
      title="Back to Code Executives"
      style={{
        color: 'var(--pg-text-secondary)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--pg-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--pg-accent-blue)';
        e.currentTarget.style.borderColor = 'var(--pg-border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--pg-text-secondary)';
        e.currentTarget.style.borderColor = 'var(--pg-border)';
      }}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {/* The label is dropped below lg; the aria-label carries it */}
      <span className="hidden lg:inline">Code Executives</span>
    </a>
  );
};

export default BackToSiteLink;
