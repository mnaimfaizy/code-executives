import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

const Introduction: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TypeScript: JavaScript with Superpowers
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Discover how TypeScript enhances JavaScript with static typing, advanced OOP features, and
          modern development tools for building robust applications
        </p>
      </div>
      <StatsGrid
        stats={[
          { value: '2020', label: 'First stable release' },
          { value: '50%+', label: 'of JS projects use TypeScript' },
          { value: 'OOP', label: 'Full object-oriented support' },
        ]}
        colorScheme="indigo"
      />
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is TypeScript */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What is TypeScript?</h2>
        </div>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            TypeScript is a <strong>statically typed superset of JavaScript</strong> that compiles
            to plain JavaScript. It adds optional static typing, advanced object-oriented
            programming features, and modern language constructs to JavaScript's dynamic nature.
          </p>
          <p>
            Created by Microsoft and first released in 2012, TypeScript has become the preferred
            choice for large-scale JavaScript applications, providing better developer experience,
            enhanced IDE support, and improved code maintainability.
          </p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
            <p className="text-indigo-800">
              <strong>Type Safety:</strong> TypeScript catches type-related errors at compile time,
              preventing runtime bugs and improving code reliability in complex applications.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Key Features */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">TypeScript's Superpowers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Static Type Checking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Advanced OOP Features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Modern ES6+ Features</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Enhanced IDE Support</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Better Refactoring Tools</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xs">✓</span>
              </div>
              <span className="text-gray-700">Gradual Adoption</span>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* JavaScript vs TypeScript */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">JavaScript vs TypeScript</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Feature
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-yellow-600">
                  JavaScript
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-blue-600">
                  TypeScript
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Typing</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-yellow-600">
                  Dynamic
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">
                  Static + Dynamic
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Classes</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-yellow-600">
                  ES6 Sugar
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">
                  Full OOP
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Interfaces</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-400">❌</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">✅</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Generics</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-400">❌</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">✅</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  Compile-time Checks
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-400">❌</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-blue-600">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore TypeScript Features</h3>
        <div className="space-y-3">
          <NavigationCard
            title="TypeScript Basics"
            description="Types, interfaces, and basic syntax"
            colorScheme="indigo"
            onClick={() => navigateToSection('TypeScript Basics')}
          />
          <NavigationCard
            title="Type System"
            description="Advanced types and type inference"
            colorScheme="indigo"
            onClick={() => navigateToSection('Type System')}
          />
          <NavigationCard
            title="OOP Fundamentals"
            description="Classes, inheritance, polymorphism"
            colorScheme="indigo"
            onClick={() => navigateToSection('OOP Fundamentals')}
          />
          <NavigationCard
            title="SOLID Principles"
            description="Object-oriented design principles"
            colorScheme="indigo"
            onClick={() => navigateToSection('SOLID Principles')}
          />
          <NavigationCard
            title="Interactive Visualizations"
            description="Visual OOP concepts and type system"
            colorScheme="indigo"
            onClick={() => navigateToSection('TypeScript Visualization')}
          />
        </div>
      </ThemeCard>

      {/* Key Facts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Facts</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Superset of JavaScript</p>
              <p className="text-xs text-gray-600">All valid JS is valid TS - gradual adoption</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Compiled Language</p>
              <p className="text-xs text-gray-600">Transpiles to JS for browser compatibility</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Optional Typing</p>
              <p className="text-xs text-gray-600">Types are optional but recommended for safety</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Modern Tooling</p>
              <p className="text-xs text-gray-600">Excellent IDE support with IntelliSense</p>
            </div>
          </div>
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
        title="Ready to Master TypeScript?"
        description="Dive into TypeScript's powerful type system and object-oriented features. Learn how to write more maintainable, scalable JavaScript applications with static typing and modern language constructs."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('TypeScript Basics')}
        colorScheme="indigo"
      />
    </>
  );
};

export default Introduction;
