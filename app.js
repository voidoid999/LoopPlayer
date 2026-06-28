// ======================================================
// LoopPlayer v2
// ======================================================

// ---------- DOM ----------

const fileInput = document.getElementById("audioFile");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

const seekSlider = document.getElementById("seekSlider");

const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");

const speedButtonsContainer =
    document.getElementById("speedButtons");

const volumeSlider =
    document.getElementById("volumeSlider");

const volumeValue =
    document.getElementById("volumeValue");

const setABtn =
    document.getElementById("setABtn");

const setBBtn =
    document.getElementById("setBBtn");

const clearLoopBtn =
    document.getElementById("clearLoopBtn");

const aTimeDisplay =
    document.getElementById("aTime");

const bTimeDisplay =
    document.getElementById("bTime");

const canvas =
    document.getElementById("waveformCanvas");

const ctx =
    canvas.getContext("2d");

// ======================================================
// Audio
// ======================================================

const audio = new Audio();

audio.preload = "auto";
audio.volume = 1;
audio.playbackRate = 1;

// ======================================================
// Web Audio
// ======================================================

const audioContext =
    new (window.AudioContext ||
    window.webkitAudioContext)();

let decodedBuffer = null;

// ======================================================
// Waveform
// ======================================================

let waveform = [];

const WAVEFORM_SAMPLES = 2000;

// ======================================================
// Loop
// ======================================================

let pointA = null;
let pointB = null;

const MIN_LOOP_LENGTH = 0.10;

// ======================================================
// Dragging
// ======================================================

let dragMode = null;

// NONE
// A
// B
// REGION

let dragOffset = 0;

const HIT_RADIUS = 10;

// ======================================================
// Speed Buttons
// ======================================================

const speedValues = [];

for (
    let speed = 0.30;
    speed <= 1.0001;
    speed += 0.05
) {

    speedValues.push(
        Number(speed.toFixed(2))
    );

}

// ======================================================
// Utilities
// ======================================================

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}

function formatTime(seconds) {

    if (!isFinite(seconds))
        return "00:00";

    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    const ratio =
        window.devicePixelRatio || 1;

    canvas.width = rect.width * ratio;

    canvas.height = rect.height * ratio;

    canvas.style.width =
        rect.width + "px";

    canvas.style.height =
        rect.height + "px";

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.scale(ratio, ratio);

    render();

}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

function canvasWidth() {
    return canvas.getBoundingClientRect().width;
}

function canvasHeight() {
    return canvas.getBoundingClientRect().height;
}

function timeToX(time) {

    if (!audio.duration)
        return 0;

    return (
        time /
        audio.duration *
        canvasWidth()
    );

}

function xToTime(x) {

    if (!audio.duration)
        return 0;

    return clamp(
        x /
        canvasWidth() *
        audio.duration,
        0,
        audio.duration
    );

}

function hasLoop() {

    return (
        pointA !== null &&
        pointB !== null &&
        pointB > pointA
    );

}

function clearLoop() {

    pointA = null;
    pointB = null;

    aTimeDisplay.textContent =
        "Not Set";

    bTimeDisplay.textContent =
        "Not Set";

}

// ======================================================
// Canvas Helpers
// ======================================================

function drawVerticalLine(
    x,
    color,
    width = 2
) {

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.beginPath();

    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight());

    ctx.stroke();

}

function drawLabel(
    text,
    x,
    color
) {

    ctx.fillStyle = color;
    ctx.font = "bold 14px Arial";

    ctx.fillText(
        text,
        x + 4,
        16
    );

}

// ======================================================
// Waveform Generation
// ======================================================

async function decodeAudioFile(file) {

    const arrayBuffer =
        await file.arrayBuffer();

    decodedBuffer =
        await audioContext.decodeAudioData(
            arrayBuffer
        );

    buildWaveform(decodedBuffer);

}

