import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';

const OOPFundamentals: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Object-Oriented Programming Fundamentals
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master the core principles of OOP in TypeScript: encapsulation, inheritance, polymorphism,
          and abstraction through practical examples and interactive visualizations
        </p>
      </div>
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* OOP Overview */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What is Object-Oriented Programming?
        </h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Object-Oriented Programming (OOP) is a programming paradigm that organizes code around
            <strong> objects</strong> rather than functions and logic. TypeScript provides full
            support for OOP concepts, making it easier to build complex, maintainable applications.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>OOP Benefits:</strong> Better code organization, reusability, maintainability,
              and modeling real-world entities in your code.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Four Pillars */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">The Four Pillars of OOP</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-lg">🔒</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Encapsulation</h4>
                <p className="text-gray-600 text-sm">
                  Bundling data and methods together, controlling access through visibility
                  modifiers.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">📈</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Inheritance</h4>
                <p className="text-gray-600 text-sm">
                  Creating new classes from existing ones, inheriting properties and methods.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-lg">🎭</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Polymorphism</h4>
                <p className="text-gray-600 text-sm">
                  Ability of objects to take multiple forms through method overriding and
                  interfaces.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-bold text-lg">🎯</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Abstraction</h4>
                <p className="text-gray-600 text-sm">
                  Hiding complex implementation details and showing only essential features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* TypeScript OOP Features */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">TypeScript OOP Features</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Classes</h4>
              <p className="text-indigo-700 text-sm">
                First-class support with constructors, properties, and methods
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Interfaces</h4>
              <p className="text-purple-700 text-sm">
                Define contracts for object shapes and behavior
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Access Modifiers</h4>
              <p className="text-green-700 text-sm">public, private, protected for encapsulation</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Abstract Classes</h4>
              <p className="text-blue-700 text-sm">
                Base classes that cannot be instantiated directly
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Method Overriding</h4>
              <p className="text-orange-700 text-sm">
                Child classes can provide specific implementations
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Generics</h4>
              <p className="text-red-700 text-sm">Type-safe reusable components and functions</p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">OOP Deep Dive</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Class Hierarchy"
            description="Visualize inheritance relationships"
            colorScheme="indigo"
            onClick={() => navigateToSection('Class Hierarchy')}
          />
          <NavigationCard
            title="Inheritance Flow"
            description="How properties and methods are inherited"
            colorScheme="indigo"
            onClick={() => navigateToSection('Inheritance')}
          />
          <NavigationCard
            title="Polymorphism Demo"
            description="Method overriding and dynamic dispatch"
            colorScheme="indigo"
            onClick={() => navigateToSection('Polymorphism')}
          />
          <NavigationCard
            title="Data Encapsulation"
            description="Access control and data hiding"
            colorScheme="indigo"
            onClick={() => navigateToSection('Encapsulation')}
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Code Examples</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-mono text-xs text-gray-800">
              {`class Animal {
  protected name: string;
  constructor(name: string) {
    this.name = name;
  }
  public speak(): void {
    console.log("...");
  }
}`}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-mono text-xs text-gray-800">
              {`class Dog extends Animal {
  public speak(): void {
    console.log("Woof!");
  }
}`}
            </p>
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
        title="Explore OOP Concepts"
        description="See these principles in action with interactive visualizations that demonstrate how TypeScript implements object-oriented programming concepts."
        buttonText="View Visualizations"
        onButtonClick={() => navigateToSection('Class Hierarchy')}
        colorScheme="indigo"
      />
    </>
  );
};

export default OOPFundamentals;
