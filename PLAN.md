# Parkour Race Game - Complete Implementation Plan

## 1. Project Overview

### Game Concept
A 2.5D side-scrolling parkour racing game where players compete against 5 AI bots through 1000 progressively challenging levels. Players perform parkour moves (jumping, climbing, sliding) while racing to the finish line to earn coins for cosmetic unlocks.

### Technical Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Rendering**: HTML5 Canvas (2D Context)
- **Storage**: IndexedDB (primary) + localStorage (settings backup)
- **Physics**: Custom lightweight physics engine
- **State Management**: React Context API + useReducer

---

## 2. Project Structure

```
parkour-race/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Game/
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── GameHUD.tsx
│   │   │   ├── PauseMenu.tsx
│   │   │   └── GameOverScreen.tsx
│   │   ├── Menu/
│   │   │   ├── MainMenu.tsx
│   │   │   ├── LevelSelect.tsx
│   │   │   ├── Shop.tsx
│   │   │   └── SettingsMenu.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── ProgressBar.tsx
│   │       └── CoinDisplay.tsx
│   ├── game/
│   │   ├── core/
│   │   │   ├── GameEngine.ts
│   │   │   ├── GameLoop.ts
│   │   │   ├── PhysicsEngine.ts
│   │   │   └── CollisionDetection.ts
│   │   ├── entities/
│   │   │   ├── Player.ts
│   │   │   ├── AIBot.ts
│   │   │   ├── Entity.ts (base class)
│   │   │   └── Obstacle.ts
│   │   ├── level/
│   │   │   ├── LevelGenerator.ts
│   │   │   ├── LevelData.ts
│   │   │   └── ObstacleFactory.ts
│   │   ├── ai/
│   │   │   ├── AIController.ts
│   │   │   ├── Pathfinding.ts
│   │   │   └── DifficultyScaling.ts
│   │   └── rendering/
│   │       ├── Renderer.ts
│   │       ├── Camera.ts
│   │       ├── ParticleSystem.ts
│   │       └── SpriteRenderer.ts
│   ├── store/
│   │   ├── db/
│   │   │   ├── IndexedDBManager.ts
│   │   │   ├── schemas.ts
│   │   │   └── migrations.ts
│   │   ├── context/
│   │   │   ├── GameContext.tsx
│   │   │   ├── PlayerDataContext.tsx
│   │   │   └── SettingsContext.tsx
│   │   └── hooks/
│   │       ├── useGameData.ts
│   │       ├── usePlayerProgress.ts
│   │       └── useShop.ts
│   ├── data/
│   │   ├── outfits.ts
│   │   ├── levelTemplates.ts
│   │   └── constants.ts
│   ├── utils/
│   │   ├── math.ts
│   │   ├── random.ts
│   │   └── color.ts
│   └── styles/
│       └── App.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Data Models & Storage Schema

### IndexedDB Schema

```typescript
// Database Name: 'parkour-race-db'
// Version: 1

// Object Store: 'playerData'
interface PlayerData {
  id: 'current-player'; // Single record
  coins: number;
  highestLevelUnlocked: number;
  currentOutfit: string;
  unlockedOutfits: string[];
  createdAt: number;
  lastPlayed: number;
}

// Object Store: 'levelProgress'
interface LevelProgress {
  levelNumber: number; // Primary key
  bestTime: number | null;
  bestPosition: number | null; // 1-6
  attempts: number;
  completed: boolean;
  stars: number; // 0-3 based on performance
}

// Object Store: 'settings'
interface GameSettings {
  id: 'settings'; // Single record
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  showTutorial: boolean;
  controlScheme: 'keyboard' | 'touch';
  difficulty: 'easy' | 'normal' | 'hard';
}

// Object Store: 'outfits'
interface OutfitData {
  id: string; // Primary key
  name: string;
  cost: number;
  unlocked: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
```

### localStorage Backup
```typescript
// Fallback for critical data
localStorage.setItem('parkour-backup', JSON.stringify({
  coins: number,
  highestLevel: number,
  timestamp: number
}));
```

---

## 4. Game Engine Architecture

### Core Game Loop

```typescript
class GameEngine {
  private lastFrameTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1000 / 60; // 60 FPS
  
  // Core systems
  private physicsEngine: PhysicsEngine;
  private renderer: Renderer;
  private camera: Camera;
  private inputManager: InputManager;
  
  // Game state
  private player: Player;
  private bots: AIBot[];
  private obstacles: Obstacle[];
  private levelData: LevelData;
  private raceState: RaceState;
  
  constructor(canvas: HTMLCanvasElement, levelNumber: number) {
    // Initialize all systems
  }
  
  start(): void {
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }
  
  private gameLoop(currentTime: number): void {
    if (this.raceState !== 'running') return;
    
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    this.accumulator += deltaTime;
    
    // Fixed update for physics
    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep / 1000);
      this.accumulator -= this.fixedTimeStep;
    }
    
    // Variable update for rendering
    this.render(this.accumulator / this.fixedTimeStep);
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  private fixedUpdate(dt: number): void {
    // Update physics
    this.physicsEngine.update(dt);
    
    // Update entities
    this.player.update(dt);
    this.bots.forEach(bot => bot.update(dt));
    
    // Check collisions
    this.handleCollisions();
    
    // Update camera
    this.camera.follow(this.player);
    
    // Check win/lose conditions
    this.checkRaceStatus();
  }
  
