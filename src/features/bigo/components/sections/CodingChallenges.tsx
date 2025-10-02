// src/sections/bigo/CodingChallenges.tsx
// Interactive coding challenges for Big-O complexity analysis practice

import React, { useState, useEffect, useCallback, useRef } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  correctTimeComplexity: string;
  correctSpaceComplexity: string;
  explanation: string;
  hints: string[];
  category: string;
}

interface UserAnswer {
  timeComplexity: string;
  spaceComplexity: string;
  reasoning: string;
}

const CodingChallenges: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState<UserAnswer>({
    timeComplexity: '',
    spaceComplexity: '',
    reasoning: '',
  });
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(0);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'beginner'
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const challengesRef = useRef<Challenge[]>([]);

  const loadRandomChallenge = useCallback((diff: typeof difficulty) => {
    const filteredChallenges = challengesRef.current.filter((c) => c.difficulty === diff);
    if (filteredChallenges.length > 0) {
      const randomChallenge =
        filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
      setCurrentChallenge(randomChallenge);
      setUserAnswer({ timeComplexity: '', spaceComplexity: '', reasoning: '' });
      setShowResult(false);
      setHintsUsed(0);
      setCurrentHint(0);
    }
  }, []);

  // Initialize challenges
  useEffect(() => {
    const challengeData: Challenge[] = [
      {
        id: 'linear-search',
        title: 'Linear Search Analysis',
        difficulty: 'beginner',
        language: 'javascript',
        code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1;
}`,
        correctTimeComplexity: 'O(n)',
        correctSpaceComplexity: 'O(1)',
        explanation:
          'The algorithm iterates through each element once, so time complexity is O(n). It uses only constant extra space.',
        hints: [
          'Count how many times the loop runs in the worst case.',
          'The loop runs once for each element in the array.',
          'No additional data structures are created that grow with input size.',
        ],
        category: 'Searching',
      },
      {
        id: 'bubble-sort',
        title: 'Bubble Sort Analysis',
        difficulty: 'beginner',
        language: 'javascript',
        code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
        correctTimeComplexity: 'O(n²)',
        correctSpaceComplexity: 'O(1)',
        explanation:
          'Two nested loops both iterate up to n times, giving O(n²) time complexity. Only constant extra space is used.',
        hints: [
          'Count the total number of comparisons made.',
          'The outer loop runs n times, inner loop runs up to n times.',
          'This is a quadratic time algorithm.',
        ],
        category: 'Sorting',
      },
      {
        id: 'binary-search',
        title: 'Binary Search Analysis',
        difficulty: 'intermediate',
        language: 'javascript',
        code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
        correctTimeComplexity: 'O(log n)',
        correctSpaceComplexity: 'O(1)',
        explanation:
          'The search space is halved each iteration, giving O(log n) time complexity. Only constant space is used.',
        hints: [
          'How many times can you divide n by 2 until you reach 1?',
          'Each iteration reduces the search space by half.',
          'This is a logarithmic time algorithm.',
        ],
        category: 'Searching',
      },
      {
        id: 'merge-sort',
        title: 'Merge Sort Analysis',
        difficulty: 'intermediate',
        language: 'javascript',
        code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
        correctTimeComplexity: 'O(n log n)',
        correctSpaceComplexity: 'O(n)',
        explanation:
          'The array is divided log n times, and each level takes O(n) time to merge, giving O(n log n). Additional O(n) space is used for merging.',
        hints: [
          'How many levels of recursion are there?',
          'Each level of the recursion tree processes all n elements.',
          'The merge function creates a new array of size n.',
        ],
        category: 'Sorting',
      },
      {
        id: 'fibonacci-recursive',
        title: 'Recursive Fibonacci Analysis',
        difficulty: 'intermediate',
        language: 'javascript',
        code: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        correctTimeComplexity: 'O(2ⁿ)',
        correctSpaceComplexity: 'O(n)',
        explanation:
          'Each call branches into 2 more calls, creating an exponential number of operations. Space complexity is O(n) due to recursion depth.',
        hints: [
          'How many times is fibonacci called for each n?',
          'This creates a call tree where each level doubles.',
          'The recursion depth determines the space usage.',
        ],
        category: 'Recursion',
      },
      {
        id: 'two-sum-hashmap',
        title: 'Two Sum with HashMap',
        difficulty: 'intermediate',
        language: 'javascript',
        code: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        correctTimeComplexity: 'O(n)',
        correctSpaceComplexity: 'O(n)',
        explanation:
          'Single pass through the array with O(1) hash map operations gives O(n) time. The hash map stores up to n elements.',
        hints: [
          'How many times does the loop run?',
          'Hash map operations are typically O(1).',
          'What data structure is being used to store elements?',
        ],
        category: 'Hash Tables',
      },
      {
        id: 'matrix-multiplication',
        title: 'Matrix Multiplication Analysis',
        difficulty: 'advanced',
        language: 'javascript',
        code: `function multiplyMatrices(A, B) {
  const result = [];
  for (let i = 0; i < A.length; i++) {
    result[i] = [];
    for (let j = 0; j < B[0].length; j++) {
      result[i][j] = 0;
      for (let k = 0; k < A[0].length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}`,
        correctTimeComplexity: 'O(n³)',
        correctSpaceComplexity: 'O(n²)',
        explanation:
          'Three nested loops iterate over matrix dimensions, giving O(n³) time. Result matrix uses O(n²) space.',
        hints: [
          'Count the total number of multiplications performed.',
          'How many nested loops are there?',
          'What is the size of the output matrix?',
        ],
        category: 'Matrix Operations',
      },
      {
        id: 'knapsack-dp',
        title: '0/1 Knapsack Dynamic Programming',
        difficulty: 'advanced',
        language: 'javascript',
        code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][capacity];
}`,
        correctTimeComplexity: 'O(nW)',
        correctSpaceComplexity: 'O(nW)',
        explanation:
          'Two nested loops over n items and W capacity give O(nW) time and space complexity, where W is the knapsack capacity.',
        hints: [
          'What are the dimensions of the DP table?',
          'How many cells are filled in the DP table?',
          'W represents the knapsack capacity, not the number of items.',
        ],
        category: 'Dynamic Programming',
      },
    ];

    challengesRef.current = challengeData;
    setChallenges(challengeData);
  }, []);

  // Load initial challenge when challenges are set
  useEffect(() => {
    if (challenges.length > 0 && !currentChallenge) {
      const filteredChallenges = challengesRef.current.filter((c) => c.difficulty === 'beginner');
      if (filteredChallenges.length > 0) {
        const randomChallenge =
          filteredChallenges[Math.floor(Math.random() * filteredChallenges.length)];
        setCurrentChallenge(randomChallenge);
        setUserAnswer({ timeComplexity: '', spaceComplexity: '', reasoning: '' });
        setShowResult(false);
        setHintsUsed(0);
        setCurrentHint(0);
      }
    }
  }, [challenges.length, currentChallenge]);

  const checkAnswer = () => {
    if (!currentChallenge) return;

    const timeCorrect =
      userAnswer.timeComplexity.toLowerCase().replace(/\s/g, '') ===
      currentChallenge.correctTimeComplexity.toLowerCase().replace(/\s/g, '');
    const spaceCorrect =
      userAnswer.spaceComplexity.toLowerCase().replace(/\s/g, '') ===
      currentChallenge.correctSpaceComplexity.toLowerCase().replace(/\s/g, '');

    const points = (timeCorrect ? 10 : 0) + (spaceCorrect ? 10 : 0) - hintsUsed * 2;
    const newScore = Math.max(0, points);

    setScore((prev) => prev + newScore);
    if (timeCorrect && spaceCorrect) {
      setStreak((prev) => prev + 1);
      // Achievement check: Streak Warrior
      if (streak + 1 >= 10) {
        console.log('Achievement unlocked: Streak Warrior!');
      }
      // Achievement check: First Correct
      if (score === 0 && newScore > 0) {
        console.log('Achievement unlocked: First Steps!');
      }
    } else {
      setStreak(0);
    }

    setShowResult(true);
  };

  const nextChallenge = () => {
    loadRandomChallenge(difficulty);
  };

  const showHint = () => {
    if (currentChallenge && currentHint < currentChallenge.hints.length) {
      setHintsUsed((prev) => prev + 1);
      setCurrentHint((prev) => prev + 1);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Big-O Coding Challenges</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Sharpen your algorithmic thinking by analyzing code complexity. Master the art of Big-O
          analysis through interactive challenges.
        </p>
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {challenges.filter((c) => c.difficulty === difficulty).length}
            </div>
            <div className="text-sm text-gray-600">Challenges</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          { label: 'Total Challenges', value: challenges.length.toString(), icon: '🎯' },
          { label: 'Current Score', value: score.toString(), icon: '⭐' },
          { label: 'Best Streak', value: streak.toString(), icon: '🔥' },
          { label: 'Hints Used', value: hintsUsed.toString(), icon: '💡' },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Difficulty Selector */}
      <ThemeCard className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Difficulty</h2>
        <div className="flex justify-center space-x-4">
          {(['beginner', 'intermediate', 'advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                loadRandomChallenge(diff);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors capitalize ${
                difficulty === diff
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </ThemeCard>

      {/* Current Challenge */}
      {currentChallenge && (
        <ThemeCard className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentChallenge.title}</h3>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getDifficultyColor(currentChallenge.difficulty)}`}
                >
                  {currentChallenge.difficulty}
                </span>
                <span className="text-sm text-gray-600">{currentChallenge.category}</span>
                <span className="text-sm text-gray-600">{currentChallenge.language}</span>
              </div>
            </div>
            <button
              onClick={nextChallenge}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              New Challenge
            </button>
          </div>

          {/* Code Display */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6">
            <pre className="text-green-400 text-sm overflow-x-auto">
              <code>{currentChallenge.code}</code>
            </pre>
          </div>

          {/* Answer Form */}
          {!showResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={userAnswer.timeComplexity}
                    onChange={(e) =>
                      setUserAnswer((prev) => ({ ...prev, timeComplexity: e.target.value }))
                    }
                    placeholder="e.g., O(n), O(n²), O(log n)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={userAnswer.spaceComplexity}
                    onChange={(e) =>
                      setUserAnswer((prev) => ({ ...prev, spaceComplexity: e.target.value }))
                    }
                    placeholder="e.g., O(1), O(n), O(n²)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reasoning (Optional)
                </label>
                <textarea
                  value={userAnswer.reasoning}
                  onChange={(e) =>
                    setUserAnswer((prev) => ({ ...prev, reasoning: e.target.value }))
                  }
                  placeholder="Explain your analysis..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={showHint}
                  disabled={currentHint >= currentChallenge.hints.length}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {currentHint >= currentChallenge.hints.length
                    ? 'No More Hints'
                    : `Hint (${currentHint}/${currentChallenge.hints.length})`}
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.timeComplexity || !userAnswer.spaceComplexity}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              </div>

              {/* Hint Display */}
              {currentHint > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Hint {currentHint}:</h4>
                  <p className="text-yellow-700">{currentChallenge.hints[currentHint - 1]}</p>
                </div>
              )}
            </div>
          )}

          {/* Result Display */}
          {showResult && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Your Answer:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Time:</span> {userAnswer.timeComplexity}
                    {userAnswer.timeComplexity.toLowerCase().replace(/\s/g, '') ===
                    currentChallenge.correctTimeComplexity.toLowerCase().replace(/\s/g, '') ? (
                      <span className="text-green-600 ml-2">✓</span>
                    ) : (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Space:</span> {userAnswer.spaceComplexity}
                    {userAnswer.spaceComplexity.toLowerCase().replace(/\s/g, '') ===
                    currentChallenge.correctSpaceComplexity.toLowerCase().replace(/\s/g, '') ? (
                      <span className="text-green-600 ml-2">✓</span>
                    ) : (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </div>
                </div>
                {userAnswer.reasoning && (
                  <div className="mt-2">
                    <span className="font-medium">Reasoning:</span> {userAnswer.reasoning}
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Correct Answer:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <span className="font-medium">Time:</span>{' '}
                    {currentChallenge.correctTimeComplexity}
                  </div>
                  <div>
                    <span className="font-medium">Space:</span>{' '}
                    {currentChallenge.correctSpaceComplexity}
                  </div>
                </div>
                <p className="text-green-700">{currentChallenge.explanation}</p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={nextChallenge}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Next Challenge
                </button>
              </div>
            </div>
          )}
        </ThemeCard>
      )}

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{score}</div>
            <div className="text-gray-600">Total Score</div>
            <div className="text-sm text-gray-500 mt-1">Points earned</div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{streak}</div>
            <div className="text-gray-600">Current Streak</div>
            <div className="text-sm text-gray-500 mt-1">Consecutive correct answers</div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round((score / Math.max(1, challenges.length * 20)) * 100)}%
            </div>
            <div className="text-gray-600">Accuracy</div>
            <div className="text-sm text-gray-500 mt-1">Correct answers ratio</div>
          </div>
        </ThemeCard>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Core Concepts"
            description="Review fundamental Big-O notation and complexity classes."
            colorScheme="blue"
            onClick={() => console.log('Navigate to Core Concepts')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Advanced Topics"
            description="Explore amortized analysis and NP-completeness."
            colorScheme="emerald"
            onClick={() => console.log('Navigate to Advanced Topics')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Case Studies"
            description="See Big-O analysis in real-world production systems."
            colorScheme="purple"
            onClick={() => console.log('Navigate to Case Studies')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Achievement Center"
            description="View your progress, unlock achievements, and compete on leaderboards."
            colorScheme="orange"
            onClick={() => (window.location.href = '/bigo?section=gamification-hub')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">How to Analyze Complexity</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-blue-600">1. Identify Input Size</strong>
            <p>Find the variable that represents input size (usually n)</p>
          </div>
          <div>
            <strong className="text-blue-600">2. Count Operations</strong>
            <p>Focus on the most expensive operations in loops/recursion</p>
          </div>
          <div>
            <strong className="text-blue-600">3. Consider Worst Case</strong>
            <p>Always analyze the worst-case scenario</p>
          </div>
          <div>
            <strong className="text-blue-600">4. Drop Constants</strong>
            <p>O(2n) becomes O(n), O(n² + n) becomes O(n²)</p>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Common Complexity Classes</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong className="text-green-600">O(1):</strong> Constant time
          </p>
          <p>
            <strong className="text-blue-600">O(log n):</strong> Logarithmic time
          </p>
          <p>
            <strong className="text-yellow-600">O(n):</strong> Linear time
          </p>
          <p>
            <strong className="text-orange-600">O(n log n):</strong> Linearithmic time
          </p>
          <p>
            <strong className="text-red-600">O(n²):</strong> Quadratic time
          </p>
          <p>
            <strong className="text-purple-600">O(2ⁿ):</strong> Exponential time
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Scoring System</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong className="text-green-600">+10 points:</strong> Correct time complexity
          </p>
          <p>
            <strong className="text-green-600">+10 points:</strong> Correct space complexity
          </p>
          <p>
            <strong className="text-red-600">-2 points:</strong> Per hint used
          </p>
          <p>
            <strong className="text-blue-600">Streak bonus:</strong> Consecutive correct answers
          </p>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Tips for Success</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🎯 <strong>Start with loops:</strong> Count iterations
          </p>
          <p>
            🔄 <strong>Recursion:</strong> Draw the call tree
          </p>
          <p>
            📊 <strong>Data structures:</strong> Know their complexities
          </p>
          <p>
            ⚡ <strong>Practice regularly:</strong> Analysis gets easier with experience
          </p>
        </div>
      </ThemeCard>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="bigo"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Keep Practicing Big-O Analysis"
        description="Master the fundamental skill that separates great developers from good ones."
        buttonText="Continue Challenges"
        onButtonClick={() => loadRandomChallenge(difficulty)}
        colorScheme="blue"
      />
    </>
  );
};

export default CodingChallenges;
