import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import SetVisualization from '../../components/models2d/datastructures/sets/SetVisualization';
import { Hash, ArrowRight } from 'lucide-react';

const Sets: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full">
          <Hash className="w-16 h-16 text-green-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Sets: Unique Collections</h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Sets are unordered collections that store unique elements, providing efficient membership
        testing and set operations like union, intersection, and difference.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔍 O(1) Membership
        </span>
        <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
          🚫 No Duplicates
        </span>
        <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔄 Set Operations
        </span>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Hash className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Set Properties</h3>
              <p className="text-gray-700 mb-4">
                Understanding the fundamental characteristics that make sets powerful.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-green-500" />
                  Unordered collection of unique elements
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-green-500" />
                  Fast membership testing (contains operation)
                </li>
                <li className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-green-500" />
                  Set operations: union, intersection, difference
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ThemeCard>
      {/* Visualization takes full width */}
      <div className="w-full px-0 mt-8">
        <SetVisualization className="w-full" />
      </div>
    </>
  );

  // No sidebar for full width visualization
  const sidebarContent = undefined;

  return (
    <>
      <SectionLayout
        section="datastructures"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      {/* Navigation cards and CTA below visualization */}
      <div className="max-w-4xl mx-auto mt-8">
        <ThemeCard>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Data Structures</h3>
          <div className="space-y-3">
            <NavigationCard
              title="Hash Tables"
              description="Key-value storage with hashing"
              icon={<Hash className="w-5 h-5" />}
              onClick={() => navigateToSection('Hash Tables')}
              colorScheme="purple"
            />
            <NavigationCard
              title="Arrays"
              description="Contiguous memory storage"
              icon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigateToSection('Arrays')}
              colorScheme="blue"
            />
          </div>
        </ThemeCard>
      </div>
      <CTASection
        title="Master Set Operations"
        description="Understanding sets is crucial for efficient data processing and algorithms."
        buttonText="Next: Deques"
        onButtonClick={() => navigateToSection('Deques')}
        colorScheme="green"
      />
    </>
  );
};

export default Sets;
