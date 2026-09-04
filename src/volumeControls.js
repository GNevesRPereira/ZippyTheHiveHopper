import { setGameVolume, getGameVolume } from "./audio.js";

export function initVolumeControls() {
    const volumeSliders = document.querySelectorAll(".volume-slider");
    const initialVolume = Math.round(getGameVolume() * 100);

    volumeSliders.forEach((slider) => {
        slider.value = initialVolume;

        slider.addEventListener("input", () => {
            const volume = Number(slider.value) / 100;
            setGameVolume(volume);
            syncVolumeSliders(volumeSliders, slider.value);
        });
    });
}

function syncVolumeSliders(volumeSliders, value) {
    volumeSliders.forEach((slider) => {
        slider.value = value;
    });
}