  private render(interpolation: number): void {
    this.renderer.clear();
    this.renderer.renderLevel(this.levelData, this.camera);
    this.renderer.renderEntities([this.player, ...this.bots], interpolation);
    this.renderer.renderObstacles(this.obstacles);
    this.renderer.renderUI(this.getRacePositions());
  }
}
```

---

## 5. Physics Engine

### Physics System

```typescript
class PhysicsEngine {
  private readonly gravity: number = 980; // pixels per second²
  private readonly terminalVelocity: number = 600;
  
  update(dt: number): void {
    // Apply gravity to all entities
  }
  
  applyGravity(entity: Entity, dt: number): void {
    if (!entity.grounded) {
      entity.velocity.y += this.gravity * dt;
      entity.velocity.y = Math.min(entity.velocity.y, this.terminalVelocity);
    }
  }
  
  resolveCollision(entity: Entity, obstacle: Obstacle): void {
    // AABB collision resolution with direction detection
  }
}

class CollisionDetection {
  static checkAABB(a: Rectangle, b: Rectangle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  
  static getCollisionNormal(a: Rectangle, b: Rectangle): Vector2 {
    // Determine collision direction for proper response
  }
}
```

---

## 6. Entity System

### Base Entity Class

```typescript
abstract class Entity {
  position: Vector2;
  velocity: Vector2;
  size: Vector2;
  grounded: boolean = false;
  
  // Parkour states
  state: 'running' | 'jumping' | 'climbing' | 'sliding' | 'falling';
  
  // Movement capabilities
  protected readonly runSpeed: number = 200; // pixels/sec
  protected readonly jumpForce: number = -400;
  protected readonly climbSpeed: number = 150;
  protected readonly slideSpeed: number = 250;
  
  abstract update(dt: number): void;
  abstract render(ctx: CanvasRenderingContext2D, camera: Camera): void;
  
  protected canJump(): boolean {
    return this.grounded || this.state === 'climbing';
  }
  
  protected canClimb(wall: Obstacle): boolean {
    // Check if next to climbable wall
    return wall.type === 'wall' && this.isAdjacentTo(wall);
  }
  
  protected canSlide(): boolean {
    return this.grounded && this.state !== 'sliding';
  }
}
```

### Player Class

```typescript
class Player extends Entity {
  private inputState: InputState;
  private outfit: OutfitData;
  private distanceTraveled: number = 0;
  
  constructor(startPosition: Vector2, outfit: OutfitData) {
    super();
    this.position = startPosition;
    this.velocity = { x: 0, y: 0 };
    this.size = { x: 20, y: 40 };
    this.outfit = outfit;
  }
  
  update(dt: number): void {
    this.handleInput(dt);
    this.updateState(dt);
    this.applyPhysics(dt);
    this.updatePosition(dt);
    this.distanceTraveled += Math.abs(this.velocity.x * dt);
  }
  
  private handleInput(dt: number): void {
    // Jump
    if (this.inputState.jump && this.canJump()) {
      this.velocity.y = this.jumpForce;
      this.state = 'jumping';
      this.grounded = false;
    }
    
    // Slide
    if (this.inputState.slide && this.canSlide()) {
      this.state = 'sliding';
      this.velocity.x = this.slideSpeed;
      this.size.y = 20; // Crouch height
    } else if (this.state === 'sliding' && !this.inputState.slide) {
      this.state = 'running';
      this.size.y = 40; // Normal height
    }
    
    // Climb
    if (this.inputState.climb && this.nearbyWall) {
      this.startClimbing(this.nearbyWall);
    }
    
    // Horizontal movement
    if (this.state === 'running' || this.state === 'jumping') {
      this.velocity.x = this.runSpeed;
    }
  }
  
  private startClimbing(wall: Obstacle): void {
    this.state = 'climbing';
    this.velocity.x = 0;
    this.position.x = wall.x - this.size.x; // Snap to wall
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position);
    
    // Draw character based on state and outfit colors
    ctx.fillStyle = this.outfit.colors.primary;
    
    if (this.state === 'sliding') {
      ctx.fillRect(screenPos.x, screenPos.y, this.size.x, this.size.y);
    } else {
      // Draw normal character
      ctx.fillRect(screenPos.x, screenPos.y, this.size.x, this.size.y);
      
      // Add simple limb animation
      this.renderLimbs(ctx, screenPos);
    }
  }
}
```

### AI Bot Class

```typescript
class AIBot extends Entity {
  private aiController: AIController;
  private personality: BotPersonality;
  private currentDecision: AIDecision;
  private reactionDelay: number;
  
  constructor(
    startPosition: Vector2,
    difficulty: number,
    personality: BotPersonality
  ) {
    super();
    this.position = startPosition;
    this.personality = personality; // aggressive, cautious, balanced
    this.reactionDelay = this.calculateReactionDelay(difficulty);
  }
  
  update(dt: number): void {
    // Make decision every N frames
    if (this.shouldMakeDecision()) {
      this.currentDecision = this.aiController.makeDecision(
        this.position,
        this.nearbyObstacles,
        this.personality
      );
    }
    
    // Execute current decision with reaction delay
    this.executeDecision(dt);
    this.applyPhysics(dt);
    this.updatePosition(dt);
  }
  
