import { playJumpSound, playLandSound } from "./audio.js";
import { keys, clearPlayerInput } from "./controls.js";


/*
 * ============================================================
 * PLAYER
 * ============================================================
 */

export const player = {

    /*
     * ========================================================
     * COLLISION / PHYSICS DIMENSIONS
     * ========================================================
     */

    x: 80,
    y: 0,

    width: 60,
    height: 90,

    speed: 240,

    velocityY: 0,

    isJumping: false,

    health: 100,

    hasTakenDamage: false,
    isDead: false,

    /*
     * 1  = facing right
     * -1 = facing left
     */
    facing: 1
};


/*
 * ============================================================
 * PHYSICS
 * ============================================================
 */

const GRAVITY = 900;
const JUMP_FORCE = 480;


/*
 * ============================================================
 * SPRITESHEET
 * ============================================================
 */

const SPRITE_SHEET = new URL(
    "./images/Grasshopper_Spritesheet.png",
    import.meta.url
).href;


/*
 * ============================================================
 * SPRITESHEET FRAME COORDINATES
 * ============================================================
 *
 * Actual spritesheet size:
 *
 * 8480 x 4208
 *
 * The sheet contains:
 *
 * ROW 1 = RUN
 * ROW 2 = JUMP
 * ROW 3 = DAMAGE
 *
 * The coordinates below correspond to the actual visible
 * character areas in the spritesheet.
 *
 * Each frame is cropped tightly around its artwork.
 */


/*
 * ============================================================
 * RUN FRAMES
 * ============================================================
 */

const SPRITE_FRAMES = {

    run: [

        {
            x: 271,
            y: 362,
            width: 751,
            height: 805
        },

        {
            x: 1398,
            y: 424,
            width: 614,
            height: 741
        },

        {
            x: 2239,
            y: 366,
            width: 787,
            height: 787
        },

        {
            x: 3231,
            y: 346,
            width: 870,
            height: 785
        },

        {
            x: 4395,
            y: 379,
            width: 818,
            height: 761
        },

        {
            x: 5523,
            y: 343,
            width: 773,
            height: 803
        },

        {
            x: 6571,
            y: 388,
            width: 597,
            height: 758
        },

        {
            x: 7438,
            y: 372,
            width: 824,
            height: 777
        }

    ],


    /*
     * ========================================================
     * JUMP FRAMES
     * ========================================================
     */

    jump: [

        {
            x: 340,
            y: 1911,
            width: 614,
            height: 761
        },

        {
            x: 1275,
            y: 1725,
            width: 701,
            height: 926
        },

        {
            x: 2302,
            y: 1583,
            width: 709,
            height: 969
        },

        {
            x: 3565,
            y: 1661,
            width: 498,
            height: 730
        },

        {
            x: 4675,
            y: 1911,
            width: 498,
            height: 758
        },

        {
            x: 5772,
            y: 2035,
            width: 544,
            height: 642
        },

        {
            x: 6640,
            y: 2036,
            width: 539,
            height: 638
        },

        {
            x: 7748,
            y: 1863,
            width: 538,
            height: 810
        }

    ],


    /*
     * ========================================================
     * DAMAGE FRAMES
     * ========================================================
     */

    damage: [

        {
            x: 191,
            y: 3120,
            width: 930,
            height: 805
        },

        {
            x: 1349,
            y: 3017,
            width: 736,
            height: 892
        },

        {
            x: 2390,
            y: 3051,
            width: 645,
            height: 817
        },

        {
            x: 3545,
            y: 3089,
            width: 597,
            height: 809
        }

    ]

};


/*
 * ============================================================
 * SPRITE CONFIGURATION
 * ============================================================
 */


/*
 * Internal canvas dimensions.
 *
 * This should match the CSS dimensions of the sprite canvas.
 */

const CANVAS_WIDTH = 120;
const CANVAS_HEIGHT = 190;


/*
 * How large the original spritesheet artwork appears
 * inside the game.
 *
 * 0.11 means:
 *
 * 1000 source pixels -> approximately 110 game pixels.
 */

const SPRITE_SCALE = 0.11;


/*
 * Animation speeds.
 */

const RUN_FPS = 12;
const JUMP_FPS = 8;
const DAMAGE_FPS = 10;


/*
 * ============================================================
 * SPRITE STATE
 * ============================================================
 */

let spriteCanvas = null;
let spriteContext = null;

let spriteSheetImage = null;

