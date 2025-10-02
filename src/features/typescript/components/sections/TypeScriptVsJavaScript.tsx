import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';

const TypeScriptVsJavaScript: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">TypeScript vs JavaScript</h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Understanding the key differences between JavaScript and TypeScript, and when to choose
          each for your projects
        </p>
      </div>
    </div>
  );

  const mainContent = (
    <>
      {/* Core Differences */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Differences</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                  Feature
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-600">
                  JavaScript
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-indigo-600">
                  TypeScript
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-medium">Typing</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  Dynamic
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Static
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">Compilation</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Interpreted
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-blue-600">
                  Compiled
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-medium">Error Detection</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-red-600">
                  Runtime
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Compile-time
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 font-medium">OOP Support</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-yellow-600">
                  Prototype-based
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Class-based
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-3 font-medium">IDE Support</td>
                <td className="border border-gray-300 px-4 py-3 text-center text-yellow-600">
                  Basic
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-green-600">
                  Advanced
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* JavaScript Strengths */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">JS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">JavaScript Strengths</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Rapid Prototyping</h3>
              <p className="text-yellow-700 text-sm">Quick development without type definitions</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Flexibility</h3>
              <p className="text-yellow-700 text-sm">
                Dynamic typing allows for flexible data structures
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Browser Native</h3>
              <p className="text-yellow-700 text-sm">
                Direct execution in browsers without compilation
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">Large Ecosystem</h3>
              <p className="text-yellow-700 text-sm">
                Extensive libraries and frameworks available
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* TypeScript Advantages */}
      <ThemeCard>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">TypeScript Advantages</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">Type Safety</h3>
              <p className="text-indigo-700 text-sm">Catch errors at compile time, not runtime</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">Better IDE Support</h3>
              <p className="text-indigo-700 text-sm">
                Enhanced autocomplete, refactoring, and navigation
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">OOP Features</h3>
              <p className="text-indigo-700 text-sm">
                Full class-based OOP with interfaces and generics
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">Maintainability</h3>
              <p className="text-indigo-700 text-sm">
                Easier to maintain and refactor large codebases
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Code Comparison */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Comparison</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-yellow-600 mb-3">JavaScript</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// JavaScript - Dynamic typing
function add(a, b) {
  return a + b; // What if a or b is a string?
}

add(5, 10); // 15
add("5", 10); // "510" - Type coercion
add(5, "10"); // "510" - Silent conversion`}
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 mb-3">TypeScript</h3>
            <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
              {`// TypeScript - Static typing
function add(a: number, b: number): number {
  return a + b; // Type-safe operation
}

add(5, 10); // 15 ✅
add("5", 10); // Error: Argument of type 'string' ❌
add(5, "10"); // Error: Argument of type 'string' ❌`}
            </pre>
          </div>
        </div>
      </ThemeCard>

      {/* When to Use Each */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">When to Use Each</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">Use JavaScript for:</h3>
            <ul className="space-y-2 text-yellow-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Small projects and prototypes
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Quick scripting and automation
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Browser-only applications
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                When you need maximum flexibility
              </li>
            </ul>
          </div>
          <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-xl font-bold text-indigo-800 mb-4">Use TypeScript for:</h3>
            <ul className="space-y-2 text-indigo-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Large-scale applications
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Team development projects
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Long-term maintainable codebases
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Complex OOP architectures
              </li>
            </ul>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="OOP Fundamentals"
          description="Learn object-oriented programming"
          colorScheme="indigo"
          onClick={() => navigateToSection('OOP Fundamentals')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Type System"
          description="Explore TypeScript's type system"
          colorScheme="indigo"
          onClick={() => navigateToSection('Type System')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Visualizations"
          description="Interactive demonstrations"
          colorScheme="indigo"
          onClick={() => navigateToSection('TypeScript Visualization')}
        />
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
        title="Explore TypeScript Features"
        description="Dive deeper into TypeScript's powerful type system and object-oriented capabilities"
        buttonText="Continue Learning"
        onButtonClick={() => navigateToSection('OOP Fundamentals')}
        colorScheme="indigo"
      />
    </>
  );
};

export default TypeScriptVsJavaScript;
