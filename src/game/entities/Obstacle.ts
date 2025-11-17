export type ObstacleType =
  | 'platform'
  | 'gap'
  | 'wall'
  | 'lowBarrier'
  | 'vent'
  | 'movingPlatform'
  | 'fallingPlatform';

export interface ObstacleProperties {
  climbable?: boolean;
  movementSpeed?: number;
  movementRange?: number;
  fallDelay?: number;
}

export class Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: ObstacleProperties;

  constructor(
    type: ObstacleType,
    x: number,
    y: number,
    width: number,
    height: number,
    properties: ObstacleProperties = {}
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.properties = properties;
  }

  update(dt: number): void {
    // Update moving platforms
    if (this.type === 'movingPlatform' && this.properties.movementSpeed) {
      // Simple horizontal movement
      this.x += this.properties.movementSpeed * dt;
    }
  }

  isClimbable(): boolean {
    return this.type === 'wall' && (this.properties.climbable !== false);
  }
}
