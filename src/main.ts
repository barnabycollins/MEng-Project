import {Faust} from "faust2webaudio";
import {WebMidi, Input, MessageEvent} from "webmidi";
import { SynthContext } from "./synthContext";
import { Evolver, GENERATION_COUNT, POPULATION_SIZE } from "./evolution";

// TODO: use OfflineAudioContext??
// TODO: use other Meyda thing rather than the callback system?
// TODO: add patch copy button, and add it to section 3.4
// TODO: delete and reinitialise Faust after each round?

const LOG = false;
const MIDI_ENABLED = true;
const HEAR_EVOLUTION = false;
const topologyToUse = undefined;

let midiPresent = false;

let audioContext: AudioContext;
let faust: Faust;

let contexts: SynthContext[] = [];
const contextCount = 4;
let selectedContext = 0;
let favouriteContext = -1;
let currentShownCode = "";

let evolving = false;
let evolver: Evolver;

const mainScreen = document.getElementById("main-screen") as HTMLDivElement;
const topButtonContainer = document.getElementById("start-screen") as HTMLDivElement;
const evolveButton = document.getElementById("evolve-btn") as HTMLButtonElement;
const codeOverlay = document.getElementById("code-overlay") as HTMLDivElement;
const codeText = document.getElementById("code-box") as HTMLDivElement;
const screenCover = document.getElementById("cover") as HTMLDivElement;
const synthUIArea = document.getElementById("synth-row") as HTMLDivElement;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;

export function synchronousPromiseExecute(jobs: any[]): Promise<any[]> {
  return new Promise(async resolve => {
    let output = [];
    for (let i = 0; i < jobs.length; i++) {
      output.push(await jobs[i]());
    }
    resolve(output);
  })
}

/*
// for getting data from other modules to export
let compilationData: number[][] = [[], []];
import { exportListToCsvFile } from "./dataExport";
export function writeData(graphSize: number, time: number) {
  compilationData.push([graphSize, time]);
}
*/

// Generate synth panels
for (let i = 0; i < contextCount; i++) {
  const mfccCoefficientCount = 13; // this is the number that Meyda.js MFCC returns
  let mfccBars = "";

  for (let j = 0; j < mfccCoefficientCount; j++) {
    mfccBars += `<div class="mfcc-bar" id="bar-${i}-${j}"></div>`;
  }

  const panelContent = `
    <div class="context-panel" id="panel${i}">
      <iframe id="ui${i}" src="./faust-ui.html" height="100px" width="50px"></iframe>
      <div class="indicators"></div>
      <div class="control-box">
        <button id="process-code-show-${i}">Show process code</button>
        <button id="full-code-show-${i}">Show full code</button>
        <button id="stop-${i}">Stop note(s)</button>
        <button class="ctx-select" id="ctx-select-${i}">Select for MIDI</button>
        <button class="favourite-select" id="select-favourite-${i}">Select for evolution</button>
      </div>
      <div class="mfcc-box" id="mfcc${i}">
        ${mfccBars}
      </div>
    </div>
  `;
  synthUIArea.innerHTML += panelContent;
}
const synthPanels: {[key: number]: HTMLDivElement} = {};
for (let i = 0; i < contextCount; i++) {
  synthPanels[i] = document.getElementById(`panel${i}`) as HTMLDivElement;
}


function log(toLog: any): void {
  /**
   * Log a message if logging is enabled; otherwise do nothing
   */
  if (LOG) console.log("(DEBUG)", toLog);
}

function selectContext(value?: number) {
  if (!midiPresent) return;
  if (value === undefined) value = (selectedContext + 1) % contextCount;
  selectedContext = value;
  for (let i = 0; i < contextCount; i++) {
    if (i === value) {
      synthPanels[i].classList.add("midi-enabled");
    }
    else {
      synthPanels[i].classList.remove("midi-enabled");
    }
  }
}

function stopContext(contextId: number) {
  contexts[contextId].allNotesOff();
}

function selectFavourite(contextId: number) {
  if (contextId === favouriteContext) {
    favouriteContext = -1;
    evolveButton.classList.add("inactive");
  }
  else {
    favouriteContext = contextId;
    evolveButton.classList.remove("inactive");
  }
  for (let i = 0; i < contextCount; i++) {
    if (i === favouriteContext) {
      synthPanels[i].classList.add("favourite");
    }
    else {
      synthPanels[i].classList.remove("favourite");
    }
  }
}

