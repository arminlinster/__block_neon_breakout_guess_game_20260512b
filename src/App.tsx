/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Heart, Zap, Shield, PlusCircle, CircleDollarSign } from 'lucide-react';
import { GameState, Ball, Paddle, Brick, BrickType, PowerUpType, PowerUp, Particle, TrailPoint } from './types';
import { LEVELS } from './levels';
import { soundManager } from './services/soundService';
import {
  updateLayout,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_BOTTOM_MARGIN,
  BALL_RADIUS,
  INITIAL_BALL_SPEED,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  BRICK_HEIGHT,
  COLORS,
  POWERUP_WIDTH,
  POWERUP_HEIGHT,
  POWERUP_SPEED,
  POWERUP_DURATION,
  PARTICLE_COUNT,
  TRAIL_MAX_POINTS,
} from './constants';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.READY);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [remainingBricks, setRemainingBricks] = useState(0);
  const [showLevelTransition, setShowLevelTransition] = useState(false);
  const [dimensions, setDimensions] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  useEffect(() => {
    const handleResize = () => {
      updateLayout();
      setDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
      paddleRef.current.y = CANVAS_HEIGHT - PADDLE_BOTTOM_MARGIN - PADDLE_HEIGHT;
      // Ensure paddle width is updated but stays within bounds
      paddleRef.current.width = PADDLE_WIDTH;
      if (paddleRef.current.x > CANVAS_WIDTH - PADDLE_WIDTH) {
         paddleRef.current.x = CANVAS_WIDTH - PADDLE_WIDTH;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refs for game state to avoid re-renders during loop
  const ballsRef = useRef<Ball[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailsRef = useRef<TrailPoint[][]>([]); // Array of trails (one per ball)
  
  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - PADDLE_BOTTOM_MARGIN - PADDLE_HEIGHT,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const bricksRef = useRef<Brick[]>([]);
  const requestRef = useRef<number>(0);
  const rightPressedRef = useRef(false);
  const leftPressedRef = useRef(false);

  // Initialize Bricks for a specific level
  const initBricks = (levelIdx: number) => {
    const level = LEVELS[levelIdx];
    const bricks: Brick[] = [];
    const rows = level.grid.length;
    const cols = level.grid[0].length;
    const totalBrickWidth = (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - (cols - 1) * BRICK_PADDING) / cols;
    
    for (let r = 0; r < rows; r++) {
      const rowPoints = (rows - r) * 10;
      for (let c = 0; c < cols; c++) {
        const typeValue = level.grid[r][c];
        if (typeValue === 0) continue;

        let type = BrickType.NORMAL;
        let health = 1;
        let powerUp: PowerUpType | undefined = undefined;

        if (typeValue === 2) {
          type = BrickType.STRONG;
          health = 3;
        } else if (typeValue === 3) {
          type = BrickType.POWERUP;
          const pRand = Math.random();
          if (pRand < 0.25) powerUp = PowerUpType.SCORE;
          else if (pRand < 0.5) powerUp = PowerUpType.SPEED;
          else if (pRand < 0.75) powerUp = PowerUpType.EXPAND;
          else powerUp = PowerUpType.MULTI;
        }

        bricks.push({
          x: c * (totalBrickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          width: totalBrickWidth,
          height: BRICK_HEIGHT,
          status: true,
          color: type === BrickType.STRONG ? COLORS.STRONG_BRICK : COLORS.BRICKS[r % COLORS.BRICKS.length],
          points: rowPoints * (type === BrickType.STRONG ? 3 : 1),
          type,
          health,
          maxHealth: health,
          powerUp
        });
      }
    }
    bricksRef.current = bricks;
    setRemainingBricks(bricks.length);
  };

  const resetBallAndPaddle = () => {
    const speed = INITIAL_BALL_SPEED * LEVELS[currentLevelIndex].speedMultiplier;
    paddleRef.current.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    paddleRef.current.width = PADDLE_WIDTH;
    
    ballsRef.current = [{
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_BOTTOM_MARGIN - PADDLE_HEIGHT - BALL_RADIUS,
      dx: speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed,
      radius: BALL_RADIUS,
    }];
    
    powerUpsRef.current = [];
  };

  const startGame = () => {
    setCurrentLevelIndex(0);
    initBricks(0);
    resetBallAndPaddle();
    setScore(0);
    setLives(3);
    setGameState(GameState.PLAYING);
  };

  const nextLevel = () => {
    const nextIdx = currentLevelIndex + 1;
    if (nextIdx < LEVELS.length) {
      setCurrentLevelIndex(nextIdx);
      initBricks(nextIdx);
      resetBallAndPaddle();
      setShowLevelTransition(false);
      setGameState(GameState.PLAYING);
    } else {
      setGameState(GameState.WON);
    }
  };

  const restartGame = () => {
    startGame();
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressedRef.current = true;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressedRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Right' || e.key === 'ArrowRight') rightPressedRef.current = false;
      if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressedRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse/Touch Handlers
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!canvasRef.current || gameState !== GameState.PLAYING) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    let clientX = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const relativeX = (clientX - rect.left) * scaleX;
    if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
      paddleRef.current.x = relativeX - paddleRef.current.width / 2;
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Trails
    trailsRef.current.forEach((trail) => {
      trail.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, BALL_RADIUS * point.opacity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${point.opacity * 0.3})`;
        ctx.fill();
        ctx.closePath();
      });
    });

    // Draw Particles
    particlesRef.current.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.closePath();
    });

    // Draw Bricks
    bricksRef.current.forEach((brick) => {
      if (brick.status) {
        // Brick Shadow/Glow effect
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowOffsetY = 2;

        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
        
        if (brick.type === BrickType.STRONG) {
          // Visual damage for strong bricks
          const damageOpacity = brick.health / brick.maxHealth;
          ctx.fillStyle = brick.color;
          ctx.globalAlpha = 0.4 + (damageOpacity * 0.6);
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Crack effect for damage
          if (brick.health < brick.maxHealth) {
             ctx.strokeStyle = 'rgba(255,255,255,0.5)';
             ctx.beginPath();
             ctx.moveTo(brick.x + 5, brick.y + 5);
             ctx.lineTo(brick.x + brick.width - 5, brick.y + brick.height - 5);
             ctx.stroke();
          }
        } else if (brick.type === BrickType.POWERUP) {
          const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
          gradient.addColorStop(0, brick.color);
          gradient.addColorStop(1, '#FFFFFF');
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Glowing core
          ctx.shadowBlur = 10;
          ctx.shadowColor = brick.color;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(brick.x + brick.width / 2, brick.y + brick.height / 2, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
          gradient.addColorStop(0, brick.color);
          gradient.addColorStop(0.8, brick.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
        ctx.closePath();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      }
    });

    // Draw PowerUps
    powerUpsRef.current.forEach((pu) => {
      if (pu.active) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.POWERUPS[pu.type as keyof typeof COLORS.POWERUPS];
        ctx.beginPath();
        ctx.roundRect(pu.x, pu.y, pu.width, pu.height, 4);
        ctx.fillStyle = COLORS.POWERUPS[pu.type as keyof typeof COLORS.POWERUPS];
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.closePath();
        ctx.shadowBlur = 0;
      }
    });

    // Draw Balls
    ctx.fillStyle = COLORS.BALL;
    ballsRef.current.forEach((ball) => {
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0;
    });

    // Draw Paddle
    const paddle = paddleRef.current;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
    ctx.fillStyle = COLORS.PADDLE;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.PADDLE;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
  };

  const applyPowerUp = (type: PowerUpType) => {
    soundManager.playPowerUpCatch();
    switch (type) {
      case PowerUpType.SCORE:
        setScore(prev => prev + 500);
        break;
      case PowerUpType.SPEED:
        ballsRef.current.forEach(b => {
          b.dx *= 1.2;
          b.dy *= 1.2;
        });
        break;
      case PowerUpType.EXPAND:
        paddleRef.current.width = PADDLE_WIDTH * 1.5;
        setTimeout(() => {
          paddleRef.current.width = PADDLE_WIDTH;
        }, POWERUP_DURATION);
        break;
      case PowerUpType.MULTI:
        const firstBall = ballsRef.current[0];
        if (firstBall) {
          ballsRef.current.push(
            { ...firstBall, dx: -firstBall.dx, dy: firstBall.dy },
            { ...firstBall, dx: firstBall.dx * 0.5, dy: -Math.abs(firstBall.dy) }
          );
        }
        break;
    }
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        radius: Math.random() * 3 + 1,
        color,
        life: 1,
        decay: Math.random() * 0.02 + 0.02
      });
    }
  };

  const update = () => {
    if (gameState !== GameState.PLAYING) return;

    const paddle = paddleRef.current;

    // Move Paddle
    if (rightPressedRef.current && paddle.x < CANVAS_WIDTH - paddle.width) {
      paddle.x += 10;
    } else if (leftPressedRef.current && paddle.x > 0) {
      paddle.x -= 10;
    }

    // Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life -= p.decay;
      return p.life > 0;
    });

    // Update PowerUps
    powerUpsRef.current = powerUpsRef.current.filter(pu => {
      if (!pu.active) return false;
      pu.y += POWERUP_SPEED;

      // Collection
      if (
        pu.y + pu.height > paddle.y &&
        pu.y < paddle.y + paddle.height &&
        pu.x + pu.width > paddle.x &&
        pu.x < paddle.x + paddle.width
      ) {
        applyPowerUp(pu.type);
        return false;
      }

      // Out of bounds
      return pu.y < CANVAS_HEIGHT;
    });

    // Update Trails and Balls
    if (trailsRef.current.length !== ballsRef.current.length) {
      trailsRef.current = ballsRef.current.map(() => []);
    }

    ballsRef.current = ballsRef.current.filter((ball, ballIdx) => {
      // Update Trail
      const trail = trailsRef.current[ballIdx];
      trail.unshift({ x: ball.x, y: ball.y, opacity: 1 });
      if (trail.length > TRAIL_MAX_POINTS) trail.pop();
      trail.forEach(pt => pt.opacity *= 0.9);

      // Wall collisions
      if (ball.x + ball.dx > CANVAS_WIDTH - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        soundManager.playPaddleHit(); // Wall hit sound same as paddle for now
      }
      if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        soundManager.playPaddleHit();
      } else if (ball.y + ball.dy > CANVAS_HEIGHT - ball.radius) {
        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width && ball.y + ball.radius > paddle.y) {
          const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
          ball.dx = hitPoint * currentSpeed;
          ball.dy = -Math.sqrt(Math.max(0, currentSpeed * currentSpeed - ball.dx * ball.dx));
          soundManager.playPaddleHit();
        } else {
          // Ball lost
          return false;
        }
      }

      // Brick collision
      bricksRef.current.forEach((brick) => {
        if (brick.status) {
          if (
            ball.x + ball.radius > brick.x &&
            ball.x - ball.radius < brick.x + brick.width &&
            ball.y + ball.radius > brick.y &&
            ball.y - ball.radius < brick.y + brick.height
          ) {
            soundManager.playBrickHit(brick.type === BrickType.STRONG);
            
            const pX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
            const pY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
            const dX = ball.x - pX;
            const dY = ball.y - pY;

            if (Math.abs(dX) > Math.abs(dY)) {
              ball.dx = -ball.dx;
            } else {
              ball.dy = -ball.dy;
            }

            brick.health -= 1;
            if (brick.health <= 0) {
              brick.status = false;
              setScore((prev) => prev + brick.points);
              setRemainingBricks(prev => prev - 1);
              soundManager.playBrickDestroy();
              createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.color);
              
              // Spawn PowerUp
              if (brick.type === BrickType.POWERUP && brick.powerUp) {
                soundManager.playPowerUpDrop();
                powerUpsRef.current.push({
                  x: brick.x + brick.width / 2 - POWERUP_WIDTH / 2,
                  y: brick.y + brick.height / 2 - POWERUP_HEIGHT / 2,
                  type: brick.powerUp,
                  width: POWERUP_WIDTH,
                  height: POWERUP_HEIGHT,
                  active: true
                });
              }
            }
          }
        }
      });

      ball.x += ball.dx;
      ball.y += ball.dy;
      return true;
    });

    // Check if all balls are lost
    if (ballsRef.current.length === 0) {
      soundManager.playLifeLost();
      setLives((prev) => {
        if (prev <= 1) {
          setGameState(GameState.GAME_OVER);
          return 0;
        }
        resetBallAndPaddle();
        return prev - 1;
      });
    }

    // Victory check
    if (bricksRef.current.length > 0 && bricksRef.current.every(b => !b.status)) {
      setGameState(GameState.READY);
      setShowLevelTransition(true);
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update();
    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none bg-[radial-gradient(circle_at_center,_var(--color-slate-800)_0%,_var(--color-slate-900)_100%)]">
      {/* Header Info */}
      <header className="flex flex-wrap justify-between items-end w-full max-w-[800px] mb-5 px-2 gap-y-2">
        <h1 className="text-xl sm:text-2xl font-black tracking-[2px] uppercase text-brand w-full sm:w-auto text-center sm:text-left">
          Neon Breakout
          <span className="block text-[10px] text-slate-500 font-mono tracking-normal normal-case">
            Level {currentLevelIndex + 1}: {LEVELS[currentLevelIndex].name}
          </span>
        </h1>
        <div className="flex gap-4 sm:gap-8 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60 tracking-[1px]">Bricks</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tighter text-brand">
              {remainingBricks}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60 tracking-[1px]">Level</div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tighter">
              {currentLevelIndex + 1}/{LEVELS.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60 tracking-[1px]">Score</div>
            <motion.div 
              key={score}
              initial={{ scale: 1.2, color: '#38bdf8' }}
              animate={{ scale: 1, color: '#f8fafc' }}
              className="text-xl sm:text-2xl font-bold font-mono tracking-tighter"
            >
              {score.toString().padStart(5, '0')}
            </motion.div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60 tracking-[1px] mb-1">Lives</div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: i < lives ? 1 : 0.8,
                    opacity: i < lives ? 1 : 0.3
                  }}
                >
                  <Heart 
                    className={`w-5 h-5 ${i < lives ? 'text-danger fill-danger' : 'text-slate-700'}`} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Game Canvas Container */}
      <div className="relative border-2 border-slate-700 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-800 overflow-hidden">
        <div className="scanlines"></div>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onTouchStart={(e) => {
            handleMouseMove(e);
            if (gameState === GameState.READY && !showLevelTransition) startGame();
          }}
          onTouchMove={handleMouseMove}
          onClick={() => {
            if (gameState === GameState.READY && !showLevelTransition) startGame();
          }}
          className="cursor-none touch-none bg-slate-900"
        />

        {/* UI Overlays */}
        <AnimatePresence>
          {(gameState !== GameState.PLAYING || showLevelTransition) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-10"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center p-10 rounded-2xl border border-brand bg-slate-900 shadow-[0_0_50px_rgba(56,189,248,0.2)]"
              >
                {showLevelTransition && (
                  <>
                    <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase text-brand">
                      LEVEL COMPLETED
                    </h2>
                    <p className="text-slate-400 mb-8 font-mono">
                      NEXT: {LEVELS[currentLevelIndex + 1]?.name || "FINAL CHALLENGE"}
                    </p>
                    <button
                      onClick={nextLevel}
                      className="px-8 py-3 bg-brand text-slate-900 font-black rounded-sm hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest w-full"
                    >
                      CONTINUE
                    </button>
                  </>
                )}

                {gameState === GameState.READY && !showLevelTransition && (
                  <>
                    <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase text-brand">
                      NEON BREAKOUT
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto text-left text-xs font-mono uppercase tracking-tight">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-3 h-3 bg-brand rounded-sm"></div>
                        <span>Normal Brick</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-3 h-3 bg-slate-400 rounded-sm border border-white"></div>
                        <span>Strong (3 hits)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#FCD34D]">
                        <CircleDollarSign className="w-4 h-4" />
                        <span>Extra Points</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#F87171]">
                        <Zap className="w-4 h-4" />
                        <span>Speed Boost</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#34D399]">
                        <Shield className="w-4 h-4" />
                        <span>Paddle Expand</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#818CF8]">
                        <PlusCircle className="w-4 h-4" />
                        <span>Multi Ball</span>
                      </div>
                    </div>
                    <button
                      id="start-button"
                      onClick={startGame}
                      className="px-8 py-3 bg-brand text-slate-900 font-black rounded-sm hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest w-full"
                    >
                      PLAY NOW
                    </button>
                  </>
                )}

                {(gameState === GameState.GAME_OVER || gameState === GameState.WON) && (
                  <>
                    <h2 className={`text-6xl font-black mb-2 uppercase tracking-tighter ${gameState === GameState.WON ? 'text-brand' : 'text-danger'}`}>
                      {gameState === GameState.WON ? 'VICTORIOUS' : 'GAME OVER'}
                    </h2>
                    <p className="text-3xl font-mono mb-8 text-slate-400">FINAL SCORE: {score}</p>
                    <button
                      id="restart-button"
                      onClick={restartGame}
                      className="px-8 py-3 bg-brand text-slate-900 font-black rounded-sm hover:scale-105 transition-transform active:scale-95 uppercase tracking-widest"
                    >
                      PLAY AGAIN
                    </button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Instructions */}
      <footer className="mt-5 text-slate-50 opacity-50 text-[12px] tracking-[0.5px] font-mono uppercase">
        USE MOUSE TO MOVE PADDLE • CLICK TO START
      </footer>
    </div>
  );
}
