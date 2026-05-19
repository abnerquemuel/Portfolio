const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const playButton = document.querySelector("#playButton");
const controlButtons = document.querySelectorAll("[data-direction]");

const tileCount = 20;
const tileSize = canvas.width / tileCount;

let snake;
let food;
let direction;
let nextDirection;
let score;
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
  food = createFood();
  running = true;
  scoreEl.textContent = score;
  playButton.textContent = "Reiniciar";

  clearInterval(gameLoop);
  gameLoop = setInterval(updateGame, 110);
  drawGame();
}

function createFood() {
  let position;

  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some((part) => part.x === position.x && part.y === position.y));

  return position;
}

function updateGame() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitBody = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitBody) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    food = createFood();
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
  snake.forEach((part, index) => {
    context.fillStyle = index === 0 ? "#31d158" : "#1a9f3b";
    context.fillRect(
      part.x * tileSize + 2,
      part.y * tileSize + 2,
      tileSize - 4,
      tileSize - 4
    );
  });
}

function drawFood() {
  context.fillStyle = "#ff3b30";
  context.beginPath();
  context.arc(
    food.x * tileSize + tileSize / 2,
    food.y * tileSize + tileSize / 2,
    tileSize / 2 - 3,
    0,
    Math.PI * 2
  );
  context.fill();
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
drawGame();
