import type { Score, Achievement, SubmissionResult, PlaygroundProblem } from '../types/playground';

// Scoring constants
const SCORING_CONFIG = {
  basePoints: 100,
  timeBonus: 50,
  hintPenalty: 10,
  difficultyMultiplier: {
    Easy: 1,
    Medium: 1.5,
    Hard: 2,
  },
  levelExperienceBase: 100,
  levelExperienceMultiplier: 1.2,
};

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_problem',
    name: 'First Steps',
    description: 'Solve your first problem',
    icon: '🎯',
    rarity: 'common',
    category: 'solving',
  },
  {
    id: 'debug_master',
    name: 'Debug Master',
    description: 'Complete 10 debug sessions',
    icon: '🔍',
    rarity: 'rare',
    category: 'performance',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Solve a problem in under 30 seconds',
    icon: '⚡',
    rarity: 'epic',
    category: 'performance',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Solve a problem with 100% test cases on first try',
    icon: '💎',
    rarity: 'legendary',
    category: 'solving',
  },
  {
    id: 'consistent_learner',
    name: 'Consistent Learner',
    description: 'Solve problems for 7 consecutive days',
    icon: '📚',
    rarity: 'rare',
    category: 'consistency',
  },
  {
    id: 'algorithm_expert',
    name: 'Algorithm Expert',
    description: 'Solve 50 problems',
    icon: '🧠',
    rarity: 'epic',
    category: 'solving',
  },
];

export class ScoringSystem {
  private score: Score;

  constructor(initialScore?: Partial<Score>) {
    this.score = {
      totalPoints: 0,
      level: 1,
      experiencePoints: 0,
      experienceToNextLevel: SCORING_CONFIG.levelExperienceBase,
      achievements: [],
      stats: {
        problemsSolved: 0,
        debugSessions: 0,
        timeSpentDebugging: 0,
        averageExecutionTime: 0,
        bestPerformanceScore: 0,
      },
      ...initialScore,
    };
  }

  // Calculate score for a submission
  calculateSubmissionScore(
    result: SubmissionResult,
    problem: PlaygroundProblem,
    timeSpent: number,
    hintsUsed: number
  ): number {
    const { difficulty } = problem;
    const { passedTests, totalTests } = result;

    // Base score
    let score = SCORING_CONFIG.basePoints;

    // Difficulty multiplier
    score *= SCORING_CONFIG.difficultyMultiplier[difficulty];

    // Test case accuracy bonus
    const accuracy = passedTests / totalTests;
    score *= accuracy;

    // Time bonus (faster = more points)
    const timeBonus = Math.max(0, SCORING_CONFIG.timeBonus - timeSpent / 10);
    score += timeBonus;

    // Hint penalty
    score -= hintsUsed * SCORING_CONFIG.hintPenalty;

    return Math.max(0, Math.round(score));
  }

  // Add experience points and check for level up
  addExperience(points: number): { leveledUp: boolean; newLevel?: number } {
    this.score.experiencePoints += points;

    let leveledUp = false;
    let newLevel = this.score.level;

    while (this.score.experiencePoints >= this.score.experienceToNextLevel) {
      this.score.experiencePoints -= this.score.experienceToNextLevel;
      this.score.level++;
      this.score.experienceToNextLevel = Math.round(
        SCORING_CONFIG.levelExperienceBase *
          Math.pow(SCORING_CONFIG.levelExperienceMultiplier, this.score.level - 1)
      );
      leveledUp = true;
      newLevel = this.score.level;
    }

    return { leveledUp, newLevel };
  }

