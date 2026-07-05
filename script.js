const canvas = document.querySelector('#game-board');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bestScoreEl = document.querySelector('#best-score');
const statusEl = document.querySelector('#status');
const startButton = document.querySelector('#start-button');
const pauseButton = document.querySelector('#pause-button');
const resetButton = document.querySelector('#reset-button');

const gridSize = 24;
const tileCount = canvas.width / gridSize;
const tickRate = 115;

let snake;
let apple;
let direction;
let nextDirection;
let score;
let bestScore = Number(localStorage.getItem('snake-best-score') || 0);
let gameLoop;
let running = false;
let paused = false;
let touchStart = null;

bestScoreEl.textContent = bestScore;

function resetGame() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  apple = createApple();
  running = false;
  paused = false;
  updateScore();
  updateStatus('Ready');
  draw();
}

function startGame() {
  if (running && !paused) return;
  running = true;
  paused = false;
  updateStatus('Playing');
  clearInterval(gameLoop);
  gameLoop = setInterval(gameTick, tickRate);
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  updateStatus(paused ? 'Paused' : 'Playing');
}

function gameTick() {
  if (paused) return;
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (hasCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 10;
    apple = createApple();
    updateScore();
  } else {
    snake.pop();
  }

  draw();
}

function hasCollision(head) {
  const wallHit = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const selfHit = snake.some(segment => segment.x === head.x && segment.y === head.y);
  return wallHit || selfHit;
}

function createApple() {
  let newApple;
  do {
    newApple = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake?.some(segment => segment.x === newApple.x && segment.y === newApple.y));
  return newApple;
}

function endGame() {
  clearInterval(gameLoop);
  running = false;
  paused = false;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('snake-best-score', bestScore);
    bestScoreEl.textContent = bestScore;
  }
  updateStatus('Game over');
  draw(true);
}

function updateScore() {
  scoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
}

function updateStatus(status) {
  statusEl.textContent = status;
}

function setDirection(newDirection) {
  const reversing = newDirection.x + direction.x === 0 && newDirection.y + direction.y === 0;
  if (!reversing) nextDirection = newDirection;
}

function draw(showGameOver = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawApple();
  drawSnake();
  if (showGameOver) drawOverlay('Game Over', 'Press Start to play again');
  if (paused) drawOverlay('Paused', 'Press Space to resume');
}

function drawGrid() {
  ctx.fillStyle = '#091728';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, index === 0 ? '#b7ff7d' : '#7cf37c');
    gradient.addColorStop(1, '#37d5ff');
    ctx.fillStyle = gradient;
    roundedTile(segment.x, segment.y, index === 0 ? 8 : 6);
  });
}

function drawApple() {
  ctx.fillStyle = '#ff6078';
  ctx.shadowColor = '#ff6078';
  ctx.shadowBlur = 18;
  roundedTile(apple.x, apple.y, 10);
  ctx.shadowBlur = 0;
}

function roundedTile(x, y, radius) {
  const inset = 3;
  const size = gridSize - inset * 2;
  const px = x * gridSize + inset;
  const py = y * gridSize + inset;
  ctx.beginPath();
  ctx.roundRect(px, py, size, size, radius);
  ctx.fill();
}

function drawOverlay(title, subtitle) {
  ctx.fillStyle = 'rgba(3, 9, 18, 0.72)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#eef7ff';
  ctx.textAlign = 'center';
  ctx.font = '700 42px Inter, sans-serif';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 12);
  ctx.fillStyle = '#9db4c7';
  ctx.font = '500 18px Inter, sans-serif';
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 26);
}

const keyMap = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

document.addEventListener('keydown', event => {
  if (event.code === 'Space') {
    event.preventDefault();
    running && !paused ? togglePause() : startGame();
    return;
  }
  const newDirection = keyMap[event.key];
  if (newDirection) {
    event.preventDefault();
    setDirection(newDirection);
    startGame();
  }
});

canvas.addEventListener('touchstart', event => {
  const touch = event.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

canvas.addEventListener('touchend', event => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) {
    setDirection(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
    startGame();
  }
  touchStart = null;
}, { passive: true });

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
resetButton.addEventListener('click', () => {
  clearInterval(gameLoop);
  resetGame();
});

resetGame();