let spritesReady = false;


/*
 * Extracted sprite frames.
 */

let loadedFrames = {

    run: [],
    jump: [],
    damage: []

};


/*
 * ============================================================
 * CURRENT ANIMATION
 * ============================================================
 *
 * There is intentionally NO idle animation.
 *
 * When Zippy is on the ground, RUN is always played.
 */

let currentAnimation = "run";

let currentFrame = 0;

let animationTimer = 0;


/*
 * ============================================================
 * DAMAGE ANIMATION
 * ============================================================
 */

const DAMAGE_DURATION =
    SPRITE_FRAMES.damage.length / DAMAGE_FPS;


/*
 * Starting at DAMAGE_DURATION means that the damage
 * animation is initially inactive.
 */

let damageTimer = DAMAGE_DURATION;


/*
 * ============================================================
 * SPRITE LOADING
 * ============================================================
 */

export function initPlayerAnimation(playerElement) {

    /*
     * Find the canvas.
     */

    spriteCanvas =
        playerElement.querySelector(".player-sprite");


    if (!spriteCanvas) {

        console.error(
            "Player sprite canvas was not found."
        );

        return;
    }


    /*
     * Set the internal canvas resolution.
     */

    spriteCanvas.width =
        CANVAS_WIDTH;

    spriteCanvas.height =
        CANVAS_HEIGHT;


    /*
     * Get drawing context.
     */

    spriteContext =
        spriteCanvas.getContext("2d");


    /*
     * Improve scaling quality.
     */

    spriteContext.imageSmoothingEnabled = true;


    /*
     * Create spritesheet image.
     */

    spriteSheetImage = new Image();


    /*
     * ========================================================
     * IMAGE LOADED
     * ========================================================
     */

    spriteSheetImage.onload = () => {

        /*
         * Extract run frames.
         */

        loadedFrames.run =
            SPRITE_FRAMES.run.map(createFrame);


        /*
         * Extract jump frames.
         */

        loadedFrames.jump =
            SPRITE_FRAMES.jump.map(createFrame);


        /*
         * Extract damage frames.
         */

        loadedFrames.damage =
            SPRITE_FRAMES.damage.map(createFrame);


        /*
         * Sprite system is ready.
         */

        spritesReady = true;


        /*
         * Start with run animation.
         */

        currentAnimation = "run";

        currentFrame = 0;

        animationTimer = 0;


        /*
         * Draw immediately.
         */

        drawCurrentFrame();

    };


    /*
     * ========================================================
     * IMAGE ERROR
     * ========================================================
     */

    spriteSheetImage.onerror = () => {

        console.error(
            "Could not load Grasshopper_Spritesheet.png"
        );

    };


    /*
     * Start loading.
     */

    spriteSheetImage.src =
        SPRITE_SHEET;
}


/*
 * ============================================================
 * CREATE FRAME
 * ============================================================
 *
 * Takes one rectangle from the spritesheet and removes
 * the green background.
 */

function createFrame(frame) {

    /*
     * Create temporary canvas.
     */

    const sourceCanvas =
        document.createElement("canvas");


    sourceCanvas.width =
        frame.width;

    sourceCanvas.height =
        frame.height;


    /*
     * Context.
     */

    const sourceContext =
        sourceCanvas.getContext("2d");


    /*
     * Draw selected spritesheet rectangle.
     */

    sourceContext.drawImage(

        spriteSheetImage,

        frame.x,
        frame.y,

        frame.width,
        frame.height,

        0,
        0,

        frame.width,
        frame.height

    );


    /*
     * ========================================================
     * REMOVE GREEN BACKGROUND
     * ========================================================
     */

    const imageData =
        sourceContext.getImageData(

            0,
            0,

            frame.width,
            frame.height

        );


    const pixels =
        imageData.data;


    /*
     * Original background colour.
     */

    const background = {

        r: 184,
        g: 253,
        b: 199

    };


    /*
     * Examine every pixel.
     */

    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        const r =
            pixels[i];

        const g =
            pixels[i + 1];

        const b =
            pixels[i + 2];


        /*
         * Distance from background colour.
         */

        const distance =
            Math.sqrt(

                Math.pow(
                    r - background.r,
                    2
                ) +

                Math.pow(
                    g - background.g,
                    2
                ) +

                Math.pow(
                    b - background.b,
                    2
                )

            );


        /*
         * Fully transparent background.
         */

        if (distance < 45) {

            pixels[i + 3] = 0;

        }


        /*
         * Soft transparency around the edges.
         */

        else if (distance < 90) {

            pixels[i + 3] =
                Math.round(
                    ((distance - 45) / 45) * 255
                );

        }

    }


    /*
     * Put modified pixels back.
     */

    sourceContext.putImageData(

        imageData,

        0,
        0

    );


    return sourceCanvas;
}


