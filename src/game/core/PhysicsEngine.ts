import { GRAVITY, TERMINAL_VELOCITY } from '../../data/constants';
import { Entity } from '../entities/Entity';
import { Obstacle } from '../entities/Obstacle';
import { CollisionDetection } from './CollisionDetection';

export class PhysicsEngine {
  private readonly gravity: number = GRAVITY;
  private readonly terminalVelocity: number = TERMINAL_VELOCITY;

  applyGravity(entity: Entity, dt: number): void {
    if (!entity.grounded) {
      entity.velocity.y += this.gravity * dt;
      entity.velocity.y = Math.min(entity.velocity.y, this.terminalVelocity);
    }
  }

  updatePosition(entity: Entity, dt: number): void {
    entity.position.x += entity.velocity.x * dt;
    entity.position.y += entity.velocity.y * dt;
  }

  checkGroundCollision(entity: Entity, platforms: Obstacle[]): boolean {
    const entityRect = entity.getBounds();
    let isGrounded = false;

    for (const platform of platforms) {
      if (platform.type !== 'platform' && platform.type !== 'movingPlatform') continue;

      const platformRect = {
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height
      };

      // Check if entity is falling onto platform
      if (
        entity.velocity.y >= 0 &&
        entityRect.x < platformRect.x + platformRect.width &&
        entityRect.x + entityRect.width > platformRect.x &&
        entityRect.y + entityRect.height >= platformRect.y &&
        entityRect.y + entityRect.height <= platformRect.y + platformRect.height
      ) {
        entity.position.y = platformRect.y - entity.size.y;
        entity.velocity.y = 0;
        isGrounded = true;
      }
    }

    return isGrounded;
  }

  resolveCollision(entity: Entity, obstacle: Obstacle): void {
    const entityRect = entity.getBounds();
    const obstacleRect = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height
    };

    if (!CollisionDetection.checkAABB(entityRect, obstacleRect)) {
      return;
    }

    const depth = CollisionDetection.getCollisionDepth(entityRect, obstacleRect);

    // Resolve based on collision depth
    if (Math.abs(depth.x) > Math.abs(depth.y)) {
      entity.position.y -= depth.y;
      if (depth.y < 0) {
        entity.velocity.y = 0;
        entity.grounded = true;
      }
    } else {
      entity.position.x -= depth.x;
      entity.velocity.x = 0;
    }
  }
}
