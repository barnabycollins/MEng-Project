import {Faust, FaustAudioWorkletNode} from "faust2webaudio";
// import {WebMidi, Input, MessageEvent} from "webmidi";
import * as c from "./constructs";
import * as g from "./genetic";
import Meyda from "meyda";


async function compile_synth(topology: c.AudioOutput): Promise<FaustAudioWorkletNode> {
  const constructedCode = topology.getOutputString();

  console.log(constructedCode);

  const codeDiv = document.getElementById('code-area');
  if (codeDiv !== null) {
    codeDiv.innerText = constructedCode;
  }

  // Compile a new Web Audio node from faust code
  let node: FaustAudioWorkletNode;
  node = await faust.getNode(constructedCode, { audioCtx: audioContext, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;
  
  // Connect the node's output to Web Audio
  // @ts-ignore (connect does exist even though TypeScript says it doesn't)
  node.connect(audioContext.destination);


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

  return node;
}


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

document.getElementById("resume-btn")?.addEventListener("click", async () => {
  // Connect to Web Audio
  audioContext = new window.AudioContext();
  
  // Enable Faust compiler; wait until it's ready
  faust = new Faust({
    debug: LOG,
    wasmLocation: "src/libfaust/libfaust-wasm.wasm",
    dataLocation: "src/libfaust/libfaust-wasm.data"
  });
  await faust.ready;
  
  const baseTopology = g.generate_graph();
  console.log(baseTopology);
  console.log(baseTopology.getNodeStrings());
  const mutatedTopology = g.mutate(baseTopology);
  console.log(mutatedTopology.getNodeStrings());
  const twiceMutatedTopology = g.mutate(mutatedTopology);
  console.log(twiceMutatedTopology.getNodeStrings());
  
  const userTopology = g.add_user_interface(baseTopology);
  const node = await compile_synth(userTopology);
  
  function processAnalysisData(features: number[]) {
    const resultSpan = document.getElementById("mfcc-results");
    if (resultSpan !== null) {
      resultSpan.innerHTML = `${features.map((item) => Math.round(item*100)/100).join(", ")}`;
    }
  }
  
  const meydaAnalyser = Meyda.createMeydaAnalyzer({
    "audioContext": audioContext,
    "source": node,
    "bufferSize": 16384,
    "featureExtractors": "mfcc",
    "callback": processAnalysisData
  });
  
  meydaAnalyser.start();
});



// MIDI SETUP

// Set up MIDI
/*await WebMidi.enable();
const midiDeviceCount = WebMidi.inputs.length;
if (midiDeviceCount < 1) {
  console.log("No MIDI input devices detected.");
}
else {
  console.log(`Detected ${midiDeviceCount} MIDI input device${midiDeviceCount == 1 ? "" : "s"}:\n- ${WebMidi.inputs.map(x => x.name).join("\n- ")}`);

  WebMidi.inputs.forEach((device: Input) => {
    device.addListener("midimessage", (e: MessageEvent) => {
      node.midiMessage(e.message.data);

      log(`Received ${e.message.type} from ${device.name}`);
    });
  });
}*/
