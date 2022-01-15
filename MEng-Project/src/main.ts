import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`

import { Faust } from "faust2webaudio";
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
  wasmLocation: "libfaust/libfaust-wasm.wasm",
  dataLocation: "libfaust/libfaust-wasm.data"
});

await faust.ready;

faust.getNode(polycode, { audioCtx, useWorklet: window.AudioWorklet ? true : false, voices: 4, args: { "-I": "https://faust.grame.fr/tools/editor/libraries/" } })
.then(node => node.connect(audioCtx.destination));
faust.getNode(code, { audioCtx, useWorklet: window.AudioWorklet ? true : false, args: { "-I": "https://faust.grame.fr/tools/editor/libraries/" } })
.then(node => node.connect(audioCtx.destination));
