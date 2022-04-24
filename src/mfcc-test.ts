import { Faust } from "faust2webaudio";
import { SynthContext } from "./synthContext";
import { fitness } from "./evolution";
import { exportObjectToCsvFile } from "./dataExport";

let contexts: SynthContext[] = [];
let faust: Faust;
let audioContext;

const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
startBtn.addEventListener("click", start);

const mainDiv = document.getElementById("main-ui") as HTMLDivElement;

const scoreInput = document.getElementById("score-slider") as HTMLInputElement;
const scoreValue = document.getElementById("score-value") as HTMLSpanElement;
scoreInput.addEventListener("change", () => scoreValue.innerText = scoreInput.value);

const scoreSubmit = document.getElementById("score-submit") as HTMLButtonElement;
scoreSubmit.addEventListener("click", submitScore);

const finishButton = document.getElementById("finish-btn") as HTMLButtonElement;
finishButton?.addEventListener("click", finish);
const saveButton = document.getElementById("save-btn") as HTMLButtonElement;

const title = document.getElementsByTagName("h1")[0] as HTMLHeadingElement;
const status = document.getElementsByTagName("h2")[0] as HTMLHeadingElement;


let nextContext = 0;
let otherContext = 1;
let lastDifference: number;

let working = false;

let data: {"user": number[], "mfcc": number[]} = {
    "user": [],
    "mfcc": []
};

function finish() {
    exportObjectToCsvFile(data, "userMfccTest");
    saveButton.style.display = "block";
}

async function submitScore() {
    if (working) return;
    working = true;
    const score = parseInt(scoreInput.value);

    data["user"].push(score);
    data["mfcc"].push(lastDifference);
    
    console.log(`regenerating ${nextContext}`);

    contexts[nextContext].cleanUp();

    contexts[nextContext].generateSynth();
    await contexts[nextContext].compile(faust);

    otherContext = (otherContext+1)%2;
    nextContext = (nextContext+1)%2;

    await startRound();
    working = false;
}

async function startRound() {
    title.innerText = `Round ${data["user"].length+1}`;
    status.innerText = "Playing sound 1...";
    const oldMeasurement = await contexts[nextContext].measureMFCC();
    status.innerText = "Waiting...";

    await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

    status.innerText = "Playing sound 2...";
    const newMeasurement = await contexts[otherContext].measureMFCC();
    status.innerText = "Waiting...";

    lastDifference = fitness(oldMeasurement, newMeasurement);

    scoreInput.value = "1";
    status.innerText = "Choose now!";
    scoreValue.innerText = scoreInput.value;
}

async function start() {
    startBtn.style.display = "none";
    mainDiv.style.display = "block";
    
    // Connect to Web Audio
    audioContext = new window.AudioContext();
    
    // Enable Faust compiler; wait until it's ready
    faust = new Faust({
        wasmLocation: "src/libfaust/libfaust-wasm.wasm",
        dataLocation: "src/libfaust/libfaust-wasm.data"
    });
    await faust.ready;
    
    for (let i = 0; i < 2; i++) {
        contexts.push(new SynthContext(i, audioContext, undefined, true, true));
    }
    
    await Promise.all(contexts.map(context => context.compile(faust)));

    startRound();
}