function buildWaveform(buffer) {

    waveform = [];

    const data =
        buffer.getChannelData(0);

    const blockSize =
        Math.floor(
            data.length /
            WAVEFORM_SAMPLES
        );

    for (
        let i = 0;
        i < WAVEFORM_SAMPLES;
        i++
    ) {

        let min = 1;
        let max = -1;

        const start =
            i * blockSize;

        const end =
            Math.min(
                start + blockSize,
                data.length
            );

        for (
            let j = start;
            j < end;
            j++
        ) {

            const sample =
                data[j];

            if (sample < min)
                min = sample;

            if (sample > max)
                max = sample;

        }

        waveform.push({
            min,
            max
        });

    }

}

// ======================================================
// Canvas Rendering
// ======================================================

function drawBackground() {

    ctx.fillStyle = "#fafafa";

    ctx.fillRect(
        0,
        0,
        canvasWidth(),
        canvasHeight()
    );

}

function drawWaveform() {

    if (!waveform.length)
        return;

    const middle =
        canvasHeight() / 2;

    const width =
        canvasWidth() /
        waveform.length;

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth = 1;

    ctx.beginPath();

    for (
        let i = 0;
        i < waveform.length;
        i++
    ) {

        const x =
            i * width;

        const top =
            middle +
            waveform[i].min *
            middle *
            0.9;

        const bottom =
            middle +
            waveform[i].max *
            middle *
            0.9;

        ctx.moveTo(
            x,
            top
        );

        ctx.lineTo(
            x,
            bottom
        );

    }

    ctx.stroke();

}

function drawLoopRegion() {

    if (!hasLoop())
        return;

    const left =
        timeToX(pointA);

    const right =
        timeToX(pointB);

    ctx.fillStyle =
        "rgba(37,99,235,0.15)";

    ctx.fillRect(
        left,
        0,
        right - left,
        canvasHeight()
    );

}

function drawMarkers() {

    if (pointA !== null) {

        const x =
            timeToX(pointA);

        drawVerticalLine(
            x,
            "#16a34a"
        );

        drawLabel(
            "A",
            x,
            "#16a34a"
        );

    }

    if (pointB !== null) {

        const x =
            timeToX(pointB);

        drawVerticalLine(
            x,
            "#dc2626"
        );

        drawLabel(
            "B",
            x,
            "#dc2626"
        );

    }

}

function drawPlayhead() {

    if (!audio.duration)
        return;

    drawVerticalLine(
        timeToX(
            audio.currentTime
        ),
        "#111",
        2
    );

}

function render() {

    drawBackground();

    drawLoopRegion();

    drawWaveform();

    drawMarkers();

    drawPlayhead();

    requestAnimationFrame(
        render
    );

}

requestAnimationFrame(
    render
);

// ======================================================
// Audio Loading
// ======================================================

fileInput.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files[0];

        if (!file)
            return;

        if (
            audioContext.state ===
            "suspended"
        ) {
            await audioContext.resume();
        }

        clearLoop();

        audio.src =
            URL.createObjectURL(file);

        audio.load();

        await decodeAudioFile(file);

        render();

    }
);

// ======================================================
// Audio Metadata
// ======================================================

audio.addEventListener(
    "loadedmetadata",
    () => {

        durationDisplay.textContent =
            formatTime(audio.duration);

        currentTimeDisplay.textContent =
            "00:00";

        seekSlider.min = 0;
        seekSlider.max = audio.duration;
        seekSlider.value = 0;

    }
);

// ======================================================
// Playback Updates
// ======================================================

audio.addEventListener(
    "timeupdate",
    () => {

        currentTimeDisplay.textContent =
            formatTime(
                audio.currentTime
            );

        seekSlider.value =
            audio.currentTime;

        if (hasLoop()) {

            if (audio.currentTime > pointB) {

                audio.currentTime = pointA;

            }

        }

    }
);

// ======================================================
// Playback Controls
// ======================================================

playBtn.addEventListener(
    "click",
    () => {

        if (!audio.src)
            return;

        audio.play();

    }
);

pauseBtn.addEventListener(
    "click",
    () => {

        audio.pause();

    }
);

// ======================================================
// Seek Slider
// ======================================================

