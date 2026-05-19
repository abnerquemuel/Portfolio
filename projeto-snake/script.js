const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const playButton = document.querySelector("#playButton");
const controlButtons = document.querySelectorAll("[data-direction]");

const tileCount = 20;
const tileSize = canvas.width / tileCount;

let snake;
let food;
let specialFood;
let enemy;
let direction;
let nextDirection;
let score;
let growthRemaining;
let moveCount;
let gameLoop;
let running = false;

function startGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  growthRemaining = 0;
  moveCount = 0;
  food = createFood();
  specialFood = null;
  enemy = null;
  running = true;
  scoreEl.textContent = score;
  playButton.textContent = "Reiniciar";

  clearInterval(gameLoop);
  gameLoop = setInterval(updateGame, 200);
  drawGame();
}

function createFood() {
  return createEmptyPosition();
}

function createEmptyPosition() {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (
    snake.some((part) => part.x === position.x && part.y === position.y) ||
    (food && food.x === position.x && food.y === position.y) ||
    (specialFood && specialFood.x === position.x && specialFood.y === position.y) ||
    (enemy && enemy.x === position.x && enemy.y === position.y)
  );

  return position;
}

function updateGame() {
  moveCount += 1;
  direction = nextDirection;
  moveEnemy();

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitBody = snake.some((part) => part.x === head.x && part.y === head.y);
  const hitEnemy = enemy && head.x === enemy.x && head.y === enemy.y;

  if (hitWall || hitBody || hitEnemy) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    growthRemaining += 1;
    scoreEl.textContent = score;
    food = createFood();
    if (!specialFood && Math.random() < 0.28) {
      specialFood = createEmptyPosition();
    }
  }

  if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
    score += 30;
    growthRemaining += 3;
    scoreEl.textContent = score;
    specialFood = null;
  }

  if (enemy && snake[0].x === enemy.x && snake[0].y === enemy.y) {
    endGame();
    return;
  }

  if (!enemy && moveCount > 12 && moveCount % 18 === 0) {
    enemy = createEmptyPosition();
  }

  if (growthRemaining > 0) {
    growthRemaining -= 1;
  } else {
    snake.pop();
  }

  drawGame();
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  drawGame();

  context.fillStyle = "rgba(8, 10, 13, 0.72)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f4f6f8";
  context.font = "700 34px Arial";
  context.textAlign = "center";
  context.fillText("Fim de jogo", canvas.width / 2, canvas.height / 2 - 8);
  context.font = "18px Arial";
  context.fillText("Clique em Jogar para tentar de novo", canvas.width / 2, canvas.height / 2 + 28);
}

function drawGame() {
  context.fillStyle = "#171c23";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSpecialFood();
  drawEnemy();
  drawSnake();
}

function drawGrid() {
  context.strokeStyle = "rgba(255, 255, 255, 0.04)";
  context.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const position = i * tileSize;
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }
}

function drawSnake() {
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#1a9f3b";
  context.lineWidth = tileSize - 7;

  context.beginPath();
  snake.forEach((part, index) => {
    const centerX = part.x * tileSize + tileSize / 2;
    const centerY = part.y * tileSize + tileSize / 2;

    if (index === 0) {
      context.moveTo(centerX, centerY);
    } else {
      context.lineTo(centerX, centerY);
    }
  });
  context.stroke();

  const head = snake[0];
  const headX = head.x * tileSize + tileSize / 2;
  const headY = head.y * tileSize + tileSize / 2;

  context.fillStyle = "#31d158";
  context.beginPath();
  context.arc(headX, headY, tileSize / 2 - 3, 0, Math.PI * 2);
  context.fill();

  drawSnakeEyes(headX, headY);
}

