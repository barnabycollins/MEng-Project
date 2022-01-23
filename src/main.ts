import {Faust, FaustAudioWorkletNode, FaustScriptProcessorNode} from "faust2webaudio";

const audioCtx = new window.AudioContext();
const code = `
import("stdfaust.lib");
process = ba.pulsen(1, 10000) : pm.djembe(60, 0.3, 0.4, 1) <: dm.freeverb_demo;`;
const polycode = `
import("stdfaust.lib");
process = ba.pulsen(1, 10000) : pm.djembe(ba.hz2midikey(freq), 0.3, 0.4, 1) * gate * gain with {
    freq = hslider("freq", 440, 40, 8000, 1);
    gain = hslider("gain", 0.5, 0, 1, 0.01);
    gate = button("gate");
};
effect = dm.freeverb_demo;`;

const faust = new Faust({
  debug: true,
  wasmLocation: "src/libfaust/libfaust-wasm.wasm",
  dataLocation: "src/libfaust/libfaust-wasm.data"
});

await faust.ready;

let node: FaustAudioWorkletNode;
/*node = await faust.getNode(code, { audioCtx, useWorklet: window.AudioWorklet ? true : false, args: { "-I": "libraries/" } })
.then(node => node.connect(audioCtx.destination));*/
node = await faust.getNode(polycode, { audioCtx, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;
console.log(node.getParams());

// typescript-eslint-ignore
node.connect(audioCtx.destination);
node.keyOn(0, 60, 100);
setTimeout(() => node.keyOn(0, 64, 40), 500);
setTimeout(() => node.keyOn(0, 67, 80), 1000);
setTimeout(() => node.allNotesOff(), 5000);

const uiWindow = (document.getElementById("ui-frame") as HTMLIFrameElement).contentWindow;
node.setOutputParamHandler((path: string, value: number) => {
  const msg = {path, value, type: "param"};
  uiWindow?.postMessage(msg, "*");
});

const msg = {type: "ui", ui: node.getUI()};
uiWindow?.postMessage(msg, "*");
