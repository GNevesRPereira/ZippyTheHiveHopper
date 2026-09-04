export let score = 0;

const scoreDisplay = document.querySelector("#score-display");

function updateScoreDisplay() {
    if (!scoreDisplay) return;

    scoreDisplay.textContent = `Score ${score}`;
}

export function addScore(points) {
    score += points;

    updateScoreDisplay();

    return score;
}

export function resetScore() {
    score = 0;

    updateScoreDisplay();
}