seekSlider.addEventListener(
    "input",
    () => {

        if (!audio.duration)
            return;

        audio.currentTime =
            Number(
                seekSlider.value
            );

    }
);

// ======================================================
// Playback Speed
// ======================================================

speedValues.forEach(speed => {

    const button =
        document.createElement(
            "button"
        );

    button.type = "button";

    button.className =
        "speed-btn";

    button.dataset.speed =
        speed;

    button.textContent =
        speed.toFixed(2) + "×";

    if (speed === 1) {
        button.classList.add(
            "active"
        );
    }

    button.addEventListener(
        "click",
        () => {

            audio.playbackRate =
                speed;

            document
                .querySelectorAll(
                    ".speed-btn"
                )
                .forEach(btn =>
                    btn.classList.remove(
                        "active"
                    )
                );

            button.classList.add(
                "active"
            );

        }
    );

    speedButtonsContainer.appendChild(
        button
    );

});

// ======================================================
// Volume
// ======================================================

volumeSlider.addEventListener(
    "input",
    () => {

        const volume =
            Number(
                volumeSlider.value
            ) / 100;

        audio.volume = volume;

        volumeValue.textContent =
            volumeSlider.value +
            "%";

    }
);

audio.volume =
    Number(volumeSlider.value) / 100;

volumeValue.textContent =
    volumeSlider.value + "%";

// ======================================================
// Loop Controls
// ======================================================

setABtn.addEventListener("click", () => {

    if (!audio.duration)
        return;

    pointA = audio.currentTime;

    if (
        pointB !== null &&
        pointA >= pointB
    ) {
        pointB = null;
        bTimeDisplay.textContent = "Not Set";
    }

    aTimeDisplay.textContent =
        formatTime(pointA);

});

setBBtn.addEventListener("click", () => {

    if (!audio.duration)
        return;

    pointB = audio.currentTime;

    if (
        pointA !== null &&
        pointB <= pointA
    ) {
        pointB =
            pointA +
            MIN_LOOP_LENGTH;
    }

    pointB = clamp(
        pointB,
        0,
        audio.duration
    );

    bTimeDisplay.textContent =
        formatTime(pointB);

});

clearLoopBtn.addEventListener("click", () => {

    clearLoop();

});

// ======================================================
// Canvas Helpers
// ======================================================

function getCanvasX(event) {

    const rect =
        canvas.getBoundingClientRect();

    return (
        (event.clientX - rect.left) *
        canvasWidth() /
        rect.width
    );

}

function hitTest(x) {

    if (!audio.duration)
        return null;

    if (pointA !== null) {

        const ax =
            timeToX(pointA);

        if (
            Math.abs(x - ax) <=
            HIT_RADIUS
        ) {
            return "A";
        }

    }

    if (pointB !== null) {

        const bx =
            timeToX(pointB);

        if (
            Math.abs(x - bx) <=
            HIT_RADIUS
        ) {
            return "B";
        }

    }

    if (hasLoop()) {

        const ax =
            timeToX(pointA);

        const bx =
            timeToX(pointB);

        if (
            x > ax &&
            x < bx
        ) {
            return "REGION";
        }

    }

    return null;

}

// ======================================================
// Pointer Down
// ======================================================

canvas.addEventListener(
    "pointerdown",
    (event) => {

        event.preventDefault();

        if (!audio.duration)
            return;

        canvas.setPointerCapture(
            event.pointerId
        );

        const x =
            getCanvasX(event);

        const hit =
            hitTest(x);

        if (hit) {

            dragMode = hit;

            if (
                hit === "REGION"
            ) {

                dragOffset =
                    xToTime(x) -
                    pointA;

            }

            return;

        }

        audio.currentTime =
            xToTime(x);

    }
);

// ======================================================
// Pointer Move
// ======================================================

