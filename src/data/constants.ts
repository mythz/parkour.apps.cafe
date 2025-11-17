// Game constants
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const FIXED_TIME_STEP = 1000 / 60; // 60 FPS

// Physics constants
export const GRAVITY = 980; // pixels per second²
export const TERMINAL_VELOCITY = 600;

// Player constants
export const PLAYER_SIZE = { x: 20, y: 40 };
export const PLAYER_RUN_SPEED = 200;
export const PLAYER_JUMP_FORCE = -400;
export const PLAYER_CLIMB_SPEED = 150;
export const PLAYER_SLIDE_SPEED = 250;
export const PLAYER_SLIDE_HEIGHT = 20;

// AI constants
export const AI_LOOKAHEAD_DISTANCE = 300;
export const AI_DECISION_INTERVAL = 0.1; // seconds

// Level constants
export const MIN_SEGMENT_LENGTH = 400;
export const MAX_SEGMENT_LENGTH = 800;
export const BASE_LEVEL_LENGTH = 3000;

// Reward constants
export const BASE_COIN_REWARD = 50;
export const POSITION_MULTIPLIERS = [1.0, 0.8, 0.6, 0.4, 0.2, 0.0];

// Number of AI bots
export const NUM_BOTS = 5;

// Camera constants
export const CAMERA_SMOOTHING = 0.1;
