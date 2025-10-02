import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';

const TypeScriptBasics: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TypeScript Basics</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Learn the fundamental concepts of TypeScript: types, interfaces, and basic syntax
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <ThemeCard>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-700">
          This section will cover TypeScript basics including primitive types, interfaces, and type
          annotations.
        </p>
      </div>
    </ThemeCard>
  );

  const sidebarContent = (
    <ThemeCard>
      <NavigationCard
        title="OOP Fundamentals"
        description="Core object-oriented concepts"
        colorScheme="indigo"
        onClick={() => navigateToSection('OOP Fundamentals')}
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
        title="Continue to OOP"
        description="Explore object-oriented programming concepts in TypeScript"
        buttonText="Learn OOP"
        onButtonClick={() => navigateToSection('OOP Fundamentals')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeScriptBasics;
