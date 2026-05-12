/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameState {
  READY = 'READY',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  WON = 'WON'
}

export enum BrickType {
  NORMAL = 'NORMAL',
  STRONG = 'STRONG',
  POWERUP = 'POWERUP'
}

export enum PowerUpType {
  SCORE = 'SCORE', // Coin
  SPEED = 'SPEED', // Acceleration
  EXPAND = 'EXPAND', // Paddle widen
  MULTI = 'MULTI' // +2 Balls
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Ball extends Position, Velocity {
  radius: number;
}

export interface Paddle extends Position {
  width: number;
  height: number;
}

export interface Brick extends Position {
  width: number;
  height: number;
  status: boolean;
  color: string;
  points: number;
  type: BrickType;
  health: number;
  maxHealth: number;
  powerUp?: PowerUpType;
}

export interface PowerUp extends Position {
  type: PowerUpType;
  width: number;
  height: number;
  active: boolean;
}

export interface Particle extends Position, Velocity {
  radius: number;
  color: string;
  life: number; // 0 to 1
  decay: number;
}

export interface TrailPoint extends Position {
  opacity: number;
}
