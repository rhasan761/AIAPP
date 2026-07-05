import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const GRID_SIZE = 24;
const BOARD_SIZE = 480;
const TILE_COUNT = BOARD_SIZE / GRID_SIZE;
const TICK_RATE = 115;
const STARTING_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];
const STARTING_DIRECTION = { x: 1, y: 0 };

const KEY_DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function getStoredBestScore() {
  return Number(window.localStorage.getItem('snake-best-score') || 0);
}

function createApple(snake) {
  let apple;
  do {
    apple = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT),
    };
  } while (snake.some(segment => segment.x === apple.x && segment.y === apple.y));
  return apple;
}

function roundedTile(ctx, x, y, radius) {
  const inset = 3;
  const size = GRID_SIZE - inset * 2;
  const px = x * GRID_SIZE + inset;
  const py = y * GRID_SIZE + inset;
  ctx.beginPath();
  ctx.roundRect(px, py, size, size, radius);
  ctx.fill();
}

function drawBoard(ctx, game, overlay) {
  ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  ctx.fillStyle = '#091728';
  ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';

  for (let i = 0; i <= TILE_COUNT; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, BOARD_SIZE);
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(BOARD_SIZE, i * GRID_SIZE);
    ctx.stroke();
  }

  ctx.fillStyle = '#ff6078';
  ctx.shadowColor = '#ff6078';
  ctx.shadowBlur = 18;
  roundedTile(ctx, game.apple.x, game.apple.y, 10);
  ctx.shadowBlur = 0;

  game.snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
    gradient.addColorStop(0, index === 0 ? '#b7ff7d' : '#7cf37c');
    gradient.addColorStop(1, '#37d5ff');
    ctx.fillStyle = gradient;
    roundedTile(ctx, segment.x, segment.y, index === 0 ? 8 : 6);
  });

  if (overlay) {
    ctx.fillStyle = 'rgba(3, 9, 18, 0.72)';
    ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    ctx.fillStyle = '#eef7ff';
    ctx.textAlign = 'center';
    ctx.font = '700 42px Inter, sans-serif';
    ctx.fillText(overlay.title, BOARD_SIZE / 2, BOARD_SIZE / 2 - 12);
    ctx.fillStyle = '#9db4c7';
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillText(overlay.subtitle, BOARD_SIZE / 2, BOARD_SIZE / 2 + 26);
  }
}