  private executeDecision(dt: number): void {
    // Add human-like imperfection
    const accuracy = 0.85 + (Math.random() * 0.15);
    
    switch (this.currentDecision.action) {
      case 'jump':
        if (this.canJump() && Math.random() > this.reactionDelay) {
          this.velocity.y = this.jumpForce * accuracy;
        }
        break;
      case 'slide':
        if (this.canSlide()) {
          this.state = 'sliding';
        }
        break;
      case 'climb':
        if (this.nearbyWall) {
          this.startClimbing(this.nearbyWall);
        }
        break;
    }
  }
}
```

---

## 7. AI System

### AI Controller with Lookahead

```typescript
class AIController {
  private readonly lookAheadDistance: number = 300; // pixels
  
  makeDecision(
    botPosition: Vector2,
    obstacles: Obstacle[],
    personality: BotPersonality
  ): AIDecision {
    const upcomingObstacles = this.getUpcomingObstacles(
      botPosition,
      obstacles
    );
    
    if (upcomingObstacles.length === 0) {
      return { action: 'run', confidence: 1.0 };
    }
    
    const nextObstacle = upcomingObstacles[0];
    const distanceToObstacle = nextObstacle.x - botPosition.x;
    
    // Determine best action based on obstacle type and distance
    return this.evaluateObstacle(nextObstacle, distanceToObstacle, personality);
  }
  
  private evaluateObstacle(
    obstacle: Obstacle,
    distance: number,
    personality: BotPersonality
  ): AIDecision {
    switch (obstacle.type) {
      case 'gap':
        return this.handleGap(obstacle, distance, personality);
      case 'wall':
        return this.handleWall(obstacle, distance, personality);
      case 'lowBarrier':
        return this.handleLowBarrier(obstacle, distance, personality);
      case 'vent':
        return this.handleVent(obstacle, distance, personality);
      default:
        return { action: 'run', confidence: 0.5 };
    }
  }
  
  private handleGap(
    gap: Obstacle,
    distance: number,
    personality: BotPersonality
  ): AIDecision {
    const jumpDistance = 150; // pixels
    const optimalJumpDistance = 80;
    
    if (distance < optimalJumpDistance - 20) {
      return { action: 'run', confidence: 0.9 };
    }
    
    if (distance >= optimalJumpDistance - 20 && distance <= optimalJumpDistance + 20) {
      // Adjust confidence based on personality
      const confidence = personality === 'aggressive' ? 0.95 : 0.85;
      return { action: 'jump', confidence };
    }
    
    return { action: 'run', confidence: 0.7 };
  }
  
  private handleWall(
    wall: Obstacle,
    distance: number,
    personality: BotPersonality
  ): AIDecision {
    if (wall.height > 100) {
      // Must climb tall walls
      if (distance < 30) {
        return { action: 'climb', confidence: 0.9 };
      }
    } else {
      // Can jump over short walls
      if (distance < 60 && distance > 30) {
        return { action: 'jump', confidence: 0.85 };
      }
    }
    
    return { action: 'run', confidence: 0.8 };
  }
  
  private handleVent(
    vent: Obstacle,
    distance: number,
    personality: BotPersonality
  ): AIDecision {
    const slideStartDistance = 80;
    
    if (distance < slideStartDistance + 20 && distance > slideStartDistance - 20) {
      return { action: 'slide', confidence: 0.88 };
    }
    
    return { action: 'run', confidence: 0.75 };
  }
}

interface BotPersonality {
  type: 'aggressive' | 'cautious' | 'balanced';
  riskTolerance: number; // 0-1
  reactionSpeed: number; // 0-1
  mistakeChance: number; // 0-1
}
```

---

## 8. Level Generation System

### Level Generator

```typescript
class LevelGenerator {
  private readonly minSegmentLength: number = 400;
  private readonly maxSegmentLength: number = 800;
  
  generateLevel(levelNumber: number): LevelData {
    const seed = this.getLevelSeed(levelNumber);
    const random = new SeededRandom(seed);
    
    const difficulty = this.calculateDifficulty(levelNumber);
    const length = this.calculateLevelLength(levelNumber);
    const segments = this.generateSegments(length, difficulty, random);
    
    return {
      levelNumber,
      seed,
      length,
      difficulty,
      segments,
      obstacles: this.placeObstacles(segments, difficulty, random),
      startPosition: { x: 50, y: 500 },
      finishLine: { x: length - 100, y: 500 }
    };
  }
  
  private calculateDifficulty(levelNumber: number): number {
    // Gradual difficulty curve from 0 to 1 over 1000 levels
    const baseDifficulty = Math.min(levelNumber / 1000, 1.0);
    
    // Add milestone difficulty spikes
    const milestone = Math.floor(levelNumber / 100);
    const spike = milestone * 0.05;
    
    return Math.min(baseDifficulty + spike, 1.0);
  }
  
  private calculateLevelLength(levelNumber: number): number {
    const baseLength = 3000;
    const additionalLength = Math.floor(levelNumber / 10) * 100;
    return baseLength + additionalLength;
  }
  
