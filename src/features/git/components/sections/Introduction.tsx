import React from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import CTASection from '../../../../components/shared/CTASection';
import { GitBranch, Shield, Zap, Users, Database, GitFork, CheckCircle } from 'lucide-react';

const Introduction: React.FC = () => {
  const navigateToSection = (sectionName: string) => {
    const baseUrl = '/git?section=';
    const encodedSection = encodeURIComponent(sectionName);
    window.location.href = baseUrl + encodedSection;
  };

  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-orange-100 p-4 rounded-full">
          <GitBranch className="w-16 h-16 text-orange-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Master Git: The Foundation of Modern Development
      </h1>
      <p className="text-xl text-gray-700 mb-6 leading-relaxed">
        Git is the world's most popular distributed version control system, powering millions of
        projects from small scripts to massive enterprise applications. Learn how Git revolutionized
        software development through its innovative architecture and powerful collaboration
        features.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold">
          🌐 Distributed VCS
        </span>
        <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
          🔒 Cryptographic Security
        </span>
        <span className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-semibold">
          ⚡ Lightning Fast
        </span>
        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
          🚀 Powerful Workflows
        </span>
      </div>
    </div>
  );

  // Main content with cards and information
  const mainContent = (
    <>
      {/* What is Git? */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Git?</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Version Control System</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Git is a <strong>distributed version control system</strong> that tracks changes in
              files over time. Unlike traditional centralized systems, Git gives every developer a
              complete copy of the project's entire history, enabling powerful workflows and
              collaboration patterns.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Created by Linus Torvalds in 2005 for Linux kernel development, Git was designed to
              handle large projects with speed, efficiency, and data integrity as core principles.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Core Philosophy</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Distributed:</strong> No single point of failure
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Fast:</strong> Optimized for speed and efficiency
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Secure:</strong> Cryptographic integrity verification
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">
                  <strong>Flexible:</strong> Support for various workflows
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <GitBranch className="w-8 h-8 text-orange-600" />,
              title: 'Distributed Architecture',
              description:
                'Every developer has a complete copy of the project history, enabling offline work and powerful collaboration.',
            },
            {
              icon: <Shield className="w-8 h-8 text-orange-600" />,
              title: 'Cryptographic Security',
              description:
                'SHA-1 hashing ensures data integrity and makes it impossible to alter history without detection.',
            },
            {
              icon: <Zap className="w-8 h-8 text-orange-600" />,
              title: 'Lightning Fast',
              description:
                'Local operations are incredibly fast since most commands work with local data.',
            },
            {
              icon: <GitFork className="w-8 h-8 text-orange-600" />,
              title: 'Powerful Branching',
              description:
                'Lightweight branches enable parallel development and experimental features without risk.',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Git vs Traditional VCS Comparison */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Git vs Traditional Version Control
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-800">Feature</th>
                <th className="text-left py-4 px-4 font-semibold text-orange-600">
                  Git (Distributed)
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-600">Traditional VCS</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'Architecture',
                  git: 'Distributed - Everyone has full history',
                  traditional: 'Centralized - Single point of failure',
                  advantage: 'git',
                },
                {
                  feature: 'Offline Work',
                  git: 'Full functionality offline',
                  traditional: 'Limited or no offline capability',
                  advantage: 'git',
                },
                {
                  feature: 'Branching',
                  git: 'Lightweight, fast, encouraged',
                  traditional: 'Heavy, slow, often avoided',
                  advantage: 'git',
                },
                {
                  feature: 'Merging',
                  git: 'Sophisticated merge algorithms',
                  traditional: 'Basic or manual merging',
                  advantage: 'git',
                },
                {
                  feature: 'Performance',
                  git: 'Fast local operations',
                  traditional: 'Network dependent',
                  advantage: 'git',
                },
              ].map((comparison, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <td className="py-4 px-4 font-medium text-gray-800">{comparison.feature}</td>
                  <td className="py-4 px-4 text-orange-700">
                    <div className="flex items-center space-x-2">
                      <span>{comparison.git}</span>
                      {comparison.advantage === 'git' && <span className="text-green-500">✓</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{comparison.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ThemeCard>

      {/* Benefits for Different Audiences */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Git Matters</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              category: 'For Developers',
              icon: <Users className="w-6 h-6 text-orange-600 mr-2" />,
              benefits: [
                'Work offline with full version control capabilities',
                'Experiment with features using lightweight branches',
                'Powerful tools for code archaeology and debugging',
                'Fast, local operations for improved productivity',
              ],
            },
            {
              category: 'For Teams',
              icon: <GitFork className="w-6 h-6 text-orange-600 mr-2" />,
              benefits: [
                'Flexible workflows that adapt to team structure',
                'Parallel development without conflicts',
                'Comprehensive audit trail and accountability',
                'Seamless integration with modern development tools',
              ],
            },
            {
              category: 'For Projects',
              icon: <Database className="w-6 h-6 text-orange-600 mr-2" />,
              benefits: [
                'Complete project history preservation',
                'Reliable backup through distributed copies',
                'Support for multiple release strategies',
                'Integration with CI/CD and automation tools',
              ],
            },
          ].map((category, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                {category.icon}
                {category.category}
              </h3>
              <ul className="space-y-2">
                {category.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="text-sm text-gray-700 flex items-start">
                    <span className="text-orange-500 mr-2 mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Git Adoption Stats */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Git's Global Impact</h2>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">100M+</div>
            <div className="text-sm text-gray-600">GitHub Repositories</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">87%</div>
            <div className="text-sm text-gray-600">Developer Adoption</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">90%</div>
            <div className="text-sm text-gray-600">Fortune 500 Usage</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">18+</div>
            <div className="text-sm text-gray-600">Years of Innovation</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Industry Standard</h3>
          <p className="text-gray-700 mb-4">
            Git has become the de facto standard for version control across industries, from
            startups to enterprise organizations. Its adoption by major platforms like GitHub,
            GitLab, and Bitbucket has created a unified ecosystem for software development.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
              GitHub
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
              GitLab
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
              Bitbucket
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
              Azure DevOps
            </span>
            <span className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border">
              SourceForge
            </span>
          </div>
        </div>
      </ThemeCard>

      {/* Learning Progress */}
      <ThemeCard>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">📚 Your Git Learning Path</h2>
        <p className="text-gray-700 mb-6">
          Follow our structured curriculum to build Git expertise step by step. Each section builds
          upon previous knowledge with interactive visualizations.
        </p>

        <div className="space-y-3">
          {[
            { name: 'Introduction', completed: true, current: true },
            { name: 'Git Architecture', completed: false, current: false },
            { name: 'Three-Tree Model', completed: false, current: false },
            { name: 'Object Model', completed: false, current: false },
            { name: 'Core Workflow', completed: false, current: false },
            { name: 'Branching & Merging', completed: false, current: false },
            { name: 'Professional Workflows', completed: false, current: false },
            { name: 'History Management', completed: false, current: false },
          ].map((step, index) => (
            <div
              key={step.name}
              className={`flex items-center p-4 rounded-lg border transition-colors ${
                step.current
                  ? 'bg-orange-50 border-orange-300'
                  : step.completed
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    step.current
                      ? 'text-orange-800'
                      : step.completed
                        ? 'text-green-800'
                        : 'text-gray-700'
                  }`}
                >
                  {step.name}
                  {step.current && <span className="ml-2 text-orange-600">(Current)</span>}
                  {step.completed && <span className="ml-2 text-green-600">✓</span>}
                </h3>
              </div>
              {!step.completed && !step.current && (
                <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Coming Next
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Interactive Learning Modules</h3>
        <div className="space-y-3">
          <NavigationCard
            title="Git Architecture"
            description="Understand distributed vs centralized systems"
            colorScheme="orange"
            onClick={() => navigateToSection('Git Architecture')}
          />
          <NavigationCard
            title="Three-Tree Model"
            description="Working Directory, Staging Area, Repository"
            colorScheme="orange"
            onClick={() => navigateToSection('Three-Tree Model')}
          />
          <NavigationCard
            title="Core Workflow"
            description="Essential Git commands and operations"
            colorScheme="orange"
            onClick={() => navigateToSection('Core Workflow')}
          />
          <NavigationCard
            title="Branching & Merging"
            description="Powerful parallel development techniques"
            colorScheme="orange"
            onClick={() => navigateToSection('Branching & Merging')}
          />
          <NavigationCard
            title="Team Workflows"
            description="Git Flow, GitHub Flow, and collaboration"
            colorScheme="orange"
            onClick={() => navigateToSection('Professional Workflows')}
          />
          <NavigationCard
            title="Interactive Playground"
            description="Practice Git concepts safely"
            colorScheme="orange"
            onClick={() => navigateToSection('Visualization')}
          />
        </div>
      </ThemeCard>
    </>
  );

  return (
    <>
      <SectionLayout
        section="git"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready to Master Git?"
        description="Dive into interactive visualizations that will transform how you understand version control and collaboration in software development."
        buttonText="Start Learning"
        onButtonClick={() => navigateToSection('Git Architecture')}
        colorScheme="orange"
      />
    </>
  );
};

export default Introduction;
