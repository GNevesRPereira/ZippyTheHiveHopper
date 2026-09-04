import {
    menuMusic,
    mainMusic,
    playMenuSound,
    defeatMusic,
    stopMusic,
    setMusicPaused,
    playDeathScream,
    exitMusic
} from "./audio.js";

import {
    updatePlayer,
    player,
    initPlayerAnimation,
    renderPlayer,
    resetPlayer,
} from "./player.js";

import {
    renderHealthBar,
    showDifficultyPopup,
    updateDifficultyPopup,
    removeDifficultyPopup
} from "./hud.js"

import {
    spawnObstacles,
    updateObstacles,
    resetObstacles,
    getDifficultyByScore
} from "./obstacles.js";

import{
    clearPlayerInput,
    initControls
} from "./controls.js"

import { boundaryCollision } from "./collision.js";
import { resetScore, score } from "./score.js";
import { initVolumeControls } from "./volumeControls.js";

const mainContaniner = document.querySelector(".main")
const gameCanvas = mainContaniner.querySelector(".game");
const mainMenu = gameCanvas.querySelector(".main-menu");
const pauseMenu = gameCanvas.querySelector(".pause-menu");
const gameOverMenu = gameCanvas.querySelector(".game-over-menu");
const mainLayer = gameCanvas.querySelector(".game-layer--main");
const playerElement = mainLayer.querySelector(".player");
const ground = mainLayer.querySelector(".ground")
const healthBar = mainLayer.querySelector(".health-bar");
const healthBarFill = mainLayer.querySelector(".health-bar__fill");
const healthValue = mainLayer.querySelector(".health-status__value");
const finalScoreDisplay = gameOverMenu.querySelector(".final-score");
const hudPauseBtn = mainLayer.querySelector('[data-action="pause"]');

let groundY = 0;
let gameLayerWidth = 0;

let lastTime = 0;
let isGameStarted = false;
let isPaused = false;
let isGameOver = false;
let animationFrameId = null;
let currentDifficultyLevel = 1;


function initMenuActions() {
    mainMenu.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === "start") {
            stopMusic();
            playMenuSound();
            mainMusic();
            setMusicPaused(false);
            isGameStarted = true;
            isPaused = false;
            isGameOver = false;
            lastTime = 0;
            resetGameState();
            mainMenu.classList.add("hide-main-menu");
            pauseMenu.classList.add("hide-pause-menu");
            gameOverMenu.classList.add("hide-game-over-menu");
            gameCanvas.classList.remove("is-paused");
            startGameLoop();
        }

        if (action === "exit") {
            playMenuSound();
            exitFromTheGame()
        }
    });

    pauseMenu.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === "resume") {
            resumeGame();
        }

        if (action === "main-menu") {
            returnToMainMenu();
        }
    });

    gameOverMenu.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;

        if (action === "retry") {
            restartGame();
        }

        if (action === "main-menu") {
            returnToMainMenu();
        }
    });

    hudPauseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isGameStarted || isGameOver || isPaused) return;

        togglePause();
    });

    document.addEventListener("keydown", (e) => {
        if (!isGameStarted || isGameOver || e.repeat) return;

        if (e.code === "Escape" || e.code === "KeyP") {
            e.preventDefault();
            togglePause();
        }
    });
}

function startGameLoop() {
    if (animationFrameId !== null) return;

    animationFrameId = requestAnimationFrame(game);
}

function stopGameLoop() {
    if (animationFrameId === null) return;

    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
}

function togglePause() {
    if (isPaused) {
        resumeGame();
        return;
    }

    pauseGame();
}

function pauseGame() {
    if (isGameOver) return;

    isPaused = true;
    stopGameLoop();
    clearPlayerInput()
    renderPlayer(playerElement);
    pauseMenu.classList.remove("hide-pause-menu");
    gameCanvas.classList.add("is-paused");
    setMusicPaused(true);
    playMenuSound();
}

function resumeGame() {
    isPaused = false;
    lastTime = 0;
    pauseMenu.classList.add("hide-pause-menu");
    gameCanvas.classList.remove("is-paused");
    setMusicPaused(false);
    playMenuSound();
    startGameLoop();
}

