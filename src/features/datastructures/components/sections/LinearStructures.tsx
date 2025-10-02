import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import StatsGrid from '../../../../components/shared/StatsGrid';
import ArrayVisualization from '../visualizations/2d/linear/ArrayVisualization';
import { List, BarChart3, ArrowRight, Link, TrendingUp, Database, Zap } from 'lucide-react';

const LinearStructures: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    window.location.href = `/datastructures?section=${encodeURIComponent(sectionName)}`;
  };

  const stats = [
    { label: 'Structure Types', value: '4', icon: <List className="w-5 h-5" /> },
    { label: 'Access Time', value: 'O(1)-O(n)', icon: <Zap className="w-5 h-5" /> },
    { label: 'Space Usage', value: 'O(n)', icon: <Database className="w-5 h-5" /> },
    { label: 'Applications', value: '1000+', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <List className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Linear Data Structures: Sequential Organization
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Linear data structures organize elements in a sequential manner where each element has a
          linear relationship with its neighbors. They form the foundation of computer science.
        </p>
      </div>
      <StatsGrid stats={stats} colorScheme="blue" />
    </div>
  );

  const mainContent = (
    <>
      <ThemeCard>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <List className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Linear Structures Overview</h3>
              <p className="text-gray-700 mb-4">
                Linear data structures are the building blocks of programming, organizing data in
                sequences that enable efficient storage, retrieval, and manipulation operations.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <ArrayVisualization className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Arrays"
            description="Fixed-size indexed collections"
            icon={<BarChart3 className="w-5 h-5" />}
            onClick={() => navigateToSection('Arrays')}
            colorScheme="blue"
          />
          <NavigationCard
            title="Linked Lists"
            description="Dynamic pointer-based lists"
            icon={<Link className="w-5 h-5" />}
            onClick={() => navigateToSection('Linked Lists')}
            colorScheme="indigo"
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Specialized Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Stacks"
            description="LIFO (Last In, First Out)"
            icon={<List className="w-5 h-5" />}
            onClick={() => navigateToSection('Stacks')}
            colorScheme="purple"
          />
          <NavigationCard
            title="Queues"
            description="FIFO (First In, First Out)"
            icon={<ArrowRight className="w-5 h-5" />}
            onClick={() => navigateToSection('Queues')}
            colorScheme="teal"
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
        title="Master Linear Data Structures"
        description="Start with arrays and work your way through to more specialized structures like stacks and queues."
        buttonText="Start with Arrays"
        onButtonClick={() => navigateToSection('Arrays')}
        colorScheme="blue"
      />
    </>
  );
};

export default LinearStructures;
