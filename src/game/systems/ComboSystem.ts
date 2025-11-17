export type ComboAction = 'perfectJump' | 'perfectSlide' | 'perfectClimb' | 'noHit';

export interface ComboState {
  count: number;
  multiplier: number;
  score: number;
  lastAction: ComboAction | null;
  timeSinceLastAction: number;
}

export class ComboSystem {
  private combo: number = 0;
  private maxCombo: number = 0;
  private multiplier: number = 1.0;
  private score: number = 0;
  private lastAction: ComboAction | null = null;
  private timeSinceLastAction: number = 0;
  private readonly comboTimeout: number = 3.0; // seconds

  update(dt: number): void {
    this.timeSinceLastAction += dt;

    // Reset combo if too much time passed
    if (this.timeSinceLastAction > this.comboTimeout && this.combo > 0) {
      this.resetCombo();
    }
  }

  addCombo(action: ComboAction, points: number = 10): void {
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.lastAction = action;
    this.timeSinceLastAction = 0;

    // Calculate multiplier based on combo
    this.multiplier = 1.0 + Math.floor(this.combo / 5) * 0.5;

    // Add score with multiplier
    const earnedPoints = Math.floor(points * this.multiplier);
    this.score += earnedPoints;
  }

  resetCombo(): void {
    this.combo = 0;
    this.multiplier = 1.0;
    this.lastAction = null;
    this.timeSinceLastAction = 0;
  }

  getComboState(): ComboState {
    return {
      count: this.combo,
      multiplier: this.multiplier,
      score: this.score,
      lastAction: this.lastAction,
      timeSinceLastAction: this.timeSinceLastAction
    };
  }

  getCombo(): number {
    return this.combo;
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  getScore(): number {
    return this.score;
  }

  getMultiplier(): number {
    return this.multiplier;
  }

  // Check if combo is about to expire
  isExpiring(): boolean {
    return this.timeSinceLastAction > this.comboTimeout * 0.7 && this.combo > 0;
  }

  // Get combo rank
  getComboRank(): string {
    if (this.combo >= 50) return 'LEGENDARY';
    if (this.combo >= 30) return 'EPIC';
    if (this.combo >= 20) return 'AMAZING';
    if (this.combo >= 10) return 'GREAT';
    if (this.combo >= 5) return 'GOOD';
    return '';
  }
}
