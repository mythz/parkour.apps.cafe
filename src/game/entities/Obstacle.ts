export type ObstacleType =
  | 'platform'
  | 'gap'
  | 'wall'
  | 'lowBarrier'
  | 'vent'
  | 'movingPlatform'
  | 'fallingPlatform'
  | 'spring'
  | 'dashPad'
  | 'spike';

export interface ObstacleProperties {
  climbable?: boolean;
  movementSpeed?: number;
  movementRange?: number;
  fallDelay?: number;
  springForce?: number;
  dashSpeed?: number;
  dangerous?: boolean;
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

      // Reverse direction if at range limit
      if (this.properties.movementRange) {
        const range = this.properties.movementRange;
        if (Math.abs(this.x) > range) {
          this.properties.movementSpeed = -this.properties.movementSpeed;
        }
      }
    }
  }

  isClimbable(): boolean {
    return this.type === 'wall' && (this.properties.climbable !== false);
  }

  isSpring(): boolean {
    return this.type === 'spring';
  }

  isDashPad(): boolean {
    return this.type === 'dashPad';
  }

  isDangerous(): boolean {
    return this.type === 'spike' || this.properties.dangerous === true;
  }

  getSpringForce(): number {
    return this.properties.springForce || -600;
  }

  getDashSpeed(): number {
    return this.properties.dashSpeed || 400;
  }
}
