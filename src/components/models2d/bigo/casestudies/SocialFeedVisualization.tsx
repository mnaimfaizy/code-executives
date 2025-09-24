// src/components/models2d/bigo/casestudies/SocialFeedVisualization.tsx
// Interactive visualization of social network feed ranking algorithms

import React, { useState, useEffect } from 'react';

interface SocialFeedVisualizationProps {
  isActive?: boolean;
  animationStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  timestamp: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  recency: number;
  relevance: number;
  score: number;
}

interface AlgorithmResult {
  name: string;
  posts: Post[];
  timeComplexity: string;
  description: string;
}

const SocialFeedVisualization: React.FC<SocialFeedVisualizationProps> = ({ className = '' }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [algorithmResults, setAlgorithmResults] = useState<AlgorithmResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  // Generate sample posts
  useEffect(() => {
    const samplePosts: Post[] = [
      {
        id: 1,
        author: 'Alice',
        content: 'Beautiful sunset!',
        timestamp: Date.now() - 1000 * 60 * 5,
        likes: 45,
        comments: 12,
        shares: 3,
        engagement: 0,
        recency: 0,
        relevance: 0,
        score: 0,
      },
      {
        id: 2,
        author: 'Bob',
        content: 'New recipe try!',
        timestamp: Date.now() - 1000 * 60 * 15,
        likes: 23,
        comments: 8,
        shares: 1,
        engagement: 0,
        recency: 0,
        relevance: 0,
        score: 0,
      },
      {
        id: 3,
        author: 'Charlie',
        content: 'Tech conference',
        timestamp: Date.now() - 1000 * 60 * 30,
        likes: 67,
        comments: 25,
        shares: 8,
        engagement: 0,
        recency: 0,
        relevance: 0,
        score: 0,
      },
      {
        id: 4,
        author: 'Diana',
        content: 'Weekend plans?',
        timestamp: Date.now() - 1000 * 60 * 60,
        likes: 12,
        comments: 5,
        shares: 0,
        engagement: 0,
        recency: 0,
        relevance: 0,
        score: 0,
      },
      {
        id: 5,
        author: 'Eve',
        content: 'Amazing art piece',
        timestamp: Date.now() - 1000 * 60 * 120,
        likes: 89,
        comments: 34,
        shares: 15,
        engagement: 0,
        recency: 0,
        relevance: 0,
        score: 0,
      },
      {
        id: 6,
        author: 'Frank',
        content: 'Sports highlights',
        timestamp: Date.now() - 1000 * 60 * 180,
        likes: 156,
        comments: 67,
        shares: 23,
        engagement: 0,
        recency: 0,
        relevance: 0,
        score: 0,
      },
    ];

    // Calculate engagement, recency, and relevance scores
    const now = Date.now();
    const processedPosts = samplePosts.map((post) => {
      const hoursOld = (now - post.timestamp) / (1000 * 60 * 60);
      const recency = Math.max(0, 24 - hoursOld) / 24; // Higher score for newer posts
      const engagement = (post.likes * 1 + post.comments * 2 + post.shares * 3) / 100;
      const relevance = Math.random() * 0.5 + 0.5; // Simulated user relevance

      return {
        ...post,
        engagement,
        recency,
        relevance,
        score: 0,
      };
    });

    setPosts(processedPosts);
  }, []);

  const calculateScores = (posts: Post[], algorithm: string): Post[] => {
    return posts.map((post) => {
      let score = 0;

      switch (algorithm) {
        case 'chronological':
          // O(1) - just sort by timestamp
          score = post.timestamp;
          break;

        case 'engagement-only':
          // O(n) - calculate engagement score
          score = post.engagement;
          break;

        case 'facebook-style':
          // O(n) - complex scoring algorithm
          score = post.engagement * 0.4 + post.recency * 0.4 + post.relevance * 0.2;
          break;

        case 'twitter-trending':
          // O(n) - focus on recency and engagement
          score = post.recency * 0.6 + post.engagement * 0.4;
          break;

        default:
          score = post.timestamp;
      }

      return { ...post, score };
    });
  };

  const runAlgorithms = async () => {
    setIsRunning(true);
    const algorithms = [
      {
        name: 'Chronological',
        key: 'chronological',
        complexity: 'O(1)',
        desc: 'Simple time-based ordering',
      },
      {
        name: 'Engagement Only',
        key: 'engagement-only',
        complexity: 'O(n)',
        desc: 'Rank by likes, comments, shares',
      },
      {
        name: 'Facebook Style',
        key: 'facebook-style',
        complexity: 'O(n)',
        desc: 'Balance engagement, recency, relevance',
      },
      {
        name: 'Twitter Trending',
        key: 'twitter-trending',
        complexity: 'O(n)',
        desc: 'Prioritize recent, engaging content',
      },
    ];

    const results: AlgorithmResult[] = [];

    for (const algorithm of algorithms) {
      const scoredPosts = calculateScores(posts, algorithm.key);
      const sortedPosts = [...scoredPosts].sort((a, b) => b.score - a.score);

      results.push({
        name: algorithm.name,
        posts: sortedPosts.slice(0, 4), // Top 4 posts
        timeComplexity: algorithm.complexity,
        description: algorithm.desc,
      });

      setAlgorithmResults([...results]);
      await new Promise((resolve) => setTimeout(resolve, 800)); // Animation delay
    }

    setIsRunning(false);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'O(1)':
        return '#10b981';
      case 'O(n)':
        return '#3b82f6';
      case 'O(n log n)':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      className={`relative w-full h-96 bg-white rounded-lg border-2 border-gray-200 p-4 ${className}`}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Social Network Feed Algorithms</h3>
        <p className="text-sm text-gray-600">
          How ranking algorithms determine what you see in your feed
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center mb-4">
        <button
          onClick={runAlgorithms}
          disabled={isRunning}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isRunning ? 'Calculating Rankings...' : 'Run Feed Algorithms'}
        </button>
      </div>

      {/* Algorithm Results */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {algorithmResults.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedAlgorithm === result.name
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedAlgorithm(result.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800 text-sm">{result.name}</h4>
              <span
                className="px-2 py-1 rounded text-xs font-mono"
                style={{
                  backgroundColor: getComplexityColor(result.timeComplexity) + '20',
                  color: getComplexityColor(result.timeComplexity),
                }}
              >
                {result.timeComplexity}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{result.description}</p>
            <div className="space-y-1">
              {result.posts.slice(0, 3).map((post, postIndex) => (
                <div key={post.id} className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-500 w-4">{postIndex + 1}.</span>
                  <span className="text-xs text-gray-700 truncate">{post.content}</span>
                  <span className="text-xs text-gray-500">({post.likes}👍)</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedAlgorithm && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">{selectedAlgorithm} - Top Posts:</h4>
          <div className="bg-gray-50 rounded p-3">
            {algorithmResults
              .find((r) => r.name === selectedAlgorithm)
              ?.posts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between py-1 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-600 w-6">{index + 1}.</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{post.content}</div>
                      <div className="text-xs text-gray-500">by {post.author}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-right">
                    <div>
                      👍 {post.likes} 💬 {post.comments} 🔄 {post.shares}
                    </div>
                    <div className="font-mono">Score: {post.score.toFixed(3)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <strong className="text-green-600">O(1) Chronological:</strong> Simple and fast, but may
          show stale content. Used by some forums.
        </div>
        <div>
          <strong className="text-blue-600">O(n) Engagement:</strong> Shows popular content, but may
          bury recent important posts. Used by Reddit-style sites.
        </div>
      </div>

      {/* Real-World Impact */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <div className="text-xs text-purple-800">
          <strong>Real-World Impact:</strong> Facebook processes 100+ billion feed ranking decisions
          daily. A 10ms improvement in ranking algorithm = 1 million CPU hours saved per day!
        </div>
      </div>
    </div>
  );
};

export default SocialFeedVisualization;
