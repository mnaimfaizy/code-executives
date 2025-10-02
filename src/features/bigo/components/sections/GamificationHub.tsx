// src/sections/bigo/GamificationHub.tsx
// Comprehensive gamification system for Big-O learning module

import React, { useState, useEffect } from 'react';
import SectionLayout from '../../../../components/shared/SectionLayout';
import ThemeCard from '../../../../components/shared/ThemeCard';
import NavigationCard from '../../../../components/shared/NavigationCard';
import StatsGrid from '../../../../components/shared/StatsGrid';
import CTASection from '../../../../components/shared/CTASection';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'challenges' | 'learning' | 'mastery' | 'special';
}

interface UserProgress {
  totalScore: number;
  challengesCompleted: number;
  sectionsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  hintsUsed: number;
  timeSpent: number; // in minutes
  lastActive: Date;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  challenges: number;
  streak: number;
  rank: number;
}

const GamificationHub: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalScore: 0,
    challengesCompleted: 0,
    sectionsCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    hintsUsed: 0,
    timeSpent: 0,
    lastActive: new Date(),
  });

  // Mock progress updates (in real app, this would come from API/localStorage)
  useEffect(() => {
    // Simulate some progress for demo purposes
    setUserProgress((prev) => ({
      ...prev,
      totalScore: 1250,
      challengesCompleted: 42,
      sectionsCompleted: 3,
      currentStreak: 7,
      bestStreak: 12,
      hintsUsed: 15,
      timeSpent: 180, // 3 hours
    }));
  }, []);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'progress' | 'leaderboard'>(
    'achievements'
  );

  // Initialize achievements
  useEffect(() => {
    const achievementData: Achievement[] = [
      // Challenge-based achievements
      {
        id: 'first-correct',
        title: 'First Steps',
        description: 'Complete your first coding challenge correctly',
        icon: '🎯',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'common',
        category: 'challenges',
      },
      {
        id: 'challenge-master',
        title: 'Challenge Master',
        description: 'Complete 50 coding challenges',
        icon: '🏆',
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        rarity: 'epic',
        category: 'challenges',
      },
      {
        id: 'streak-warrior',
        title: 'Streak Warrior',
        description: 'Achieve a 10-challenge streak',
        icon: '🔥',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rarity: 'rare',
        category: 'challenges',
      },
      {
        id: 'perfect-score',
        title: 'Perfectionist',
        description: 'Complete a challenge with perfect score (no hints)',
        icon: '💎',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'rare',
        category: 'challenges',
      },

      // Learning achievements
      {
        id: 'theory-explorer',
        title: 'Theory Explorer',
        description: 'Read through all core concept sections',
        icon: '📚',
        unlocked: false,
        progress: 0,
        maxProgress: 5,
        rarity: 'common',
        category: 'learning',
      },
      {
        id: 'complexity-expert',
        title: 'Complexity Expert',
        description: 'Master all common complexity classes',
        icon: '🧠',
        unlocked: false,
        progress: 0,
        maxProgress: 8,
        rarity: 'epic',
        category: 'learning',
      },
      {
        id: 'case-study-scholar',
        title: 'Case Study Scholar',
        description: 'Study all real-world case studies',
        icon: '🏢',
        unlocked: false,
        progress: 0,
        maxProgress: 4,
        rarity: 'rare',
        category: 'learning',
      },

      // Mastery achievements
      {
        id: 'big-o-master',
        title: 'Big-O Master',
        description: 'Achieve 1000 total points',
        icon: '👑',
        unlocked: false,
        progress: 0,
        maxProgress: 1000,
        rarity: 'legendary',
        category: 'mastery',
      },
      {
        id: 'hint-minimalist',
        title: 'Hint Minimalist',
        description: 'Complete 20 challenges using fewer than 2 hints each',
        icon: '🎭',
        unlocked: false,
        progress: 0,
        maxProgress: 20,
        rarity: 'epic',
        category: 'mastery',
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Complete 10 challenges in under 30 seconds each',
        icon: '⚡',
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        rarity: 'rare',
        category: 'mastery',
      },

      // Special achievements
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Complete a challenge before 6 AM',
        icon: '🌅',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'rare',
        category: 'special',
      },
      {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Complete a challenge after 11 PM',
        icon: '🦉',
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'rare',
        category: 'special',
      },
      {
        id: 'dedicated-learner',
        title: 'Dedicated Learner',
        description: 'Spend 5 hours learning Big-O concepts',
        icon: '⏰',
        unlocked: false,
        progress: 0,
        maxProgress: 300, // 5 hours in minutes
        rarity: 'epic',
        category: 'special',
      },
    ];

    setAchievements(achievementData);
  }, []);

  // Initialize leaderboard (mock data for now)
  useEffect(() => {
    const mockLeaderboard: LeaderboardEntry[] = [
      { id: '1', name: 'AlgorithmAce', score: 2450, challenges: 89, streak: 15, rank: 1 },
      { id: '2', name: 'ComplexityKing', score: 2230, challenges: 76, streak: 12, rank: 2 },
      { id: '3', name: 'BigONinja', score: 1980, challenges: 67, streak: 8, rank: 3 },
      { id: '4', name: 'CodeMaster', score: 1750, challenges: 58, streak: 11, rank: 4 },
      { id: '5', name: 'EfficiencyExpert', score: 1620, challenges: 52, streak: 6, rank: 5 },
      {
        id: '6',
        name: 'You',
        score: userProgress.totalScore,
        challenges: userProgress.challengesCompleted,
        streak: userProgress.currentStreak,
        rank: 6,
      },
    ];

    setLeaderboard(mockLeaderboard);
  }, [userProgress]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'rare':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'epic':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'legendary':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'challenges':
        return '🎯';
      case 'learning':
        return '📚';
      case 'mastery':
        return '👑';
      case 'special':
        return '⭐';
      default:
        return '🏆';
    }
  };

  const heroContent = (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Big-O Achievement Center</h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Track your progress, unlock achievements, and compete with fellow learners in mastering
          algorithmic complexity analysis.
        </p>
        <div className="flex justify-center items-center space-x-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{userProgress.totalScore}</div>
            <div className="text-sm text-gray-600">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {userProgress.challengesCompleted}
            </div>
            <div className="text-sm text-gray-600">Challenges</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {achievements.filter((a) => a.unlocked).length}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{userProgress.currentStreak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
        </div>
      </div>

      <StatsGrid
        stats={[
          {
            label: 'Sections Completed',
            value: userProgress.sectionsCompleted.toString(),
            icon: '📖',
          },
          { label: 'Best Streak', value: userProgress.bestStreak.toString(), icon: '🔥' },
          {
            label: 'Time Learning',
            value: `${Math.floor(userProgress.timeSpent / 60)}h ${userProgress.timeSpent % 60}m`,
            icon: '⏱️',
          },
          { label: 'Global Rank', value: '#6', icon: '🏅' },
        ]}
        colorScheme="emerald"
      />
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Achievement Categories */}
      {(['challenges', 'learning', 'mastery', 'special'] as const).map((category) => {
        const categoryAchievements = achievements.filter((a) => a.category === category);
        const unlockedCount = categoryAchievements.filter((a) => a.unlocked).length;

        return (
          <ThemeCard key={category} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 capitalize flex items-center">
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category} Achievements
              </h3>
              <span className="text-sm text-gray-600">
                {unlockedCount}/{categoryAchievements.length} unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}
                      >
                        {achievement.title}
                      </h4>
                      <p
                        className={`text-sm ${achievement.unlocked ? 'text-gray-700' : 'text-gray-400'}`}
                      >
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && achievement.maxProgress > 1 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <div
                        className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getRarityColor(achievement.rarity)}`}
                      >
                        {achievement.rarity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ThemeCard>
        );
      })}
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      {/* Overall Progress */}
      <ThemeCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeDasharray={`${(userProgress.sectionsCompleted / 7) * 100}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {Math.round((userProgress.sectionsCompleted / 7) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Sections Completed</div>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeDasharray={`${(userProgress.challengesCompleted / 100) * 100}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {Math.round((userProgress.challengesCompleted / 100) * 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Challenges Completed</div>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray={`${(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {Math.round(
                    (achievements.filter((a) => a.unlocked).length / achievements.length) * 100
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray={`${Math.min((userProgress.totalScore / 1000) * 100, 100)}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {Math.min(Math.round((userProgress.totalScore / 1000) * 100), 100)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600">Mastery Level</div>
          </div>
        </div>
      </ThemeCard>

      {/* Detailed Progress */}
      <ThemeCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Progress</h3>
        <div className="space-y-4">
          {[
            { label: 'Introduction', completed: true, progress: 100 },
            { label: 'Core Concepts', completed: false, progress: 60 },
            { label: 'Common Complexities', completed: false, progress: 40 },
            { label: 'Algorithm Analysis', completed: false, progress: 20 },
            { label: 'Advanced Concepts', completed: true, progress: 100 },
            { label: 'Real-World Applications', completed: false, progress: 80 },
            { label: 'Practice Challenges', completed: false, progress: 30 },
          ].map((section) => (
            <div key={section.label} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm font-medium ${section.completed ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    {section.label}
                  </span>
                  <span className="text-sm text-gray-500">{section.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${section.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${section.progress}%` }}
                  />
                </div>
              </div>
              {section.completed && <span className="text-green-500">✓</span>}
            </div>
          ))}
        </div>
      </ThemeCard>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      {/* Global Leaderboard */}
      <ThemeCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Global Leaderboard
        </h3>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                entry.name === 'You' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    entry.rank === 1
                      ? 'bg-yellow-400 text-yellow-900'
                      : entry.rank === 2
                        ? 'bg-gray-400 text-gray-900'
                        : entry.rank === 3
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {entry.rank}
                </div>
                <div>
                  <div
                    className={`font-semibold ${entry.name === 'You' ? 'text-blue-600' : 'text-gray-900'}`}
                  >
                    {entry.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.challenges} challenges • {entry.streak} streak
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-gray-900">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>

      {/* Your Ranking */}
      <ThemeCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Ranking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">#6</div>
            <div className="text-gray-600">Global Rank</div>
            <div className="text-sm text-gray-500 mt-1">Top 10%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2,450</div>
            <div className="text-gray-600">Points to Next Rank</div>
            <div className="text-sm text-gray-500 mt-1">Catch up to #5</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
            <div className="text-gray-600">Percentile</div>
            <div className="text-sm text-gray-500 mt-1">Above average</div>
          </div>
        </div>
      </ThemeCard>

      {/* Weekly Challenges */}
      <ThemeCard className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Challenges</h3>
        <div className="space-y-3">
          {[
            {
              title: 'Speed Round',
              description: 'Complete 5 challenges in under 2 minutes each',
              progress: 3,
              max: 5,
              reward: '⚡ Speed Badge',
            },
            {
              title: 'Complexity Master',
              description: 'Correctly analyze O(n log n) algorithms',
              progress: 1,
              max: 3,
              reward: '🧠 Analysis Badge',
            },
            {
              title: 'Streak Champion',
              description: 'Maintain a 15-challenge streak',
              progress: 12,
              max: 15,
              reward: '🔥 Streak Badge',
            },
          ].map((challenge) => (
            <div key={challenge.title} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
                <span className="text-sm text-purple-600 font-medium">{challenge.reward}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {challenge.progress}/{challenge.max}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(challenge.progress / challenge.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ThemeCard>
    </div>
  );

  const mainContent = (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <ThemeCard className="p-6">
        <div className="flex justify-center">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'achievements', label: 'Achievements', icon: '🏆' },
              { id: 'progress', label: 'Progress', icon: '📊' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </ThemeCard>

      {/* Tab Content */}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'progress' && renderProgress()}
      {activeTab === 'leaderboard' && renderLeaderboard()}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard>
          <NavigationCard
            title="Practice Challenges"
            description="Jump back into coding challenges to earn more points and achievements."
            colorScheme="emerald"
            onClick={() => console.log('Navigate to Practice Challenges')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Study Materials"
            description="Review core concepts and improve your understanding."
            colorScheme="blue"
            onClick={() => console.log('Navigate to Study Materials')}
          />
        </ThemeCard>

        <ThemeCard>
          <NavigationCard
            title="Weekly Challenges"
            description="Take on special timed challenges for bonus rewards."
            colorScheme="purple"
            onClick={() => console.log('Navigate to Weekly Challenges')}
          />
        </ThemeCard>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="space-y-6">
      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Achievement Categories</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center">
              <span className="mr-2">🎯</span>
              Challenges
            </span>
            <span className="text-sm font-medium text-gray-600">
              {achievements.filter((a) => a.category === 'challenges' && a.unlocked).length}/
              {achievements.filter((a) => a.category === 'challenges').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center">
              <span className="mr-2">📚</span>
              Learning
            </span>
            <span className="text-sm font-medium text-gray-600">
              {achievements.filter((a) => a.category === 'learning' && a.unlocked).length}/
              {achievements.filter((a) => a.category === 'learning').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center">
              <span className="mr-2">👑</span>
              Mastery
            </span>
            <span className="text-sm font-medium text-gray-600">
              {achievements.filter((a) => a.category === 'mastery' && a.unlocked).length}/
              {achievements.filter((a) => a.category === 'mastery').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center">
              <span className="mr-2">⭐</span>
              Special
            </span>
            <span className="text-sm font-medium text-gray-600">
              {achievements.filter((a) => a.category === 'special' && a.unlocked).length}/
              {achievements.filter((a) => a.category === 'special').length}
            </span>
          </div>
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Achievements</h3>
        <div className="space-y-3">
          {achievements
            .filter((a) => a.unlocked)
            .slice(-3)
            .map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3">
                <span className="text-lg">{achievement.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                  <div className="text-xs text-gray-500">{achievement.description}</div>
                </div>
              </div>
            ))}
          {achievements.filter((a) => a.unlocked).length === 0 && (
            <p className="text-sm text-gray-500">No achievements unlocked yet. Start practicing!</p>
          )}
        </div>
      </ThemeCard>

      <ThemeCard className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Gamification Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            🎯 <strong>Set goals:</strong> Aim for specific achievements
          </p>
          <p>
            🔥 <strong>Maintain streaks:</strong> Consistent practice pays off
          </p>
          <p>
            💡 <strong>Use hints wisely:</strong> Balance learning with scoring
          </p>
          <p>
            ⏰ <strong>Time yourself:</strong> Speed challenges for bonus points
          </p>
          <p>
            📚 <strong>Study regularly:</strong> Complete sections for progress
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
        title="Continue Your Big-O Journey"
        description="Keep learning, keep achieving, and master algorithmic complexity analysis."
        buttonText="Start Practicing"
        onButtonClick={() => console.log('Navigate to practice')}
        colorScheme="emerald"
      />
    </>
  );
};

export default GamificationHub;
