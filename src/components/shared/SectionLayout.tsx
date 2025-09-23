// src/components/shared/SectionLayout.tsx
// Shared layout component for consistent section design

import React from 'react';
import { getSectionTheme, sectionClasses } from '../../utils/theme';

interface SectionLayoutProps {
  section: 'rxjs' | 'git' | 'javascript' | 'datastructures' | 'react' | 'nextjs';
  hero: React.ReactNode;
  mainContent: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}

const SectionLayout: React.FC<SectionLayoutProps> = ({
  section,
  hero,
  mainContent,
  sidebar,
  className = '',
}) => {
  const theme = getSectionTheme(section);

  const hasSidebar = !!sidebar;
  return (
    <section className={`${sectionClasses.container} ${className}`}>
      {/* Hero Section */}
      <div
        className={`${sectionClasses.hero} bg-gradient-to-br ${theme.gradient} border-${theme.border} shadow-lg`}
      >
        {hero}
      </div>

      {/* Main Content Layout */}
      {hasSidebar ? (
        <div className={sectionClasses.contentGrid}>
          {/* Left Column - Main Content */}
          <div className={sectionClasses.mainContent}>{mainContent}</div>
          {/* Right Column - Navigation & Quick Links */}
          <div className={sectionClasses.sidebar}>{sidebar}</div>
        </div>
      ) : (
        <div className="w-full">{mainContent}</div>
      )}
    </section>
  );
};

export default SectionLayout;
