import React from 'react';
import { Code, GitBranch, Database, Zap, ArrowRight, BookOpen } from 'lucide-react';
import ThemeCard from '../components/shared/ThemeCard';
import { SEO } from '../shared/components/SEO/SEO';

const Home: React.FC = () => {
  const navigateToSection = (path: string) => {
    window.location.href = path;
  };

  const features = [
    {
      icon: <Code className="w-12 h-12 text-indigo-600" />,
      title: 'JavaScript Engine',
      description:
        'Master the inner workings of JavaScript execution, from Call Stack to Event Loop',
      path: '/javascript',
      color: 'indigo',
    },
    {
      icon: <GitBranch className="w-12 h-12 text-orange-600" />,
      title: 'Git Fundamentals',
      description: 'Learn distributed version control with interactive visualizations',
      path: '/git',
      color: 'orange',
    },
    {
      icon: <Database className="w-12 h-12 text-blue-600" />,
      title: 'Data Structures',
      description: 'Explore algorithms and data structures with performance analysis',
      path: '/datastructures',
      color: 'blue',
    },
  ];

  const stats = [
    { value: '10+', label: 'Interactive Modules' },
    { value: '50+', label: 'Visualizations' },
    { value: '1000+', label: 'Code Examples' },
  ];

  return (
    <>
      <SEO
        title="Home - Learn Programming Visually"
        description="Master JavaScript, Git, Data Structures, and more with interactive 2D/3D visualizations. Code Executives makes complex programming concepts simple and engaging."
        keywords={[
          'programming education',
          'javascript tutorial',
          'git tutorial',
          'data structures',
          'interactive learning',
          'code visualization',
          'web development',
        ]}
        canonicalUrl="https://code-executives.com/"
      />
      <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-8 shadow-lg">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Code Executives
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Deep dive into the inner workings of programming languages with interactive theory and
              visual demos. Master JavaScript, Git, and Data Structures through hands-on learning
              experiences.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigateToSection(feature.path)}
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <div className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          {/* Learning Path */}
          <ThemeCard className="mb-16">
            <div className="text-center mb-8">
              <BookOpen className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Learning Journey</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow our structured curriculum designed to take you from beginner to expert in
                modern programming concepts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">JavaScript Foundations</h3>
                <p className="text-sm text-gray-600">
                  Understand how JavaScript really works under the hood
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Version Control Mastery</h3>
                <p className="text-sm text-gray-600">
                  Master Git workflows and collaboration techniques
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Structure Expertise</h3>
                <p className="text-sm text-gray-600">
                  Build efficient algorithms with proper data structures
                </p>
              </div>
            </div>
          </ThemeCard>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                Choose any module above to begin your interactive learning experience. Each section
                is designed to build your understanding step by step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigateToSection('/javascript')}
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Start with JavaScript
                </button>
                <button
                  onClick={() => navigateToSection('/git')}
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Learn Git
                </button>
                <button
                  onClick={() => navigateToSection('/datastructures')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explore Data Structures
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
