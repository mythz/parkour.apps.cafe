import { Entity } from './Entity';
import { Vector2 } from '../../utils/math';
import { Camera } from '../rendering/Camera';
import { Obstacle } from './Obstacle';
import { AIController, BotPersonality, AIDecision } from '../ai/AIController';
import { PLAYER_SIZE } from '../../data/constants';

const BOT_COLORS = [
  { primary: '#4A90E2', secondary: '#2E5C8A', accent: '#A8D5FF' },
  { primary: '#E24A4A', secondary: '#8A2E2E', accent: '#FFA8A8' },
  { primary: '#4AE290', secondary: '#2E8A5C', accent: '#A8FFD5' },
  { primary: '#E2904A', secondary: '#8A5C2E', accent: '#FFD5A8' },
  { primary: '#904AE2', secondary: '#5C2E8A', accent: '#D5A8FF' }
];

const BOT_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

export class AIBot extends Entity {
  private aiController: AIController;
  private personality: BotPersonality;
  private currentDecision: AIDecision;
  private reactionDelay: number;
  private decisionTimer: number = 0;
  private color: typeof BOT_COLORS[0];
  public name: string;
  private climbingWall: Obstacle | null = null;

  constructor(
    startPosition: Vector2,
    difficulty: number,
    personality: BotPersonality,
    botIndex: number
  ) {
    super(startPosition, { ...PLAYER_SIZE });
    this.aiController = new AIController();
    this.personality = personality;
    this.currentDecision = { action: 'run', confidence: 1.0 };
    this.reactionDelay = this.calculateReactionDelay(difficulty);
    this.color = BOT_COLORS[botIndex % BOT_COLORS.length];
    this.name = BOT_NAMES[botIndex % BOT_NAMES.length];
  }

  private calculateReactionDelay(difficulty: number): number {
    // Lower delay with higher difficulty
    return Math.max(0.05, 0.2 - (difficulty * 0.15));
  }

  update(dt: number, obstacles: Obstacle[]): void {
    this.updateNearbyWall(obstacles);

    // Make decision periodically
    this.decisionTimer += dt;
    if (this.decisionTimer >= 0.1) {
      this.currentDecision = this.aiController.makeDecision(
        this.position,
        obstacles,
        this.personality
      );
      this.decisionTimer = 0;
    }

    // Execute current decision
    this.executeDecision(dt);
    this.updateState(dt);
    this.updatePosition(dt);
    this.distanceTraveled += Math.abs(this.velocity.x * dt);
  }

  private executeDecision(_dt: number): void {
    // Add human-like imperfection
    const accuracy = 0.85 + (Math.random() * 0.15);

    switch (this.currentDecision.action) {
      case 'jump':
        if (this.canJump() && Math.random() > this.reactionDelay) {
          this.velocity.y = this.jumpForce * accuracy;
          this.state = 'jumping';
          this.grounded = false;
          this.climbingWall = null;
        }
        break;

      case 'slide':
        if (this.canSlide() && Math.random() > this.reactionDelay) {
          this.state = 'sliding';
          this.size.y = 20;
          this.velocity.x = this.slideSpeed;
        }
        break;

      case 'climb':
        if (this.nearbyWall && this.canClimb(this.nearbyWall) && Math.random() > this.reactionDelay) {
          this.startClimbing(this.nearbyWall);
        }
        break;

      case 'run':
      default:
        if (this.state === 'sliding') {
          this.state = 'running';
          this.size.y = PLAYER_SIZE.y;
        }
        if (this.state === 'running' || this.state === 'falling') {
          this.velocity.x = this.runSpeed;
        }
        break;
    }
  }

  private startClimbing(wall: Obstacle): void {
    this.state = 'climbing';
    this.climbingWall = wall;
    this.velocity.x = 0;
    this.velocity.y = 0;
    // Snap to wall edge
    if (this.position.x < wall.x) {
      this.position.x = wall.x - this.size.x;
    } else {
      this.position.x = wall.x + wall.width;
    }
  }

  private updateState(_dt: number): void {
    // Update state based on climbing
    if (this.state === 'climbing') {
      this.velocity.x = 0;
      this.velocity.y = -this.climbSpeed;

      // Check if reached top of wall
      if (this.climbingWall && this.position.y + this.size.y < this.climbingWall.y) {
        this.state = 'running';
        this.velocity.x = this.runSpeed;
        this.velocity.y = 0;
        this.climbingWall = null;
      }
    } else if (this.state !== 'sliding') {
      // Normal state updates
      if (!this.grounded && this.velocity.y > 0) {
        this.state = 'falling';
      } else if (!this.grounded && this.velocity.y < 0) {
        this.state = 'jumping';
      } else if (this.grounded) {
        this.state = 'running';
        this.velocity.x = this.runSpeed;
      }
    }
  }

  private updatePosition(dt: number): void {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw bot character
    ctx.fillStyle = this.color.primary;
    ctx.fillRect(screenPos.x, screenPos.y, this.size.x, this.size.y);

    // Add details
    ctx.fillStyle = this.color.secondary;
    ctx.fillRect(screenPos.x + 4, screenPos.y + 8, 12, 8);

    ctx.fillStyle = this.color.accent;
    ctx.fillRect(screenPos.x + 7, screenPos.y + 2, 6, 6);

    // Draw name tag
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, screenPos.x + this.size.x / 2, screenPos.y - 5);
  }
}
