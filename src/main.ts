import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`

import {Faust, FaustAudioWorkletNode, FaustScriptProcessorNode} from "faust2webaudio";
const audioCtx = new window.AudioContext();
const code = `
import("stdfaust.lib");
process = ba.pulsen(1, 10000) : pm.djembe(60, 0.3, 0.4, 1) <: dm.freeverb_demo;`;
/*const polycode = `
import("stdfaust.lib");
process = ba.pulsen(1, 10000) : pm.djembe(ba.hz2midikey(freq), 0.3, 0.4, 1) * gate * gain with {
    freq = hslider("freq", 440, 40, 8000, 1);
    gain = hslider("gain", 0.5, 0, 1, 0.01);
    gate = button("gate");
};
effect = dm.freeverb_demo;`;*/

const faust = new Faust({
  debug: true,
  wasmLocation: "src/libfaust/libfaust-wasm.wasm",
  dataLocation: "src/libfaust/libfaust-wasm.data"
});

await faust.ready;

let node: FaustScriptProcessorNode | FaustAudioWorkletNode;
node = await faust.getNode(code, { audioCtx, useWorklet: window.AudioWorklet ? true : false, args: { "-I": "https://raw.githubusercontent.com/grame-cncm/faustlibraries/4cd48b91f1170498c1cf5d8ee5b87cda6cd797df/" } })
.then(node => node.connect(audioCtx.destination));
/*faust.getNode(polycode, { audioCtx, useWorklet: window.AudioWorklet ? true : false, voices: 4, args: { "-I": "https://faust.grame.fr/tools/editor/libraries/" } })
.then(node => node.connect(audioCtx.destination));*/