  // Process a successful submission
  processSubmission(
    result: SubmissionResult,
    problem: PlaygroundProblem,
    timeSpent: number,
    hintsUsed: number
  ): {
    pointsEarned: number;
    experienceEarned: number;
    newAchievements: Achievement[];
    leveledUp: boolean;
    newLevel?: number;
  } {
    const pointsEarned = this.calculateSubmissionScore(result, problem, timeSpent, hintsUsed);
    const experienceEarned = Math.round(pointsEarned * 0.1); // 10% of points as XP

    this.score.totalPoints += pointsEarned;
    this.score.stats.problemsSolved++;

    // Update stats
    const executionTime = result.executionTime;
    this.score.stats.averageExecutionTime =
      (this.score.stats.averageExecutionTime * (this.score.stats.problemsSolved - 1) +
        executionTime) /
      this.score.stats.problemsSolved;

    if (pointsEarned > this.score.stats.bestPerformanceScore) {
      this.score.stats.bestPerformanceScore = pointsEarned;
    }

    // Level up
    const { leveledUp, newLevel } = this.addExperience(experienceEarned);

    // Check for achievements
    const newAchievements = this.checkAchievements(result, timeSpent, hintsUsed);

    return {
      pointsEarned,
      experienceEarned,
      newAchievements,
      leveledUp,
      newLevel,
    };
  }

  // Record debug session
  recordDebugSession(timeSpent: number): void {
    this.score.stats.debugSessions++;
    this.score.stats.timeSpentDebugging += timeSpent;
  }

  // Check for new achievements
  private checkAchievements(
    result: SubmissionResult,
    timeSpent: number,
    hintsUsed: number
  ): Achievement[] {
    const newAchievements: Achievement[] = [];
    const unlockedIds = new Set(this.score.achievements.map((a) => a.id));

    // First problem solved
    if (this.score.stats.problemsSolved === 1 && !unlockedIds.has('first_problem')) {
      newAchievements.push({
        ...ACHIEVEMENTS.find((a) => a.id === 'first_problem')!,
        unlockedAt: new Date(),
      });
    }

    // Debug master
    if (this.score.stats.debugSessions >= 10 && !unlockedIds.has('debug_master')) {
      newAchievements.push({
        ...ACHIEVEMENTS.find((a) => a.id === 'debug_master')!,
        unlockedAt: new Date(),
      });
    }

    // Speed demon
    if (timeSpent < 30 && !unlockedIds.has('speed_demon')) {
      newAchievements.push({
        ...ACHIEVEMENTS.find((a) => a.id === 'speed_demon')!,
        unlockedAt: new Date(),
      });
    }

    // Perfectionist
    if (
      result.passedTests === result.totalTests &&
      hintsUsed === 0 &&
      !unlockedIds.has('perfectionist')
    ) {
      newAchievements.push({
        ...ACHIEVEMENTS.find((a) => a.id === 'perfectionist')!,
        unlockedAt: new Date(),
      });
    }

    // Algorithm expert
    if (this.score.stats.problemsSolved >= 50 && !unlockedIds.has('algorithm_expert')) {
      newAchievements.push({
        ...ACHIEVEMENTS.find((a) => a.id === 'algorithm_expert')!,
        unlockedAt: new Date(),
      });
    }

    // Add to score
    this.score.achievements.push(...newAchievements);

    return newAchievements;
  }

  // Get current score
  getScore(): Score {
    return { ...this.score };
  }

  // Get recent achievements (last 5)
  getRecentAchievements(): Achievement[] {
    return this.score.achievements
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
      .slice(0, 5);
  }

  // Save score to localStorage
  saveToStorage(): void {
    try {
      localStorage.setItem('playground_score', JSON.stringify(this.score));
    } catch (error) {
      console.warn('Failed to save score to localStorage:', error);
    }
  }

  // Load score from localStorage
  loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('playground_score');
      if (saved) {
        this.score = { ...this.score, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load score from localStorage:', error);
    }
  }
}

// Singleton instance
let scoringSystemInstance: ScoringSystem | null = null;

export const getScoringSystem = (): ScoringSystem => {
  if (!scoringSystemInstance) {
    scoringSystemInstance = new ScoringSystem();
    scoringSystemInstance.loadFromStorage();
  }
  return scoringSystemInstance;
};
