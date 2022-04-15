import {Faust, FaustAudioWorkletNode} from "faust2webaudio";

onmessage = async event => {
    const code = event.data[0];
    const audioContext = event.data[1];
    let node = await faust.getNode(code, { audioCtx: audioContext, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;

    postMessage(node);
}

const faust = new Faust({
    wasmLocation: "src/libfaust/libfaust-wasm.wasm",
    dataLocation: "src/libfaust/libfaust-wasm.data"
});
await faust.ready;
postMessage("Ready");