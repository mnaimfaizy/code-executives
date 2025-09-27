import React, { useState, useCallback, useEffect } from 'react';
import type { PlaygroundSession, UserProgress } from '../../types/playground';
import { Play, RotateCcw, Code, Eye, BarChart3, Trophy, Lightbulb } from 'lucide-react';
import SectionLayout from '../shared/SectionLayout';
import ThemeCard from '../shared/ThemeCard';
import NavigationCard from '../shared/NavigationCard';
import StatsGrid from '../shared/StatsGrid';
import CTASection from '../shared/CTASection';
import ProblemDisplay from './ProblemDisplay';
import CodeEditor from './CodeEditor';
import VisualizationSelector from './VisualizationSelector';
import ExecutionEngine, { type DebugState } from './ExecutionEngine';
import TestRunner from './TestRunner';
import ScoringSystem from './ScoringSystem';
import { ArrayVisualization } from '../models2d/datastructures/linear/ArrayVisualization';
import { LinkedListVisualization } from '../models2d/datastructures/linear/LinkedListVisualization';
import { QueueVisualization } from '../models2d/datastructures/linear/QueueVisualization';
import { StackVisualization } from '../models2d/datastructures/linear/StackVisualization';
import HashTableVisualization from '../models2d/datastructures/hash/HashTableVisualization';
import { getScoringSystem } from '../../utils/scoring';
import type {
  PlaygroundProblem,
  Language,
  DataStructureType,
  SubmissionResult,
  TestCaseResult,
} from '../../types/playground';
import type { QueueElement, StackElement } from '../../types/datastructures';

interface PlaygroundProps {
  problemId?: string;
  initialLanguage?: Language;
  initialVisualization?: DataStructureType;
  onProblemChange?: (problem: PlaygroundProblem) => void;
  onSubmission?: (result: SubmissionResult) => void;
}

