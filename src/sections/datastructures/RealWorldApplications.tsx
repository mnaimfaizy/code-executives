import React, { useState } from 'react';
import { 
  Globe, 
  Smartphone, 
  Database, 
  Brain, 
  Gamepad2, 
  ShoppingCart, 
  MapPin, 
  Users, 
  Code,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Zap
} from 'lucide-react';

interface UseCase {
  id: string;
  title: string;
  description: string;
  industry: string;
  dataStructure: string;
  reasoning: string;
  example: string;
  complexity: string;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
}

interface RecommendationInput {
  dataSize: 'small' | 'medium' | 'large';
  operations: string[];
  performance: 'fast-read' | 'fast-write' | 'balanced';
  memory: 'low' | 'medium' | 'high';
}

const RealWorldApplications: React.FC = () => {
  const [selectedUseCase, setSelectedUseCase] = useState<string>('social-media');
  const [activeTab, setActiveTab] = useState<'showcase' | 'benchmarks' | 'recommender'>('showcase');
  const [recommendation, setRecommendation] = useState<RecommendationInput>({
    dataSize: 'medium',
    operations: ['search'],
    performance: 'balanced',
    memory: 'medium'
  });

  // Real-world use cases
  const useCases: UseCase[] = [
    {
      id: 'social-media',
      title: 'Social Media Platform',
      description: 'Managing user connections, feeds, and content discovery',
      industry: 'Social Networks',
      dataStructure: 'Graph + Hash Table',
      reasoning: 'Graphs model user relationships, hash tables provide fast user lookups',
      example: 'Facebook friend recommendations, Twitter follower network',
      complexity: 'O(1) user lookup, O(V + E) for network traversal',
      benefits: ['Fast user searches', 'Efficient friend discovery', 'Scalable relationship mapping'],
      icon: <Users className="w-6 h-6" />,
      color: '#3B82F6'
    },
    {
      id: 'gps-navigation',
      title: 'GPS Navigation System',
      description: 'Finding optimal routes between locations',
      industry: 'Transportation',
      dataStructure: 'Weighted Graph + Priority Queue',
      reasoning: 'Roads as edges with distances/time, Dijkstra\'s for shortest paths',
      example: 'Google Maps, Waze route calculation',
      complexity: 'O((V + E) log V) for shortest path calculation',
      benefits: ['Optimal route finding', 'Real-time traffic adaptation', 'Multiple route options'],
      icon: <MapPin className="w-6 h-6" />,
      color: '#10B981'
    },
    {
      id: 'search-engine',
      title: 'Search Engine Indexing',
      description: 'Organizing and retrieving web content efficiently',
      industry: 'Technology',
      dataStructure: 'Trie + Inverted Index',
      reasoning: 'Tries for autocomplete, inverted index for document retrieval',
      example: 'Google search suggestions and results',
      complexity: 'O(m) for prefix search, O(k) for document lookup',
      benefits: ['Fast autocomplete', 'Relevant result ranking', 'Typo tolerance'],
      icon: <Globe className="w-6 h-6" />,
      color: '#8B5CF6'
    },
    {
      id: 'ecommerce',
      title: 'E-commerce Platform',
      description: 'Managing product catalogs, shopping carts, and recommendations',
      industry: 'Retail',
      dataStructure: 'B+ Tree + Hash Table + MinHeap',
      reasoning: 'B+ trees for product catalog, hash tables for cart, heaps for pricing',
      example: 'Amazon product search, shopping cart, price tracking',
      complexity: 'O(log n) product search, O(1) cart operations',
      benefits: ['Fast product search', 'Efficient inventory', 'Dynamic pricing'],
      icon: <ShoppingCart className="w-6 h-6" />,
      color: '#F59E0B'
    },
    {
      id: 'gaming',
      title: 'Game Development',
      description: 'Real-time collision detection and pathfinding',
      industry: 'Gaming',
      dataStructure: 'Quadtree + A* Algorithm',
      reasoning: 'Spatial partitioning for collisions, A* for NPC movement',
      example: 'StarCraft unit movement, collision detection in FPS games',
      complexity: 'O(log n) collision detection, O(b^d) pathfinding',
      benefits: ['Real-time performance', 'Smooth gameplay', 'Intelligent AI'],
      icon: <Gamepad2 className="w-6 h-6" />,
      color: '#EF4444'
    },
    {
      id: 'database',
      title: 'Database Management',
      description: 'Efficient data storage and retrieval systems',
      industry: 'Enterprise',
      dataStructure: 'B+ Tree + Hash Index',
      reasoning: 'B+ trees for range queries, hash indexes for exact matches',
      example: 'MySQL index structures, PostgreSQL query optimization',
      complexity: 'O(log n) for range queries, O(1) for key lookups',
      benefits: ['Fast query execution', 'Efficient storage', 'ACID compliance'],
      icon: <Database className="w-6 h-6" />,
      color: '#06B6D4'
    },
    {
      id: 'ai-ml',
      title: 'Machine Learning',
      description: 'Data preprocessing and model optimization',
      industry: 'Artificial Intelligence',
      dataStructure: 'Decision Tree + Priority Queue',
      reasoning: 'Trees for decision models, heaps for feature selection',
      example: 'Random Forest algorithms, neural network optimization',
      complexity: 'O(log n) for tree traversal, O(log n) for priority operations',
      benefits: ['Model interpretability', 'Feature importance', 'Efficient training'],
      icon: <Brain className="w-6 h-6" />,
      color: '#84CC16'
    },
    {
      id: 'mobile-app',
      title: 'Mobile Applications',
      description: 'Memory-efficient data management on devices',
      industry: 'Mobile Development',
      dataStructure: 'LRU Cache + Compressed Trie',
      reasoning: 'LRU for memory management, tries for efficient text storage',
      example: 'Instagram image caching, WhatsApp message storage',
      complexity: 'O(1) cache operations, O(m) for text operations',
      benefits: ['Memory efficiency', 'Fast app performance', 'Offline capability'],
      icon: <Smartphone className="w-6 h-6" />,
      color: '#EC4899'
    }
  ];

  // Data structure recommendation engine
  const getRecommendation = (input: RecommendationInput): string => {
    const { dataSize, operations, performance, memory } = input;
    
    // Simple recommendation logic
    if (operations.includes('search') && performance === 'fast-read') {
      if (dataSize === 'large') return 'Hash Table or B+ Tree';
      return 'Hash Table';
    }
    
    if (operations.includes('range-query')) {
      return 'B+ Tree or Binary Search Tree';
    }
    
    if (operations.includes('priority')) {
      return 'Binary Heap or Priority Queue';
    }
    
    if (operations.includes('relationships')) {
      return 'Graph (Adjacency List)';
    }
    
    if (operations.includes('sequence') && performance === 'fast-write') {
      return 'Linked List or Dynamic Array';
    }
    
    if (memory === 'low' && dataSize === 'small') {
      return 'Array';
    }
    
    return 'Hash Table (balanced performance)';
  };

  const selectedCase = useCases.find(uc => uc.id === selectedUseCase) || useCases[0];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
          <Code className="w-8 h-8" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Real-World Applications
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Discover how data structures power the applications you use every day.
          From social media to GPS navigation, see the practical impact of choosing the right structure.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'showcase'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Industry Showcase
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'benchmarks'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Performance Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('recommender')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'recommender'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Recommendation Engine
          </button>
        </div>
      </div>

      {/* Industry Showcase Tab */}
      {activeTab === 'showcase' && (
        <div className="space-y-8">
          {/* Use Case Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setSelectedUseCase(useCase.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedUseCase === useCase.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${useCase.color}20` }}
                  >
                    <div style={{ color: useCase.color }}>
                      {useCase.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {useCase.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {useCase.industry}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Use Case Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${selectedCase.color}20` }}
                  >
                    <div style={{ color: selectedCase.color }}>
                      {selectedCase.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCase.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCase.industry}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedCase.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Data Structure Choice
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {selectedCase.dataStructure}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedCase.reasoning}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Real Examples
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    {selectedCase.example}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Performance Analysis
                  </h3>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400">
                      {selectedCase.complexity}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Key Benefits
                  </h3>
                  <div className="space-y-2">
                    {selectedCase.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Industry Impact
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This application pattern processes millions of operations daily,
                    demonstrating the critical importance of efficient data structure selection
                    in production systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-600" />
              Performance Benchmarks
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Small Dataset */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Small Dataset (1K items)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Array Access</span>
                    <span className="font-mono text-green-600 dark:text-green-400">~1ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hash Lookup</span>
                    <span className="font-mono text-green-600 dark:text-green-400">~5ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">BST Search</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">~10ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Linear Search</span>
                    <span className="font-mono text-orange-600 dark:text-orange-400">~500ns</span>
                  </div>
                </div>
              </div>

              {/* Medium Dataset */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Medium Dataset (1M items)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Array Access</span>
                    <span className="font-mono text-green-600 dark:text-green-400">~1ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hash Lookup</span>
                    <span className="font-mono text-green-600 dark:text-green-400">~5ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">BST Search</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">~20ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Linear Search</span>
                    <span className="font-mono text-red-600 dark:text-red-400">~500μs</span>
                  </div>
                </div>
              </div>

              {/* Large Dataset */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Large Dataset (1B items)
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Array Access</span>
                    <span className="font-mono text-green-600 dark:text-green-400">~1ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hash Lookup</span>
                    <span className="font-mono text-green-600 dark:text-green-400">~5ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">BST Search</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">~30ns</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Linear Search</span>
                    <span className="font-mono text-red-600 dark:text-red-400">~500ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Key Insights from Benchmarks:
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Hash tables maintain O(1) performance regardless of dataset size</li>
                <li>• Binary search trees scale logarithmically - ideal for sorted data</li>
                <li>• Array access is unbeatable for indexed operations</li>
                <li>• Linear search becomes impractical for large datasets</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Engine Tab */}
      {activeTab === 'recommender' && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-purple-600" />
              Data Structure Recommendation Engine
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Data Size:
                  </label>
                  <select
                    value={recommendation.dataSize}
                    onChange={(e) => setRecommendation(prev => ({ 
                      ...prev, 
                      dataSize: e.target.value as 'small' | 'medium' | 'large' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="small">Small (&lt; 1K items)</option>
                    <option value="medium">Medium (1K - 1M items)</option>
                    <option value="large">Large (&gt; 1M items)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Operations (select multiple):
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'search', label: 'Fast Search/Lookup' },
                      { id: 'sequence', label: 'Sequential Access' },
                      { id: 'range-query', label: 'Range Queries' },
                      { id: 'priority', label: 'Priority Operations' },
                      { id: 'relationships', label: 'Relationship Modeling' }
                    ].map((op) => (
                      <label key={op.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={recommendation.operations.includes(op.id)}
                          onChange={(e) => {
                            const ops = e.target.checked
                              ? [...recommendation.operations, op.id]
                              : recommendation.operations.filter(o => o !== op.id);
                            setRecommendation(prev => ({ ...prev, operations: ops }));
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {op.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Performance Priority:
                  </label>
                  <select
                    value={recommendation.performance}
                    onChange={(e) => setRecommendation(prev => ({ 
                      ...prev, 
                      performance: e.target.value as 'fast-read' | 'fast-write' | 'balanced' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="fast-read">Fast Read Operations</option>
                    <option value="fast-write">Fast Write Operations</option>
                    <option value="balanced">Balanced Performance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Memory Constraints:
                  </label>
                  <select
                    value={recommendation.memory}
                    onChange={(e) => setRecommendation(prev => ({ 
                      ...prev, 
                      memory: e.target.value as 'low' | 'medium' | 'high' 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low Memory Available</option>
                    <option value="medium">Medium Memory Available</option>
                    <option value="high">High Memory Available</option>
                  </select>
                </div>
              </div>

              {/* Recommendation Results */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Recommended Data Structure
                  </h3>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {getRecommendation(recommendation)}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-purple-800 dark:text-purple-200">
                    <div>
                      <strong>Based on your requirements:</strong>
                    </div>
                    <ul className="space-y-1 ml-4">
                      <li>• Data size: {recommendation.dataSize}</li>
                      <li>• Operations: {recommendation.operations.join(', ') || 'none selected'}</li>
                      <li>• Performance: {recommendation.performance.replace('-', ' ')}</li>
                      <li>• Memory: {recommendation.memory} constraints</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Alternative Considerations:
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div>• For read-heavy workloads, consider caching strategies</div>
                    <div>• For write-heavy workloads, consider append-only structures</div>
                    <div>• For concurrent access, consider thread-safe variants</div>
                    <div>• For persistence, consider database-backed solutions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealWorldApplications;