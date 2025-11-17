import { Vector2 } from '../../utils/math';
import { Entity } from '../entities/Entity';
import { CAMERA_SMOOTHING } from '../../data/constants';

export class Camera {
  position: Vector2;
  viewport: Vector2;
  private readonly smoothing: number = CAMERA_SMOOTHING;
  
  private levelLength: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewport = { x: viewportWidth, y: viewportHeight };
    this.position = { x: 0, y: 0 };
  }

  setLevelLength(length: number): void {
    this.levelLength = length;
  }

  follow(entity: Entity): void {
    

    // Smooth camera following - keep player in left third of screen
    const targetX = entity.position.x - this.viewport.x / 3;
    const targetY = entity.position.y - this.viewport.y / 2;

    this.position.x += (targetX - this.position.x) * this.smoothing;
    this.position.y += (targetY - this.position.y) * this.smoothing;

    // Keep camera within level bounds
    this.clampToBounds();
  }

  private clampToBounds(): void {
    // Don't go below x = 0
    this.position.x = Math.max(0, this.position.x);

    // Don't go past level end
    if (this.levelLength > 0) {
      this.position.x = Math.min(this.position.x, this.levelLength - this.viewport.x);
    }

    // Keep some vertical bounds
    this.position.y = Math.max(-200, this.position.y);
    this.position.y = Math.min(200, this.position.y);
  }

  worldToScreen(worldPos: Vector2): Vector2 {
    return {
      x: worldPos.x - this.position.x,
      y: worldPos.y - this.position.y
    };
  }

  screenToWorld(screenPos: Vector2): Vector2 {
    return {
      x: screenPos.x + this.position.x,
      y: screenPos.y + this.position.y
    };
  }

  isVisible(worldX: number, worldY: number, width: number, height: number): boolean {
    const screenX = worldX - this.position.x;
    const screenY = worldY - this.position.y;

    return (
      screenX + width > -100 &&
      screenX < this.viewport.x + 100 &&
      screenY + height > -100 &&
      screenY < this.viewport.y + 100
    );
  }
}