function returnToMainMenu() {
    isGameStarted = false;
    isPaused = false;
    isGameOver = false;
    lastTime = 0;
    stopGameLoop();
    clearPlayerInput()
    renderPlayer(playerElement);
    pauseMenu.classList.add("hide-pause-menu");
    gameOverMenu.classList.add("hide-game-over-menu");
    mainMenu.classList.remove("hide-main-menu");
    gameCanvas.classList.remove("is-paused");
    playMenuSound();
    stopMusic();
    menuMusic();
}

function resetGameState() {
    resetPlayer()
    resetObstacles();
    renderPlayer(playerElement);
    resetScore()
    renderHealthBar(healthBarFill, healthValue, healthBar, player.health);
    currentDifficultyLevel = 1;
    removeDifficultyPopup();

    const initialDifficulty = getDifficultyByScore(score);
    showDifficultyPopup(mainLayer, initialDifficulty.message, initialDifficulty.label);
}

function restartGame() {
    stopMusic();
    playMenuSound();
    mainMusic();
    setMusicPaused(false);
    isGameStarted = true;
    isPaused = false;
    isGameOver = false;
    lastTime = 0;
    resetGameState();
    gameOverMenu.classList.add("hide-game-over-menu");
    pauseMenu.classList.add("hide-pause-menu");
    mainMenu.classList.add("hide-main-menu");
    gameCanvas.classList.remove("is-paused");
    startGameLoop();
}

function renderFinalScore() {
    finalScoreDisplay.textContent = `Final score: ${score}`;
}

function showGameOverMenu() {
    isGameStarted = false;
    isPaused = false;
    isGameOver = true;
    lastTime = 0;
    stopGameLoop();
    renderFinalScore()
    clearPlayerInput();
    renderPlayer(playerElement);
    pauseMenu.classList.add("hide-pause-menu");
    gameOverMenu.classList.remove("hide-game-over-menu");
    gameCanvas.classList.remove("is-paused");
    defeatMusic();
}
function checkDifficultyChange() {
    const difficulty = getDifficultyByScore(score);

    if (difficulty.level === currentDifficultyLevel) return;

    currentDifficultyLevel = difficulty.level;
    showDifficultyPopup(mainLayer, difficulty.message, difficulty.label);
}
function exitFromTheGame() {
    window.removeEventListener("resize", refreshGameLayerMetrics);
    stopMusic();
    exitMusic();
    gameCanvas.remove()
    const section = document.createElement("section")
    section.classList.add("close-message")

    const title = document.createElement("h2")
    title.textContent = "Thank you for playing"

    const paragraph = document.createElement("p")
    paragraph.textContent = "Reload the page to play again"

    section.appendChild(title)
    section.appendChild(paragraph)
    mainContaniner.appendChild(section)
}

function refreshGameLayerMetrics() {
    gameLayerWidth = mainLayer.getBoundingClientRect().width;

    const gameLayerTop = mainLayer.getBoundingClientRect().top;
    const groundTop = ground.getBoundingClientRect().top;
    groundY = groundTop - gameLayerTop;

    if (player.x + player.width > gameLayerWidth) {
        player.x = gameLayerWidth - player.width;
    }

    if (player.x < 0) {
        player.x = 0;
    }
}

function initResponsiveLayout() {
    refreshGameLayerMetrics();
    window.addEventListener("resize", refreshGameLayerMetrics);
}



function game(timeStamp) {
    animationFrameId = null;

    if (!isGameStarted || isPaused) return;

    if (lastTime === 0) {
        lastTime = timeStamp;
    }

    const deltaTime = (timeStamp - lastTime) / 1000;
    lastTime = timeStamp;

    updatePlayer(deltaTime);
    spawnObstacles(deltaTime, gameLayerWidth, groundY)
    updateObstacles(deltaTime, player, groundY)
    boundaryCollision(player, gameLayerWidth, deltaTime)
    renderPlayer(playerElement, deltaTime);
    renderHealthBar(healthBarFill, healthValue, healthBar, player.health)
    checkDifficultyChange()
    updateDifficultyPopup(deltaTime)

    if (player.isDead) {
        showGameOverMenu();
        playDeathScream();
        return
    }
    startGameLoop();
}

function initGame() {
    initVolumeControls();
    initMenuActions();
    initPlayerAnimation(playerElement);
    initResponsiveLayout();
    initControls()
}

initGame();