/*
 * ============================================================
 * DRAW CURRENT FRAME
 * ============================================================
 *
 * This is where the important coordinate correction happens.
 *
 * Instead of simply stretching every frame to the same size,
 * we:
 *
 * 1. Preserve the original frame proportions.
 * 2. Scale it consistently.
 * 3. Center it horizontally.
 * 4. Align the bottom of the artwork to the same baseline.
 *
 * This prevents the character from visibly jumping sideways
 * between animation frames.
 */

function drawCurrentFrame() {

    /*
     * Do nothing until everything is ready.
     */

    if (
        !spritesReady ||
        !spriteContext
    ) {

        return;

    }


    /*
     * Clear canvas.
     */

    spriteContext.clearRect(

        0,
        0,

        CANVAS_WIDTH,
        CANVAS_HEIGHT

    );


    /*
     * Get current animation frames.
     */

    const frames =
        loadedFrames[currentAnimation];


    if (
        !frames ||
        frames.length === 0
    ) {

        return;

    }


    /*
     * Get current frame.
     */

    const frame =
        frames[
            currentFrame % frames.length
        ];


    /*
     * ========================================================
     * DISPLAY SIZE
     * ========================================================
     */

    const width =
        frame.width * SPRITE_SCALE;


    const height =
        frame.height * SPRITE_SCALE;


    /*
     * ========================================================
     * HORIZONTAL POSITION
     * ========================================================
     *
     * Always use the center of the 120px canvas.
     */

    const x =
        (CANVAS_WIDTH - width) / 2;


    /*
     * ========================================================
     * VERTICAL POSITION
     * ========================================================
     *
     * The bottom of the sprite always meets the bottom of
     * the canvas.
     */

    const y =
        CANVAS_HEIGHT - height;


    /*
     * ========================================================
     * DRAW
     * ========================================================
     */

    spriteContext.save();


    /*
     * ========================================================
     * FACE LEFT
     * ========================================================
     */

    if (player.facing === -1) {

        spriteContext.translate(

            CANVAS_WIDTH,
            0

        );

        spriteContext.scale(

            -1,
            1

        );

    }


    /*
     * Draw frame.
     */

    spriteContext.drawImage(

        frame,

        x,
        y,

        width,
        height

    );


    /*
     * Restore canvas state.
     */

    spriteContext.restore();
}


/*
 * ============================================================
 * CHANGE ANIMATION
 * ============================================================
 */

function setAnimation(animation) {

    /*
     * Don't restart the animation if it is already active.
     */

    if (
        currentAnimation === animation
    ) {

        return;

    }


    /*
     * Change animation.

     */

    currentAnimation =
        animation;


    /*
     * Start at first frame.

     */

    currentFrame = 0;


    /*
     * Reset animation timer.

     */

    animationTimer = 0;
}


/*
 * ============================================================
 * UPDATE PLAYER
 * ============================================================
 */

export function updatePlayer(deltaTime) {

    /*
     * ========================================================
     * HORIZONTAL MOVEMENT
     * ========================================================
     */

    if (keys.left) {

        player.x -=
            player.speed *
            deltaTime;

        player.facing = -1;

    }


    if (keys.right) {

        player.x +=
            player.speed *
            deltaTime;

        player.facing = 1;

    }


    /*
     * ========================================================
     * JUMP
     * ========================================================
     */

    if (
        keys.jump &&
        !player.isJumping
    ) {

        player.velocityY =
            JUMP_FORCE;


        player.isJumping =
            true;


        /*
         * Consume jump input.
         */

        keys.jump = false;


        /*
         * Play sound.
         */

        playJumpSound();

    }


    /*
     * ========================================================
     * VERTICAL PHYSICS
     * ========================================================
     */

    if (player.isJumping) {

        /*
         * Move player.

         */

        player.y +=
            player.velocityY *
            deltaTime;


        /*
         * Gravity.

         */

        player.velocityY -=
            GRAVITY *
            deltaTime;


        /*
         * ====================================================
         * LANDING
         * ====================================================
         */

        if (player.y <= 0) {

            player.y = 0;

            player.velocityY = 0;

            player.isJumping = false;


            /*
             * Landing sound.

             */

            playLandSound();

        }

    }
}


