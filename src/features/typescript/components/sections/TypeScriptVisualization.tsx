import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import ClassHierarchy2D from '../visualizations/2d/ClassHierarchy2D';
import InheritanceTree2D from '../visualizations/2d/InheritanceTree2D';
import PolymorphismFlow2D from '../visualizations/2d/PolymorphismFlow2D';
import EncapsulationBox2D from '../visualizations/2d/EncapsulationBox2D';

const TypeScriptVisualization: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Interactive OOP Visualizations</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore TypeScript&apos;s object-oriented programming concepts through interactive,
          animated visualizations — click, toggle, and animate to see abstract concepts come alive
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '4', label: 'Interactive visualizations' },
          { value: 'OOP', label: 'Hierarchy, inheritance, polymorphism' },
          { value: 'Controls', label: 'Click, toggle, animate' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  // Main content with visualizations
  const mainContent = (
    <>
      {/* Class Hierarchy Visualization */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Class Hierarchy &amp; Inheritance</h3>
        <ClassHierarchy2D />
      </ThemeCard>

      {/* Inheritance Flow Visualization */}
      <ThemeCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">
            🌳
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Inheritance Flow</h2>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Switch between example hierarchies, animate inheritance step-by-step, and click nodes to
          see own vs inherited members.
        </p>
        <InheritanceTree2D />
      </ThemeCard>

      {/* Polymorphism Flow Visualization */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Polymorphism &amp; Method Overriding
        </h3>
        <PolymorphismFlow2D />
      </ThemeCard>

      {/* Encapsulation Visualization */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Data Encapsulation</h3>
        <EncapsulationBox2D />
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Color legend */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Color Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-700">
              <code className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">public</code>{' '}
              — accessible everywhere
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="text-sm text-gray-700">
              <code className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                protected
              </code>{' '}
              — class + subclasses
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-gray-700">
              <code className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">private</code>{' '}
              — class only
            </span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Visualization Controls</h3>
        <div className="space-y-4">
          {[
            {
              icon: '🏗️',
              title: 'Class Hierarchy',
              tips: ['Click classes to expand', 'Color-coded visibility', 'Inheritance arrows'],
            },
            {
              icon: '🌳',
              title: 'Inheritance Flow',
              tips: [
                'Animate property flow',
                'Click to highlight members',
                'See overridden methods',
              ],
            },
            {
              icon: '🔄',
              title: 'Polymorphism',
              tips: ['Watch method dispatch', 'View implementation code', 'Compare signatures'],
            },
            {
              icon: '🔐',
              title: 'Encapsulation',
              tips: ['Toggle visibility levels', 'See access control', 'Understand data hiding'],
            },
          ].map((viz) => (
            <div key={viz.title} className="text-sm">
              <p className="font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                <span>{viz.icon}</span> {viz.title}
              </p>
              <ul className="text-gray-500 space-y-0.5 text-xs">
                {viz.tips.map((tip) => (
                  <li key={tip}>• {tip}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Learning Objectives</h3>
        <div className="space-y-3">
          <NavigationCard
            title="OOP Fundamentals"
            description="Core OOP principles"
            colorScheme="indigo"
            onClick={() => navigateToSection('OOP Fundamentals')}
          />
          <NavigationCard
            title="SOLID Principles"
            description="Design principles for maintainable code"
            colorScheme="indigo"
            onClick={() => navigateToSection('SOLID Principles')}
          />
          <NavigationCard
            title="Advanced Types"
            description="Complex type system features"
            colorScheme="indigo"
            onClick={() => navigateToSection('Advanced Types')}
          />
        </div>
      </ThemeCard>
    </>
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
        title="Continue Learning TypeScript"
        description="Now that you've seen these concepts visualized, dive deeper into TypeScript's type system, advanced features, and best practices for building robust applications."
        buttonText="Explore More"
        onButtonClick={() => navigateToSection('TypeScript Basics')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeScriptVisualization;
