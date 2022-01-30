import {Faust, FaustAudioWorkletNode} from "faust2webaudio";
import {WebMidi} from "webmidi";
import {code, polycode, midicode} from "./programs";



// LOGGING
const LOG = false;
function log(toLog: any): void {
  /**
   * Log a message if logging is enabled; otherwise do nothing
   */
  if (LOG) console.log("(DEBUG)", toLog);
}



// SOUND OUTPUT

// Connect to Web Audio
const audioCtx = new window.AudioContext();

// Enable Faust compiler; wait until it's ready
const faust = new Faust({
  debug: LOG,
  wasmLocation: "src/libfaust/libfaust-wasm.wasm",
  dataLocation: "src/libfaust/libfaust-wasm.data"
});
await faust.ready;

// Compile a new Web Audio node from faust code
let node: FaustAudioWorkletNode;
node = await faust.getNode(midicode, { audioCtx, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;

// Connect the node's output to Web Audio
node.connect(audioCtx.destination);



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
if (WebMidi.inputs.length < 1) {
  console.log("No MIDI input devices detected.");
}
else {
  WebMidi.inputs.forEach(device => {
    device.addListener("midimessage", e => {
      node.midiMessage(e.message.data);

      log(`Received ${e.message.type} from ${device.name}`);
    });
  });
}
