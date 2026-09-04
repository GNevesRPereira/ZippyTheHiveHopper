let difficultyPopup = null;
let difficultyPopupTimer = 0;
const DIFFICULTY_POPUP_DURATION = 1.4;

function renderHealthBar(healthBarFill, healthValue, healthBar, playerHealth) {
    const health = Math.max(0, Math.min(100, playerHealth));

    healthBarFill.style.width = `${health}%`;
    healthValue.textContent = `${health}%`;
    healthBar.setAttribute("aria-valuenow", health);
}

function showDifficultyPopup(mainLayer, message, currentLevel) {
    removeDifficultyPopup();

    difficultyPopup = document.createElement("div");
    difficultyPopup.classList.add("difficulty-popup");

    const currentLvMsg = document.createElement("span")
    currentLvMsg.textContent = currentLevel
    const labelMsg = document.createElement("span")
    labelMsg.textContent = message;

    difficultyPopup.appendChild(currentLvMsg)
    difficultyPopup.appendChild(labelMsg)
    
    mainLayer.appendChild(difficultyPopup);
    difficultyPopupTimer = 0;
}

function updateDifficultyPopup(deltaTime) {
    if (!difficultyPopup) return;

    difficultyPopupTimer += deltaTime;

    if (difficultyPopupTimer >= DIFFICULTY_POPUP_DURATION) {
        removeDifficultyPopup();
    }
}

function removeDifficultyPopup() {
    if (!difficultyPopup) return;

    difficultyPopup.remove();
    difficultyPopup = null;
    difficultyPopupTimer = 0;
}

export {
    renderHealthBar,
    showDifficultyPopup,
    updateDifficultyPopup,
    removeDifficultyPopup
}
