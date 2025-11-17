import { Rectangle, Vector2 } from '../../utils/math';

export class CollisionDetection {
  static checkAABB(a: Rectangle, b: Rectangle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  static getCollisionNormal(a: Rectangle, b: Rectangle): Vector2 {
    // Calculate overlap on each axis
    const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
    const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

    // Return normal based on smallest overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      return { x: a.x < b.x ? -1 : 1, y: 0 };
    } else {
      // Vertical collision
      return { x: 0, y: a.y < b.y ? -1 : 1 };
    }
  }

  static getCollisionDepth(a: Rectangle, b: Rectangle): Vector2 {
    const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
    const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

    if (overlapX < overlapY) {
      return { x: a.x < b.x ? overlapX : -overlapX, y: 0 };
    } else {
      return { x: 0, y: a.y < b.y ? overlapY : -overlapY };
    }
  }
}