function drawSnakeEyes(headX, headY) {
  const horizontal = direction.x !== 0;
  const eyeOffsetX = horizontal ? direction.x * 5 : 5;
  const eyeOffsetY = horizontal ? 5 : direction.y * 5;

  context.fillStyle = "#f4f6f8";
  context.beginPath();
  context.arc(headX + eyeOffsetX, headY - eyeOffsetY, 3, 0, Math.PI * 2);
  context.arc(headX + eyeOffsetX, headY + eyeOffsetY, 3, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#11151b";
  context.beginPath();
  context.arc(headX + eyeOffsetX + direction.x, headY - eyeOffsetY + direction.y, 1.4, 0, Math.PI * 2);
  context.arc(headX + eyeOffsetX + direction.x, headY + eyeOffsetY + direction.y, 1.4, 0, Math.PI * 2);
  context.fill();
}

function drawFood() {
  const centerX = food.x * tileSize + tileSize / 2;
  const centerY = food.y * tileSize + tileSize / 2 + 2;
  const radius = tileSize / 2 - 4;

  context.fillStyle = "#ff3b30";
  context.beginPath();
  context.arc(centerX - 4, centerY, radius * 0.72, 0, Math.PI * 2);
  context.arc(centerX + 4, centerY, radius * 0.72, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#7a3f16";
  context.fillRect(centerX - 1.5, centerY - radius - 4, 3, 8);

  context.fillStyle = "#31d158";
  context.beginPath();
  context.ellipse(centerX + 6, centerY - radius - 3, 6, 3, -0.45, 0, Math.PI * 2);
  context.fill();
}

function drawSpecialFood() {
  if (!specialFood) return;
  drawApple(specialFood, "#8e44ff", "#5c2aa8", "#31d158");
}

function drawApple(position, color, shadowColor, leafColor) {
  const centerX = position.x * tileSize + tileSize / 2;
  const centerY = position.y * tileSize + tileSize / 2 + 2;
  const radius = tileSize / 2 - 4;

  context.fillStyle = color;
  context.beginPath();
  context.arc(centerX - 4, centerY, radius * 0.72, 0, Math.PI * 2);
  context.arc(centerX + 4, centerY, radius * 0.72, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = shadowColor;
  context.beginPath();
  context.arc(centerX + 4, centerY + 4, radius * 0.38, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#7a3f16";
  context.fillRect(centerX - 1.5, centerY - radius - 4, 3, 8);

  context.fillStyle = leafColor;
  context.beginPath();
  context.ellipse(centerX + 6, centerY - radius - 3, 6, 3, -0.45, 0, Math.PI * 2);
  context.fill();
}

function moveEnemy() {
  if (!enemy) return;

  if (moveCount % 2 !== 0) {
    return;
  }

  const head = snake[0];
  const deltaX = head.x - enemy.x;
  const deltaY = head.y - enemy.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    enemy.x += Math.sign(deltaX);
  } else if (deltaY !== 0) {
    enemy.y += Math.sign(deltaY);
  } else if (deltaX !== 0) {
    enemy.x += Math.sign(deltaX);
  }
}

function drawEnemy() {
  if (!enemy) return;

  const centerX = enemy.x * tileSize + tileSize / 2;
  const centerY = enemy.y * tileSize + tileSize / 2;

  context.fillStyle = "#c084fc";
  context.beginPath();
  context.arc(centerX, centerY, tileSize / 2 - 4, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#11151b";
  context.beginPath();
  context.arc(centerX - 5, centerY - 3, 2.5, 0, Math.PI * 2);
  context.arc(centerX + 5, centerY - 3, 2.5, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#11151b";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(centerX, centerY + 4, 6, 0.15, Math.PI - 0.15);
  context.stroke();
}

function changeDirection(newDirection) {
  if (!running) return;

  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const selected = directions[newDirection];
  const isOpposite = selected.x + direction.x === 0 && selected.y + direction.y === 0;

  if (!isOpposite) {
    nextDirection = selected;
  }
}

playButton.addEventListener("click", startGame);

window.addEventListener("keydown", (event) => {
  const keyDirections = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right"
  };

  const newDirection = keyDirections[event.key];
  if (newDirection) {
    event.preventDefault();
    changeDirection(newDirection);
  }
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeDirection(button.dataset.direction);
  });
});

snake = [{ x: 10, y: 10 }];
food = { x: 14, y: 10 };
specialFood = null;
enemy = null;
direction = { x: 1, y: 0 };
nextDirection = { x: 1, y: 0 };
drawGame();
