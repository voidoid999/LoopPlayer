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
const loopMarkers = document.getElementById("loopMarkers");

const setABtn = document.getElementById("setABtn");
const setBBtn = document.getElementById("setBBtn");
const clearLoopBtn = document.getElementById("clearLoopBtn");

const aTimeDisplay = document.getElementById("aTime");
const bTimeDisplay = document.getElementById("bTime");
const loopStatus = document.getElementById("loopStatus");

const audio = new Audio();

const MIN_LOOP_LENGTH = 0.1;

let pointA = null;
let pointB = null;

let draggedMarker = null;
let draggingRegion = false;
let regionDragOffset = 0;

audio.volume = 1;
audio.playbackRate = 1;

const speedValues = [];

for (let speed = 0.30; speed <= 1.0001; speed += 0.05) {
    speedValues.push(Number(speed.toFixed(2)));
}

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

function clearLoopPoints() {
    pointA = null;
    pointB = null;

    aTimeDisplay.textContent = "Not Set";
    bTimeDisplay.textContent = "Not Set";

    updateLoopStatus();
    updateLoopMarkers();
}

function updateLoopMarkers() {
    if (!audio.duration || !isFinite(audio.duration)) {
        markerA.classList.add("hidden");
        markerB.classList.add("hidden");
        loopRegion.classList.add("hidden");
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

function setSpeed(speed) {
    audio.playbackRate = speed;

    document
        .querySelectorAll(".speed-btn")
        .forEach((btn) => {
            btn.classList.toggle(
                "active",
                Number(btn.dataset.speed) === speed
            );
        });
}

function positionToTime(clientX) {
    const rect = loopMarkers.getBoundingClientRect();

    let percent =
        (clientX - rect.left) / rect.width;

    percent = Math.max(0, Math.min(1, percent));

    return percent * audio.duration;
}

speedValues.forEach((speed) => {
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

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    audio.src = URL.createObjectURL(file);
    audio.load();

    clearLoopPoints();
});

audio.addEventListener("loadedmetadata", () => {
    durationDisplay.textContent =
        formatTime(audio.duration);

    seekSlider.max = audio.duration;
    seekSlider.value = 0;

    updateLoopMarkers();
});

audio.addEventListener("timeupdate", () => {
    currentTimeDisplay.textContent =
        formatTime(audio.currentTime);

    seekSlider.value = audio.currentTime;

    const loopingEnabled =
        pointA !== null &&
        pointB !== null &&
        pointB > pointA;

    if (
        loopingEnabled &&
        audio.currentTime >= pointB
    ) {
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
    audio.currentTime =
        Number(seekSlider.value);
});

volumeSlider.addEventListener("input", () => {
    const volume =
        Number(volumeSlider.value) / 100;

    audio.volume = volume;
    volumeValue.textContent =
        `${volumeSlider.value}%`;
});

setABtn.addEventListener("click", () => {
    pointA = audio.currentTime;

    aTimeDisplay.textContent =
        formatTime(pointA);

    updateLoopStatus();
    updateLoopMarkers();
});

setBBtn.addEventListener("click", () => {
    pointB = audio.currentTime;

    bTimeDisplay.textContent =
        formatTime(pointB);

    updateLoopStatus();
    updateLoopMarkers();
});

clearLoopBtn.addEventListener("click", () => {
    clearLoopPoints();
});

document.addEventListener("keydown", (event) => {
    if (
        event.code === "Space" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
            document.activeElement.tagName
        )
    ) {
        event.preventDefault();

        if (!audio.src) {
            return;
        }

        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }
});

markerA.addEventListener("pointerdown", () => {
    if (pointA === null || pointB === null) {
        return;
    }

    draggedMarker = "A";
    markerA.classList.add("dragging");
});

markerB.addEventListener("pointerdown", () => {
    if (pointA === null || pointB === null) {
        return;
    }

    draggedMarker = "B";
    markerB.classList.add("dragging");
});

loopRegion.addEventListener("pointerdown", (event) => {
    if (
        pointA === null ||
        pointB === null ||
        !audio.duration
    ) {
        return;
    }

    draggingRegion = true;

    const rect =
        loopMarkers.getBoundingClientRect();

    const clickTime =
        ((event.clientX - rect.left) / rect.width) *
        audio.duration;

    regionDragOffset =
        clickTime - pointA;

    loopRegion.style.cursor = "grabbing";
});

document.addEventListener("pointermove", (event) => {
    if (!audio.duration) {
        return;
    }

    if (draggingRegion) {
        const loopLength =
            pointB - pointA;

        let newA =
            positionToTime(event.clientX) -
            regionDragOffset;

        newA = Math.max(0, newA);

        if (
            newA + loopLength >
            audio.duration
        ) {
            newA =
                audio.duration - loopLength;
        }

        pointA = newA;
        pointB = newA + loopLength;

        aTimeDisplay.textContent =
            formatTime(pointA);

        bTimeDisplay.textContent =
            formatTime(pointB);

        updateLoopMarkers();
        updateLoopStatus();

        return;
    }

    if (!draggedMarker) {
        return;
    }

    const time =
        positionToTime(event.clientX);

    if (
        draggedMarker === "A" &&
        pointB !== null
    ) {
        pointA = Math.min(
            time,
            pointB - MIN_LOOP_LENGTH
        );

        aTimeDisplay.textContent =
            formatTime(pointA);
    }

    if (
        draggedMarker === "B" &&
        pointA !== null
    ) {
        pointB = Math.max(
            time,
            pointA + MIN_LOOP_LENGTH
        );

        bTimeDisplay.textContent =
            formatTime(pointB);
    }

    updateLoopMarkers();
    updateLoopStatus();
});

document.addEventListener("pointerup", () => {
    markerA.classList.remove("dragging");
    markerB.classList.remove("dragging");

    draggedMarker = null;

    draggingRegion = false;

    loopRegion.style.cursor = "grab";
});

updateLoopStatus();
updateLoopMarkers();