import { Entity } from './Entity';
import { Vector2 } from '../../utils/math';
import { Camera } from '../rendering/Camera';
import { OutfitData } from '../../data/outfits';
import { Obstacle } from './Obstacle';
import { PLAYER_SIZE, PLAYER_SLIDE_HEIGHT } from '../../data/constants';

export interface InputState {
  jump: boolean;
  slide: boolean;
  climb: boolean;
}

export class Player extends Entity {
  private inputState: InputState = { jump: false, slide: false, climb: false };
  private outfit: OutfitData;
  private climbingWall: Obstacle | null = null;

  constructor(startPosition: Vector2, outfit: OutfitData) {
    super(startPosition, { ...PLAYER_SIZE });
    this.outfit = outfit;
    
    
    
  }

  setInputState(inputState: InputState): void {
    this.inputState = inputState;
  }

  update(dt: number, obstacles: Obstacle[]): void {
    this.updateNearbyWall(obstacles);
    this.handleInput(dt);
    this.updateState(dt);
    this.updatePosition(dt);
    this.distanceTraveled += Math.abs(this.velocity.x * dt);
  }

  private handleInput(_dt: number): void {
    // Jump
    if (this.inputState.jump && this.canJump()) {
      this.velocity.y = this.jumpForce;
      this.state = 'jumping';
      this.grounded = false;
      this.climbingWall = null;
    }

    // Slide
    if (this.inputState.slide && this.canSlide()) {
      this.state = 'sliding';
      this.velocity.x = this.slideSpeed;
      this.size.y = PLAYER_SLIDE_HEIGHT;
    } else if (this.state === 'sliding' && !this.inputState.slide) {
      this.state = 'running';
      this.size.y = PLAYER_SIZE.y;
    }

    // Climb
    if (this.inputState.climb && this.nearbyWall && this.canClimb(this.nearbyWall)) {
      this.startClimbing(this.nearbyWall);
    }

    // Horizontal movement
    if (this.state === 'running' || this.state === 'jumping' || this.state === 'falling') {
      this.velocity.x = this.runSpeed;
    } else if (this.state === 'climbing') {
      if (this.inputState.jump) {
        // Jump off wall
        this.velocity.x = this.runSpeed;
        this.velocity.y = this.jumpForce * 0.8;
        this.state = 'jumping';
        this.climbingWall = null;
      } else {
        this.velocity.x = 0;
        this.velocity.y = -this.climbSpeed;
      }
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
    // Update state based on velocity
    if (this.state !== 'climbing' && this.state !== 'sliding') {
      if (!this.grounded && this.velocity.y > 0) {
        this.state = 'falling';
      } else if (!this.grounded && this.velocity.y < 0) {
        this.state = 'jumping';
      } else if (this.grounded) {
        this.state = 'running';
      }
    }

    // Check if still on climbing wall
    if (this.state === 'climbing' && this.climbingWall) {
      if (this.position.y + this.size.y < this.climbingWall.y) {
        // Reached top of wall
        this.state = 'running';
        this.velocity.x = this.runSpeed;
        this.climbingWall = null;
      }
    }
  }

  private updatePosition(dt: number): void {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);

    // Draw character based on state and outfit colors
    ctx.fillStyle = this.outfit.colors.primary;

    if (this.state === 'sliding') {
      // Draw sliding character (wider, shorter)
      ctx.fillRect(screenPos.x, screenPos.y, this.size.x, this.size.y);
      ctx.fillStyle = this.outfit.colors.secondary;
      ctx.fillRect(screenPos.x + 2, screenPos.y + 2, this.size.x - 4, this.size.y - 4);
    } else {
      // Draw normal character
      ctx.fillRect(screenPos.x, screenPos.y, this.size.x, this.size.y);

      // Add details
      ctx.fillStyle = this.outfit.colors.secondary;
      ctx.fillRect(screenPos.x + 4, screenPos.y + 8, 12, 8); // Torso detail

      ctx.fillStyle = this.outfit.colors.accent;
      ctx.fillRect(screenPos.x + 7, screenPos.y + 2, 6, 6); // Head detail

      // Simple limb animation based on state
      this.renderLimbs(ctx, screenPos);
    }

    // Draw name tag
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', screenPos.x + this.size.x / 2, screenPos.y - 5);
  }

  private renderLimbs(ctx: CanvasRenderingContext2D, screenPos: Vector2): void {
    const time = Date.now() / 100;
    const legOffset = Math.sin(time) * 3;

    ctx.fillStyle = this.outfit.colors.secondary;

    // Legs
    if (this.state === 'running') {
      ctx.fillRect(screenPos.x + 5, screenPos.y + this.size.y - 15 + legOffset, 4, 10);
      ctx.fillRect(screenPos.x + 11, screenPos.y + this.size.y - 15 - legOffset, 4, 10);
    } else {
      ctx.fillRect(screenPos.x + 5, screenPos.y + this.size.y - 15, 4, 10);
      ctx.fillRect(screenPos.x + 11, screenPos.y + this.size.y - 15, 4, 10);
    }
  }

  setOutfit(outfit: OutfitData): void {
    this.outfit = outfit;
  }
}