  private generateSegments(
    totalLength: number,
    difficulty: number,
    random: SeededRandom
  ): LevelSegment[] {
    const segments: LevelSegment[] = [];
    let currentX = 0;
    
    // Starting platform
    segments.push({
      type: 'platform',
      x: 0,
      y: 500,
      width: 200,
      height: 50
    });
    currentX = 200;
    
    // Generate segments to fill level length
    while (currentX < totalLength) {
      const segmentType = this.selectSegmentType(difficulty, random);
      const segment = this.createSegment(
        segmentType,
        currentX,
        difficulty,
        random
      );
      
      segments.push(segment);
      currentX += segment.width;
    }
    
    // Finish platform
    segments.push({
      type: 'platform',
      x: currentX,
      y: 500,
      width: 300,
      height: 50
    });
    
    return segments;
  }
  
  private selectSegmentType(
    difficulty: number,
    random: SeededRandom
  ): SegmentType {
    const roll = random.next();
    
    // Increase complex segment frequency with difficulty
    if (roll < 0.3 - (difficulty * 0.1)) {
      return 'straightRun';
    } else if (roll < 0.5) {
      return 'gapJump';
    } else if (roll < 0.7) {
      return 'wallClimb';
    } else if (roll < 0.85) {
      return 'slideSection';
    } else {
      return 'complexParkour'; // Multiple obstacles
    }
  }
  
  private createSegment(
    type: SegmentType,
    startX: number,
    difficulty: number,
    random: SeededRandom
  ): LevelSegment {
    switch (type) {
      case 'gapJump':
        return this.createGapSegment(startX, difficulty, random);
      case 'wallClimb':
        return this.createWallSegment(startX, difficulty, random);
      case 'slideSection':
        return this.createSlideSegment(startX, difficulty, random);
      case 'complexParkour':
        return this.createComplexSegment(startX, difficulty, random);
      default:
        return this.createStraightSegment(startX, random);
    }
  }
  
  private createGapSegment(
    startX: number,
    difficulty: number,
    random: SeededRandom
  ): LevelSegment {
    const gapWidth = 50 + (difficulty * 100) + random.next() * 50;
    const platformLength = 150 + random.next() * 100;
    
    return {
      type: 'gapJump',
      x: startX,
      y: 500,
      width: gapWidth + platformLength,
      height: 50,
      obstacles: [
        {
          type: 'gap',
          x: startX,
          y: 500,
          width: gapWidth,
          height: 600 // Drop depth
        }
      ]
    };
  }
}
```

### Obstacle Types

```typescript
type ObstacleType = 
  | 'gap'           // Must jump over
  | 'wall'          // Must climb or jump
  | 'lowBarrier'    // Must jump over
  | 'vent'          // Must slide under
  | 'movingPlatform' // Timing challenge
  | 'fallingPlatform'; // Quick reflexes needed

interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: {
    climbable?: boolean;
    movementSpeed?: number;
    movementRange?: number;
    fallDelay?: number;
  };
}
```

---

## 9. Rendering System

### Camera System

```typescript
class Camera {
  position: Vector2;
  viewport: Vector2;
  private readonly smoothing: number = 0.1;
  private target: Entity | null = null;
  
  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewport = { x: viewportWidth, y: viewportHeight };
    this.position = { x: 0, y: 0 };
  }
  
  follow(entity: Entity): void {
    this.target = entity;
    
    // Smooth camera following
    const targetX = entity.position.x - this.viewport.x / 3;
    const targetY = entity.position.y - this.viewport.y / 2;
    
    this.position.x += (targetX - this.position.x) * this.smoothing;
    this.position.y += (targetY - this.position.y) * this.smoothing;
    
    // Keep camera within level bounds
    this.clampToBounds();
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
}
```

### Renderer

```typescript
class Renderer {
  private ctx: CanvasRenderingContext2D;
  private particleSystem: ParticleSystem;
  
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.particleSystem = new ParticleSystem();
  }
  
  clear(): void {
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw parallax background layers
    this.renderBackground();
  }
  
  renderLevel(level: LevelData, camera: Camera): void {
    // Draw segments
    level.segments.forEach(segment => {
      const screenPos = camera.worldToScreen({ x: segment.x, y: segment.y });
      
      this.ctx.fillStyle = '#8B4513'; // Brown platform
      this.ctx.fillRect(
        screenPos.x,
        screenPos.y,
        segment.width,
        segment.height
      );
      
      // Add platform decoration
      this.ctx.strokeStyle = '#654321';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        screenPos.x,
        screenPos.y,
        segment.width,
        segment.height
      );
    });
    
    // Draw finish line
    const finishScreen = camera.worldToScreen(level.finishLine);
    this.renderFinishLine(finishScreen);
  }
  
  renderEntities(entities: Entity[], interpolation: number): void {
    // Sort by position for proper depth rendering
    const sorted = [...entities].sort((a, b) => a.position.y - b.position.y);
    
    sorted.forEach(entity => {
      entity.render(this.ctx, camera);
      
      // Add name tag above entity
      if (entity instanceof AIBot) {
        this.renderNameTag(entity);
      }
    });
  }
  
  renderObstacles(obstacles: Obstacle[]): void {
    obstacles.forEach(obstacle => {
      const screenPos = camera.worldToScreen(obstacle);
      
      switch (obstacle.type) {
        case 'wall':
          this.renderWall(screenPos, obstacle);
          break;
        case 'vent':
          this.renderVent(screenPos, obstacle);
          break;
        case 'gap':
          this.renderGap(screenPos, obstacle);
          break;
      }
    });
  }
  
  renderUI(racePositions: RacePosition[]): void {
    // Render position indicators for all racers
    const padding = 10;
    const width = 200;
    const height = 30 * racePositions.length;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(padding, padding, width, height);
    
    racePositions.forEach((racer, index) => {
      const y = padding + 10 + (index * 30);
      const isPlayer = racer.entity instanceof Player;
      
      this.ctx.fillStyle = isPlayer ? '#FFD700' : '#FFFFFF';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.fillText(
        `${index + 1}. ${racer.name} - ${racer.progress.toFixed(0)}%`,
        padding + 10,
        y
      );
    });
  }
  
  private renderBackground(): void {
    // Parallax city background
    const layers = [
      { speed: 0.2, color: '#4A5568', offset: 100 },
      { speed: 0.4, color: '#2D3748', offset: 200 },
      { speed: 0.6, color: '#1A202C', offset: 300 }
    ];
    
    layers.forEach(layer => {
      // Draw simplified buildings
    });
  }
}
```

### Particle System

```typescript
class ParticleSystem {
  private particles: Particle[] = [];
  
