let audioContext;
let masterGain;
let gameVolume = 0.6;
let isMusicPaused = false;
let currentMusic = null;

const audioTracks = {
    mainMenuTheme: new Audio("./src/soundtrack/mainMenuTheme.wav"),
    mainGameTheme: new Audio("./src/soundtrack/mainGameThemeLoop.wav"),
    exitTheme: new Audio("./src/soundtrack/exitTheme.wav"),
    defeatTheme: new Audio("./src/soundtrack/defeatTheme.wav"),
    JumpSFX: new Audio("./src/soundtrack/jump.wav"),
    playerDamage: new Audio("./src/soundtrack/playerDamage.wav"),
    LandSFX: new Audio("./src/soundtrack/land.wav"),
    deathScream: new Audio("./src/soundtrack/deathScream.wav"),
};

Object.values(audioTracks).forEach((track) => {
    track.preload = "auto";
    track.volume = gameVolume;
});

function getAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
        masterGain = audioContext.createGain();
        masterGain.gain.value = getToneVolume();
        masterGain.connect(audioContext.destination);
    }

    return audioContext;
}

function getToneVolume() {
    return isMusicPaused ? gameVolume * 0.07 : gameVolume * 0.22;
}

function applyMusicVolume() {
    if (!currentMusic) return;

    currentMusic.volume = isMusicPaused ? gameVolume * 0.3 : gameVolume;
}

function applyToneVolume() {
    if (!masterGain || !audioContext) return;

    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(getToneVolume(), now, 0.08);
}


function playTone(frequency, duration, type = "square", volume = 0.35) {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
}


function playMusic(track, isLooping = true) {
   
    stopMusic();

    currentMusic = track;
    currentMusic.loop = isLooping;
    currentMusic.currentTime = 0;

    applyMusicVolume();

    currentMusic.play().catch(console.error);
}

function playSFX(track) {
    track.currentTime = 0;
    track.volume = gameVolume;

    track.play().catch(console.error);
}

export function stopMusic() {
    if (!currentMusic) return;

    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
}

export function mainMusic() {
   playMusic(audioTracks.mainGameTheme, true)
}

export function menuMusic() {
   playMusic(audioTracks.mainMenuTheme, true)
}

export function exitMusic() {
  playMusic(audioTracks.exitTheme, false)
}

export function defeatMusic() {
    playMusic(audioTracks.defeatTheme, false)
}

export function playDamageHitSound() {
    playSFX(audioTracks.playerDamage);
}

export function playDeathScream() {
    playSFX(audioTracks.deathScream);
}

export function playJumpSound() {
    playSFX(audioTracks.JumpSFX);
}

export function playLandSound() {
    playSFX(audioTracks.LandSFX);
}

export function playMenuSound() {
    playTone(523, 0.08, "sine", 0.28);
}

export function setMusicPaused(isPaused) {
    isMusicPaused = isPaused;
    applyMusicVolume();
    applyToneVolume();
}

export function setGameVolume(volume) {
    gameVolume = Math.min(1, Math.max(0, volume));

    Object.values(audioTracks).forEach((track) => {
        if (track !== currentMusic) {
            track.volume = gameVolume;
        }
    });

    applyMusicVolume();
    applyToneVolume();
}

export function getGameVolume() {
    return gameVolume;
}

