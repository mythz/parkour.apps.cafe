import { Vector2 } from '../../utils/math';

export class ScreenShake {
  private intensity: number = 0;
  private duration: number = 0;
  private elapsed: number = 0;
  public offset: Vector2 = { x: 0, y: 0 };

  trigger(intensity: number, duration: number): void {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
    this.elapsed = 0;
  }

  update(dt: number): void {
    if (this.elapsed < this.duration) {
      this.elapsed += dt;
      const progress = this.elapsed / this.duration;
      const currentIntensity = this.intensity * (1 - progress);

      this.offset.x = (Math.random() - 0.5) * currentIntensity * 2;
      this.offset.y = (Math.random() - 0.5) * currentIntensity * 2;
    } else {
      this.offset.x = 0;
      this.offset.y = 0;
      this.intensity = 0;
    }
  }

  isActive(): boolean {
    return this.elapsed < this.duration;
  }
}

export class TrailEffect {
  private points: Array<{ position: Vector2; alpha: number; time: number }> = [];
  private readonly maxPoints: number = 10;
  private readonly trailDuration: number = 0.3;

  addPoint(position: Vector2): void {
    this.points.push({
      position: { ...position },
      alpha: 1.0,
      time: 0
    });

    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }

  update(dt: number): void {
    this.points = this.points.filter(point => {
      point.time += dt;
      point.alpha = 1 - (point.time / this.trailDuration);
      return point.time < this.trailDuration;
    });
  }

  render(ctx: CanvasRenderingContext2D, color: string, size: Vector2): void {
    this.points.forEach(point => {
      ctx.globalAlpha = point.alpha * 0.6;
      ctx.fillStyle = color;
      ctx.fillRect(point.position.x, point.position.y, size.x, size.y);
    });
    ctx.globalAlpha = 1.0;
  }

  clear(): void {
    this.points = [];
  }
}

export class FlashEffect {
  private active: boolean = false;
  private duration: number = 0;
  private elapsed: number = 0;
  private color: string = '#FFFFFF';
  private maxAlpha: number = 0.5;

  trigger(color: string, duration: number, alpha: number = 0.5): void {
    this.active = true;
    this.color = color;
    this.duration = duration;
    this.maxAlpha = alpha;
    this.elapsed = 0;
  }

  update(dt: number): void {
    if (this.active) {
      this.elapsed += dt;
      if (this.elapsed >= this.duration) {
        this.active = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.active) {
      const progress = this.elapsed / this.duration;
      const alpha = this.maxAlpha * (1 - progress);

      ctx.fillStyle = this.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }
  }

  isActive(): boolean {
    return this.active;
  }
}
