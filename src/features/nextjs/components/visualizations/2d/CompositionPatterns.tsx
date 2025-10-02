import React, { useState } from 'react';
import type { BaseNextJSVisualizationProps } from '../../../../../types/nextjs';

interface CompositionPattern {
  id: string;
  name: string;
  description: string;
  serverCode: string;
  clientCode: string;
  visualDiagram: React.ReactNode;
  benefits: string[];
  useCases: string[];
  category: 'basic' | 'advanced' | 'anti-pattern';
}

interface CompositionPatternsProps extends BaseNextJSVisualizationProps {
  patterns?: CompositionPattern[];
  selectedCategory?: 'all' | 'basic' | 'advanced' | 'anti-pattern';
}

const CompositionPatterns: React.FC<CompositionPatternsProps> = ({
  patterns: initialPatterns,
  selectedCategory = 'all',
  className = '',
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    'all' | 'basic' | 'advanced' | 'anti-pattern'
  >(selectedCategory);

  // Generate default composition patterns
  const generateDefaultPatterns = (): CompositionPattern[] => [
    {
      id: 'server-calling-client',
      name: 'Server Component → Client Component',
      description: 'Server components can render client components as children',
      category: 'basic',
      serverCode: `// Server Component
export default function Page() {
  return (
    <div>
      <h1>Server Content</h1>
      <ClientCounter /> {/* ✅ Works */}
    </div>
  );
}`,
      clientCode: `// Client Component
'use client';

export function ClientCounter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
      visualDiagram: (
        <svg viewBox="0 0 300 150" className="w-full h-32">
          <rect x="50" y="50" width="80" height="40" fill="#10b981" rx="8" />
          <text x="90" y="72" textAnchor="middle" fontSize="12" fill="white">
            Server
          </text>
          <rect x="170" y="50" width="80" height="40" fill="#3b82f6" rx="8" />
          <text x="210" y="72" textAnchor="middle" fontSize="12" fill="white">
            Client
          </text>
          <path d="M130 70 L170 70" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
      ),
      benefits: [
        'Server components handle static content',
        'Client components add interactivity',
        'Optimal performance split',
      ],
      useCases: [
        'Page layouts with interactive elements',
        'Data display with user controls',
        'Static content with dynamic features',
      ],
    },
    {
      id: 'client-calling-server',
      name: 'Client Component → Server Component',
      description: 'Client components cannot directly render server components',
      category: 'anti-pattern',
      serverCode: `// Server Component
export function ServerList({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}`,
      clientCode: `// Client Component - ANTI-PATTERN
'use client';

export function ClientPage() {
  return (
    <div>
      <ServerList items={['a', 'b', 'c']} />
      {/* ❌ This won't work */}
    </div>
  );
}`,
      visualDiagram: (
        <svg viewBox="0 0 300 150" className="w-full h-32">
          <rect x="50" y="50" width="80" height="40" fill="#3b82f6" rx="8" />
          <text x="90" y="72" textAnchor="middle" fontSize="12" fill="white">
            Client
          </text>
          <rect x="170" y="50" width="80" height="40" fill="#10b981" rx="8" />
          <text x="210" y="72" textAnchor="middle" fontSize="12" fill="white">
            Server
          </text>
          <path d="M130 70 L170 70" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
          <text x="150" y="85" textAnchor="middle" fontSize="10" fill="#ef4444">
            ❌ Invalid
          </text>
          <defs>
            <marker
              id="arrow-red"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
            </marker>
          </defs>
        </svg>
      ),
      benefits: [],
      useCases: [],
    },
    {
      id: 'server-composition',
      name: 'Server Component Composition',
      description: 'Server components can compose other server components',
      category: 'basic',
      serverCode: `// Layout Server Component
export function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

// Page Server Component
export default function Page() {
  return (
    <Layout>
      <Content />
    </Layout>
  );
}`,
      clientCode: '',
      visualDiagram: (
        <svg viewBox="0 0 300 200" className="w-full h-40">
          <rect x="100" y="20" width="100" height="30" fill="#10b981" rx="8" />
          <text x="150" y="38" textAnchor="middle" fontSize="10" fill="white">
            Layout
          </text>
          <rect x="50" y="80" width="80" height="25" fill="#10b981" rx="6" />
          <text x="90" y="95" textAnchor="middle" fontSize="9" fill="white">
            Header
          </text>
          <rect x="170" y="80" width="80" height="25" fill="#10b981" rx="6" />
          <text x="210" y="95" textAnchor="middle" fontSize="9" fill="white">
            Footer
          </text>
          <rect x="100" y="130" width="100" height="25" fill="#10b981" rx="6" />
          <text x="150" y="145" textAnchor="middle" fontSize="9" fill="white">
            Content
          </text>
          <path d="M150 50 L150 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M150 50 L130 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M150 50 L170 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M150 105 L150 130" stroke="#6b7280" strokeWidth="1" />
        </svg>
      ),
      benefits: ['All rendering on server', 'Maximum performance', 'No hydration overhead'],
      useCases: ['Static page layouts', 'Data-heavy pages', 'SEO-critical content'],
    },
    {
      id: 'client-composition',
      name: 'Client Component Composition',
      description: 'Client components can compose other client components',
      category: 'basic',
      serverCode: '',
      clientCode: `'use client';

// Parent Client Component
export function Dashboard() {
  return (
    <div>
      <StatsChart />
      <DataTable />
      <InteractiveForm />
    </div>
  );
}

// Child Client Components
function StatsChart() {
  const [data, setData] = useState([]);
  // Interactive chart logic
}

function DataTable() {
  const [sortBy, setSortBy] = useState('name');
  // Table sorting logic
}`,
      visualDiagram: (
        <svg viewBox="0 0 300 200" className="w-full h-40">
          <rect x="100" y="20" width="100" height="30" fill="#3b82f6" rx="8" />
          <text x="150" y="38" textAnchor="middle" fontSize="10" fill="white">
            Dashboard
          </text>
          <rect x="40" y="80" width="80" height="25" fill="#3b82f6" rx="6" />
          <text x="80" y="95" textAnchor="middle" fontSize="9" fill="white">
            Chart
          </text>
          <rect x="140" y="80" width="80" height="25" fill="#3b82f6" rx="6" />
          <text x="180" y="95" textAnchor="middle" fontSize="9" fill="white">
            Table
          </text>
          <rect x="100" y="130" width="100" height="25" fill="#3b82f6" rx="6" />
          <text x="150" y="145" textAnchor="middle" fontSize="9" fill="white">
            Form
          </text>
          <path d="M150 50 L150 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M150 50 L110 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M150 50 L190 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M150 105 L150 130" stroke="#6b7280" strokeWidth="1" />
        </svg>
      ),
      benefits: [
        'Full client-side interactivity',
        'Rich user experiences',
        'State management between components',
      ],
      useCases: ['Interactive dashboards', 'Complex forms', 'Real-time applications'],
    },
    {
      id: 'mixed-composition',
      name: 'Mixed Composition Pattern',
      description: 'Server components with selective client component islands',
      category: 'advanced',
      serverCode: `// Server Component with Client Islands
export default function ArticlePage({ article }) {
  return (
    <div>
      {/* Server-rendered content */}
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* Client component islands */}
      <LikeButton articleId={article.id} />
      <CommentSection articleId={article.id} />
      <ShareButtons url={article.url} />
    </div>
  );
}`,
      clientCode: `'use client';

function LikeButton({ articleId }) {
  const [likes, setLikes] = useState(0);
  // Like functionality
}

function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  // Comment functionality
}`,
      visualDiagram: (
        <svg viewBox="0 0 400 200" className="w-full h-40">
          <rect x="150" y="20" width="100" height="30" fill="#10b981" rx="8" />
          <text x="200" y="38" textAnchor="middle" fontSize="10" fill="white">
            Article
          </text>
          <rect x="50" y="80" width="80" height="25" fill="#3b82f6" rx="6" />
          <text x="90" y="95" textAnchor="middle" fontSize="9" fill="white">
            Like
          </text>
          <rect x="160" y="80" width="80" height="25" fill="#3b82f6" rx="6" />
          <text x="200" y="95" textAnchor="middle" fontSize="9" fill="white">
            Comments
          </text>
          <rect x="270" y="80" width="80" height="25" fill="#3b82f6" rx="6" />
          <text x="310" y="95" textAnchor="middle" fontSize="9" fill="white">
            Share
          </text>
          <rect x="150" y="130" width="100" height="25" fill="#10b981" rx="6" />
          <text x="200" y="145" textAnchor="middle" fontSize="9" fill="white">
            Content
          </text>
          <path d="M200 50 L200 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M200 50 L130 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M200 50 L270 80" stroke="#6b7280" strokeWidth="1" />
          <path d="M200 105 L200 130" stroke="#6b7280" strokeWidth="1" />
        </svg>
      ),
      benefits: ['Optimal performance balance', 'Selective hydration', 'Best of both worlds'],
      useCases: [
        'Content-heavy pages with interactions',
        'E-commerce product pages',
        'Social media feeds',
      ],
    },
    {
      id: 'props-drilling',
      name: 'Props Passing Through Boundaries',
      description: 'Passing data from server to client components',
      category: 'advanced',
      serverCode: `// Server Component
export default function Page() {
  const user = await getUser();
  const posts = await getPosts();

  return (
    <ClientDashboard
      user={user}        // ✅ Serializable data
      posts={posts}      // ✅ Serializable data
      onPostUpdate={...} // ❌ Functions not allowed
    />
  );
}`,
      clientCode: `'use client';

export function ClientDashboard({ user, posts }) {
  const [localPosts, setLocalPosts] = useState(posts);

  // Client-side interactions
  const handleUpdate = (postId, updates) => {
    setLocalPosts(prev =>
      prev.map(p => p.id === postId ? { ...p, ...updates } : p)
    );
  };

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={localPosts} onUpdate={handleUpdate} />
    </div>
  );
}`,
      visualDiagram: (
        <svg viewBox="0 0 300 180" className="w-full h-36">
          <rect x="50" y="30" width="80" height="30" fill="#10b981" rx="8" />
          <text x="90" y="48" textAnchor="middle" fontSize="10" fill="white">
            Server
          </text>
          <rect x="170" y="30" width="80" height="30" fill="#3b82f6" rx="8" />
          <text x="210" y="48" textAnchor="middle" fontSize="10" fill="white">
            Client
          </text>
          <path d="M130 45 L170 45" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x="150" y="35" textAnchor="middle" fontSize="8" fill="#6b7280">
            props
          </text>
          <rect x="100" y="100" width="100" height="25" fill="#3b82f6" rx="6" />
          <text x="150" y="115" textAnchor="middle" fontSize="9" fill="white">
            Child Client
          </text>
          <path d="M210 60 L210 100" stroke="#6b7280" strokeWidth="1" />
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
            </marker>
          </defs>
        </svg>
      ),
      benefits: [
        'Server data available to client',
        'Type-safe prop passing',
        'Serializable data transfer',
      ],
      useCases: [
        'User-specific client interactions',
        'Pre-loaded data with client features',
        'Server state initialization',
      ],
    },
  ];

  const patterns = initialPatterns || generateDefaultPatterns();
  const filteredPatterns = patterns.filter(
    (pattern) => filterCategory === 'all' || pattern.category === filterCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'anti-pattern':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Server & Client Component Composition Patterns
        </h3>
        <p className="text-gray-600">
          Learn how to effectively combine server and client components
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {(['all', 'basic', 'advanced', 'anti-pattern'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {category === 'all'
              ? 'All Patterns'
              : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Patterns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatterns.map((pattern) => (
          <div
            key={pattern.id}
            className={`bg-white border rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPattern === pattern.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
          >
            {/* Pattern Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{pattern.name}</h4>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(pattern.category)}`}
              >
                {pattern.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">{pattern.description}</p>

            {/* Visual Diagram */}
            <div className="mb-4 flex justify-center">{pattern.visualDiagram}</div>

            {/* Benefits */}
            {pattern.benefits.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {pattern.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Use Cases */}
            {pattern.useCases.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Use Cases:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {pattern.useCases.map((useCase, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Expand/Collapse Indicator */}
            <div className="text-center">
              <span className="text-sm text-gray-500">
                {selectedPattern === pattern.id ? 'Click to collapse' : 'Click for code examples'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedPattern && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {(() => {
            const pattern = patterns.find((p) => p.id === selectedPattern);
            if (!pattern) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-semibold text-gray-900">{pattern.name}</h4>
                  <button
                    onClick={() => setSelectedPattern(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Code Examples */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Server Code */}
                  {pattern.serverCode && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>Server Component</span>
                      </h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                          {pattern.serverCode}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Client Code */}
                  {pattern.clientCode && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span>Client Component</span>
                      </h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                          {pattern.clientCode}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pattern Rules */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Composition Rules:</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    {pattern.category === 'anti-pattern' ? (
                      <div>
                        <p className="font-medium">
                          ❌ This pattern is not allowed in Next.js App Router
                        </p>
                        <p>Client components cannot render server components directly.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">✅ Valid composition pattern</p>
                        <p>
                          Follow this pattern to combine server and client components effectively.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {patterns.filter((p) => p.category === 'basic').length}
          </div>
          <div className="text-sm text-gray-600">Basic Patterns</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {patterns.filter((p) => p.category === 'advanced').length}
          </div>
          <div className="text-sm text-gray-600">Advanced Patterns</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {patterns.filter((p) => p.category === 'anti-pattern').length}
          </div>
          <div className="text-sm text-gray-600">Anti-Patterns</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{patterns.length}</div>
          <div className="text-sm text-gray-600">Total Patterns</div>
        </div>
      </div>
    </div>
  );
};

export default CompositionPatterns;
