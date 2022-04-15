import {Faust} from "faust2webaudio";
import {WebMidi, Input, MessageEvent} from "webmidi";
import * as c from "./constructs";
import {fitness} from "./genetic";
import { exportListToCsvFile, exportObjectToCsvFile } from "./export";

// LOGGING
const LOG = false;
// @ts-ignore
function log(toLog: any): void {
  /**
   * Log a message if logging is enabled; otherwise do nothing
   */
  if (LOG) console.log("(DEBUG)", toLog);
}

// SOUND OUTPUT

let audioContext: AudioContext;
let faust: Faust;

let contexts: c.SynthContext[] = [];
const contextCount = 4;
let selectedContext = 0;
let favouriteContext = -1;
let currentShownCode = "";
let evolving = false;

type BestType = {
  topology: c.SynthNode | undefined,
  score: number
};

let best: BestType = {
  topology: undefined,
  score: 0
};

let bests: BestType[] = [];

const panel = document.getElementById("synth-row") as HTMLDivElement;
for (let i = 0; i < contextCount; i++) {
  const mfccCoefficientCount = 13; // taken from Meyda.js MFCC
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
  panel.innerHTML += panelContent;
}

function selectContext(value?: number) {
  if (value === undefined) value = (selectedContext + 1) % contextCount;
  selectedContext = value;
  for (let i = 0; i < contextCount; i++) {
    if (i === value) {
      (document.getElementById(`panel${i}`) as HTMLDivElement).classList.add("midi-enabled");
    }
    else {
      (document.getElementById(`panel${i}`) as HTMLDivElement).classList.remove("midi-enabled");
    }
  }
}

function stopContext(contextId: number) {
  contexts[contextId].allNotesOff();
}

function selectFavourite(contextId: number) {
  if (contextId === favouriteContext) {
    favouriteContext = -1;
    (document.getElementById("evolve-btn") as HTMLButtonElement).classList.add("inactive");
  }
  else {
    favouriteContext = contextId;
    (document.getElementById("evolve-btn") as HTMLButtonElement).classList.remove("inactive");
  }
  for (let i = 0; i < contextCount; i++) {
    if (i === favouriteContext) {
      (document.getElementById(`panel${i}`) as HTMLDivElement).classList.add("favourite");
    }
    else {
      (document.getElementById(`panel${i}`) as HTMLDivElement).classList.remove("favourite");
    }
  }
}

function closeCode() {
  (document.getElementById("code-overlay") as HTMLDivElement).style.display = "none";
}
function showProcessCode(i: number) {
  const shownCode = `process${i}`;
  if (shownCode === currentShownCode) {
    currentShownCode = "";
    closeCode();
  }
  else {
    currentShownCode = shownCode;
    (document.getElementById("code-box") as HTMLDivElement).innerText = contexts[i].processCode;
    (document.getElementById("code-overlay") as HTMLDivElement).style.display = "flex";
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
    (document.getElementById("code-box") as HTMLDivElement).innerText = contexts[i].fullCode;
    (document.getElementById("code-overlay") as HTMLDivElement).style.display = "flex";
  }
}

function startEvolving() {
  evolving = true;
  (document.getElementById("cover") as HTMLDivElement).style.display = "block";
  (document.getElementById("synth-row") as HTMLDivElement).style.opacity = "0.5";
  (document.getElementById("evolve-btn") as HTMLButtonElement).classList.add("inactive");
}

function test(context: c.SynthContext): Promise<number[][]> {
  return new Promise<number[][]>(async (resolve) => {
    context.mutateSynth();
    //context.generateSynth();
    await context.compile(faust);
    const measurement = await context.measureMFCC();
    context.cleanUp();
    resolve(measurement);
  });
}


