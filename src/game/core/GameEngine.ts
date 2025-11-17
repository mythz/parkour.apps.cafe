import { Player } from '../entities/Player';
import { AIBot } from '../entities/AIBot';
import { PhysicsEngine } from './PhysicsEngine';
import { Renderer, RacePosition } from '../rendering/Renderer';
import { Camera } from '../rendering/Camera';
import { InputManager } from './InputManager';
import { LevelData } from '../level/LevelData';
import { LevelGenerator } from '../level/LevelGenerator';
import { OutfitData } from '../../data/outfits';
import { FIXED_TIME_STEP, NUM_BOTS } from '../../data/constants';
import { Entity } from '../entities/Entity';
import { createBotPersonality } from '../ai/AIController';

export type GameState = 'countdown' | 'running' | 'paused' | 'finished';

export interface RaceResult {
  position: number;
  levelNumber: number;
  completionTime: number;
  coinsEarned: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private levelNumber: number;

  // Core systems
  private physicsEngine: PhysicsEngine;
  private renderer: Renderer;
  private camera: Camera;
  private inputManager: InputManager;

  // Game entities
  private player: Player;
  private bots: AIBot[] = [];
  private levelData: LevelData;

  // Game state
  private gameState: GameState = 'countdown';
  private countdownTimer: number = 3;
  private raceTime: number = 0;
  private animationFrameId: number | null = null;

  // Game loop timing
  private lastFrameTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = FIXED_TIME_STEP;