function App() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const touchStartRef = useRef(null);
  const directionRef = useRef(STARTING_DIRECTION);
  const nextDirectionRef = useRef(STARTING_DIRECTION);
  const [bestScore, setBestScore] = useState(getStoredBestScore);
  const [game, setGame] = useState(() => ({
    snake: STARTING_SNAKE,
    apple: createApple(STARTING_SNAKE),
    score: 0,
    status: 'Ready',
    running: false,
    paused: false,
  }));

  const resetGame = useCallback(() => {
    clearInterval(gameLoopRef.current);
    directionRef.current = STARTING_DIRECTION;
    nextDirectionRef.current = STARTING_DIRECTION;
    setGame({
      snake: STARTING_SNAKE,
      apple: createApple(STARTING_SNAKE),
      score: 0,
      status: 'Ready',
      running: false,
      paused: false,
    });
  }, []);

  const startGame = useCallback(() => {
    setGame(current => {
      if (current.running && !current.paused) return current;
      if (current.status === 'Game over') {
        directionRef.current = STARTING_DIRECTION;
        nextDirectionRef.current = STARTING_DIRECTION;
        const snake = STARTING_SNAKE;
        return {
          snake,
          apple: createApple(snake),
          score: 0,
          status: 'Playing',
          running: true,
          paused: false,
        };
      }
      return {
        ...current,
        running: true,
        paused: false,
        status: 'Playing',
      };
    });
  }, []);

  const togglePause = useCallback(() => {
    setGame(current => !current.running ? current : {
      ...current,
      paused: !current.paused,
      status: current.paused ? 'Playing' : 'Paused',
    });
  }, []);

  const setDirection = useCallback(newDirection => {
    const direction = directionRef.current;
    const reversing = newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;
    if (!reversing) nextDirectionRef.current = newDirection;
  }, []);

  useEffect(() => {
    if (!game.running || game.paused) {
      clearInterval(gameLoopRef.current);
      return undefined;
    }

    gameLoopRef.current = setInterval(() => {
      setGame(current => {
        if (!current.running || current.paused) return current;
        directionRef.current = nextDirectionRef.current;
        const head = {
          x: current.snake[0].x + directionRef.current.x,
          y: current.snake[0].y + directionRef.current.y,
        };
        const wallHit = head.x < 0 || head.y < 0 || head.x >= TILE_COUNT || head.y >= TILE_COUNT;
        const selfHit = current.snake.some(segment => segment.x === head.x && segment.y === head.y);

        if (wallHit || selfHit) {
          const nextBest = Math.max(bestScore, current.score);
          window.localStorage.setItem('snake-best-score', String(nextBest));
          setBestScore(nextBest);
          return { ...current, running: false, paused: false, status: 'Game over' };
        }

        const snake = [head, ...current.snake];
        const ateApple = head.x === current.apple.x && head.y === current.apple.y;
        if (!ateApple) snake.pop();

        return {
          ...current,
          snake,
          apple: ateApple ? createApple(snake) : current.apple,
          score: ateApple ? current.score + 10 : current.score,
        };
      });
    }, TICK_RATE);

    return () => clearInterval(gameLoopRef.current);
  }, [bestScore, game.paused, game.running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const overlay = game.status === 'Game over'
      ? { title: 'Game Over', subtitle: 'Press Start to play again' }
      : game.paused
        ? { title: 'Paused', subtitle: 'Press Space to resume' }
        : null;
    drawBoard(ctx, game, overlay);
  }, [game]);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.code === 'Space') {
        event.preventDefault();
        game.running && !game.paused ? togglePause() : startGame();
        return;
      }
      const newDirection = KEY_DIRECTIONS[event.key];
      if (newDirection) {
        event.preventDefault();
        setDirection(newDirection);
        startGame();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [game.paused, game.running, setDirection, startGame, togglePause]);

  const handleTouchStart = event => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = event => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) {
      setDirection(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
      startGame();
    }
    touchStartRef.current = null;
  };

  return (
    <main className="game-shell">
      <section className="hero" aria-labelledby="game-title">
        <p className="eyebrow"><span aria-hidden="true">⚡</span> React arcade app</p>
        <h1 id="game-title">Snake Play Game</h1>
        <p className="intro">A real React app experience: play snake, track your best score, pause, reset, and swipe on touch screens.</p>
      </section>

      <section className="score-panel" aria-label="Game statistics">
        <div><span>Score</span><strong>{game.score}</strong></div>
        <div><span>Best</span><strong>{bestScore}</strong></div>
        <div><span>Status</span><strong>{game.status}</strong></div>
      </section>

      <section className="board-card">
        <canvas ref={canvasRef} width={BOARD_SIZE} height={BOARD_SIZE} aria-label="Snake game board" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} />
        <div className="controls">
          <button type="button" onClick={startGame}><span aria-hidden="true">▶</span> Start Game</button>
          <button type="button" onClick={togglePause}><span aria-hidden="true">⏸</span> Pause</button>
          <button type="button" onClick={resetGame}><span aria-hidden="true">↻</span> Reset</button>
        </div>
      </section>

      <section className="help-card" aria-labelledby="how-to-play">
        <h2 id="how-to-play"><span aria-hidden="true">🏆</span> How to play</h2>
        <ul>
          <li>Use arrow keys or WASD to move.</li>
          <li>On touch screens, swipe in the direction you want to go.</li>
          <li>Press Space to pause or resume.</li>
        </ul>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
