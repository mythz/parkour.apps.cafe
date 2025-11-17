import { Vector2 } from '../../utils/math';

export type PowerUpType = 'speedBoost' | 'shield' | 'doubleJump' | 'magnet';

export interface PowerUpData {
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  duration: number; // Effect duration in seconds
}

export class PowerUp {
  type: PowerUpType;
  position: Vector2;
  size: Vector2;
  collected: boolean = false;
  duration: number;
  private animationTime: number = 0;

  constructor(type: PowerUpType, x: number, y: number, duration: number = 5) {
    this.type = type;
    this.position = { x, y };
    this.size = { x: 30, y: 30 };
    this.duration = duration;
  }

  update(dt: number): void {
    if (!this.collected) {
      this.animationTime += dt;
      // Floating animation
      this.position.y += Math.sin(this.animationTime * 3) * 0.5;
    }
  }

  checkCollision(entityPos: Vector2, entitySize: Vector2): boolean {
    if (this.collected) return false;

    return (
      entityPos.x < this.position.x + this.size.x &&
      entityPos.x + entitySize.x > this.position.x &&
      entityPos.y < this.position.y + this.size.y &&
      entityPos.y + entitySize.y > this.position.y
    );
  }

  collect(): void {
    this.collected = true;
  }

  getColor(): string {
    switch (this.type) {
      case 'speedBoost':
        return '#FF6B00'; // Orange
      case 'shield':
        return '#00BFFF'; // Blue
      case 'doubleJump':
        return '#FF1493'; // Pink
      case 'magnet':
        return '#FFD700'; // Gold
      default:
        return '#FFFFFF';
    }
  }

  getIcon(): string {
    switch (this.type) {
      case 'speedBoost':
        return '⚡';
      case 'shield':
        return '🛡️';
      case 'doubleJump':
        return '⬆️';
      case 'magnet':
        return '🧲';
      default:
        return '?';
    }
  }
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeRemaining: number;
}

export class PowerUpManager {
  private activePowerUps: Map<PowerUpType, number> = new Map();

  update(dt: number): void {
    // Update active power-up timers
    for (const [type, timeRemaining] of this.activePowerUps.entries()) {
      const newTime = timeRemaining - dt;
      if (newTime <= 0) {
        this.activePowerUps.delete(type);
      } else {
        this.activePowerUps.set(type, newTime);
      }
    }
  }

  activatePowerUp(type: PowerUpType, duration: number): void {
    this.activePowerUps.set(type, duration);
  }

  isActive(type: PowerUpType): boolean {
    return this.activePowerUps.has(type);
  }

  getTimeRemaining(type: PowerUpType): number {
    return this.activePowerUps.get(type) || 0;
  }

  getActivePowerUps(): ActivePowerUp[] {
    const result: ActivePowerUp[] = [];
    for (const [type, timeRemaining] of this.activePowerUps.entries()) {
      result.push({ type, timeRemaining });
    }
    return result;
  }

  clear(): void {
    this.activePowerUps.clear();
  }

  // Get multipliers based on active power-ups
  getSpeedMultiplier(): number {
    return this.isActive('speedBoost') ? 1.5 : 1.0;
  }

  hasShield(): boolean {
    return this.isActive('shield');
  }

  hasDoubleJump(): boolean {
    return this.isActive('doubleJump');
  }

  hasMagnet(): boolean {
    return this.isActive('magnet');
  }
}
