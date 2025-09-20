import React from 'react';
import { Database, BookOpen, Clock, Code } from 'lucide-react';
import SectionLayout from '../../components/shared/SectionLayout';
import ThemeCard from '../../components/shared/ThemeCard';
import NavigationCard from '../../components/shared/NavigationCard';
import StatsGrid from '../../components/shared/StatsGrid';
import CTASection from '../../components/shared/CTASection';
import { getSectionTheme } from '../../utils/theme';

const Introduction: React.FC = () => {
  const theme = getSectionTheme('datastructures');

  const navigateToSection = (sectionName: string) => {
    // Navigate using the existing URL structure
    const baseUrl = '/datastructures?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  const stats = [
    { value: '100+', label: 'Data Structures Covered' },
    { value: 'O(n)', label: 'Complexity Analysis' },
    { value: 'Real-World', label: 'Practical Examples' },
  ];

  const keyFeatures = [
    {
      icon: <Database className={`w-8 h-8 text-${theme.primary}-600`} />,
      title: 'Comprehensive Coverage',
      description: 'From basic arrays to advanced tree structures and graph algorithms.',
    },
    {
      icon: <Clock className={`w-8 h-8 text-${theme.secondary}-600`} />,
      title: 'Performance Analysis',
      description:
        'Understand Big O notation and time/space complexity for optimal implementations.',
    },
    {
      icon: <Code className={`w-8 h-8 text-${theme.accent}-600`} />,
      title: 'Practical Applications',
      description: 'Real-world use cases from web development to system design and algorithms.',
    },
    {
      icon: <BookOpen className={`w-8 h-8 text-${theme.primary}-600`} />,
      title: 'Interactive Learning',
      description:
        'Visualize data structures with interactive diagrams and step-by-step animations.',
    },
  ];

  const benefits = [
    {
      category: 'For Developers',
      benefits: [
        'Master fundamental computer science concepts',
        'Optimize code performance with efficient data structures',
        'Solve complex algorithmic problems',
        'Build scalable and maintainable applications',
      ],
    },
    {
      category: 'For Interviews',
      benefits: [
        'Prepare for technical interviews at top companies',
        'Understand common data structure questions',
        'Learn problem-solving patterns and techniques',
        'Build confidence in algorithmic thinking',
      ],
    },
    {
      category: 'For Projects',
      benefits: [
        'Choose the right data structure for your use case',
        'Implement efficient algorithms and data processing',
        'Design scalable system architectures',
        'Optimize memory usage and performance',
      ],
    },
  ];

  const complexityComparison = [
    {
      structure: 'Array',
      access: 'O(1)',
      search: 'O(n)',
      insert: 'O(n)',
      delete: 'O(n)',
    },
    {
      structure: 'Linked List',
      access: 'O(n)',
      search: 'O(n)',
      insert: 'O(1)',
      delete: 'O(1)',
    },
    {
      structure: 'Hash Table',
      access: 'O(1)',
      search: 'O(1)',
      insert: 'O(1)',
      delete: 'O(1)',
    },
    {
      structure: 'Binary Tree',
      access: 'O(log n)',
      search: 'O(log n)',
      insert: 'O(log n)',
      delete: 'O(log n)',
    },
  ];

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className={`bg-${theme.primary}-100 p-4 rounded-full`}>
            <Database className={`w-16 h-16 text-${theme.primary}-600`} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Data Structures: The Building Blocks of Programming
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          Data structures are specialized formats for organizing, processing, retrieving, and
          storing data. They form the foundation of efficient algorithms and are essential for
          solving complex computational problems.
        </p>
      </div>

      <StatsGrid stats={stats} colorScheme={theme.primary} />
    </div>
  );

  // Main content
  const mainContent = (
    <>
      {/* What are Data Structures? */}
      <ThemeCard>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">DS</span>
          </div>
          What are Data Structures?
        </h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Data structures are systematic ways of organizing and storing data in computer memory to
            enable efficient access and modification. They provide the blueprint for how data
            elements relate to each other and the operations that can be performed on it.
          </p>
          <p>
            Choosing the right data structure is crucial for writing efficient algorithms and
            building performant applications. Each data structure has its own strengths and
            trade-offs in terms of time complexity, space complexity, and ease of implementation.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <p className="text-blue-800">
              <strong>Key Insight:</strong> The choice of data structure can make or break your
              application's performance. Understanding these fundamental building blocks is
              essential for any serious programmer.
            </p>
          </div>
        </div>
      </ThemeCard>

      {/* Key Features Grid */}
      <ThemeCard>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Why Data Structures Matter</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {keyFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Performance Comparison */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Performance Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-800">Structure</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-800">Access</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-800">Search</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-800">Insert</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-800">Delete</th>
              </tr>
            </thead>
            <tbody>
              {complexityComparison.map((comparison, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <td className="py-4 px-4 font-medium text-blue-600">{comparison.structure}</td>
                  <td className="py-4 px-4 text-green-600">{comparison.access}</td>
                  <td className="py-4 px-4 text-orange-600">{comparison.search}</td>
                  <td className="py-4 px-4 text-orange-600">{comparison.insert}</td>
                  <td className="py-4 px-4 text-orange-600">{comparison.delete}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Benefits for Different Audiences */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Benefits for Different Roles</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((category, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                {index === 0 && <Database className={`w-6 h-6 text-${theme.primary}-600 mr-2`} />}
                {index === 1 && <Code className={`w-6 h-6 text-${theme.secondary}-600 mr-2`} />}
                {index === 2 && <Clock className={`w-6 h-6 text-${theme.accent}-600 mr-2`} />}
                {category.category}
              </h3>
              <ul className="space-y-2">
                {category.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar content
  const sidebarContent = (
    <>
      {/* Exploration Navigation */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Explore Data Structures</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Linear Structures"
            description="Arrays, Lists, Stacks, Queues"
            colorScheme={theme.primary}
            onClick={() => navigateToSection('Linear Structures')}
          />
          <NavigationCard
            title="Hash Tables"
            description="Key-value storage and lookup"
            colorScheme={theme.secondary}
            onClick={() => navigateToSection('Hash Tables')}
          />
          <NavigationCard
            title="Tree Structures"
            description="Hierarchical data organization"
            colorScheme={theme.accent}
            onClick={() => navigateToSection('Tree Structures')}
          />
          <NavigationCard
            title="Graph Structures"
            description="Complex relationships and networks"
            colorScheme={theme.primary}
            onClick={() => navigateToSection('Graph Structures')}
          />
          <NavigationCard
            title="Complexity Analysis"
            description="Big O notation and performance"
            colorScheme={theme.secondary}
            onClick={() => navigateToSection('Complexity Analysis')}
          />
        </div>
      </ThemeCard>

      {/* Key Concepts */}
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Concepts</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Time Complexity</p>
              <p className="text-xs text-gray-600">How execution time scales with input size</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Space Complexity</p>
              <p className="text-xs text-gray-600">Memory usage patterns and trade-offs</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Trade-offs</p>
              <p className="text-xs text-gray-600">
                Balancing different performance characteristics
              </p>
            </div>
          </div>
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

      {/* Bottom CTA */}
      <CTASection
        title="Ready to Master Data Structures?"
        description="Dive into interactive visualizations that will transform how you think about organizing and processing data in your applications."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('Linear Structures')}
        colorScheme={theme.primary}
      />
    </>
  );
};

export default Introduction;
