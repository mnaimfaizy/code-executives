import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import ClassHierarchy2D from '../../components/models2d/typescript/ClassHierarchy2D';
import InheritanceTree2D from '../../components/models2d/typescript/InheritanceTree2D';
import PolymorphismFlow2D from '../../components/models2d/typescript/PolymorphismFlow2D';
import EncapsulationBox2D from '../../components/models2d/typescript/EncapsulationBox2D';
import type {
  ClassDefinition,
  ClassHierarchy2DHandle,
} from '../../components/models2d/typescript/ClassHierarchy2D';
import type {
  InheritanceNode,
  InheritanceTree2DHandle,
} from '../../components/models2d/typescript/InheritanceTree2D';
import type {
  PolymorphicMethod,
  PolymorphismFlow2DHandle,
} from '../../components/models2d/typescript/PolymorphismFlow2D';
import type {
  EncapsulationClass,
  EncapsulationBox2DHandle,
} from '../../components/models2d/typescript/EncapsulationBox2D';

const TypeScriptVisualization: React.FC = () => {
  const navigate = useNavigate();
  const classHierarchyRef = useRef<ClassHierarchy2DHandle>(null);
  const inheritanceTreeRef = useRef<InheritanceTree2DHandle>(null);
  const polymorphismFlowRef = useRef<PolymorphismFlow2DHandle>(null);
  const encapsulationBoxRef = useRef<EncapsulationBox2DHandle>(null);

  const navigateToSection = (sectionName: string) => {
    const encodedSection = encodeURIComponent(sectionName);
    navigate(`/typescript?section=${encodedSection}`);
  };

  // Sample data for visualizations
  const classHierarchyData: ClassDefinition[] = [
    {
      name: 'Animal',
      members: [
        { name: 'name', type: 'property', visibility: 'protected' },
        { name: 'age', type: 'property', visibility: 'protected' },
        { name: 'speak', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'move', type: 'method', visibility: 'public', returnType: 'void' },
      ],
    },
    {
      name: 'Mammal',
      extends: 'Animal',
      members: [
        { name: 'furColor', type: 'property', visibility: 'public' },
        { name: 'giveBirth', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'nurse', type: 'method', visibility: 'protected', returnType: 'void' },
      ],
    },
    {
      name: 'Dog',
      extends: 'Mammal',
      members: [
        { name: 'breed', type: 'property', visibility: 'public' },
        { name: 'bark', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'fetch', type: 'method', visibility: 'public', returnType: 'void' },
      ],
    },
    {
      name: 'Cat',
      extends: 'Mammal',
      members: [
        { name: 'whiskerLength', type: 'property', visibility: 'private' },
        { name: 'purr', type: 'method', visibility: 'public', returnType: 'void' },
        { name: 'scratch', type: 'method', visibility: 'public', returnType: 'void' },
      ],
    },
  ];

  const inheritanceTreeData: InheritanceNode = {
    name: 'Vehicle',
    level: 0,
    properties: [
      { name: 'make', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'year', type: 'number' },
    ],
    methods: [
      { name: 'start', signature: '(): void', inherited: false },
      { name: 'stop', signature: '(): void', inherited: false },
    ],
  };

  const polymorphismData: PolymorphicMethod[] = [
    {
      name: 'calculateArea',
      baseClass: 'Shape',
      implementations: [
        {
          className: 'Circle',
          signature: '(radius: number): number',
          body: 'return Math.PI * radius * radius;',
          isOverride: true,
        },
        {
          className: 'Rectangle',
          signature: '(width: number, height: number): number',
          body: 'return width * height;',
          isOverride: true,
        },
        {
          className: 'Triangle',
          signature: '(base: number, height: number): number',
          body: 'return (base * height) / 2;',
          isOverride: true,
        },
      ],
    },
  ];

  const encapsulationData: EncapsulationClass = {
    name: 'BankAccount',
    publicMembers: [
      { name: 'accountNumber', type: 'property', visibility: 'public', value: 'string' },
      {
        name: 'deposit',
        type: 'method',
        visibility: 'public',
        signature: '(amount: number): void',
      },
      {
        name: 'withdraw',
        type: 'method',
        visibility: 'public',
        signature: '(amount: number): boolean',
      },
      { name: 'getBalance', type: 'method', visibility: 'public', signature: '(): number' },
    ],
    privateMembers: [
      { name: 'balance', type: 'property', visibility: 'private', value: 'number' },
      {
        name: 'transactionHistory',
        type: 'property',
        visibility: 'private',
        value: 'Transaction[]',
      },
      {
        name: 'validateAmount',
        type: 'method',
        visibility: 'private',
        signature: '(amount: number): boolean',
      },
    ],
    protectedMembers: [
      { name: 'minimumBalance', type: 'property', visibility: 'protected', value: 'number' },
      {
        name: 'calculateInterest',
        type: 'method',
        visibility: 'protected',
        signature: '(): number',
      },
    ],
  };

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Interactive TypeScript Visualizations
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Explore TypeScript's object-oriented programming concepts through interactive, animated
          visualizations that bring abstract concepts to life
        </p>
      </div>
    </div>
  );

  // Main content with visualizations
  const mainContent = (
    <>
      {/* Class Hierarchy Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🏗️ Class Hierarchy & Inheritance</h2>
          <div className="flex gap-2">
            <button
              onClick={() => classHierarchyRef.current?.expandClass('Dog')}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
            >
              Expand Dog
            </button>
            <button
              onClick={() => classHierarchyRef.current?.reset()}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="text-gray-700 mb-4">
          Click on class boxes to expand/collapse and see their members. Different colors represent
          access modifiers: 🔵 public, 🔴 private, 🟡 protected.
        </p>
        <div className="h-96 w-full">
          <ClassHierarchy2D
            ref={classHierarchyRef}
            classes={classHierarchyData}
            width={800}
            height={400}
            showVisibility={true}
          />
        </div>
      </ThemeCard>

      {/* Inheritance Flow Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🌳 Inheritance Flow</h2>
          <button
            onClick={() => inheritanceTreeRef.current?.animateInheritance()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            ▶️ Animate Inheritance
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          Watch how properties and methods flow down the inheritance hierarchy. Inherited members
          are marked with different colors and can be highlighted by clicking.
        </p>
        <div className="h-96 w-full">
          <InheritanceTree2D
            ref={inheritanceTreeRef}
            rootClass={inheritanceTreeData}
            width={800}
            height={400}
            animationSpeed={1200}
          />
        </div>
      </ThemeCard>

      {/* Polymorphism Flow Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🔄 Polymorphism & Method Overriding</h2>
          <button
            onClick={() => polymorphismFlowRef.current?.animatePolymorphism()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            ▶️ Animate Polymorphism
          </button>
        </div>
        <p className="text-gray-700 mb-4">
          See how different classes implement the same method signature differently. Click on
          implementation nodes to view the actual code.
        </p>
        <div className="h-96 w-full">
          <PolymorphismFlow2D
            ref={polymorphismFlowRef}
            methods={polymorphismData}
            width={800}
            height={400}
            animationSpeed={1500}
          />
        </div>
      </ThemeCard>

      {/* Encapsulation Visualization */}
      <ThemeCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">🔐 Data Encapsulation</h2>
          <div className="flex gap-2">
            <button
              onClick={() => encapsulationBoxRef.current?.toggleVisibility('private')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
            >
              🔒 Toggle Private
            </button>
            <button
              onClick={() => encapsulationBoxRef.current?.toggleVisibility('protected')}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
            >
              🛡️ Toggle Protected
            </button>
          </div>
        </div>
        <p className="text-gray-700 mb-4">
          Explore how encapsulation controls access to class members. Use the buttons above to
          show/hide different visibility levels and understand data hiding principles.
        </p>
        <div className="h-96 w-full">
          <EncapsulationBox2D
            ref={encapsulationBoxRef}
            classData={encapsulationData}
            width={800}
            height={400}
            showProtected={true}
          />
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Visualization Controls</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Class Hierarchy:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Click classes to expand</li>
              <li>• Color-coded visibility</li>
              <li>• Inheritance arrows</li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Inheritance Flow:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Animate property flow</li>
              <li>• Click to highlight members</li>
              <li>• See overridden methods</li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Polymorphism:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Watch method dispatch</li>
              <li>• View implementation code</li>
              <li>• Compare signatures</li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900 mb-2">Encapsulation:</p>
            <ul className="text-gray-600 space-y-1">
              <li>• Toggle visibility levels</li>
              <li>• See access control</li>
              <li>• Understand data hiding</li>
            </ul>
          </div>
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
