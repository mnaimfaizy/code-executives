// src/components/models2d/bigo/casestudies/SearchEngineVisualization.tsx
// Interactive visualization of search engine indexing and query algorithms

import React, { useState, useEffect } from 'react';

interface SearchEngineVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Document {
  id: number;
  title: string;
  content: string;
  words: string[];
}

interface DocumentWithRelevance extends Document {
  relevance?: number;
}

interface DocumentWithScore extends Document {
  score?: number;
}

interface SearchResult {
  algorithm: string;
  time: number;
  results: Document[];
  description: string;
}

const SearchEngineVisualization: React.FC<SearchEngineVisualizationProps> = ({
  className = '',
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('algorithm');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  // Initialize sample documents
  useEffect(() => {
    const sampleDocs: Document[] = [
      {
        id: 1,
        title: 'Introduction to Algorithms',
        content:
          'This book covers fundamental algorithms including sorting, searching, and graph algorithms.',
        words: [
          'introduction',
          'algorithms',
          'book',
          'covers',
          'fundamental',
          'sorting',
          'searching',
          'graph',
          'algorithms',
        ],
      },
      {
        id: 2,
        title: 'Data Structures Guide',
        content:
          'Learn about arrays, linked lists, trees, and hash tables with practical examples.',
        words: [
          'data',
          'structures',
          'guide',
          'learn',
          'arrays',
          'linked',
          'lists',
          'trees',
          'hash',
          'tables',
          'practical',
          'examples',
        ],
      },
      {
        id: 3,
        title: 'Big O Notation Explained',
        content:
          'Understanding time and space complexity with Big O notation and practical analysis.',
        words: [
          'big',
          'notation',
          'explained',
          'understanding',
          'time',
          'space',
          'complexity',
          'practical',
          'analysis',
        ],
      },
      {
        id: 4,
        title: 'Database Optimization',
        content:
          'Advanced techniques for database indexing, query optimization, and performance tuning.',
        words: [
          'database',
          'optimization',
          'advanced',
          'techniques',
          'indexing',
          'query',
          'optimization',
          'performance',
          'tuning',
        ],
      },
      {
        id: 5,
        title: 'Machine Learning Basics',
        content:
          'Introduction to machine learning algorithms, neural networks, and deep learning concepts.',
        words: [
          'machine',
          'learning',
          'basics',
          'introduction',
          'algorithms',
          'neural',
          'networks',
          'deep',
          'learning',
          'concepts',
        ],
      },
    ];

    setDocuments(sampleDocs);
  }, []);

  const simulateSearch = (algorithm: string, query: string, docs: Document[]): SearchResult => {
    const queryWords = query
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 0);

    switch (algorithm) {
      case 'linear-scan': {
        // O(n*m) - scan each document for each query word
        let linearTime = 0;
        const linearResults: DocumentWithRelevance[] = [];

        for (const doc of docs) {
          linearTime += 10; // Base time per document
          let matches = 0;

          for (const queryWord of queryWords) {
            linearTime += 5; // Time to search for each word
            if (doc.words.some((word) => word.includes(queryWord))) {
              matches++;
            }
          }

          if (matches > 0) {
            linearResults.push({ ...doc, relevance: matches });
          }
        }

        return {
          algorithm: 'Linear Scan',
          time: linearTime,
          results: linearResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0)),
          description: 'Scans every document for every query term',
        };
      }

      case 'inverted-index': {
        // O(k) - lookup in inverted index (k = number of query terms)
        let indexTime = 0;
        const invertedIndex: { [word: string]: number[] } = {};

        // Build inverted index (preprocessing)
        for (const doc of docs) {
          for (const word of doc.words) {
            if (!invertedIndex[word]) {
              invertedIndex[word] = [];
            }
            if (!invertedIndex[word].includes(doc.id)) {
              invertedIndex[word].push(doc.id);
            }
          }
        }

        // Search using inverted index
        const resultSets: Set<number>[] = [];
        for (const queryWord of queryWords) {
          indexTime += 2; // Fast lookup time
          const docIds = invertedIndex[queryWord] || [];
          resultSets.push(new Set(docIds));
        }

        // Intersect result sets (AND operation)
        let intersection = resultSets[0] || new Set<number>();
        for (let i = 1; i < resultSets.length; i++) {
          indexTime += 5; // Intersection time
          intersection = new Set([...intersection].filter((x) => resultSets[i].has(x)));
        }

        const indexResults = docs.filter((doc) => intersection.has(doc.id));

        return {
          algorithm: 'Inverted Index',
          time: indexTime,
          results: indexResults,
          description: 'Pre-built index allows instant term lookup',
        };
      }

      case 'bm25-ranking': {
        // O(n*k) - BM25 scoring for all matching documents
        let bm25Time = 0;
        const bm25Results: DocumentWithScore[] = [];

        for (const doc of docs) {
          bm25Time += 8; // Base processing time
          let score = 0;

          for (const queryWord of queryWords) {
            bm25Time += 3; // Scoring time per term
            const termFreq = doc.words.filter((word) => word.includes(queryWord)).length;
            const docLength = doc.words.length;
            const avgDocLength = docs.reduce((sum, d) => sum + d.words.length, 0) / docs.length;

            // Simplified BM25 scoring
            if (termFreq > 0) {
              const idf = Math.log(
                docs.length / docs.filter((d) => d.words.some((w) => w.includes(queryWord))).length
              );
              const tf =
                (termFreq * (1.2 + 1)) /
                (termFreq + 1.2 * (1 - 0.75 + 0.75 * (docLength / avgDocLength)));
              score += tf * idf;
            }
          }

          if (score > 0) {
            bm25Results.push({ ...doc, score });
          }
        }

        return {
          algorithm: 'BM25 Ranking',
          time: bm25Time,
          results: bm25Results.sort((a, b) => (b.score || 0) - (a.score || 0)),
          description: 'Advanced ranking algorithm used by search engines',
        };
      }

      default:
        return { algorithm: '', time: 0, results: [], description: '' };
    }
  };

  const runSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const algorithms = ['linear-scan', 'inverted-index', 'bm25-ranking'];
    const results: SearchResult[] = [];

    for (const algorithm of algorithms) {
      const result = simulateSearch(algorithm, searchQuery, documents);
      results.push(result);
      setSearchResults([...results]);
      await new Promise((resolve) => setTimeout(resolve, 600)); // Animation delay
    }

    setIsSearching(false);
  };

  const getBarHeight = (time: number) => {
    const maxTime = Math.max(...searchResults.map((r) => r.time));
    return maxTime > 0 ? (time / maxTime) * 150 : 0; // Max height of 150px
  };

  const getTimeColor = (time: number) => {
    const maxTime = Math.max(...searchResults.map((r) => r.time));
    const ratio = time / maxTime;
    if (ratio < 0.33) return '#10b981'; // green
    if (ratio < 0.66) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Search Engine Algorithms</h3>
        <p className="text-sm text-gray-600">
          From O(n²) brute force to O(k) inverted index lookups
        </p>
      </div>

      {/* Search Controls */}
      <div className="flex justify-center items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Query:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm w-32"
            placeholder="algorithm"
            disabled={isSearching}
          />
        </div>
        <button
          onClick={runSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Performance Comparison */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Search Performance:</div>
        <div className="flex items-end justify-center space-x-6 h-32">
          {searchResults.map((result, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-16 bg-gradient-to-t rounded-t cursor-pointer transition-all hover:opacity-80"
                style={{
                  height: `${getBarHeight(result.time)}px`,
                  backgroundColor:
                    getBarHeight(result.time) > 0 ? getTimeColor(result.time) : '#e5e7eb',
                }}
                onClick={() => setSelectedAlgorithm(result.algorithm)}
                title={`${result.algorithm}: ${result.time}ms, ${result.results.length} results`}
              />
              <div className="text-xs text-gray-600 mt-2 text-center max-w-20 truncate">
                {result.algorithm}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {selectedAlgorithm && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">{selectedAlgorithm} Results:</h4>
          <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
            {searchResults
              .find((r) => r.algorithm === selectedAlgorithm)
              ?.results.map((doc, index) => (
                <div key={doc.id} className="mb-2 pb-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-gray-600 text-sm w-4">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{doc.title}</div>
                      <div className="text-xs text-gray-600 line-clamp-2">{doc.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            {searchResults.find((r) => r.algorithm === selectedAlgorithm)?.results.length === 0 && (
              <div className="text-sm text-gray-500 italic">No results found</div>
            )}
          </div>
        </div>
      )}

      {/* Algorithm Explanations */}
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-4">
        <div>
          <strong className="text-red-600">Linear Scan:</strong> Simple but slow for large datasets
        </div>
        <div>
          <strong className="text-blue-600">Inverted Index:</strong> Pre-built word-to-document
          mapping
        </div>
        <div>
          <strong className="text-green-600">BM25 Ranking:</strong> Sophisticated relevance scoring
        </div>
      </div>

      {/* Real-World Impact */}
      <div className="p-3 bg-green-50 rounded-lg">
        <div className="text-xs text-green-800">
          <strong>Real-World Impact:</strong> Google processes 3.5 billion searches daily. Inverted
          indexes reduce search from hours to milliseconds - enabling the modern web!
        </div>
      </div>
    </div>
  );
};

export default SearchEngineVisualization;
