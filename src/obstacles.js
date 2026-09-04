import { addScore, score } from "./score.js";
import { collision } from "./collision.js";

const obstacleContainer = document.querySelector(".obstacles")

let obstacles = [];
let startTimer = 0;

const OBSTACLE_TYPES = [
  {
    id: "cactus-small",
    className: "obstacle--cactus-small",
    width: 45,
    height: 70,
    damage: 10,
    points: 10,
  },
  {
    id: "cactus-medium",
    className: "obstacle--cactus-medium",
    width: 60,
    height: 85,
    damage: 20,
    points: 20,
  },
  {
    id: "cactus-large",
    className: "obstacle--cactus-large",
    width: 60,
    height: 95,
    damage: 25,
     points: 40,
  },
  {
    id: "rock",
    className: "obstacle--rock",
    width: 90,
    height: 70,
    damage: 40,
    points: 20,
  },
];

export function getDifficultyByScore(score) {
  switch (true) {
    case score >= 1500:
      return {
        level: 5,
        baseSpeed:350,
        spawnTime: 1,
        label: "Level 5",
        message: "Survival Mode!"
      }
    case score >= 700:
      return {
        level: 4,
        baseSpeed: 300,
        spawnTime: 1,
        label: "Level 4",
        message: "Extreme Speed!"
      };
    case score >= 300:
      return {
        level: 3,
        baseSpeed: 230,
        spawnTime: 1.4,
        label: "Level 3",
        message: "Things are getting dangerous!"
      }
    case score >= 120:
      return {
        level: 2,
        baseSpeed: 180,
        spawnTime: 1.6,
        label: "Level 2",
        message: "Difficulty increased!",
      }
    default:
      return {
        level: 1,
        baseSpeed: 150,
        spawnTime: 2,
        label: "Level 1",
        message: "Warm up!"
      }
  }
}

function getRandomSpeed(baseSpeed) {
  const offsetSpeed = Math.floor(Math.random() * 80);

  return baseSpeed + offsetSpeed;
}

function getNextObstacleType() {
  const randomIndex = Math.floor(Math.random() * OBSTACLE_TYPES.length);

  return OBSTACLE_TYPES[randomIndex];
}

function createObstacleElement(obstacle) {
  const div = document.createElement("div")

  div.classList.add("obstacle", obstacle.className);

  div.style.left = `${obstacle.x}px`;
  div.style.top = `${obstacle.y}px`;

  return div
}

function createObstacle(gameAreaWidth, groundY, difficulty) {

  const obstacleType = getNextObstacleType();
  const speed = getRandomSpeed(difficulty.baseSpeed);

  const obstacle = {
    id: crypto.randomUUID(),
    type: obstacleType.id,
    className: obstacleType.className,
    x: gameAreaWidth,
    y: groundY - obstacleType.height,
    width: obstacleType.width,
    height: obstacleType.height,
    speed: speed,
    damage: obstacleType.damage,
    points: obstacleType.points,
    hasHit: false,
    scored: false,
    element: null,
  };

  obstacle.element = createObstacleElement(obstacle);

  return obstacle
}

export function spawnObstacles(deltatime, gameAreaWidth, groundY) {
  const difficulty = getDifficultyByScore(score);

  startTimer += deltatime

  if (startTimer < difficulty.spawnTime) return;

    const newObstacle = createObstacle(gameAreaWidth, groundY, difficulty)

    obstacles.push(newObstacle)

    obstacleContainer.appendChild(newObstacle.element)
    startTimer = 0
}


export function updateObstacles(deltaTime, player, groundY) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];

    obstacle.x -= obstacle.speed * deltaTime;
    obstacle.element.style.left = `${obstacle.x}px`;

    const obstacleRightEdge = obstacle.x + obstacle.width;

    if (!obstacle.scored && !obstacle.hasHit && obstacleRightEdge < player.x) {
      addScore(obstacle.points);
      obstacle.scored = true;
    }

    collision(player, obstacle, groundY, deltaTime)

    if (obstacleRightEdge < 0) {
      obstacle.element.remove();
      obstacles.splice(i, 1);
    }
  }

}

export function resetObstacles() {
  obstacles.forEach((obstacle) => obstacle.element.remove());
  obstacles = [];
  startTimer = 0;
}
