export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number; // Coins awarded
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first race',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 50
  },
  {
    id: 'win_10',
    name: 'Rising Star',
    description: 'Win 10 races',
    icon: '⭐',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    reward: 100
  },
  {
    id: 'win_50',
    name: 'Champion',
    description: 'Win 50 races',
    icon: '👑',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    reward: 500
  },
  {
    id: 'perfect_level',
    name: 'Flawless',
    description: 'Complete a level without any mistakes',
    icon: '💎',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 75
  },
  {
    id: 'combo_20',
    name: 'Combo Master',
    description: 'Achieve a 20x combo',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 100
  },
  {
    id: 'level_10',
    name: 'Getting Started',
    description: 'Reach level 10',
    icon: '📈',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    reward: 75
  },
  {
    id: 'level_50',
    name: 'Experienced',
    description: 'Reach level 50',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    reward: 250
  },
  {
    id: 'level_100',
    name: 'Veteran',
    description: 'Reach level 100',
    icon: '🏅',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    reward: 500
  },
  {
    id: 'coins_1000',
    name: 'Wealthy',
    description: 'Accumulate 1000 coins',
    icon: '💰',
    unlocked: false,
    progress: 0,
    maxProgress: 1000,
    reward: 200
  },
  {
    id: 'all_outfits',
    name: 'Fashionista',
    description: 'Unlock all outfits',
    icon: '👕',
    unlocked: false,
    progress: 0,
    maxProgress: 21,
    reward: 1000
  },
  {
    id: 'speedrun',
    name: 'Speed Demon',
    description: 'Complete a level in under 20 seconds',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 150
  },
  {
    id: 'collector',
    name: 'Power Collector',
    description: 'Collect 50 power-ups',
    icon: '🌟',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    reward: 100
  },
  {
    id: 'daily_streak',
    name: 'Dedicated',
    description: 'Complete daily challenges 7 days in a row',
    icon: '📅',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    reward: 300
  },
  {
    id: 'comeback',
    name: 'Never Give Up',
    description: 'Win a race after being in last place',
    icon: '💪',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    reward: 100
  },
  {
    id: 'three_stars',
    name: 'Perfectionist',
    description: 'Get 3 stars on 25 levels',
    icon: '⭐⭐⭐',
    unlocked: false,
    progress: 0,
    maxProgress: 25,
    reward: 250
  }
];

export class AchievementManager {
  static checkAchievement(
    achievementId: string,
    currentProgress: number,
    achievements: Map<string, AchievementProgress>
  ): { unlocked: boolean; achievement: Achievement | null } {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return { unlocked: false, achievement: null };

    const progress = achievements.get(achievementId);
    if (progress && progress.unlocked) {
      return { unlocked: false, achievement: null };
    }

    if (currentProgress >= achievement.maxProgress) {
      return { unlocked: true, achievement };
    }

    return { unlocked: false, achievement: null };
  }

  static updateProgress(
    achievementId: string,
    progress: number,
    achievements: Map<string, AchievementProgress>
  ): AchievementProgress {
    const existing = achievements.get(achievementId);
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

    if (!achievement) {
      return {
        achievementId,
        progress: 0,
        unlocked: false
      };
    }

    const unlocked = progress >= achievement.maxProgress;

    return {
      achievementId,
      progress: Math.min(progress, achievement.maxProgress),
      unlocked: unlocked || (existing?.unlocked || false),
      unlockedAt: unlocked && !existing?.unlocked ? Date.now() : existing?.unlockedAt
    };
  }
}
