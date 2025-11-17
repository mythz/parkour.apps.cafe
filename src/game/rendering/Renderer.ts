import { Camera } from './Camera';
import { LevelData } from '../level/LevelData';
import { Entity } from '../entities/Entity';
import { Obstacle } from '../entities/Obstacle';
import { ParticleSystem } from './ParticleSystem';
import { Vector2 } from '../../utils/math';

export interface RacePosition {
  entity: Entity;
  name: string;
  progress: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private particleSystem: ParticleSystem;
  private backgroundOffset: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;
    this.particleSystem = new ParticleSystem();
  }

  getParticleSystem(): ParticleSystem {
    return this.particleSystem;
  }

  clear(): void {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.ctx.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw parallax background
    this.renderBackground();
  }

  private renderBackground(): void {
    // Simple parallax city background
    const layers = [
      { speed: 0.2, color: '#4A5568', y: 400, height: 200 },
      { speed: 0.4, color: '#2D3748', y: 450, height: 150 },
      { speed: 0.6, color: '#1A202C', y: 500, height: 100 }
    ];

    layers.forEach((layer) => {
      this.ctx.fillStyle = layer.color;

      // Draw simple building shapes
      for (let i = 0; i < 10; i++) {
        const x = (i * 150 - this.backgroundOffset * layer.speed) % (this.ctx.canvas.width + 300);
        const buildingHeight = 50 + (i % 3) * 50;

        this.ctx.fillRect(
          x,
          layer.y - buildingHeight,
          120,
          buildingHeight
        );

        // Building windows
        this.ctx.fillStyle = '#FFD700';
        for (let w = 0; w < 3; w++) {
          for (let h = 0; h < 5; h++) {
            if (Math.random() > 0.3) {
              this.ctx.fillRect(x + 20 + w * 30, layer.y - buildingHeight + 10 + h * 20, 15, 10);
            }
          }
        }
        this.ctx.fillStyle = layer.color;
      }
    });

    this.backgroundOffset += 0.5;
  }

  renderLevel(level: LevelData, camera: Camera): void {
    // Draw ground/platforms
    level.segments.forEach(segment => {
      if (!camera.isVisible(segment.x, segment.y, segment.width, segment.height)) {
        return;
      }

      const screenPos = camera.worldToScreen({ x: segment.x, y: segment.y });

      // Platform
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(screenPos.x, screenPos.y, segment.width, segment.height);

      // Platform border
      this.ctx.strokeStyle = '#654321';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenPos.x, screenPos.y, segment.width, segment.height);

      // Add some texture
      this.ctx.fillStyle = '#A0522D';
      for (let i = 0; i < segment.width; i += 30) {
        this.ctx.fillRect(screenPos.x + i, screenPos.y + 5, 20, 10);
      }
    });

    // Draw finish line
    const finishScreen = camera.worldToScreen(level.finishLine);
    this.renderFinishLine(finishScreen);
  }

  renderObstacles(obstacles: Obstacle[], camera: Camera): void {
    obstacles.forEach(obstacle => {
      if (obstacle.type === 'platform') return; // Already rendered

      if (!camera.isVisible(obstacle.x, obstacle.y, obstacle.width, obstacle.height)) {
        return;
      }

      const screenPos = camera.worldToScreen({ x: obstacle.x, y: obstacle.y });

      switch (obstacle.type) {
        case 'wall':
          this.renderWall(screenPos, obstacle);
          break;
        case 'vent':
          this.renderVent(screenPos, obstacle);
          break;
        case 'gap':
          // Gaps are empty space, just render warning marks
          this.renderGapWarning(screenPos, obstacle);
          break;
        case 'lowBarrier':
          this.renderLowBarrier(screenPos, obstacle);
          break;
        case 'spring':
          this.renderSpring(screenPos, obstacle);
          break;
        case 'dashPad':
          this.renderDashPad(screenPos, obstacle);
          break;
        case 'spike':
          this.renderSpike(screenPos, obstacle);
          break;
      }
    });
  }

  private renderWall(screenPos: Vector2, wall: Obstacle): void {
    this.ctx.fillStyle = '#696969';
    this.ctx.fillRect(screenPos.x, screenPos.y, wall.width, wall.height);

    // Add brick pattern
    this.ctx.strokeStyle = '#505050';
    this.ctx.lineWidth = 1;
    for (let y = 0; y < wall.height; y += 20) {
      for (let x = 0; x < wall.width; x += 30) {
        this.ctx.strokeRect(screenPos.x + x, screenPos.y + y, 30, 20);
      }
    }

    // Climbing indicators
    if (wall.isClimbable()) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('▲', screenPos.x + wall.width / 2, screenPos.y + 20);
    }
  }

  private renderVent(screenPos: Vector2, vent: Obstacle): void {
    this.ctx.fillStyle = '#2C2C2C';
    this.ctx.fillRect(screenPos.x, screenPos.y, vent.width, vent.height);

    // Vent grill pattern
    this.ctx.strokeStyle = '#1A1A1A';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < vent.width; i += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(screenPos.x + i, screenPos.y);
      this.ctx.lineTo(screenPos.x + i, screenPos.y + vent.height);
      this.ctx.stroke();
    }

    // Slide indicator
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('▼', screenPos.x + vent.width / 2, screenPos.y - 5);
  }

  private renderGapWarning(screenPos: Vector2, _gap: Obstacle): void {
    // Draw warning stripes at gap edge
    this.ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 3; i++) {
      this.ctx.fillRect(screenPos.x - 10, screenPos.y - 5 - i * 10, 10, 5);
    }
  }

  private renderLowBarrier(screenPos: Vector2, barrier: Obstacle): void {
    this.ctx.fillStyle = '#FF6347';
    this.ctx.fillRect(screenPos.x, screenPos.y, barrier.width, barrier.height);

    this.ctx.strokeStyle = '#DC143C';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(screenPos.x, screenPos.y, barrier.width, barrier.height);
  }

  private renderSpring(screenPos: Vector2, spring: Obstacle): void {
    // Spring coil
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(screenPos.x, screenPos.y, spring.width, spring.height);

    // Draw coil pattern
    this.ctx.strokeStyle = '#2E7D32';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    const coils = 3;
    for (let i = 0; i < coils; i++) {
      const y = screenPos.y + (i * spring.height / coils);
      this.ctx.moveTo(screenPos.x, y);
      this.ctx.lineTo(screenPos.x + spring.width, y);
    }
    this.ctx.stroke();

    // Arrow indicator
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('↑', screenPos.x + spring.width / 2, screenPos.y - 5);
  }

  private renderDashPad(screenPos: Vector2, pad: Obstacle): void {
    // Dash pad with arrows
    this.ctx.fillStyle = '#FF6B00';
    this.ctx.fillRect(screenPos.x, screenPos.y, pad.width, pad.height);

    // Draw speed arrows
    this.ctx.fillStyle = '#FFD700';
    const arrowCount = 3;
    const arrowSpacing = pad.width / (arrowCount + 1);

    for (let i = 1; i <= arrowCount; i++) {
      const x = screenPos.x + (i * arrowSpacing);
      const y = screenPos.y + pad.height / 2;

      this.ctx.beginPath();
      this.ctx.moveTo(x - 5, y);
      this.ctx.lineTo(x + 5, y);
      this.ctx.lineTo(x + 2, y - 3);
      this.ctx.moveTo(x + 5, y);
      this.ctx.lineTo(x + 2, y + 3);
      this.ctx.stroke();
    }
  }

  private renderSpike(screenPos: Vector2, spike: Obstacle): void {
    // Dangerous spikes
    this.ctx.fillStyle = '#8B0000';
    const spikeCount = Math.floor(spike.width / 20);

    for (let i = 0; i < spikeCount; i++) {
      const x = screenPos.x + (i * (spike.width / spikeCount));

      this.ctx.beginPath();
      this.ctx.moveTo(x, screenPos.y + spike.height);
      this.ctx.lineTo(x + spike.width / spikeCount / 2, screenPos.y);
      this.ctx.lineTo(x + spike.width / spikeCount, screenPos.y + spike.height);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  private renderFinishLine(screenPos: Vector2): void {
    // Checkered flag pattern
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(screenPos.x - 10, screenPos.y - 100, 20, 100);

    const squareSize = 10;
    for (let y = 0; y < 100; y += squareSize) {
      for (let x = 0; x < 20; x += squareSize) {
        if ((x / squareSize + y / squareSize) % 2 === 0) {
          this.ctx.fillStyle = '#000000';
        } else {
          this.ctx.fillStyle = '#FFFFFF';
        }
        this.ctx.fillRect(screenPos.x - 10 + x, screenPos.y - 100 + y, squareSize, squareSize);
      }
    }

    // "FINISH" text
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FINISH', screenPos.x, screenPos.y - 110);
  }

  renderEntities(entities: Entity[], camera: Camera): void {
    // Sort by y position for proper depth rendering
    const sorted = [...entities].sort((a, b) => a.position.y - b.position.y);

    sorted.forEach(entity => {
      if (camera.isVisible(entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
        entity.render(this.ctx, camera);
      }
    });
  }

  renderUI(racePositions: RacePosition[], currentLevel: number): void {
    const padding = 10;
    const width = 250;
    const height = 40 + racePositions.length * 30;

    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(padding, padding, width, height);

    // Border
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(padding, padding, width, height);

    // Level number
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Level ${currentLevel}`, padding + 10, padding + 25);

    // Race positions
    racePositions.forEach((racer, index) => {
      const y = padding + 50 + (index * 30);
      const isPlayer = racer.name === 'YOU';

      this.ctx.fillStyle = isPlayer ? '#FFD700' : '#FFFFFF';
      this.ctx.font = isPlayer ? 'bold 14px Arial' : '14px Arial';
      this.ctx.fillText(
        `${index + 1}. ${racer.name} - ${racer.progress.toFixed(0)}%`,
        padding + 10,
        y
      );
    });
  }

  renderParticles(camera: Camera): void {
    this.particleSystem.render(this.ctx, camera);
  }

  updateParticles(dt: number): void {
    this.particleSystem.update(dt);
  }

  renderPowerUps(powerUps: Array<{ position: Vector2; size: Vector2; type: string; getColor: () => string; getIcon: () => string; collected: boolean }>, camera: Camera): void {
    powerUps.forEach(powerUp => {
      if (powerUp.collected) return;

      if (!camera.isVisible(powerUp.position.x, powerUp.position.y, powerUp.size.x, powerUp.size.y)) {
        return;
      }

      const screenPos = camera.worldToScreen(powerUp.position);

      // Glow effect
      const gradient = this.ctx.createRadialGradient(
        screenPos.x + powerUp.size.x / 2,
        screenPos.y + powerUp.size.y / 2,
        0,
        screenPos.x + powerUp.size.x / 2,
        screenPos.y + powerUp.size.y / 2,
        powerUp.size.x
      );

      gradient.addColorStop(0, powerUp.getColor());
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        screenPos.x - powerUp.size.x / 2,
        screenPos.y - powerUp.size.y / 2,
        powerUp.size.x * 2,
        powerUp.size.y * 2
      );

      // Power-up box
      this.ctx.fillStyle = powerUp.getColor();
      this.ctx.fillRect(screenPos.x, screenPos.y, powerUp.size.x, powerUp.size.y);

      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(screenPos.x, screenPos.y, powerUp.size.x, powerUp.size.y);

      // Icon
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        powerUp.getIcon(),
        screenPos.x + powerUp.size.x / 2,
        screenPos.y + powerUp.size.y / 2
      );
    });
  }

  renderActivePowerUps(activePowerUps: Array<{ type: string; timeRemaining: number }>, width: number): void {
    const startY = 80;
    const boxHeight = 40;

    activePowerUps.forEach((powerUp, index) => {
      const y = startY + (index * (boxHeight + 5));

      // Background
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(width - 160, y, 150, boxHeight);

      // Border
      this.ctx.strokeStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(width - 160, y, 150, boxHeight);

      // Icon and name
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(
        `${this.getPowerUpIcon(powerUp.type)} ${this.getPowerUpName(powerUp.type)}`,
        width - 150,
        y + 15
      );

      // Timer
      this.ctx.fillText(
        `${powerUp.timeRemaining.toFixed(1)}s`,
        width - 150,
        y + 30
      );

      // Progress bar
      const barWidth = 140;
      const progress = powerUp.timeRemaining / 5; // Assuming 5s duration
      this.ctx.fillStyle = this.getPowerUpColor(powerUp.type);
      this.ctx.fillRect(width - 155, y + boxHeight - 8, barWidth * progress, 4);
    });
  }

  private getPowerUpColor(type: string): string {
    switch (type) {
      case 'speedBoost': return '#FF6B00';
      case 'shield': return '#00BFFF';
      case 'doubleJump': return '#FF1493';
      case 'magnet': return '#FFD700';
      default: return '#FFFFFF';
    }
  }

  private getPowerUpIcon(type: string): string {
    switch (type) {
      case 'speedBoost': return '⚡';
      case 'shield': return '🛡️';
      case 'doubleJump': return '⬆️';
      case 'magnet': return '🧲';
      default: return '?';
    }
  }

  private getPowerUpName(type: string): string {
    switch (type) {
      case 'speedBoost': return 'Speed';
      case 'shield': return 'Shield';
      case 'doubleJump': return 'Double Jump';
      case 'magnet': return 'Magnet';
      default: return 'Unknown';
    }
  }

  renderCombo(combo: number, multiplier: number, rank: string): void {
    if (combo === 0) return;

    const centerX = this.ctx.canvas.width / 2;
    const y = 100;

    // Combo background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(centerX - 100, y - 30, 200, 60);

    // Combo text
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${combo}x COMBO`, centerX, y);

    // Rank
    if (rank) {
      this.ctx.fillStyle = '#FF6B00';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(rank, centerX, y + 20);
    }

    // Multiplier
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`${multiplier.toFixed(1)}x Multiplier`, centerX, y - 15);
  }
}