const Playground: React.FC<PlaygroundProps> = ({
  problemId = 'two-sum',
  initialLanguage = 'javascript',
  initialVisualization = 'Array',
  onProblemChange,
  onSubmission,
}) => {
  // Mock playground state for now
  const [currentProblem, setCurrentProblem] = useState<PlaygroundProblem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState(
    '// Write your solution here\nfunction solution() {\n  // TODO: Implement\n}'
  );
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [selectedVisualization, setSelectedVisualization] =
    useState<DataStructureType>(initialVisualization);
  const [session] = useState<PlaygroundSession | null>(null);
  const [progress] = useState<UserProgress | null>(null);
  const [error] = useState<string | null>(null);

  // Mock functions
  const runCode = useCallback(async () => {
    setIsExecuting(true);
    // Mock execution
    setTimeout(() => setIsExecuting(false), 1000);
  }, []);

  const runTests = useCallback(async () => {
    setIsExecuting(true);
    // Mock test execution
    setTimeout(() => {
      setTestResults([]);
      setIsExecuting(false);
    }, 1000);
  }, []);

  const submitSolution = useCallback(async (): Promise<SubmissionResult> => {
    // Mock submission
    return {
      problemId: problemId,
      userId: 'mock-user',
      language,
      code,
      overallResult: 'accepted',
      testCaseResults: [],
      totalTests: 1,
      passedTests: 1,
      executionTime: 10,
      memoryUsage: 5,
      submittedAt: new Date(),
      hintsUsed: 0,
      score: 100,
    };
  }, [problemId, language, code]);

  const resetCode = useCallback(() => {
    setCode('// Write your solution here\nfunction solution() {\n  // TODO: Implement\n}');
  }, []);

  const showHint = useCallback((hintId: string) => {
    console.log('Showing hint:', hintId);
  }, []);

  // Load mock problem
  useEffect(() => {
    const mockProblem: PlaygroundProblem = {
      id: problemId,
      title: 'Two Sum',
      difficulty: 'Easy',
      category: 'Data Structures',
      dataStructure: 'Array',
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      examples: [],
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
      starterCode: {
        javascript:
          '// Write your solution here\nfunction twoSum(nums, target) {\n  // TODO: Implement\n}',
      },
      testCases: [],
      hints: [],
      solution: {
        code: {
          javascript:
            'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}',
        },
        explanation: 'Use a hash map to store numbers and their indices.',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        approaches: [],
      },
      visualizationOptions: ['Array', 'LinkedList', 'Stack', 'Queue'],
      learningObjectives: ['Understand hash maps', 'Practice array iteration'],
      tags: ['array', 'hash-table'],
      estimatedSolveTime: 30,
    };

    setTimeout(() => {
      setCurrentProblem(mockProblem);
      setIsLoading(false);
    }, 500);
  }, [problemId]);

  // UI state
  const [activeTab, setActiveTab] = useState<
    'problem' | 'editor' | 'visualization' | 'tests' | 'performance' | 'debug' | 'scoring'
  >('problem');
  const [showHints, setShowHints] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugState, setDebugState] = useState<DebugState | null>(null);

  // Scoring system
  const [scoringSystem] = useState(() => getScoringSystem());
  const [currentScore, setCurrentScore] = useState(() => scoringSystem.getScore());
  const [recentAchievements, setRecentAchievements] = useState(() =>
    scoringSystem.getRecentAchievements()
  );

  // Handle problem changes
  useEffect(() => {
    if (currentProblem && onProblemChange) {
      onProblemChange(currentProblem);
    }
  }, [currentProblem, onProblemChange]);

  // Handle submission results
  const handleSubmission = useCallback(async () => {
    const result = await submitSolution();
    if (result && onSubmission) {
      onSubmission(result);

      // Process scoring
      const timeSpent = session ? (Date.now() - session.startTime.getTime()) / 1000 : 0; // in seconds
      const hintsUsed = session?.hintsUsed?.length || 0;

      if (currentProblem) {
        const scoringResult = scoringSystem.processSubmission(
          result,
          currentProblem,
          timeSpent,
          hintsUsed
        );

        // Update local state
        setCurrentScore(scoringSystem.getScore());
        setRecentAchievements(scoringSystem.getRecentAchievements());

        // Save to storage
        scoringSystem.saveToStorage();

        // Show achievement notifications
        if (scoringResult.newAchievements.length > 0) {
          scoringResult.newAchievements.forEach((achievement) => {
            console.log(`🎉 Achievement Unlocked: ${achievement.name}`);
          });
        }

        console.log(
          `Points earned: ${scoringResult.pointsEarned}, Experience: ${scoringResult.experienceEarned}`
        );
        if (scoringResult.leveledUp) {
          console.log(`🎊 Level Up! You are now level ${scoringResult.newLevel}`);
        }
      }
    }
  }, [submitSolution, onSubmission, session, currentProblem, scoringSystem]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading playground...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentProblem) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Playground
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Unable to load the playground. Please try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Hero content
  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Visual Algorithm Playground</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Solve coding problems with real-time visual feedback. See your algorithms execute on data
          structures and understand complexity analysis through interactive visualizations.
        </p>
        <div className="flex justify-center items-center space-x-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progress?.statistics.totalSolved || 0}
            </div>
            <div className="text-sm text-gray-600">Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress?.statistics.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(progress?.statistics.averageScore || 0)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          {
            label: 'Easy Problems',
            value: (progress?.statistics.easySolved || 0).toString(),
            icon: '🟢',
          },
          {
            label: 'Medium Problems',
            value: (progress?.statistics.mediumSolved || 0).toString(),
            icon: '🟡',
          },
          {
            label: 'Hard Problems',
            value: (progress?.statistics.hardSolved || 0).toString(),
            icon: '🔴',
          },
          {
            label: 'Time Spent',
            value: `${Math.round((progress?.statistics.totalTimeSpent || 0) / 60)}h`,
            icon: '⏱️',
          },
        ]}
        colorScheme="blue"
      />
    </div>
  );

  // Main content
  const mainContent = (
    <div className="space-y-6">
      {/* Problem Header */}
      <ThemeCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">{currentProblem.title}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentProblem.difficulty === 'Easy'
                  ? 'bg-green-100 text-green-800'
                  : currentProblem.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {currentProblem.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <BarChart3 className="w-4 h-4" />
              <span>{currentProblem.solution.timeComplexity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Code className="w-4 h-4" />
              <span>{language}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{selectedVisualization}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Trophy className="w-4 h-4" />
          <span>Category: {currentProblem.category}</span>
          {currentProblem.dataStructure && (
            <>
              <span>•</span>
              <span>Data Structure: {currentProblem.dataStructure}</span>
            </>
          )}
        </div>
      </ThemeCard>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'problem' as const, label: 'Problem', icon: '📋' },
            { id: 'editor' as const, label: 'Code Editor', icon: '💻' },
            { id: 'visualization' as const, label: 'Visualization', icon: '👁️' },
            { id: 'tests' as const, label: 'Test Results', icon: '🧪' },
            { id: 'performance' as const, label: 'Analysis', icon: '📊' },
            { id: 'scoring' as const, label: 'Progress', icon: '🏆' },
            ...(debugMode ? [{ id: 'debug' as const, label: 'Debug', icon: '🐛' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Problem Tab */}
          {activeTab === 'problem' && (
            <ProblemDisplay
              problem={currentProblem}
              showHints={showHints}
              hintsUsed={session?.hintsUsed || []}
              onHintClick={(hintId: string) => {
                showHint(hintId);
                setShowHints(true);
              }}
            />
          )}

          {/* Editor Tab */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Code Editor</h3>
                <div className="flex items-center space-x-2">
                  {/* Debug Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Debug</span>
                    <button
                      onClick={() => setDebugMode(!debugMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        debugMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          debugMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={resetCode}
                    className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                             hover:text-gray-900 dark:hover:text-white transition-colors
                             flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={runCode}
                    disabled={isExecuting}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400
                             text-white text-sm font-medium rounded-lg transition-colors
                             flex items-center space-x-2"
                  >
                    {isExecuting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                onLanguageChange={setLanguageState}
                starterCode={currentProblem.starterCode}
              />
            </div>
          )}

          {/* Visualization Tab */}
          {activeTab === 'visualization' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Live Visualization
                </h3>
                <VisualizationSelector
                  options={currentProblem.visualizationOptions}
                  selected={selectedVisualization}
                  onSelect={setSelectedVisualization}
                />
              </div>

              {selectedVisualization === 'Array' ? (
                <ArrayVisualization
                  debugState={
                    debugState
                      ? {
                          isDebugging: debugState.isDebugging,
                          dataStructureState: debugState.dataStructureState,
                          currentOperation: debugState.currentOperation
                            ? {
                                type: debugState.currentOperation.type,
                                indices: debugState.currentOperation.indices,
                                values: debugState.currentOperation.values,
                              }
                            : undefined,
                        }
                      : undefined
                  }
                />
              ) : selectedVisualization === 'LinkedList' ? (
                <LinkedListVisualization
                  debugState={
                    debugState
                      ? {
                          isDebugging: debugState.isDebugging,
                          dataStructureState: debugState.dataStructureState,
                          currentOperation: debugState.currentOperation
                            ? {
                                type: debugState.currentOperation.type,
                                indices: debugState.currentOperation.indices,
                                values: debugState.currentOperation.values,
                              }
                            : undefined,
                        }
                      : undefined
                  }
                />
              ) : selectedVisualization === 'Queue' ? (
                <QueueVisualization
                  debugState={
                    debugState
                      ? {
                          isDebugging: debugState.isDebugging,
                          dataStructureState: {
                            currentElements: ((
                              debugState.dataStructureState.queue as unknown as {
                                elements?: unknown[];
                              }
                            )?.elements || []) as QueueElement[],
                            front:
                              (debugState.dataStructureState.queue as unknown as { front?: number })
                                ?.front || 0,
                            rear:
                              (debugState.dataStructureState.queue as unknown as { rear?: number })
                                ?.rear || -1,
                            size:
                              (debugState.dataStructureState.queue as unknown as { size?: number })
                                ?.size || 0,
                          },
                          currentOperation: debugState.currentOperation?.type || '',
                        }
                      : undefined
                  }
                />
              ) : selectedVisualization === 'Stack' ? (
                <StackVisualization
                  debugState={
                    debugState
                      ? {
                          isDebugging: debugState.isDebugging,
                          dataStructureState: {
                            currentElements: ((
                              debugState.dataStructureState.stack as unknown as {
                                elements?: unknown[];
                              }
                            )?.elements || []) as StackElement[],
                            top:
                              (debugState.dataStructureState.stack as unknown as { top?: number })
                                ?.top || -1,
                            size:
                              (debugState.dataStructureState.stack as unknown as { size?: number })
                                ?.size || 0,
                          },
                          currentOperation: debugState.currentOperation?.type || '',
                        }
                      : undefined
                  }
                />
              ) : selectedVisualization === 'HashTable' ? (
                <HashTableVisualization
                  tableSize={7}
                  hashFunction="simple"
                  collisionStrategy="chaining"
                  showHashCalculation={true}
                  onOperationComplete={(operation) =>
                    console.log('HashTable operation:', operation)
                  }
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Visualization Coming Soon</p>
                    <p className="text-sm">
                      Run your code to see {selectedVisualization} operations visualized in
                      real-time
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === 'tests' && (
            <TestRunner
              testCases={currentProblem.testCases}
              results={testResults}
              isRunning={isExecuting}
              onRun={runTests}
              onResult={() => {}} // Results are handled by the hook
            />
          )}

          {/* Scoring Tab */}
          {activeTab === 'scoring' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Progress & Achievements
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your learning progress, earn achievements, and see your algorithm mastery
                grow.
              </p>

              <ScoringSystem
                score={currentScore}
                recentAchievements={recentAchievements}
                onAchievementClick={(achievement) =>
                  console.log('Achievement clicked:', achievement)
                }
              />
            </div>
          )}

          {/* Debug Tab */}
          {activeTab === 'debug' && debugMode && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Step-by-Step Debugging
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Debug your algorithm execution step by step. See how data structures change with
                each operation.
              </p>

              <ExecutionEngine
                code={code}
                language={language}
                testCases={currentProblem.testCases}
                debugMode={true}
                onResult={(result: unknown) => console.log('Debug result:', result)}
                onOperation={(operation: unknown) => console.log('Debug operation:', operation)}
                onDebugStateChange={setDebugState}
                onStep={(operation: unknown, state: unknown) =>
                  console.log('Debug step:', operation, state)
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('editor')}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Code className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Write Code</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Start coding your solution</p>
            </div>
          </div>
        </button>

        <button
          onClick={runTests}
          disabled={isExecuting}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <Play className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">Run Tests</h4>
              <p className="text-sm text-green-700 dark:text-green-300">Test your solution</p>
            </div>
          </div>
        </button>

        <button
          onClick={handleSubmission}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-purple-600" />
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100">Submit Solution</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">Submit for grading</p>
            </div>
          </div>
        </button>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ThemeCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {session?.submissions.length || 0}
            </div>
            <div className="text-sm text-gray-600">Attempts</div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {session?.hintsUsed?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Hints Used</div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {session ? Math.floor((Date.now() - session.startTime.getTime()) / 60000) : 0}
            </div>
            <div className="text-sm text-gray-600">Minutes Spent</div>
          </div>
        </ThemeCard>

        <ThemeCard>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{session?.score || 0}</div>
            <div className="text-sm text-gray-600">Current Score</div>
          </div>
        </ThemeCard>
      </div>
    </div>
  );

  // Sidebar content
  const sidebarContent = (
    <div className="space-y-6">
      {/* Quick Stats */}
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Your Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Easy</span>
            <span className="text-sm font-medium text-green-600">
              {progress?.statistics.easySolved || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Medium</span>
            <span className="text-sm font-medium text-yellow-600">
              {progress?.statistics.mediumSolved || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hard</span>
            <span className="text-sm font-medium text-red-600">
              {progress?.statistics.hardSolved || 0}
            </span>
          </div>
        </div>
      </ThemeCard>

      {/* Learning Objectives */}
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Learning Objectives</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {currentProblem.learningObjectives.map((objective: string, index: number) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </ThemeCard>

      {/* Hints Toggle */}
      <ThemeCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-900">Hints</span>
          </div>
          <button
            onClick={() => setShowHints(!showHints)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showHints ? 'bg-yellow-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showHints ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {showHints ? 'Hints are visible' : 'Click to show hints'}
        </p>
      </ThemeCard>

      {/* Navigation */}
      <div className="space-y-3">
        <NavigationCard
          title="Problem List"
          description="Browse all available problems"
          colorScheme="blue"
          onClick={() => console.log('Navigate to problem list')}
        />

        <NavigationCard
          title="Big-O Tutorial"
          description="Review complexity analysis concepts"
          colorScheme="green"
          onClick={() => (window.location.href = '/bigo')}
        />

        <NavigationCard
          title="Data Structures"
          description="Learn about different data structures"
          colorScheme="purple"
          onClick={() => (window.location.href = '/datastructures')}
        />

        <NavigationCard
          title="Achievements"
          description="View your progress and unlock achievements"
          colorScheme="orange"
          onClick={() => console.log('Navigate to achievements')}
        />
      </div>
    </div>
  );

  return (
    <>
      <SectionLayout
        section="playground"
        hero={heroContent}
        mainContent={mainContent}
        sidebar={sidebarContent}
      />
      <CTASection
        title="Ready for More Challenges?"
        description="Continue your journey through algorithms and data structures with interactive visualizations."
        buttonText="Explore More Problems"
        onButtonClick={() => console.log('Navigate to problem selection')}
        colorScheme="blue"
      />
    </>
  );
};

export default Playground;