canvas.addEventListener(
    "pointermove",
    (event) => {

        event.preventDefault();

        const x =
            getCanvasX(event);

        const time =
            xToTime(x);

        if (!dragMode) {

            const hit =
                hitTest(x);

            canvas.style.cursor =
                hit
                    ? (
                        hit ===
                        "REGION"
                    )
                        ? "grab"
                        : "ew-resize"
                    : "pointer";

            return;

        }

        // ---------- Drag A ----------

        if (dragMode === "A") {

            if (
                pointB !== null
            ) {

                pointA = clamp(
                    time,
                    0,
                    pointB -
                    MIN_LOOP_LENGTH
                );

            } else {

                pointA = clamp(
                    time,
                    0,
                    audio.duration
                );

            }

            aTimeDisplay.textContent =
                formatTime(
                    pointA
                );

            return;

        }

        // ---------- Drag B ----------

        if (dragMode === "B") {

            if (
                pointA !== null
            ) {

                pointB = clamp(
                    time,
                    pointA +
                    MIN_LOOP_LENGTH,
                    audio.duration
                );

            } else {

                pointB = clamp(
                    time,
                    0,
                    audio.duration
                );

            }

            bTimeDisplay.textContent =
                formatTime(
                    pointB
                );

            return;

        }

        // ---------- Drag Region ----------

        if (
            dragMode ===
            "REGION"
        ) {

            const length =
                pointB - pointA;

            let newA =
                time -
                dragOffset;

            newA = clamp(
                newA,
                0,
                audio.duration -
                length
            );

            pointA = newA;
            pointB =
                newA + length;

            aTimeDisplay.textContent =
                formatTime(
                    pointA
                );

            bTimeDisplay.textContent =
                formatTime(
                    pointB
                );

        }

    }
);

canvas.addEventListener(
    "pointerup",
    () => {

        canvas.releasePointerCapture(event.pointerId);

        dragMode = null;

        canvas.style.cursor =
            "pointer";

    }
);

canvas.addEventListener(
    "pointercancel",
    () => {

        dragMode = null;

    }
);

// ======================================================
// Keyboard Shortcuts
// ======================================================

document.addEventListener("keydown", (event) => {

    const tag = document.activeElement.tagName;

    if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
    ) {
        return;
    }

    switch (event.code) {

        case "Space":

            event.preventDefault();

            if (!audio.src)
                return;

            if (audio.paused)
                audio.play();
            else
                audio.pause();

            break;

        case "KeyA":

            if (!audio.duration)
                return;

            pointA = audio.currentTime;

            if (
                pointB !== null &&
                pointA >= pointB
            ) {
                pointB = null;
                bTimeDisplay.textContent =
                    "Not Set";
            }

            aTimeDisplay.textContent =
                formatTime(pointA);

            break;

        case "KeyB":

            if (!audio.duration)
                return;

            pointB = audio.currentTime;

            if (
                pointA !== null &&
                pointB <= pointA
            ) {
                pointB =
                    pointA +
                    MIN_LOOP_LENGTH;
            }

            pointB = clamp(
                pointB,
                0,
                audio.duration
            );

            bTimeDisplay.textContent =
                formatTime(pointB);

            break;

        case "Delete":

            clearLoop();

            break;

    }

});

// ======================================================
// Double Click
// ======================================================

canvas.addEventListener(
    "dblclick",
    () => {

        if (pointA === null)
            return;

        audio.currentTime = pointA;

    }
);

// ======================================================
// Touch
// ======================================================

canvas.style.touchAction = "none";

// ======================================================
// Initialization
// ======================================================

function initialize() {

    currentTimeDisplay.textContent =
        "00:00";

    durationDisplay.textContent =
        "00:00";

    aTimeDisplay.textContent =
        "Not Set";

    bTimeDisplay.textContent =
        "Not Set";

    volumeValue.textContent =
        volumeSlider.value + "%";

    audio.volume =
        Number(volumeSlider.value) / 100;

    audio.playbackRate = 1;

}

initialize();

// ======================================================
// Playback End
// ======================================================

audio.addEventListener(
    "ended",
    () => {

        seekSlider.value = 0;

        currentTimeDisplay.textContent =
            "00:00";

    }
);

console.log(
    "LoopPlayer v2 Ready"
);