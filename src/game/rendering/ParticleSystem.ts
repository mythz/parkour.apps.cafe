import { Vector2 } from '../../utils/math';
import { Camera } from './Camera';
import { Color, rgbToString } from '../../utils/color';

export type ParticleType = 'dust' | 'spark' | 'coin';

export interface Particle {
  position: Vector2;
  velocity: Vector2;
  life: number;
  maxLife: number;
  size: number;
  color: Color;
  type: ParticleType;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(type: ParticleType, position: Vector2, count: number): void {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(type, position));
    }
  }

  private createParticle(type: ParticleType, position: Vector2): Particle {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 100;

    let color: Color;
    let life: number;
    let size: number;

    switch (type) {
      case 'dust':
        color = { r: 150, g: 150, b: 150, a: 0.8 };
        life = 0.3 + Math.random() * 0.3;
        size = 2 + Math.random() * 3;
        break;
      case 'spark':
        color = { r: 255, g: 200, b: 0, a: 1.0 };
        life = 0.2 + Math.random() * 0.2;
        size = 1 + Math.random() * 2;
        break;
      case 'coin':
        color = { r: 255, g: 215, b: 0, a: 1.0 };
        life = 0.5 + Math.random() * 0.3;
        size = 3 + Math.random() * 2;
        break;
    }

    return {
      position: { x: position.x, y: position.y },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 100
      },
      life,
      maxLife: life,
      size,
      color,
      type
    };
  }

  update(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.velocity.y += 200 * dt; // Gravity
      p.velocity.x *= 0.98; // Air resistance

      return p.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    this.particles.forEach(particle => {
      const screenPos = camera.worldToScreen(particle.position);
      const alpha = (particle.life / particle.maxLife) * (particle.color.a || 1);

      ctx.fillStyle = rgbToString({ ...particle.color, a: alpha });
      ctx.fillRect(
        screenPos.x - particle.size / 2,
        screenPos.y - particle.size / 2,
        particle.size,
        particle.size
      );
    });
  }

  emitLandingDust(position: Vector2): void {
    this.emit('dust', position, 8);
  }

  emitCoinEffect(position: Vector2): void {
    this.emit('coin', position, 15);
  }

  clear(): void {
    this.particles = [];
  }
}
