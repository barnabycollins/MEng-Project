import {Faust, FaustAudioWorkletNode} from "faust2webaudio";
import {WebMidi, Input, MessageEvent} from "webmidi";
import {code, polycode, midicode} from "./programs";
import * as c from "./constructs";
import Meyda from "meyda";

let population: FaustAudioWorkletNode[] = [];

function sample(array: any[]): any {
  return array[~~(Math.random() * array.length)];

}

function randomParameter(): number {
  return Math.random() * (20000 - 20) + 20;
}

function generate(type: new (...args: any[]) => c.BaseNode, furtherArg?: any): c.BaseNode {
  if (type === c.Constant) {
    return new c.Constant(randomParameter());
  }
  else if (type === c.Parameter) {
    const rangeZeroOne = furtherArg as boolean;
    if (rangeZeroOne) {
      return new c.Parameter(Math.random(), {min: 0, max: 1, step: 0.01});
    }
    return new c.Parameter(randomParameter());
  }
  else if (type === c.MIDIFreq) {
    return new c.MIDIFreq();
  }
  else if (type === c.MathsNode) {
    const operation = "*";
    const numArguments = sample([2, 2, 2, 2, 2, 3, 3, 4]);

    let args = [];
    const possibleArgs = [c.Oscillator, c.Parameter, c.MathsNode, c.MIDIFreq];
    
    let choices = [];

    for (let i=0; i < numArguments; i++) {
      const choice = sample(possibleArgs);
      choices.push(choice);
      if (choice === c.MIDIFreq) {
        possibleArgs.pop();
      }
    }

    function couldCarrySound(input: new (...args: any[]) => c.BaseNode) {
      return input === c.Oscillator || input === c.MathsNode;
    }

    choices.sort((a, b) => {
      if (!couldCarrySound(a) && couldCarrySound(b)) {
        return 1;
      }
      else if (couldCarrySound(a) && !couldCarrySound(b)) {
        return -1;
      }
      return 0;
    });

    let carriesSound = false;

    for (let choice of choices) {
      let input;
      if (choice === c.Oscillator || choice === c.MathsNode) {
        input = generate(choice);
        if (input.carriesSound) {
          carriesSound = true;
        }
      }
      else if (carriesSound) {
        input = generate(c.Parameter, true);
      }
      else {
        input = generate(choice);
      }
      args.push(input);
    }

    return new c.MathsNode(operation, ...args);
  }
  else if (type === c.Oscillator) {
    const waveform = sample(['sine', 'saw', 'square', 'triangle']);
    const frequencyNodeType = sample([c.MathsNode, c.FrequencyModulator, c.Parameter, c.MIDIFreq, c.MIDIFreq]);
    
    return new c.Oscillator(waveform, generate(frequencyNodeType));
  }
  else if (type === c.FrequencyModulator) {
    return new c.FrequencyModulator(undefined, undefined, generate(c.Oscillator));
  }

  throw new Error("You need to provide a valid node type to generate()!");
}

function generate_graph() {
  const possibleNodes = [c.MathsNode, c.Oscillator];

  const rootNodeType = sample(possibleNodes);
  let rootNode = generate(rootNodeType);
  console.log(`graphSize: ${rootNode.graphSize}`);

  while (!rootNode.carriesSound || rootNode.graphSize > 50) {
    console.log(`graphSize: ${rootNode.graphSize}`);
    rootNode = generate(rootNodeType);
  }

  return rootNode;
}

function add_user_interface(topology: c.SynthNode) {
  return new c.AudioOutput([
    new c.MathsNode('*', 
      topology,
      new c.Envelope(),
      new c.MIDIGain()
    )
  ]);
}

async function compile_synth(topology: c.AudioOutput): Promise<FaustAudioWorkletNode> {
  const constructedCode = topology.getOutputString();

  console.log(constructedCode);

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
  
  const baseTopology = generate_graph();
  const userTopology = add_user_interface(baseTopology);
  const node = await compile_synth(userTopology);
  
  function processAnalysisData(features: number[]) {
    const resultSpan = document.getElementById("mfcc-results");
    if (resultSpan !== null) {
      resultSpan.innerHTML = `${features}`;
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
