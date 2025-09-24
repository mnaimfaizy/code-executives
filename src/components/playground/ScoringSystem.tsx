import React, { useState } from 'react';
import { Trophy, Star, Target, TrendingUp, Award, Zap } from 'lucide-react';
import type { Achievement, Score } from '../../types/playground';

interface ScoringSystemProps {
  score: Score;
  recentAchievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
  className?: string;
}

const ScoringSystem: React.FC<ScoringSystemProps> = ({
  score,
  recentAchievements,
  onAchievementClick,
  className = '',
}) => {
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Calculate progress to next level
  const levelProgress = (score.experiencePoints / score.experienceToNextLevel) * 100;

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
    onAchievementClick?.(achievement);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level and XP Display */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Level {score.level}</span>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">
              XP: {score.experiencePoints}/{score.experienceToNextLevel}
            </div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Problems</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {score.stats.problemsSolved}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Debug Sessions
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {score.stats.debugSessions}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Best Score</span>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {score.stats.bestPerformanceScore}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-1">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Total Points</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {score.totalPoints.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Recent Achievements</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentAchievements.slice(0, 4).map((achievement) => (
              <button
                key={achievement.id}
                onClick={() => handleAchievementClick(achievement)}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {showAchievementModal && selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{selectedAchievement.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedAchievement.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {selectedAchievement.description}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowAchievementModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoringSystem;
