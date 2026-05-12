/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

export let CANVAS_WIDTH = isMobile ? window.innerWidth - 32 : 800;
export let CANVAS_HEIGHT = isMobile ? window.innerHeight - 250 : 600;

export let PADDLE_WIDTH = isMobile ? 80 : 120;
export const PADDLE_HEIGHT = 15;
export const PADDLE_BOTTOM_MARGIN = isMobile ? 60 : 30;

export const BALL_RADIUS = isMobile ? 6 : 8;
export const INITIAL_BALL_SPEED = isMobile ? 4 : 5;

export const BRICK_ROWS = 6;
export const BRICK_COLS = 9;
export const BRICK_PADDING = isMobile ? 4 : 10;
export const BRICK_OFFSET_TOP = isMobile ? 40 : 60;
export const BRICK_OFFSET_LEFT = isMobile ? 10 : 35;
export const BRICK_HEIGHT = isMobile ? 18 : 22;

export const POWERUP_WIDTH = isMobile ? 16 : 20;
export const POWERUP_HEIGHT = isMobile ? 16 : 20;
export const POWERUP_SPEED = isMobile ? 2.5 : 3;
export const POWERUP_DURATION = 10000; // 10 seconds

export const updateLayout = () => {
  const mobile = window.innerWidth < 640;
  CANVAS_WIDTH = mobile ? window.innerWidth - 32 : 800;
  CANVAS_HEIGHT = mobile ? window.innerHeight - 250 : 600;
  PADDLE_WIDTH = mobile ? 80 : 120;
};

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