  // Callbacks
  public onPositionUpdate: ((positions: RacePosition[]) => void) | null = null;
  public onRaceComplete: ((result: RaceResult) => void) | null = null;
  public onCountdown: ((count: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, levelNumber: number, playerOutfit: OutfitData) {
    this.canvas = canvas;
    this.levelNumber = levelNumber;

    // Initialize systems
    this.physicsEngine = new PhysicsEngine();
    this.renderer = new Renderer(canvas);
    this.camera = new Camera(canvas.width, canvas.height);
    this.inputManager = new InputManager(canvas);

    // Generate level
    const generator = new LevelGenerator();
    this.levelData = generator.generateLevel(levelNumber);
    this.camera.setLevelLength(this.levelData.length);

    // Create player
    this.player = new Player({ ...this.levelData.startPosition }, playerOutfit);

    // Create AI bots
    const difficulty = this.levelData.difficulty;
    for (let i = 0; i < NUM_BOTS; i++) {
      const botStartPos = {
        x: this.levelData.startPosition.x,
        y: this.levelData.startPosition.y
      };
      const personality = createBotPersonality(difficulty);
      const bot = new AIBot(botStartPos, difficulty, personality, i);
      this.bots.push(bot);
    }
  }

  start(): void {
    this.gameState = 'countdown';
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  pause(): void {
    this.gameState = 'paused';
  }

  resume(): void {
    if (this.gameState === 'paused') {
      this.gameState = 'running';
      this.lastFrameTime = performance.now();
      this.accumulator = 0;
    }
  }

  private gameLoop(currentTime: number): void {
    if (this.gameState === 'paused') {
      this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
      return;
    }

    const deltaTime = Math.min(currentTime - this.lastFrameTime, 100); // Cap at 100ms
    this.lastFrameTime = currentTime;

    if (this.gameState === 'countdown') {
      this.updateCountdown(deltaTime / 1000);
      this.render();
      this.renderCountdown();
    } else if (this.gameState === 'running') {
      this.accumulator += deltaTime;

      // Fixed update for physics
      while (this.accumulator >= this.fixedTimeStep) {
        this.fixedUpdate(this.fixedTimeStep / 1000);
        this.accumulator -= this.fixedTimeStep;
      }

      // Variable update for rendering
      this.render();
    } else if (this.gameState === 'finished') {
      this.render();
      return; // Stop the loop
    }

    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private updateCountdown(dt: number): void {
    this.countdownTimer -= dt;

    if (this.onCountdown) {
      this.onCountdown(Math.ceil(this.countdownTimer));
    }

    if (this.countdownTimer <= 0) {
      this.gameState = 'running';
      this.raceTime = 0;
    }
  }

  private renderCountdown(): void {
    const ctx = this.canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const count = Math.ceil(this.countdownTimer);
    if (count > 0) {
      ctx.fillText(count.toString(), this.canvas.width / 2, this.canvas.height / 2);
    } else {
      ctx.fillText('GO!', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  private fixedUpdate(dt: number): void {
    this.raceTime += dt;

    // Update input
    const inputState = this.inputManager.getInputState();
    this.player.setInputState(inputState);

    // Update entities
    this.player.update(dt, this.levelData.obstacles);
    this.bots.forEach(bot => bot.update(dt, this.levelData.obstacles));

    // Apply physics
    const allEntities: Entity[] = [this.player, ...this.bots];
    allEntities.forEach(entity => {
      this.physicsEngine.applyGravity(entity, dt);
      entity.grounded = this.physicsEngine.checkGroundCollision(entity, this.levelData.obstacles);
    });

    // Update camera to follow player
    this.camera.follow(this.player);

    // Update particles
    this.renderer.updateParticles(dt);

    // Check race status
    this.checkRaceStatus();

    // Update race positions
    this.updateRacePositions();
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.renderLevel(this.levelData, this.camera);
    this.renderer.renderObstacles(this.levelData.obstacles, this.camera);

    const allEntities: Entity[] = [this.player, ...this.bots];
    this.renderer.renderEntities(allEntities, this.camera);

    this.renderer.renderParticles(this.camera);

    const positions = this.getRacePositions();
    this.renderer.renderUI(positions, this.levelNumber);
  }

  private checkRaceStatus(): void {
    // Check if player reached finish line
    if (this.player.position.x >= this.levelData.finishLine.x) {
      this.finishRace();
    }

    // Check if all bots finished (player timeout)
    const allBotsFinished = this.bots.every(
      bot => bot.position.x >= this.levelData.finishLine.x
    );

    if (allBotsFinished && this.player.position.x < this.levelData.finishLine.x) {
      this.finishRace();
    }
  }

  private finishRace(): void {
    this.gameState = 'finished';

    const position = this.getPlayerPosition();
    const coinsEarned = this.calculateReward(position);

    const result: RaceResult = {
      position,
      levelNumber: this.levelNumber,
      completionTime: this.raceTime,
      coinsEarned
    };

    if (this.onRaceComplete) {
      this.onRaceComplete(result);
    }

    // Emit celebration particles
    if (position === 1) {
      this.renderer.getParticleSystem().emitCoinEffect(this.player.position);
    }
  }

  private getPlayerPosition(): number {
    const allEntities = [this.player, ...this.bots];
    const sorted = [...allEntities].sort((a, b) => b.position.x - a.position.x);
    return sorted.indexOf(this.player) + 1;
  }

  private calculateReward(position: number): number {
    const baseReward = 50;
    const positionMultipliers = [1.0, 0.8, 0.6, 0.4, 0.2, 0.0];
    const multiplier = positionMultipliers[position - 1] || 0;
    return Math.floor(baseReward * multiplier);
  }

  private getRacePositions(): RacePosition[] {
    const positions: RacePosition[] = [];

    positions.push({
      entity: this.player,
      name: 'YOU',
      progress: this.player.getProgress(this.levelData.length)
    });

    this.bots.forEach(bot => {
      positions.push({
        entity: bot,
        name: bot.name,
        progress: bot.getProgress(this.levelData.length)
      });
    });

    return positions.sort((a, b) => b.progress - a.progress);
  }

  private updateRacePositions(): void {
    if (this.onPositionUpdate) {
      this.onPositionUpdate(this.getRacePositions());
    }
  }

  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputManager.destroy();
  }
}