/*
 * ============================================================
 * RENDER PLAYER
 * ============================================================
 */

export function renderPlayer(
    playerElement,
    deltaTime = 0
) {

    /*
     * ========================================================
     * WORLD POSITION
     * ========================================================
     */

    playerElement.style.transform =
        `translate(${player.x}px, ${-player.y}px)`;


    /*
     * ========================================================
     * FACING DIRECTION
     * ========================================================
     */

    if (keys.left) {

        player.facing = -1;

    }

    else if (keys.right) {

        player.facing = 1;

    }


    /*
     * ========================================================
     * DAMAGE TRIGGER
     * ========================================================
     */

    if (player.hasTakenDamage) {

        /*
         * Restart damage animation.

         */

        damageTimer = 0;

        currentFrame = 0;

        animationTimer = 0;


        /*
         * Flash player.

         */

        playerElement.classList.add(
            "damage"
        );


        /*
         * Consume trigger.

         */

        player.hasTakenDamage = false;

    }


    /*
     * ========================================================
     * DAMAGE ANIMATION
     * ========================================================
     *
     * Highest priority.
     */

    if (
        damageTimer < DAMAGE_DURATION
    ) {

        damageTimer +=
            deltaTime;


        setAnimation("damage");


        animationTimer +=
            deltaTime;


        const frameDuration =
            1 / DAMAGE_FPS;


        /*
         * Advance frames.

         */

        while (
            animationTimer >=
            frameDuration
        ) {

            animationTimer -=
                frameDuration;


            currentFrame++;

        }


        /*
         * Stay on final damage frame.

         */

        currentFrame =
            Math.min(

                currentFrame,

                loadedFrames.damage.length - 1

            );


        /*
         * Remove CSS flash when finished.

         */

        if (
            damageTimer >= DAMAGE_DURATION
        ) {

            playerElement.classList.remove(
                "damage"
            );

        }

    }


    /*
     * ========================================================
     * JUMP ANIMATION
     * ========================================================
     */

    else if (player.isJumping) {

        setAnimation("jump");


        animationTimer +=
            deltaTime;


        const frameDuration =
            1 / JUMP_FPS;


        /*
         * Advance jump frames.

         */

        while (
            animationTimer >=
            frameDuration
        ) {

            animationTimer -=
                frameDuration;


            currentFrame++;

        }


        /*
         * Loop jump animation.

         */

        currentFrame =
            currentFrame %
            loadedFrames.jump.length;

    }


    /*
     * ========================================================
     * RUN ANIMATION
     * ========================================================
     *
     * RUN is always the default grounded animation.
     */

    else {

        setAnimation("run");


        animationTimer +=
            deltaTime;


        const frameDuration =
            1 / RUN_FPS;


        /*
         * Advance frames.

         */

        while (
            animationTimer >=
            frameDuration
        ) {

            animationTimer -=
                frameDuration;


            currentFrame++;

        }


        /*
         * Loop run animation.

         */

        currentFrame =
            currentFrame %
            loadedFrames.run.length;

    }


    /*
     * ========================================================
     * DRAW
     * ========================================================
     */

    drawCurrentFrame();
}


/*
 * ============================================================
 * RESET PLAYER
 * ============================================================
 */

export function resetPlayer() {

    /*
     * Reset position.

     */

    player.x = 80;

    player.y = 0;


    /*
     * Reset physics.

     */

    player.velocityY = 0;

    player.isJumping = false;


    /*
     * Reset health.

     */

    player.health = 100;


    /*
     * Reset state.

     */

    player.hasTakenDamage = false;

    player.isDead = false;


    /*
     * Reset facing.

     */

    player.facing = 1;


    /*
     * Reset animation.

     */

    currentAnimation = "run";

    currentFrame = 0;

    animationTimer = 0;


    /*
     * Disable damage animation.

     */

    damageTimer =
        DAMAGE_DURATION;


    /*
     * Remove damage CSS effect.

     */

    if (spriteCanvas) {

        const playerElement =
            spriteCanvas.parentElement;


        if (playerElement) {

            playerElement.classList.remove(
                "damage"
            );

        }

    }


    /*
     * Clear controls.

     */

    clearPlayerInput();


    /*
     * Draw first run frame.

     */

    drawCurrentFrame();
}