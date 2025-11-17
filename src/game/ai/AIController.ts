import { Vector2 } from '../../utils/math';
import { Obstacle } from '../entities/Obstacle';
import { AI_LOOKAHEAD_DISTANCE } from '../../data/constants';

export type AIAction = 'run' | 'jump' | 'slide' | 'climb';

export interface AIDecision {
  action: AIAction;
  confidence: number;
}

export type BotPersonalityType = 'aggressive' | 'cautious' | 'balanced';

export interface BotPersonality {
  type: BotPersonalityType;
  riskTolerance: number; // 0-1
  reactionSpeed: number; // 0-1
  mistakeChance: number; // 0-1
}

export class AIController {
  private readonly lookAheadDistance: number = AI_LOOKAHEAD_DISTANCE;

  makeDecision(
    botPosition: Vector2,
    obstacles: Obstacle[],
    personality: BotPersonality
  ): AIDecision {
    const upcomingObstacles = this.getUpcomingObstacles(botPosition, obstacles);

    if (upcomingObstacles.length === 0) {
      return { action: 'run', confidence: 1.0 };
    }

    const nextObstacle = upcomingObstacles[0];
    const distanceToObstacle = nextObstacle.x - botPosition.x;

    // Random mistakes based on personality
    if (Math.random() < personality.mistakeChance) {
      return { action: 'run', confidence: 0.3 };
    }

    return this.evaluateObstacle(nextObstacle, distanceToObstacle, personality);
  }

  private getUpcomingObstacles(position: Vector2, obstacles: Obstacle[]): Obstacle[] {
    return obstacles
      .filter(obs => obs.x > position.x && obs.x - position.x < this.lookAheadDistance)
      .sort((a, b) => a.x - b.x);
  }

  private evaluateObstacle(
    obstacle: Obstacle,
    distance: number,
    personality: BotPersonality
  ): AIDecision {
    switch (obstacle.type) {
      case 'gap':
        return this.handleGap(obstacle, distance, personality);
      case 'wall':
        return this.handleWall(obstacle, distance, personality);
      case 'lowBarrier':
        return this.handleLowBarrier(obstacle, distance, personality);
      case 'vent':
        return this.handleVent(obstacle, distance, personality);
      default:
        return { action: 'run', confidence: 0.5 };
    }
  }

  private handleGap(
    _gap: Obstacle,
    distance: number,
    personality: BotPersonality
  ): AIDecision {
    const optimalJumpDistance = 80;
    const jumpWindow = 20;

    if (distance < optimalJumpDistance - jumpWindow) {
      return { action: 'run', confidence: 0.9 };
    }

    if (distance >= optimalJumpDistance - jumpWindow && distance <= optimalJumpDistance + jumpWindow) {
      const confidence = personality.type === 'aggressive' ? 0.95 : 0.85;
      return { action: 'jump', confidence };
    }

    return { action: 'run', confidence: 0.7 };
  }

  private handleWall(
    wall: Obstacle,
    distance: number,
    _personality: BotPersonality
  ): AIDecision {
    if (wall.height > 100) {
      // Must climb tall walls
      if (distance < 30) {
        return { action: 'climb', confidence: 0.9 };
      }
    } else {
      // Can jump over short walls
      if (distance < 60 && distance > 30) {
        return { action: 'jump', confidence: 0.85 };
      }
    }

    return { action: 'run', confidence: 0.8 };
  }

  private handleLowBarrier(
    _barrier: Obstacle,
    distance: number,
    _personality: BotPersonality
  ): AIDecision {
    const optimalJumpDistance = 60;

    if (distance < optimalJumpDistance + 20 && distance > optimalJumpDistance - 20) {
      return { action: 'jump', confidence: 0.88 };
    }

    return { action: 'run', confidence: 0.75 };
  }

  private handleVent(
    _vent: Obstacle,
    distance: number,
    _personality: BotPersonality
  ): AIDecision {
    const slideStartDistance = 80;

    if (distance < slideStartDistance + 20 && distance > slideStartDistance - 20) {
      return { action: 'slide', confidence: 0.88 };
    }

    return { action: 'run', confidence: 0.75 };
  }
}

export function createBotPersonality(difficulty: number): BotPersonality {
  const types: BotPersonalityType[] = ['aggressive', 'cautious', 'balanced'];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    type,
    riskTolerance: 0.5 + (difficulty * 0.3),
    reactionSpeed: 0.6 + (difficulty * 0.3),
    mistakeChance: Math.max(0.05, 0.2 - (difficulty * 0.15))
  };
}
