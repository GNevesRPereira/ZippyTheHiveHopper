import { playDamageHitSound } from "./audio.js";


export function collision(player, obstacle, groundY, deltaTime) {
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacleLeft + obstacle.width;
    const obstacleTop = obstacle.y;
    const obstacleBottom = obstacleTop + obstacle.height;

    const playerLeft = player.x;
    const playerRight = playerLeft + player.width;

    const playerBottom = groundY - player.y;
    const playerTop = playerBottom - player.height;

    if (
        playerLeft < obstacleRight &&
        playerRight > obstacleLeft &&
        playerBottom > obstacleTop &&
        playerTop < obstacleBottom
    ) {

        handleObstacleHit(player, obstacle, deltaTime)
    }
}

function handleObstacleHit(player, obstacle, deltaTime) {
    if (obstacle.hasHit) return
    const knockBackAmount = player.speed * deltaTime * 60

    player.x -= knockBackAmount
    player.health -= obstacle.damage
    player.hasTakenDamage = true

    obstacle.hasHit = true;
    playDamageHitSound();
  
    if (player.health <= 0) {
        player.health = 0;
        player.isDead = true;

    }
}

export function boundaryCollision(player, gameArea, deltaTime) {
    const knockBackAmount = player.speed * deltaTime

    const playerLeft = player.x;
    const playerRight = playerLeft + player.width;

    const gameAreaLeft = 0
    const gameAreaRight = gameArea

    if (playerLeft < gameAreaLeft) {
        player.x += knockBackAmount
    }
    if (playerRight >= gameAreaRight) {
        player.x -= knockBackAmount
    }
}