const POPULATION_SIZE = 16;
const NUM_ROUNDS = 51;
const progressBar = document.getElementById("progress-bar") as HTMLDivElement;
async function evolve() {
  progressBar.style.width = "0px";
  if (evolving || favouriteContext === -1) return;

  startEvolving();

  const target = await contexts[favouriteContext].measureMFCC();

  let evolvingContexts: c.SynthContext[] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    evolvingContexts.push(new c.SynthContext(i, audioContext, undefined, true));
  }

  let measurements: number[][][];
  let roundBest: BestType = {
    topology: undefined,
    score: 0
  };

  let averageFitnesses = [];
  let maxFitnesses = [];
  let minFitnesses = [];

  for (let i = 0; i < NUM_ROUNDS; i++) {
    progressBar.style.width = `${(i/NUM_ROUNDS)*100}%`;

    console.log(`Starting round ${i}`);
    measurements = await Promise.all(evolvingContexts.map(context => test(context)));
    
    roundBest = {
      topology: undefined,
      score: 0
    };

    let fitnesses = [];

    for (let j = 0; j < POPULATION_SIZE; j++) {
      const measurement = measurements[j];
      const currentFitness = fitness(target, measurement);
      fitnesses.push(currentFitness);

      if (currentFitness > roundBest.score) {
        roundBest = {
          topology: evolvingContexts[j].topology,
          score: currentFitness
        };

        if (currentFitness > best.score) {
          best = {
            topology: evolvingContexts[j].topology,
            score: currentFitness
          };

          bests = [best, ...bests];
          console.log(`NEW BEST: ${currentFitness}`);
        }
      }
    }
    averageFitnesses.push(fitnesses.reduce((a, b) => a + b, 0)/POPULATION_SIZE);
    maxFitnesses.push(Math.max(...fitnesses));
    minFitnesses.push(Math.min(...fitnesses));
    evolvingContexts.forEach(context => context.setTopology((roundBest.topology as c.SynthNode)));
    progressBar.style.width = "100%";
  }

  exportObjectToCsvFile({"Min": minFitnesses, "Average": averageFitnesses, "Max": maxFitnesses}, `fitness${POPULATION_SIZE}p${NUM_ROUNDS}i`);

  console.log(bests);
}

async function start() {
  (document.getElementById("main-panel") as HTMLDivElement).style.display = "flex";
  (document.getElementById("btn-container") as HTMLDivElement).style.display = "none";

  // Connect to Web Audio
  audioContext = new window.AudioContext();

  // Enable Faust compiler; wait until it's ready
  faust = new Faust({
    debug: LOG,
    wasmLocation: "src/libfaust/libfaust-wasm.wasm",
    dataLocation: "src/libfaust/libfaust-wasm.data"
  });
  await faust.ready;

  for (let i = 0; i < contextCount; i++) {
    contexts.push(new c.SynthContext(i, audioContext));
  }

  await Promise.all(contexts.map(context => context.compile(faust)));
}

for (let i = 0; i < contextCount; i++) {
  document.getElementById(`ctx-select-${i}`)?.addEventListener("click", () => selectContext(i));
  document.getElementById(`stop-${i}`)?.addEventListener("click", () => stopContext(i));
  document.getElementById(`select-favourite-${i}`)?.addEventListener("click", () => selectFavourite(i));
  document.getElementById(`process-code-show-${i}`)?.addEventListener("click",() => showProcessCode(i));
  document.getElementById(`full-code-show-${i}`)?.addEventListener("click", () => showFullCode(i));
}

document.getElementById("code-close")?.addEventListener("click", () => closeCode());

document.getElementById("start-btn")?.addEventListener("click", async () => await start());

document.getElementById("evolve-btn")?.addEventListener("click", () => evolve());


// MIDI SETUP
await WebMidi.enable();
const midiDeviceCount = WebMidi.inputs.length;
if (midiDeviceCount < 1) {
  console.log("No MIDI input devices detected.");
  //Array.prototype.forEach.call(document.getElementsByClassName("ctx-select"), (item: HTMLButtonElement) => item.style.display = "none");
}
else {
  console.log(`Detected ${midiDeviceCount} MIDI input device${midiDeviceCount == 1 ? "" : "s"}:\n- ${WebMidi.inputs.map(x => x.name).join("\n- ")}`);

  WebMidi.inputs.forEach((device: Input) => {
    device.addListener("midimessage", (e: MessageEvent) => {
      contexts[selectedContext].midiMessage(e.message.data);

      log(`Received ${e.message.type} from ${device.name}`);
    });
  });
}