function closeCode() {
  codeOverlay.style.display = "none";
}
function showProcessCode(i: number) {
  const shownCode = `process${i}`;
  if (shownCode === currentShownCode) {
    currentShownCode = "";
    closeCode();
  }
  else {
    currentShownCode = shownCode;
    codeText.innerText = contexts[i].processCode;
    codeOverlay.style.display = "flex";
  }
}
function showFullCode(i: number) {
  const shownCode = `full${i}`;
  if (shownCode === currentShownCode) {
    currentShownCode = "";
    closeCode();
  }
  else {
    currentShownCode = shownCode;
    codeText.innerText = contexts[i].fullCode;
    codeOverlay.style.display = "flex";
  }
}

async function start() {
  mainScreen.style.display = "flex";
  topButtonContainer.style.display = "none";

  // Connect to Web Audio
  audioContext = new window.AudioContext();

  // Enable Faust compiler; wait until it's ready
  faust = new Faust({
    debug: LOG,
    wasmLocation: "src/libfaust/libfaust-wasm.wasm",
    dataLocation: "src/libfaust/libfaust-wasm.data"
  });
  await faust.ready;

  evolver = new Evolver(progressBar, faust, audioContext, HEAR_EVOLUTION, contextCount);

  for (let i = 0; i < contextCount; i++) {
    contexts.push(new SynthContext(i, audioContext, topologyToUse));
  }

  await Promise.all(contexts.map(context => context.compile(faust)));

  if (MIDI_ENABLED) {
    // MIDI SETUP
    await WebMidi.enable();
    const midiDeviceCount = WebMidi.inputs.length;
    if (midiDeviceCount < 1) {
      console.log("No MIDI input devices detected.");
      Array.prototype.forEach.call(document.getElementsByClassName("ctx-select"), (item: HTMLButtonElement) => item.classList.add("inactive"));
      Array.prototype.forEach.call(document.getElementsByClassName("indicators"), (item: HTMLButtonElement) => item.classList.add("midi-disabled"));
    }
    else {
      console.log(`Detected ${midiDeviceCount} MIDI input device${midiDeviceCount == 1 ? "" : "s"}:\n- ${WebMidi.inputs.map(x => x.name).join("\n- ")}`);
      
      midiPresent = true;

      selectContext(0);

      WebMidi.inputs.forEach((device: Input) => {
        device.addListener("midimessage", (e: MessageEvent) => {
          contexts[selectedContext].midiMessage(e.message.data);
    
          log(`Received ${e.message.type} from ${device.name}`);
        });
      });
    }
  }
}

async function evolve() {
  if (evolving || favouriteContext === -1) return;
  evolving = true;

  progressBar.style.width = "0%";
  //screenCover.style.display = "block";
  //synthUIArea.style.opacity = "0.5";
  evolveButton.classList.add("inactive");

  const target = contexts[favouriteContext].topology;

  const results = await evolver.evolve(target);

  for (let i = 0; i < contextCount; i++) {
    if (/*i < contextCount-1 && */i < results.length) {
      contexts[i].setTopology(results[i].topology);
    }
    else {
      // Fill any extra slots with a random patch
      contexts[i].generateSynth();
    }
  }

  faust = new Faust({
    debug: LOG,
    wasmLocation: "src/libfaust/libfaust-wasm.wasm",
    dataLocation: "src/libfaust/libfaust-wasm.data"
  });

  await faust.ready;

  await Promise.all(contexts.map(context => context.compile(faust)));

  progressBar.style.width = "100%";
  //screenCover.style.display = "none";
  //synthUIArea.style.opacity = "1";
  evolveButton.classList.remove("inactive");
  
  evolving = false;
}

for (let i = 0; i < contextCount; i++) {
  document.getElementById(`ctx-select-${i}`)?.addEventListener("click", () => selectContext(i));
  document.getElementById(`stop-${i}`)?.addEventListener("click", () => stopContext(i));
  document.getElementById(`select-favourite-${i}`)?.addEventListener("click", () => selectFavourite(i));
  document.getElementById(`process-code-show-${i}`)?.addEventListener("click",() => showProcessCode(i));
  document.getElementById(`full-code-show-${i}`)?.addEventListener("click", () => showFullCode(i));
}

document.getElementById("code-close")?.addEventListener("click", () => closeCode());
document.getElementById("evolve-btn")?.addEventListener("click", () => evolve());
document.getElementById("start-btn")?.addEventListener("click", async () => await start());
