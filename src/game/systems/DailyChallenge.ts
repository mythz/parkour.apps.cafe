export interface DailyChallenge {
  date: string; // YYYY-MM-DD format
  levelSeed: number;
  difficulty: number;
  targetTime: number; // seconds
  reward: number; // bonus coins
  completed: boolean;
  bestTime: number | null;
}

export class DailyChallengeManager {
  static getDailyChallengeSeed(date?: Date): number {
    const d = date || new Date();
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

    // Convert date string to a number seed
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) {
      seed = ((seed << 5) - seed) + dateStr.charCodeAt(i);
      seed = seed & seed; // Convert to 32-bit integer
    }

    return Math.abs(seed);
  }

  static getTodaysChallengeKey(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  static generateDailyChallenge(date?: Date): DailyChallenge {
    const d = date || new Date();
    const dateStr = d.toISOString().split('T')[0];
    const seed = this.getDailyChallengeSeed(d);

    // Generate difficulty based on day of week (harder on weekends)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const difficulty = isWeekend ? 0.7 : 0.5;

    // Target time varies by difficulty
    const targetTime = isWeekend ? 45 : 60;

    // Higher rewards on weekends
    const reward = isWeekend ? 200 : 100;

    return {
      date: dateStr,
      levelSeed: seed,
      difficulty,
      targetTime,
      reward,
      completed: false,
      bestTime: null
    };
  }

  static isDailyChallengeCompleted(
    challengeKey: string,
    completedChallenges: Map<string, DailyChallenge>
  ): boolean {
    const challenge = completedChallenges.get(challengeKey);
    return challenge?.completed || false;
  }

  static calculateStreak(completedChallenges: Map<string, DailyChallenge>): number {
    let streak = 0;
    const today = new Date();

    // Check backwards from today
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const key = checkDate.toISOString().split('T')[0];

      const challenge = completedChallenges.get(key);
      if (challenge?.completed) {
        streak++;
      } else if (i > 0) {
        // Break streak if we find a non-completed day (except today)
        break;
      }
    }

    return streak;
  }

  static getRewardMultiplier(streak: number): number {
    if (streak >= 30) return 3.0;
    if (streak >= 14) return 2.5;
    if (streak >= 7) return 2.0;
    if (streak >= 3) return 1.5;
    return 1.0;
  }
}
