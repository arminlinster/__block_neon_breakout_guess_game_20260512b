/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrickType } from './types';

export interface LevelConfig {
  name: string;
  grid: number[][]; // 0: Null, 1: Normal, 2: Strong, 3: Powerup
  speedMultiplier: number;
}

export const LEVELS: LevelConfig[] = [
  {
    name: "Classic Start",
    speedMultiplier: 1.0,
    grid: [
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0],
    ]
  },
  {
    name: "Diagonal Dash",
    speedMultiplier: 1.1,
    grid: [
      [2, 0, 0, 0, 0, 2],
      [0, 1, 1, 1, 1, 0],
      [0, 1, 3, 3, 1, 0],
      [0, 1, 1, 1, 1, 0],
      [2, 0, 0, 0, 0, 2],
    ]
  },
  {
    name: "The Pyramid",
    speedMultiplier: 1.2,
    grid: [
      [0, 0, 2, 2, 0, 0],
      [0, 2, 3, 3, 2, 0],
      [2, 1, 1, 1, 1, 2],
      [2, 1, 1, 1, 1, 2],
      [1, 1, 1, 1, 1, 1],
    ]
  },
  {
    name: "Floating Islands",
    speedMultiplier: 1.3,
    grid: [
      [2, 2, 0, 0, 2, 2],
      [2, 2, 3, 3, 2, 2],
      [0, 0, 1, 1, 0, 0],
      [2, 2, 1, 1, 2, 2],
      [2, 2, 0, 0, 2, 2],
    ]
  },
  {
    name: "Checkerboard Chaos",
    speedMultiplier: 1.4,
    grid: [
      [1, 3, 1, 3, 1, 3],
      [2, 1, 2, 1, 2, 1],
      [1, 3, 1, 3, 1, 3],
      [2, 1, 2, 1, 2, 1],
      [1, 3, 1, 3, 1, 3],
    ]
  }
];
