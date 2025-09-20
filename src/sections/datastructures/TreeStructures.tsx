import React from 'react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import CTASection from '../../components/shared/CTASection';
import StatsGrid from '../../components/shared/StatsGrid';
import BinaryTreeVisualization from '../../components/models2d/datastructures/tree/BinaryTreeVisualization';
import { TreePine, TrendingUp, Database, Zap } from 'lucide-react';

const TreeStructures: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    window.location.href = `/datastructures?section=${encodeURIComponent(sectionName)}`;
  };

  const stats = [
    { label: 'Tree Types', value: '6+', icon: <TreePine className="w-5 h-5" /> },
    { label: 'Search Time', value: 'O(log n)', icon: <Zap className="w-5 h-5" /> },
    { label: 'Space Usage', value: 'O(n)', icon: <Database className="w-5 h-5" /> },
    { label: 'Applications', value: '100+', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <TreePine className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tree Structures: Hierarchical Data Organization
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Trees are hierarchical data structures consisting of nodes connected by edges. Each tree
          has a single root node and every other node has exactly one parent.
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
              <TreePine className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tree Structures Overview</h3>
              <p className="text-gray-700 mb-4">
                Trees are fundamental data structures that organize data hierarchically, making them
                essential for many algorithms and applications.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <BinaryTreeVisualization className="w-full" />
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tree Types</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Binary Trees"
            description="Basic tree with max 2 children"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Trees')}
            colorScheme="blue"
          />
          <NavigationCard
            title="Binary Search Trees"
            description="Ordered binary trees"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Binary Search Trees')}
            colorScheme="indigo"
          />
          <NavigationCard
            title="AVL Trees"
            description="Height-balanced BSTs"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('AVL Trees')}
            colorScheme="purple"
          />
        </div>
      </ThemeCard>

      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Advanced Trees</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Red-Black Trees"
            description="Color-based balanced trees"
            icon={<TreePine className="w-5 h-5" />}
            onClick={() => navigateToSection('Red-Black Trees')}
            colorScheme="red"
          />
          <NavigationCard
            title="Heaps"
            description="Priority-based complete trees"
            icon={<TrendingUp className="w-5 h-5" />}
            onClick={() => navigateToSection('Heaps')}
            colorScheme="orange"
          />
          <NavigationCard
            title="B-Trees"
            description="Multi-way balanced trees"
            icon={<Database className="w-5 h-5" />}
            onClick={() => navigateToSection('B-Trees')}
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
        title="Explore Different Tree Types"
        description="Dive deep into specific tree implementations, each optimized for different use cases."
        buttonText="Start with Binary Trees"
        onButtonClick={() => navigateToSection('Binary Trees')}
        colorScheme="blue"
      />
    </>
  );
};

export default TreeStructures;