  emit(type: ParticleType, position: Vector2, count: number): void {
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(type, position));
    }
  }
  
  update(dt: number): void {
    this.particles = this.particles.filter(p => {
      p.life -= dt;
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.velocity.y += 200 * dt; // Gravity
      return p.life > 0;
    });
  }
  
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    this.particles.forEach(particle => {
      const screenPos = camera.worldToScreen(particle.position);
      const alpha = particle.life / particle.maxLife;
      
      ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
      ctx.fillRect(screenPos.x, screenPos.y, particle.size, particle.size);
    });
  }
  
  // Emit particles on landing, wall hitting, etc.
  emitLandingDust(position: Vector2): void {
    this.emit('dust', position, 8);
  }
}
```

---

## 10. Shop & Progression System

### Outfit Data

```typescript
const OUTFITS: OutfitData[] = [
  {
    id: 'default',
    name: 'Street Runner',
    cost: 0,
    unlocked: true,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' }
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    cost: 250,
    unlocked: false,
    colors: { primary: '#2C2C2C', secondary: '#FF0000', accent: '#FFFFFF' }
  },
  {
    id: 'cyber',
    name: 'Cyber Runner',
    cost: 500,
    unlocked: false,
    colors: { primary: '#00FFFF', secondary: '#FF00FF', accent: '#FFFF00' }
  },
  {
    id: 'gold',
    name: 'Golden Champion',
    cost: 1000,
    unlocked: false,
    colors: { primary: '#FFD700', secondary: '#FFA500', accent: '#FFFFE0' }
  },
  // ... 20+ more outfits with increasing costs
];
```

### Progression Logic

```typescript
interface RaceResult {
  position: number; // 1-6
  levelNumber: number;
  completionTime: number;
  coinsEarned: number;
}

function calculateReward(result: RaceResult): number {
  const baseReward = 50;
  
  // Position multiplier
  const positionMultipliers = [1.0, 0.8, 0.6, 0.4, 0.2, 0.0];
  const multiplier = positionMultipliers[result.position - 1];
  
  return Math.floor(baseReward * multiplier);
}

function calculateStars(result: RaceResult): number {
  if (result.position === 1) return 3;
  if (result.position <= 2) return 2;
  if (result.position <= 4) return 1;
  return 0;
}

async function saveRaceResult(result: RaceResult): Promise<void> {
  const db = await IndexedDBManager.getInstance();
  
  // Update player data
  const playerData = await db.getPlayerData();
  playerData.coins += result.coinsEarned;
  
  if (result.levelNumber === playerData.highestLevelUnlocked) {
    playerData.highestLevelUnlocked++;
  }
  
  await db.savePlayerData(playerData);
  
  // Update level progress
  const progress = await db.getLevelProgress(result.levelNumber);
  const newStars = calculateStars(result);
  
  const updated: LevelProgress = {
    ...progress,
    bestTime: Math.min(progress.bestTime || Infinity, result.completionTime),
    bestPosition: Math.min(progress.bestPosition || 6, result.position),
    stars: Math.max(progress.stars, newStars),
    attempts: progress.attempts + 1,
    completed: true
  };
  
  await db.saveLevelProgress(updated);
}
```

---

## 11. IndexedDB Manager

```typescript
class IndexedDBManager {
  private static instance: IndexedDBManager;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'parkour-race-db';
  private readonly DB_VERSION = 1;
  
