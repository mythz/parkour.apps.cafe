import { Vector2, Rectangle } from '../../utils/math';
import { Camera } from '../rendering/Camera';
import { Obstacle } from './Obstacle';

export type EntityState = 'running' | 'jumping' | 'climbing' | 'sliding' | 'falling';

export abstract class Entity {
  position: Vector2;
  velocity: Vector2;
  size: Vector2;
  grounded: boolean = false;
  state: EntityState = 'running';
  distanceTraveled: number = 0;

  // Movement capabilities
  protected readonly runSpeed: number = 200;
  protected readonly jumpForce: number = -400;
  protected readonly climbSpeed: number = 150;
  protected readonly slideSpeed: number = 250;

  // Reference to nearby wall for climbing
  protected nearbyWall: Obstacle | null = null;

  constructor(position: Vector2, size: Vector2) {
    this.position = position;
    this.velocity = { x: 0, y: 0 };
    this.size = size;
  }

  abstract update(dt: number, obstacles: Obstacle[]): void;
  abstract render(ctx: CanvasRenderingContext2D, camera: Camera): void;

  getBounds(): Rectangle {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.size.x,
      height: this.size.y
    };
  }

  protected canJump(): boolean {
    return this.grounded || this.state === 'climbing';
  }

  protected canClimb(wall: Obstacle): boolean {
    if (wall.type !== 'wall') return false;

    const bounds = this.getBounds();
    const wallBounds = {
      x: wall.x,
      y: wall.y,
      width: wall.width,
      height: wall.height
    };

    // Check if entity is adjacent to wall
    const isAdjacent =
      bounds.x + bounds.width >= wallBounds.x - 10 &&
      bounds.x <= wallBounds.x + wallBounds.width + 10 &&
      bounds.y < wallBounds.y + wallBounds.height &&
      bounds.y + bounds.height > wallBounds.y;

    return isAdjacent;
  }

  protected canSlide(): boolean {
    return this.grounded && this.state !== 'sliding';
  }

  protected isAdjacentTo(obstacle: Obstacle): boolean {
    const bounds = this.getBounds();
    const obstBounds = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height
    };

    return (
      bounds.x + bounds.width >= obstBounds.x - 20 &&
      bounds.x <= obstBounds.x + obstBounds.width + 20 &&
      bounds.y < obstBounds.y + obstBounds.height &&
      bounds.y + bounds.height > obstBounds.y
    );
  }

  protected updateNearbyWall(obstacles: Obstacle[]): void {
    this.nearbyWall = null;
    for (const obstacle of obstacles) {
      if (obstacle.type === 'wall' && this.isAdjacentTo(obstacle)) {
        this.nearbyWall = obstacle;
        break;
      }
    }
  }

  getProgress(levelLength: number): number {
    return Math.min((this.position.x / levelLength) * 100, 100);
  }
}
