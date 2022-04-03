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
      <div class="mfcc-box" id="mfcc${i}">
        ${mfccBars}
      </div>
      <div class="control-box">
        <button id="process-code-show-${i}">Show process code</button>
        <button id="full-code-show-${i}">Show full code</button>
        <button id="ctx-select-${i}">Select context</button>
        <button id="stop-${i}">Stop note(s)</button>
      </div>
    </div>
  `;
  panel.innerHTML += panelContent;
}

const selectContext = (value?: number) => {
  if (value === undefined) value = (selectedContext + 1) % contextCount;
  selectedContext = value;
}

const stopContext = (contextId: number) => {
  // sends MIDI All Notes Off message (11010000 01111011 00000000)
  //                                   = 176    = 123    = 0
  contexts[contextId].webAudioNode.midiMessage([176, 123, 0]);
}

for (let i = 0; i < contextCount; i++) {
  document.getElementById(`ctx-select-${i}`)?.addEventListener("click", () => selectContext(i));
  document.getElementById(`stop-${i}`)?.addEventListener("click", () => stopContext(i));
}

document.getElementById("resume-btn")?.addEventListener("click", async () => {
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
    contexts.push(new c.SynthContext(i));
  }
  
  for (let i of contexts) {
    await i.compile(faust, audioContext);
  }
});



// MIDI SETUP

// Set up MIDI
await WebMidi.enable();
const midiDeviceCount = WebMidi.inputs.length;
if (midiDeviceCount < 1) {
  console.log("No MIDI input devices detected.");
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
