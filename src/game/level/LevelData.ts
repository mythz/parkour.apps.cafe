import { Vector2 } from '../../utils/math';
import { Obstacle } from '../entities/Obstacle';

export type SegmentType =
  | 'straightRun'
  | 'gapJump'
  | 'wallClimb'
  | 'slideSection'
  | 'complexParkour';

export interface LevelSegment {
  type: SegmentType;
  x: number;
  y: number;
  width: number;
  height: number;
  obstacles?: Obstacle[];
}

export interface LevelData {
  levelNumber: number;
  seed: number;
  length: number;
  difficulty: number;
  segments: LevelSegment[];
  obstacles: Obstacle[];
  startPosition: Vector2;
  finishLine: Vector2;
}
