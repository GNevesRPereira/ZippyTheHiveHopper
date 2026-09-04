const btnContainer = document.querySelector(".touch-controls")

export const keys = {
    left: false,
    right: false,
    jump: false
};

function keyHelper(keyBoolean, event) {
    if (event.code === "KeyA") {
        keys.left = keyBoolean;
    }

    if (event.code === "KeyD") {
        keys.right = keyBoolean;
    }

    if (event.code === "Space") {
        event.preventDefault();
        keys.jump = keyBoolean;
    }
}

function handleTouchControls(event, isPressed){
    const left = event.target.closest('[data-control="left"]')
    const right = event.target.closest('[data-control="right"]')
    const jump = event.target.closest('[data-control="jump"]')

    if (!left && !right && !jump) return;

    event.preventDefault();
    event.stopPropagation();

    if (left) keys.left = isPressed;
    if (right) keys.right = isPressed;
    if (jump) keys.jump = isPressed;
}

export function initControls(){
    document.addEventListener("keydown", (e) => {
        keyHelper(true, e);
    });

    document.addEventListener("keyup", (e) => {
        keyHelper(false, e);
    });

    btnContainer.addEventListener("pointerdown", (e) =>{
        handleTouchControls(e, true)
    })

    btnContainer.addEventListener("pointerup", (e) =>{
        handleTouchControls(e, false)
    })

    btnContainer.addEventListener("pointercancel", (e)=>{
        e.stopPropagation()
        e.preventDefault()
        clearPlayerInput() 
    })
}

export function clearPlayerInput() {
    keys.left = false;
    keys.right = false;
    keys.jump = false;
}