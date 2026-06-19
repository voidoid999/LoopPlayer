const fileInput = document.getElementById("audioFile");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const seekSlider = document.getElementById("seekSlider");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");
const speedButtonsContainer = document.getElementById("speedButtons");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const markerA = document.getElementById("markerA");
const markerB = document.getElementById("markerB");
const loopRegion = document.getElementById("loopRegion");

const setABtn = document.getElementById("setABtn");
const setBBtn = document.getElementById("setBBtn");
const clearLoopBtn = document.getElementById("clearLoopBtn");

const aTimeDisplay = document.getElementById("aTime");
const bTimeDisplay = document.getElementById("bTime");
const loopStatus = document.getElementById("loopStatus");

const audio = new Audio();

audio.volume = 1;

const speedValues = [];

for (let speed = 0.30; speed <= 1.0001; speed += 0.05) {
    speedValues.push(Number(speed.toFixed(2)));
}

function setSpeed(speed) {
    audio.playbackRate = speed;

    document.querySelectorAll(".speed-btn")
        .forEach(btn => {
            btn.classList.toggle(
                "active",
                Number(btn.dataset.speed) === speed
            );
        });
}

speedValues.forEach(speed => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "speed-btn";
    button.dataset.speed = speed;
    button.textContent = `${speed.toFixed(2)}×`;

    if (speed === 1) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => {
        setSpeed(speed);
    });

    speedButtonsContainer.appendChild(button);
});

audio.playbackRate = 1;

let pointA = null;
let pointB = null;

function formatTime(seconds) {
    if (!isFinite(seconds)) {
        return "00:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateLoopStatus() {
    const enabled =
        pointA !== null &&
        pointB !== null &&
        pointB > pointA;

    loopStatus.textContent = enabled
        ? "Looping Enabled"
        : "Looping Disabled";
}

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const url = URL.createObjectURL(file);

    audio.src = url;
    audio.load();

    clearLoopPoints();
});

audio.addEventListener("loadedmetadata", () => {
    durationDisplay.textContent = formatTime(audio.duration);
    seekSlider.max = audio.duration;
    seekSlider.value = 0;
});

audio.addEventListener("timeupdate", () => {
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    seekSlider.value = audio.currentTime;

    const loopingEnabled =
        pointA !== null &&
        pointB !== null &&
        pointB > pointA;

    if (loopingEnabled && audio.currentTime >= pointB) {
        audio.currentTime = pointA;
    }
});

playBtn.addEventListener("click", () => {
    if (audio.src) {
        audio.play();
    }
});

pauseBtn.addEventListener("click", () => {
    audio.pause();
});

seekSlider.addEventListener("input", () => {
    audio.currentTime = Number(seekSlider.value);
});

setABtn.addEventListener("click", () => {
    pointA = audio.currentTime;
    aTimeDisplay.textContent = formatTime(pointA);

    updateLoopStatus();
    updateLoopMarkers();
});

setBBtn.addEventListener("click", () => {
    pointB = audio.currentTime;
    bTimeDisplay.textContent = formatTime(pointB);

    updateLoopStatus();
    updateLoopMarkers();
});

clearLoopBtn.addEventListener("click", () => {
    clearLoopPoints();
});

function clearLoopPoints() {
    pointA = null;
    pointB = null;

    aTimeDisplay.textContent = "Not Set";
    bTimeDisplay.textContent = "Not Set";

    updateLoopStatus();
    updateLoopMarkers();
}

volumeSlider.addEventListener("input", () => {
    const volume = Number(volumeSlider.value) / 100;

    audio.volume = volume;
    volumeValue.textContent = `${volumeSlider.value}%`;
});

function updateLoopMarkers() {
    if (!audio.duration || !isFinite(audio.duration)) {
        return;
    }

    if (pointA !== null) {
        const percent = (pointA / audio.duration) * 100;

        markerA.style.left = `${percent}%`;
        markerA.classList.remove("hidden");
    } else {
        markerA.classList.add("hidden");
    }

    if (pointB !== null) {
        const percent = (pointB / audio.duration) * 100;

        markerB.style.left = `${percent}%`;
        markerB.classList.remove("hidden");
    } else {
        markerB.classList.add("hidden");
    }

    if (
        pointA !== null &&
        pointB !== null &&
        pointB > pointA
    ) {
        const startPercent =
            (pointA / audio.duration) * 100;

        const endPercent =
            (pointB / audio.duration) * 100;

        loopRegion.style.left = `${startPercent}%`;
        loopRegion.style.width =
            `${endPercent - startPercent}%`;

        loopRegion.classList.remove("hidden");
    } else {
        loopRegion.classList.add("hidden");
    }
}