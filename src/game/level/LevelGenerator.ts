import { LevelData, LevelSegment, SegmentType } from './LevelData';
import { Obstacle } from '../entities/Obstacle';
import { SeededRandom } from '../../utils/random';
import { BASE_LEVEL_LENGTH } from '../../data/constants';

export class LevelGenerator {
  
  
  private readonly groundY: number = 500;
  private readonly platformHeight: number = 50;

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
      obstacles: this.collectObstacles(segments),
      startPosition: { x: 50, y: this.groundY - 40 },
      finishLine: { x: length - 100, y: this.groundY }
    };
  }

  private getLevelSeed(levelNumber: number): number {
    return levelNumber * 12345 + 67890;
  }

  private calculateDifficulty(levelNumber: number): number {
    const baseDifficulty = Math.min(levelNumber / 1000, 1.0);
    const milestone = Math.floor(levelNumber / 100);
    const spike = milestone * 0.05;
    return Math.min(baseDifficulty + spike, 1.0);
  }

  private calculateLevelLength(levelNumber: number): number {
    const additionalLength = Math.floor(levelNumber / 10) * 100;
    return BASE_LEVEL_LENGTH + additionalLength;
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
      type: 'straightRun',
      x: 0,
      y: this.groundY,
      width: 200,
      height: this.platformHeight,
      obstacles: []
    });
    currentX = 200;

    // Generate segments to fill level length
    while (currentX < totalLength - 300) {
      const segmentType = this.selectSegmentType(difficulty, random);
      const segment = this.createSegment(segmentType, currentX, difficulty, random);

      segments.push(segment);
      currentX += segment.width;
    }

    // Finish platform
    segments.push({
      type: 'straightRun',
      x: currentX,
      y: this.groundY,
      width: 300,
      height: this.platformHeight,
      obstacles: []
    });

    return segments;
  }

  private selectSegmentType(difficulty: number, random: SeededRandom): SegmentType {
    const roll = random.next();

    if (roll < 0.3 - (difficulty * 0.1)) {
      return 'straightRun';
    } else if (roll < 0.5) {
      return 'gapJump';
    } else if (roll < 0.7) {
      return 'wallClimb';
    } else if (roll < 0.85) {
      return 'slideSection';
    } else {
      return 'complexParkour';
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

  private createStraightSegment(startX: number, _random: SeededRandom): LevelSegment {
    const width = 200;

    return {
      type: 'straightRun',
      x: startX,
      y: this.groundY,
      width,
      height: this.platformHeight,
      obstacles: []
    };
  }

  private createGapSegment(
    startX: number,
    difficulty: number,
    random: SeededRandom
  ): LevelSegment {
    const gapWidth = 50 + (difficulty * 100) + random.next() * 50;
    const platformLength = 150 + random.next() * 100;

    const obstacles: Obstacle[] = [
      new Obstacle('gap', startX, this.groundY, gapWidth, 600)
    ];

    return {
      type: 'gapJump',
      x: startX,
      y: this.groundY,
      width: gapWidth + platformLength,
      height: this.platformHeight,
      obstacles
    };
  }

  private createWallSegment(
    startX: number,
    difficulty: number,
    random: SeededRandom
  ): LevelSegment {
    const wallHeight = 80 + (difficulty * 100) + random.next() * 50;
    const platformAfter = 150 + random.next() * 100;

    const obstacles: Obstacle[] = [
      new Obstacle('wall', startX + 50, this.groundY - wallHeight, 30, wallHeight, {
        climbable: true
      })
    ];

    return {
      type: 'wallClimb',
      x: startX,
      y: this.groundY,
      width: platformAfter + 80,
      height: this.platformHeight,
      obstacles
    };
  }

  private createSlideSegment(
    startX: number,
    _difficulty: number,
    random: SeededRandom
  ): LevelSegment {
    const ventWidth = 60 + random.next() * 40;
    const platformAfter = 150 + random.next() * 100;

    const obstacles: Obstacle[] = [
      new Obstacle('vent', startX + 50, this.groundY - 40, ventWidth, 30)
    ];

    return {
      type: 'slideSection',
      x: startX,
      y: this.groundY,
      width: platformAfter + 110,
      height: this.platformHeight,
      obstacles
    };
  }

  private createComplexSegment(
    startX: number,
    _difficulty: number,
    random: SeededRandom
  ): LevelSegment {
    const obstacles: Obstacle[] = [];
    let offset = 100;

    // Add 2-3 obstacles
    const numObstacles = random.nextInt(2, 3);

    for (let i = 0; i < numObstacles; i++) {
      const obstacleType = random.choice(['lowBarrier', 'gap', 'wall', 'vent', 'spring', 'dashPad']);

      switch (obstacleType) {
        case 'lowBarrier':
          obstacles.push(new Obstacle('lowBarrier', startX + offset, this.groundY - 30, 40, 30));
          offset += 100;
          break;
        case 'gap':
          const gapWidth = 40 + random.next() * 40;
          obstacles.push(new Obstacle('gap', startX + offset, this.groundY, gapWidth, 600));
          offset += gapWidth + 50;
          break;
        case 'wall':
          obstacles.push(new Obstacle('wall', startX + offset, this.groundY - 80, 30, 80, {
            climbable: true
          }));
          offset += 100;
          break;
        case 'vent':
          obstacles.push(new Obstacle('vent', startX + offset, this.groundY - 35, 50, 25));
          offset += 100;
          break;
        case 'spring':
          obstacles.push(new Obstacle('spring', startX + offset, this.groundY - 15, 30, 15, {
            springForce: -600
          }));
          offset += 80;
          break;
        case 'dashPad':
          obstacles.push(new Obstacle('dashPad', startX + offset, this.groundY - 5, 60, 5, {
            dashSpeed: 400
          }));
          offset += 100;
          break;
      }
    }

    return {
      type: 'complexParkour',
      x: startX,
      y: this.groundY,
      width: offset + 100,
      height: this.platformHeight,
      obstacles
    };
  }

  private collectObstacles(segments: LevelSegment[]): Obstacle[] {
    const obstacles: Obstacle[] = [];

    // Add platforms as obstacles for collision
    segments.forEach(segment => {
      obstacles.push(new Obstacle('platform', segment.x, segment.y, segment.width, segment.height));

      if (segment.obstacles) {
        obstacles.push(...segment.obstacles);
      }
    });

    return obstacles;
  }

  // Generate power-up positions for a level
  generatePowerUpPositions(levelLength: number, _difficulty: number, random: SeededRandom): Array<{ x: number; y: number; type: string }> {
    const powerUps: Array<{ x: number; y: number; type: string }> = [];
    const spacing = 800; // Power-ups every ~800 pixels
    const numPowerUps = Math.floor(levelLength / spacing);

    const types = ['speedBoost', 'shield', 'doubleJump', 'magnet'];

    for (let i = 1; i < numPowerUps; i++) {
      const x = i * spacing + random.next() * 200;
      const y = this.groundY - 100 - random.next() * 100; // Floating above ground
      const type = random.choice(types);

      powerUps.push({ x, y, type });
    }

    return powerUps;
  }
}
