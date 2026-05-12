/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playPaddleHit() {
    this.playTone(150, 'sine', 0.1, 0.3);
  }

  playBrickHit(isStrong: boolean) {
    this.playTone(isStrong ? 300 : 400, 'square', 0.05, 0.1);
  }

  playBrickDestroy() {
    this.playTone(200, 'triangle', 0.2, 0.2);
  }

  playPowerUpDrop() {
    this.playTone(600, 'sine', 0.3, 0.1);
    setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 100);
  }

  playPowerUpCatch() {
    this.playTone(800, 'sine', 0.1, 0.2);
    setTimeout(() => this.playTone(1200, 'sine', 0.1, 0.2), 50);
  }

  playLifeLost() {
    this.playTone(100, 'sawtooth', 0.5, 0.2);
  }
}

export const soundManager = new SoundManager();
