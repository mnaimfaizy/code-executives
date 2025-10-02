import React from 'react';
import { Type } from 'lucide-react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';
import StringVisualization from '../visualizations/2d/strings/StringVisualization';

/**
 * Strings Section
 * Interactive learning module for understanding string data structures and operations
 */
const Strings: React.FC = () => {
  // Hero content with title, description, and stats
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Strings: Text Processing Fundamentals
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed">
          Master string manipulation, pattern matching, and text processing algorithms. From basic
          operations to advanced string searching and manipulation techniques.
        </p>
      </div>
      <StatsGrid
        stats={[
          { label: 'Time Complexity', value: 'O(n)' },
          { label: 'Space Complexity', value: 'O(n)' },
          { label: 'Operations', value: '15+' },
          { label: 'Algorithms', value: '10+' },
        ]}
        colorScheme="datastructures"
      />
    </div>
  );

  // Main content with visualization and information
  const mainContent = (
    <>
      {/* Interactive Visualization */}
      <ThemeCard className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Type className="w-6 h-6 mr-2 text-indigo-600" />
            Interactive String Visualization
          </h2>
          <p className="text-gray-600 mb-6">
            Explore string operations with this interactive visualization. Manipulate text, search
            for patterns, and see how different algorithms work on strings.
          </p>
          <StringVisualization />
        </div>
      </ThemeCard>

      {/* Core Concepts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ThemeCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What are Strings?</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                A <strong>string</strong> is a sequence of characters stored as a data structure.
                Modern programming languages provide rich string manipulation capabilities, from
                simple concatenation to complex pattern matching algorithms.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Key Characteristics:</h4>
                <ul className="space-y-1 text-indigo-800">
                  <li>
                    • <strong>Sequential:</strong> Characters stored in order
                  </li>
                  <li>
                    • <strong>Immutable:</strong> Often cannot be modified in-place
                  </li>
                  <li>
                    • <strong>Indexed:</strong> Access by position (0-based)
                  </li>
                  <li>
                    • <strong>Unicode:</strong> Support for international characters
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Core Operations</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-900 text-sm">Basic Operations</h4>
                  <ul className="text-xs text-green-800 mt-1 space-y-1">
                    <li>
                      • <code>length()</code> - Get string length
                    </li>
                    <li>
                      • <code>charAt(index)</code> - Get character
                    </li>
                    <li>
                      • <code>concat(str)</code> - Join strings
                    </li>
                    <li>
                      • <code>substring()</code> - Extract part
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 text-sm">Search Operations</h4>
                  <ul className="text-xs text-blue-800 mt-1 space-y-1">
                    <li>
                      • <code>indexOf(str)</code> - Find position
                    </li>
                    <li>
                      • <code>includes(str)</code> - Check presence
                    </li>
                    <li>
                      • <code>startsWith(str)</code> - Prefix check
                    </li>
                    <li>
                      • <code>endsWith(str)</code> - Suffix check
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-900 text-sm">Advanced Operations</h4>
                <ul className="text-xs text-purple-800 mt-1 space-y-1">
                  <li>
                    • <code>replace()</code> - Pattern replacement
                  </li>
                  <li>
                    • <code>split()</code> - String to array
                  </li>
                  <li>
                    • <code>match()</code> - Regex matching
                  </li>
                  <li>
                    • <code>trim()</code> - Remove whitespace
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* String Algorithms */}
      <ThemeCard className="mb-8">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">String Algorithms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Pattern Matching</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 text-sm">Naive Search</h5>
                  <div className="text-xs text-gray-600 mt-1">
                    Simple character-by-character comparison
                  </div>
                  <div className="text-xs font-mono text-green-600 mt-1">
                    Time: O(n×m), Space: O(1)
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 text-sm">KMP Algorithm</h5>
                  <div className="text-xs text-gray-600 mt-1">
                    Knuth-Morris-Pratt with prefix table
                  </div>
                  <div className="text-xs font-mono text-green-600 mt-1">
                    Time: O(n+m), Space: O(m)
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">String Comparison</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 text-sm">Levenshtein Distance</h5>
                  <div className="text-xs text-gray-600 mt-1">Edit distance between strings</div>
                  <div className="text-xs font-mono text-green-600 mt-1">
                    Time: O(n×m), Space: O(n×m)
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 text-sm">Longest Common Substring</h5>
                  <div className="text-xs text-gray-600 mt-1">Find shared character sequences</div>
                  <div className="text-xs font-mono text-green-600 mt-1">
                    Time: O(n×m), Space: O(n×m)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeCard>

      {/* Real-World Applications */}
      <ThemeCard className="mb-8">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Real-World Applications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Text Editors</h4>
              <p className="text-sm text-indigo-800">
                Find, replace, and search operations in code editors and word processors.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Search Engines</h4>
              <p className="text-sm text-green-800">
                Pattern matching and indexing for web search and database queries.
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">DNA Sequencing</h4>
              <p className="text-sm text-orange-800">
                Biological sequence alignment and pattern matching in genomics.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Data Validation</h4>
              <p className="text-sm text-blue-800">
                Email validation, password strength checking, and input sanitization.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Natural Language Processing</h4>
              <p className="text-sm text-purple-800">
                Tokenization, stemming, and text analysis for language understanding.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">File Processing</h4>
              <p className="text-sm text-yellow-800">
                Parsing CSV files, log analysis, and configuration file handling.
              </p>
            </div>
          </div>
        </div>
      </ThemeCard>
    </>
  );

  // Sidebar with navigation cards
  const sidebarContent = (
    <>
      <ThemeCard>
        <NavigationCard
          title="Sets"
          description="Unique element collections"
          colorScheme="datastructures"
          onClick={() => (window.location.href = '/datastructures?section=sets')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Deques"
          description="Double-ended queue operations"
          colorScheme="datastructures"
          onClick={() => (window.location.href = '/datastructures?section=deques')}
        />
      </ThemeCard>
      <ThemeCard>
        <NavigationCard
          title="Tree Structures"
          description="Hierarchical data organization"
          colorScheme="datastructures"
          onClick={() => (window.location.href = '/datastructures?section=Tree%20Structures')}
        />
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
        title="Ready to Explore More?"
        description="Continue your journey through data structures and algorithms"
        buttonText="View All Data Structures"
        onButtonClick={() => (window.location.href = '/datastructures?section=Introduction')}
        colorScheme="datastructures"
      />
    </>
  );
};

export default Strings;
