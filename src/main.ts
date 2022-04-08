import {Faust} from "faust2webaudio";
import {WebMidi, Input, MessageEvent} from "webmidi";
import * as c from "./constructs";

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

const panel = document.getElementById("main-panel") as HTMLDivElement;
for (let i = 0; i < contextCount; i++) {
  const mfccCoefficientCount = 13; // taken from Meyda.js MFCC
  let mfccBars = "";

  for (let j = 0; j < mfccCoefficientCount; j++) {
    mfccBars += `<div class="mfcc-bar" id="bar-${i}-${j}"></div>`;
  }

  const panelContent = `
    <div class="context-panel" id="panel${i}">
      <iframe id="ui${i}" src="./faust-ui.html" height="700px" width="40%"></iframe>
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

const selectContext = (value?: number) => {
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

const stopContext = (contextId: number) => {
  contexts[contextId].webAudioNode.allNotesOff();
}

const selectFavourite = (contextId: number) => {
  if (contextId === favouriteContext) {
    favouriteContext = -1;
  }
  else {
    favouriteContext = contextId;
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

const closeCode = () => {
  (document.getElementById("code-overlay") as HTMLDivElement).style.display = "none";
};
const showProcessCode = (i: number) => {
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
const showFullCode = (i: number) => {
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

const start = async () => {
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
  
  for (let i of contexts) {
    await i.compile(faust);
  }

  setTimeout(async () => {
    let dave = contexts[0].measureMFCC();
    console.log(dave);
    console.log(await dave);
  }, 1000);
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
      contexts[selectedContext].webAudioNode.midiMessage(e.message.data);

      log(`Received ${e.message.type} from ${device.name}`);
    });
  });
}
