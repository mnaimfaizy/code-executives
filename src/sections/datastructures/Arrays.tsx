import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import ArrayVisualization from '../../components/models2d/datastructures/linear/ArrayVisualization';
import { BarChart3, ArrowRight, Database } from 'lucide-react';

const Arrays: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <BarChart3 className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Arrays: The Foundation of Data Structures
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Arrays are the most fundamental data structure, storing elements in contiguous memory
        locations with constant-time access by index.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
          📊 O(1) Access
        </span>
        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔢 Indexed Elements
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          💾 Contiguous Memory
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Array Properties</h3>
              <p className="text-gray-700 mb-4">
                Understanding the fundamental characteristics that make arrays efficient.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                  Elements stored in contiguous memory locations
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-blue-500" />
                  Direct access to elements using indices
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <ArrayVisualization className="w-full" />
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Linear Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Linked Lists"
            description="Dynamic pointer-based lists"
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={() => navigateToSection('Linked Lists')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="Stacks"
            description="LIFO data structure"
            icon={<Database className="w-5 h-5" />}
            onClick={() => navigateToSection('Stacks')}
            colorScheme="purple"
          />
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="datastructures"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Master Array Operations"
        description="Understanding arrays is crucial for efficient programming."
        buttonText="Next: Linked Lists"
        onButtonClick={() => navigateToSection('Linked Lists')}
        colorScheme="blue"
      />
    </>
  );
};

export default Arrays;
