/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PADDLE_WIDTH = 120;
export const PADDLE_HEIGHT = 15;
export const PADDLE_BOTTOM_MARGIN = 30;

export const BALL_RADIUS = 8;
export const INITIAL_BALL_SPEED = 5;

export const BRICK_ROWS = 6;
export const BRICK_COLS = 9;
export const BRICK_PADDING = 10;
export const BRICK_OFFSET_TOP = 60;
export const BRICK_OFFSET_LEFT = 35;
export const BRICK_HEIGHT = 22;

export const POWERUP_WIDTH = 20;
export const POWERUP_HEIGHT = 20;
export const POWERUP_SPEED = 3;
export const POWERUP_DURATION = 10000; // 10 seconds

export const PARTICLE_COUNT = 8;
export const TRAIL_MAX_POINTS = 12;

export const COLORS = {
  BACKGROUND: '#1e293b',
  PADDLE: '#38bdf8',
  BALL: '#FFFFFF',
  BRICKS: [
    '#38bdf8', // Cyan
    '#0ea5e9', // Sky Blue
    '#0284c7', // Darker Blue
    '#0369a1', // Deep Blue
    '#075985', // Darkest Blue
    '#1e293b'  // Near background Blue
  ],
  POWERUPS: {
    SCORE: '#FCD34D', // Gold
    SPEED: '#F87171', // Red
    EXPAND: '#34D399', // Green
    MULTI: '#818CF8'   // Indigo
  },
  STRONG_BRICK: '#94A3B8' // Slate
};
