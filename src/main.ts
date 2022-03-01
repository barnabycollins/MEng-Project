import {Faust, FaustAudioWorkletNode} from "faust2webaudio";
import {WebMidi, Input, MessageEvent} from "webmidi";
import {code, polycode, midicode} from "./programs";
import * as c from "./constructs";
import Meyda from "meyda";

const constructedCode = new c.AudioOutput([
  new c.MathsNode('*', 
    new c.Oscillator('triangle', new c.MIDIFreq()),
    new c.Envelope(),
    new c.MIDIGain()
  )
]).getOutputString();

console.log(constructedCode);

// LOGGING
const LOG = false;
function log(toLog: any): void {
  /**
   * Log a message if logging is enabled; otherwise do nothing
   */
  if (LOG) console.log("(DEBUG)", toLog);
}

function processAnalysisData(features: number[]) {
  const resultSpan = document.getElementById("mfcc-results");
  if (resultSpan !== null) {
    resultSpan.innerHTML = `${features}`;
  }
}

function fitness(target: number[][], current: number[][]) {
  const numWindows = target.length;
  const numCoefficients = target[0].length;

  let distance = 0;

  for (let window = 0; window < numWindows; window++) {
    let sum = 0;
    for (let coeff = 0; coeff < numCoefficients; coeff++) {
      sum += (target[window][coeff] - current[window][coeff])**2;
    }
    distance += Math.sqrt(sum);
  }
  distance /= numWindows;

  return 1/(1+distance);
}

// SOUND OUTPUT

// Connect to Web Audio
const audioContext = new window.AudioContext();

// Enable Faust compiler; wait until it's ready
const faust = new Faust({
  debug: LOG,
  wasmLocation: "src/libfaust/libfaust-wasm.wasm",
  dataLocation: "src/libfaust/libfaust-wasm.data"
});
await faust.ready;

// Compile a new Web Audio node from faust code
let node: FaustAudioWorkletNode;
node = await faust.getNode(constructedCode, { audioCtx: audioContext, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;

// Connect the node's output to Web Audio
// @ts-ignore (connect does exist even though TypeScript says it doesn't)
node.connect(audioContext.destination);

const meydaAnalyser = Meyda.createMeydaAnalyzer({
  "audioContext": audioContext,
  "source": node,
  "bufferSize": 16384,
  "featureExtractors": "mfcc",
  "callback": processAnalysisData
});

meydaAnalyser.start();


// UI CONTROLS

// Find UI iframe
const uiWindow = (document.getElementById("ui-frame") as HTMLIFrameElement).contentWindow;

// Make the UI update when parameters change on the backend (eg, when a control is modulated by MIDI)
node.setOutputParamHandler((path: string, value: number) => {
  const msg = {path, value, type: "param"};
  uiWindow?.postMessage(msg, "*");
});

// Send node parameters to the UI for display
const msg = {type: "ui", ui: node.getUI()};
uiWindow?.postMessage(msg, "*");

// Add a listener for when we receive control changes from the iframe
window.addEventListener("message", (e) => {
  node.setParamValue(e.data.path, e.data.value);
});



// MIDI SETUP

// Set up MIDI
await WebMidi.enable();
const midiDeviceCount = WebMidi.inputs.length;
if (midiDeviceCount < 1) {
  console.log("No MIDI input devices detected.");
}
else {
  console.log(`Detected ${midiDeviceCount} MIDI input device${midiDeviceCount != 1 ? "s" : ""}:\n- ${WebMidi.inputs.map(x => x.name).join("\n- ")}`);

  WebMidi.inputs.forEach((device: Input) => {
    device.addListener("midimessage", (e: MessageEvent) => {
      node.midiMessage(e.message.data);

      log(`Received ${e.message.type} from ${device.name}`);
    });
  });
}
