import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';

const TypeSystem: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TypeScript Type System</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore TypeScript's advanced type system features and type inference capabilities
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <ThemeCard>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-700">
          This section will cover advanced types, union types, intersection types, and type guards.
        </p>
      </div>
    </ThemeCard>
  );

  const sidebarContent = (
    <ThemeCard>
      <NavigationCard
        title="Visualizations"
        description="Interactive OOP demonstrations"
        colorScheme="indigo"
        onClick={() => navigateToSection('TypeScript Visualization')}
      />
    </ThemeCard>
  );

  return (
    <>
      <SectionLayout
        section="typescript"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="View Visualizations"
        description="See OOP concepts in action with interactive visualizations"
        buttonText="Explore Visualizations"
        onButtonClick={() => navigateToSection('TypeScript Visualization')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeSystem;
