import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';

const ClassHierarchy: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Class Hierarchy</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Understand inheritance relationships and class hierarchies in TypeScript
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <ThemeCard>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-700">
          This section will cover class inheritance and hierarchy design.
        </p>
      </div>
    </ThemeCard>
  );

  const sidebarContent = (
    <ThemeCard>
      <NavigationCard
        title="Visualizations"
        description="Interactive class hierarchy demo"
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
        title="View Interactive Demo"
        description="See class hierarchies in action"
        buttonText="Explore Demo"
        onButtonClick={() => navigateToSection('TypeScript Visualization')}
        colorScheme="indigo"
      />
    </>
  );
};

export default ClassHierarchy;
