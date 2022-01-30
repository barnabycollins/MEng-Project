import {Faust, FaustAudioWorkletNode} from "faust2webaudio";
import {WebMidi} from "webmidi";
import {code, polycode, midicode} from "./programs";

const LOG = true;

const audioCtx = new window.AudioContext();

const faust = new Faust({
  debug: LOG,
  wasmLocation: "src/libfaust/libfaust-wasm.wasm",
  dataLocation: "src/libfaust/libfaust-wasm.data"
});

await faust.ready;

let node: FaustAudioWorkletNode;
node = await faust.getNode(midicode, { audioCtx, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;

node.connect(audioCtx.destination);

const uiWindow = (document.getElementById("ui-frame") as HTMLIFrameElement).contentWindow;
node.setOutputParamHandler((path: string, value: number) => {
  const msg = {path, value, type: "param"};
  uiWindow?.postMessage(msg, "*");
});

const msg = {type: "ui", ui: node.getUI()};
uiWindow?.postMessage(msg, "*");

window.addEventListener("message", (e) => {
  node.setParamValue(e.data.path, e.data.value);
});

await WebMidi.enable();

if (WebMidi.inputs.length < 1) {
  console.log("No MIDI input devices detected.");
}
else {
  WebMidi.inputs.forEach(device => {
    device.addListener("midimessage", e => {
      node.midiMessage(e.message.data);
      if (LOG) console.log(`Received ${e.message.type} from ${device.name}`);
    });
  });
}