  static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }
  
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('playerData')) {
          db.createObjectStore('playerData', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('levelProgress')) {
          db.createObjectStore('levelProgress', { keyPath: 'levelNumber' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('outfits')) {
          db.createObjectStore('outfits', { keyPath: 'id' });
        }
        
        // Initialize default data
        this.initializeDefaultData(db);
      };
    });
  }
  
  private async initializeDefaultData(db: IDBDatabase): Promise<void> {
    const transaction = db.transaction(['playerData', 'settings', 'outfits'], 'readwrite');
    
    // Default player data
    transaction.objectStore('playerData').add({
      id: 'current-player',
      coins: 0,
      highestLevelUnlocked: 1,
      currentOutfit: 'default',
      unlockedOutfits: ['default'],
      createdAt: Date.now(),
      lastPlayed: Date.now()
    });
    
    // Default settings
    transaction.objectStore('settings').add({
      id: 'settings',
      musicVolume: 0.7,
      sfxVolume: 0.8,
      showTutorial: true,
      controlScheme: 'keyboard',
      difficulty: 'normal'
    });
    
    // Initialize all outfits
    const outfitStore = transaction.objectStore('outfits');
    OUTFITS.forEach(outfit => {
      outfitStore.add(outfit);
    });
  }
  
  async getPlayerData(): Promise<PlayerData> {
    const transaction = this.db!.transaction('playerData', 'readonly');
    const store = transaction.objectStore('playerData');
    
    return new Promise((resolve, reject) => {
      const request = store.get('current-player');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async savePlayerData(data: PlayerData): Promise<void> {
    data.lastPlayed = Date.now();
    
    const transaction = this.db!.transaction('playerData', 'readwrite');
    const store = transaction.objectStore('playerData');
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => {
        // Backup to localStorage
        this.backupToLocalStorage(data);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async getLevelProgress(levelNumber: number): Promise<LevelProgress> {
    const transaction = this.db!.transaction('levelProgress', 'readonly');
    const store = transaction.objectStore('levelProgress');
    
    return new Promise((resolve, reject) => {
      const request = store.get(levelNumber);
      request.onsuccess = () => {
        const result = request.result || {
          levelNumber,
          bestTime: null,
          bestPosition: null,
          attempts: 0,
          completed: false,
          stars: 0
        };
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAllLevelProgress(): Promise<LevelProgress[]> {
    const transaction = this.db!.transaction('levelProgress', 'readonly');
    const store = transaction.objectStore('levelProgress');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async purchaseOutfit(outfitId: string): Promise<boolean> {
    const playerData = await this.getPlayerData();
    const outfit = OUTFITS.find(o => o.id === outfitId);
    
    if (!outfit || playerData.coins < outfit.cost) {
      return false;
    }
    
    playerData.coins -= outfit.cost;
    playerData.unlockedOutfits.push(outfitId);
    
    await this.savePlayerData(playerData);
    
    // Update outfit unlock status
    const transaction = this.db!.transaction('outfits', 'readwrite');
    const store = transaction.objectStore('outfits');
    outfit.unlocked = true;
    await store.put(outfit);
    
    return true;
  }
  
  private backupToLocalStorage(data: PlayerData): void {
    try {
      localStorage.setItem('parkour-backup', JSON.stringify({
        coins: data.coins,
        highestLevel: data.highestLevelUnlocked,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('LocalStorage backup failed:', e);
    }
  }
}
```

---

## 12. React Component Structure

### Main App Component

```typescript
function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('mainMenu');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Initialize database
    IndexedDBManager.getInstance().initialize()
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="app">
      {currentScreen === 'mainMenu' && (
        <MainMenu onStartGame={() => setCurrentScreen('levelSelect')} />
      )}
      {currentScreen === 'levelSelect' && (
        <LevelSelect
          onSelectLevel={(level) => {
            setSelectedLevel(level);
            setCurrentScreen('game');
          }}
        />
      )}
      {currentScreen === 'game' && (
        <GameCanvas
          levelNumber={selectedLevel}
          onComplete={(result) => {
            saveRaceResult(result);
            setCurrentScreen('gameOver');
          }}
        />
      )}
      {currentScreen === 'shop' && (
        <Shop onBack={() => setCurrentScreen('mainMenu')} />
      )}
    </div>
  );
}
```

### Game Canvas Component

```typescript
function GameCanvas({ levelNumber, onComplete }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [racePositions, setRacePositions] = useState<RacePosition[]>([]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize game engine
    engineRef.current = new GameEngine(canvasRef.current, levelNumber);
    
    // Register callbacks
    engineRef.current.onPositionUpdate = setRacePositions;
    engineRef.current.onRaceComplete = onComplete;
    
    // Start game
    engineRef.current.start();
    
    return () => {
      engineRef.current?.destroy();
    };
  }, [levelNumber]);
  
  useEffect(() => {
    if (engineRef.current) {
      if (isPaused) {
        engineRef.current.pause();
      } else {
        engineRef.current.resume();
      }
    }
  }, [isPaused]);
  
  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="game-canvas"
      />
      <GameHUD
        racePositions={racePositions}
        level={levelNumber}
        onPause={() => setIsPaused(true)}
      />
      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onQuit={onComplete}
        />
      )}
    </div>
  );
}
```

### Shop Component

```typescript
function Shop({ onBack }: ShopProps) {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<string>('');
  
  useEffect(() => {
    loadShopData();
  }, []);
  
  async function loadShopData() {
    const db = IndexedDBManager.getInstance();
    const data = await db.getPlayerData();
    setPlayerData(data);
    setOutfits(OUTFITS);
    setSelectedOutfit(data.currentOutfit);
  }
  
  async function handlePurchase(outfitId: string) {
    const db = IndexedDBManager.getInstance();
    const success = await db.purchaseOutfit(outfitId);
    
    if (success) {
      await loadShopData();
      // Show success notification
    } else {
      // Show insufficient coins notification
    }
  }
  
  async function handleEquip(outfitId: string) {
    if (!playerData) return;
    
    const db = IndexedDBManager.getInstance();
    playerData.currentOutfit = outfitId;
    await db.savePlayerData(playerData);
    setSelectedOutfit(outfitId);
  }
  
  return (
    <div className="shop">
      <div className="shop-header">
        <h1>Outfit Shop</h1>
        <CoinDisplay coins={playerData?.coins || 0} />
        <Button onClick={onBack}>Back</Button>
      </div>
      
      <div className="outfit-grid">
        {outfits.map(outfit => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            isOwned={playerData?.unlockedOutfits.includes(outfit.id)}
            isEquipped={selectedOutfit === outfit.id}
            onPurchase={() => handlePurchase(outfit.id)}
            onEquip={() => handleEquip(outfit.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 13. Input System

```typescript
class InputManager {
  private keys: Set<string> = new Set();
  private touchStartY: number = 0;
  
  constructor(canvas: HTMLCanvasElement) {
    this.setupKeyboardListeners();
    this.setupTouchListeners(canvas);
  }
  
  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      
      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }
  
  private setupTouchListeners(canvas: HTMLCanvasElement): void {
    // Divide screen into zones
    // Left side: climb
    // Middle: jump
    // Right side: slide
    // Swipe down: slide
    
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartY = touch.clientY;
      
      const zone = this.getTouchZone(touch.clientX, canvas.width);
      
      if (zone === 'jump') {
        this.keys.add('Space');
      } else if (zone === 'climb') {
        this.keys.add('KeyW');
      }
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaY = touch.clientY - this.touchStartY;
      
      if (deltaY > 50) {
        // Swipe down = slide
        this.keys.delete('Space');
        this.keys.add('KeyS');
      }
    });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.clear();
    });
  }
  
  getInputState(): InputState {
    return {
      jump: this.keys.has('Space') || this.keys.has('ArrowUp'),
      slide: this.keys.has('KeyS') || this.keys.has('ArrowDown'),
      climb: this.keys.has('KeyW'),
    };
  }
}
```

---

## 14. Sound System (Optional Enhancement)

```typescript
class SoundManager {
  private audioContext: AudioContext;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  
  async loadSounds(): Promise<void> {
    // Generate procedural sounds using Web Audio API
    this.sounds.set('jump', this.createJumpSound());
    this.sounds.set('land', this.createLandSound());
    this.sounds.set('slide', this.createSlideSound());
    this.sounds.set('coin', this.createCoinSound());
  }
  
  private createJumpSound(): AudioBuffer {
    // Create simple sine wave sweep for jump
    const duration = 0.2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + (800 * (1 - t / duration));
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
    }
    
    return buffer;
  }
  
  play(sound: SoundType): void {
    const buffer = this.sounds.get(sound);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.sfxVolume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }
}
```

---

## 15. Performance Optimizations

### Object Pooling

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  
  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 50) {
    this.factory = factory;
    this.reset = reset;
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }
  
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// Usage for particles
const particlePool = new ObjectPool(
  () => new Particle(),
  (p) => {
    p.life = 0;
    p.velocity = { x: 0, y: 0 };
  },
  100
);
```

### Render Culling

```typescript
class Renderer {
  private isVisible(entity: Entity, camera: Camera): boolean {
    const screenPos = camera.worldToScreen(entity.position);
    
    return (
      screenPos.x + entity.size.x > 0 &&
      screenPos.x < camera.viewport.x &&
      screenPos.y + entity.size.y > 0 &&
      screenPos.y < camera.viewport.y
    );
  }
  
  renderEntities(entities: Entity[], camera: Camera): void {
    // Only render entities in viewport
    const visible = entities.filter(e => this.isVisible(e, camera));
    visible.forEach(entity => entity.render(this.ctx, camera));
  }
}
```

---

## 16. Game States & Flow

```typescript
type GameState = 
  | 'countdown'     // 3-2-1 before race starts
  | 'running'       // Active race
  | 'paused'        // Player paused
  | 'finished'      // Race completed
  | 'gameOver';     // Player failed

class GameStateMachine {
  private currentState: GameState = 'countdown';
  private countdownTimer: number = 3;
  
  update(dt: number): void {
    switch (this.currentState) {
      case 'countdown':
        this.updateCountdown(dt);
        break;
      case 'running':
        // Normal game update
        break;
      case 'finished':
        this.handleRaceEnd();
        break;
    }
  }
  
  private updateCountdown(dt: number): void {
    this.countdownTimer -= dt;
    
    if (this.countdownTimer <= 0) {
      this.currentState = 'running';
    }
  }
  
  private handleRaceEnd(): void {
    // Calculate final results
    // Save to database
    // Trigger completion callback
  }
}
```

---

## 17. Tutorial System

```typescript
interface TutorialStep {
  id: string;
  message: string;
  trigger: TutorialTrigger;
  completed: boolean;
}

type TutorialTrigger =
  | { type: 'level', levelNumber: number }
  | { type: 'obstacle', obstacleType: ObstacleType }
  | { type: 'position', position: number };

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    message: 'Welcome to Parkour Race! Press SPACE to jump.',
    trigger: { type: 'level', levelNumber: 1 },
    completed: false
  },
  {
    id: 'first-jump',
    message: 'Great! Now jump over this gap!',
    trigger: { type: 'obstacle', obstacleType: 'gap' },
    completed: false
  },
  {
    id: 'climb',
    message: 'Press W near a wall to climb it!',
    trigger: { type: 'obstacle', obstacleType: 'wall' },
    completed: false
  },
  {
    id: 'slide',
    message: 'Press S to slide under low obstacles!',
    trigger: { type: 'obstacle', obstacleType: 'vent' },
    completed: false
  }
];

class TutorialManager {
  private currentStep: number = 0;
  private showingMessage: boolean = false;
  
  checkTrigger(trigger: TutorialTrigger): void {
    const step = TUTORIAL_STEPS[this.currentStep];
    
    if (this.matchesTrigger(trigger, step.trigger)) {
      this.showMessage(step.message);
      step.completed = true;
      this.currentStep++;
    }
  }
}
```

---

## 18. Responsive Design

```css
/* styles/App.css */
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
}

.game-canvas {
  max-width: 100%;
  max-height: 100%;
  border: 4px solid #2d3748;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.main-menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.button {
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .game-canvas {
    width: 100vw;
    height: 100vh;
  }
  
  .main-menu {
    width: 90%;
    padding: 20px;
  }
}
```

---

## 19. Build Configuration

```json
// package.json
{
  "name": "parkour-race",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // For static hosting
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
});
```

---

## 20. Implementation Checklist

### Phase 1: Core Foundation (Week 1)
- [ ] Set up React + Vite + TypeScript project
- [ ] Implement IndexedDB manager with all schemas
- [ ] Create base Entity class
- [ ] Build physics engine with gravity and collision
- [ ] Implement basic game loop with canvas rendering

### Phase 2: Player & Controls (Week 1)
- [ ] Create Player class with all parkour moves
- [ ] Implement input manager (keyboard + touch)
- [ ] Add player animations and state machine
- [ ] Test all player movements thoroughly

### Phase 3: AI System (Week 2)
- [ ] Create AIBot class
- [ ] Implement AI controller with obstacle detection
- [ ] Add difficulty scaling and bot personalities
- [ ] Test AI decision-making and racing behavior

### Phase 4: Level Generation (Week 2)
- [ ] Build level generator with seeded randomness
- [ ] Create all obstacle types
- [ ] Implement difficulty progression curve
- [ ] Generate and test variety of level layouts

### Phase 5: Rendering & Polish (Week 3)
- [ ] Implement camera system with smooth following
- [ ] Add particle effects
- [ ] Create background parallax layers
- [ ] Design and render all UI elements
- [ ] Add visual feedback for all actions

### Phase 6: Progression System (Week 3)
- [ ] Create shop interface
- [ ] Design 20+ outfits with unique colors
- [ ] Implement coin economy and rewards
- [ ] Build level select screen with progress display

### Phase 7: Testing & Optimization (Week 4)
- [ ] Test all 1000 levels (sample testing)
- [ ] Optimize rendering with culling
- [ ] Add object pooling for particles
- [ ] Test on mobile devices
- [ ] Balance difficulty and coin economy

### Phase 8: Final Polish (Week 4)
- [ ] Add tutorial system
- [ ] Implement settings menu
- [ ] Add sound effects (optional)
- [ ] Test data persistence across sessions
- [ ] Build and deploy static version

---

## 21. Key Technical Decisions

### Why IndexedDB over localStorage?
- **Storage Limit**: localStorage limited to ~5-10MB, IndexedDB supports much more
- **Complex Queries**: IndexedDB allows indexed searches on level progress
- **Better Structure**: Proper database with multiple object stores
- **Async Operations**: Non-blocking database operations

### Why Canvas over SVG/DOM?
- **Performance**: 60fps game loop with many entities
- **Particle Effects**: Thousands of particles need canvas performance
- **Pixel Control**: Precise control over rendering pipeline

### Why Custom Physics over Library?
- **Bundle Size**: Keep deployment small for static hosting
- **Simplicity**: Game only needs basic AABB collision
- **Control**: Fine-tune behavior for responsive gameplay

### Seeded Random for Levels
- **Consistency**: Same level number always generates same layout
- **Multiplayer Ready**: Players can share level codes
- **Storage Efficient**: Don't need to store full level data

---

## 22. Testing Strategy

### Unit Tests
- Physics calculations
- Collision detection
- AI decision making
- Level generation consistency

### Integration Tests
- IndexedDB operations
- Game state transitions
- Shop purchases
- Progress saving

### Manual Testing Checklist
- [ ] Jump timing feels responsive
- [ ] AI bots behave realistically
- [ ] All 5 bots finish race
- [ ] Coins awarded correctly for 1st place
- [ ] Level unlocking works properly
- [ ] Outfit purchases and equipping
- [ ] Progress persists after refresh
- [ ] Touch controls work on mobile
- [ ] Game runs at stable 60fps
- [ ] No memory leaks during long play

---

## 23. Future Enhancements

### Post-Launch Features
1. **Multiplayer Ghost Racing**: Race against recorded runs
2. **Daily Challenges**: Special levels with bonus rewards
3. **Achievement System**: Unlock special outfits
4. **Power-ups**: Temporary speed boosts, double jumps
5. **Custom Level Creator**: Let players build and share
6. **Leaderboards**: Using hash-based verification
7. **Replay System**: Watch and share best runs
8. **More Outfits**: Regular content updates
9. **Weather Effects**: Rain, snow, fog variations
10. **Night Mode**: Dark themed levels

---

This plan provides complete architectural guidance for building a production-ready parkour racing game. All systems are designed to work together cohesively while maintaining clean separation of concerns. The LLM can implement this step-by-step, with each phase building naturally on the previous one.