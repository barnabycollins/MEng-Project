import {Faust, FaustAudioWorkletNode} from "faust2webaudio";
import {WebMidi, Input, MessageEvent} from "webmidi";
import * as c from "./constructs";
import Meyda from "meyda";

let population: FaustAudioWorkletNode[] = [];

function sample(array: any[]): any {
  return array[~~(Math.random() * array.length)];

}

const minLogValue = Math.log(20);
const maxLogValue = Math.log(20000);
const parameterLogScale = maxLogValue - minLogValue;
function randomParameter(scale: "log" | "linear" = "log"): number {
  if (scale == "log") {
    // based on https://stackoverflow.com/a/846249/5094386
    return Math.exp(minLogValue + parameterLogScale*Math.random());
  }
  else if (scale == "linear") {
    return Math.random() * (20000 - 20) + 20;
  }

  return 0;
}

function generate(type: new (...args: any[]) => c.BaseNode, ...nodeArgs: any[]): c.BaseNode {
  if (type === c.Constant) {
    let value;
    if (nodeArgs[0] !== undefined) {
      value = nodeArgs[0];
    }

    return new c.Constant(value);
  }
  else if (type === c.Parameter) {
    let value, range;
    if (nodeArgs[0] !== undefined) {
      value = nodeArgs[0];
      
      if (nodeArgs[1] !== undefined) {
        range = nodeArgs[1];
      }
    }

    return new c.Parameter(value, range);
  }
  else if (type === c.MIDIFreq) {
    return new c.MIDIFreq();
  }
  else if (type === c.MathsNode) {
    let operation, args = [];
    let givenArgs = false;
    if (nodeArgs[0] !== undefined) {
      operation = nodeArgs[0];

      if (nodeArgs[1] !== undefined) {
        givenArgs = true;
        args = nodeArgs.slice(1);
      }
    }
    else {
      operation = sample(["*", "+"]);
    }

    if (!givenArgs) {
      const numArguments = sample([2, 2, 2, 2, 2, 3, 3, 4]);
  
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
        return input === c.Oscillator || input === c.MathsNode || input === c.FrequencyModulator;
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
          input = generate(c.Parameter, Math.random());
        }
        else {
          input = generate(choice);
        }
        args.push(input);
      }
    }

    return new c.MathsNode(operation, ...args);
  }
  else if (type === c.Oscillator) {
    let waveform, frequencyNode;
    let givenFrequencyNode = false;
    if (nodeArgs[0] !== undefined) {
      waveform = nodeArgs[0];

      if (nodeArgs[1] !== undefined) {
        givenFrequencyNode = true;
        frequencyNode = nodeArgs[1];
      }
    }
    else {
      waveform = sample(['sine', 'saw', 'square', 'triangle']);
    }
    
    if (!givenFrequencyNode) {
      const frequencyNodeType = sample([c.MathsNode, c.FrequencyModulator, c.Parameter, c.MIDIFreq, c.MIDIFreq]);
      frequencyNode = generate(frequencyNodeType);
    }
    
    return new c.Oscillator(waveform, frequencyNode);
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
    c.resetCounts();
    rootNode = generate(rootNodeType);
  }

  return rootNode;
}

function mutate(node: c.BaseNode): c.BaseNode {
  const REPLACE_CHANCE = 0.03;
  const MUTATE_CHANCE = 0.1;

  // c.resetCounts(); //TODO maybe fix

  function replaceValue() {
    const possibleReplacements = [c.MathsNode, c.Parameter, c.MIDIFreq, c.FrequencyModulator];
    return generate(sample(possibleReplacements));
  }

  function replaceSynth() {
    const possibleReplacements = [c.MathsNode, c.Oscillator, c.FrequencyModulator];
    return generate(sample(possibleReplacements));
  }

  if (node instanceof c.Parameter) {
    const randomValue = Math.random();

    if (randomValue < REPLACE_CHANCE) {
      return replaceValue();
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(c.Parameter);
    }
    return generate(c.Parameter, node.defaultValue);
  }
  else if (node instanceof c.MIDIFreq) {
    const randomValue = Math.random();

    if (randomValue < REPLACE_CHANCE) {
      return replaceValue();
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(c.MathsNode, "*", new c.Parameter(Math.random()*5, {min: 0, max: 5, step: 0.01}), generate(c.MIDIFreq));
    }
    return generate(c.MIDIFreq);
  }
  else if (node instanceof c.MathsNode) {
    const randomValue = Math.random();

    if (randomValue < REPLACE_CHANCE) {
      if (node.carriesSound) {
        return replaceValue();
      }
      else {
        return replaceSynth();
      }
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(c.MathsNode, undefined, ...node.inputs.map(mutate));
    }
    return generate(c.MathsNode, node.operation, ...node.inputs.map(mutate));
  }
  else if (node instanceof c.Oscillator) {
    const randomValue = Math.random();
    
    if (randomValue < REPLACE_CHANCE) {
      return replaceSynth();
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(c.Oscillator, undefined, mutate(node.frequency));
    }
    return generate(c.Oscillator, node.waveform, mutate(node.frequency));
  }
  else if (node instanceof c.FrequencyModulator) {
    const randomValue = Math.random();

    if (randomValue < REPLACE_CHANCE) {
      return replaceValue();
    }
    return generate(c.FrequencyModulator, mutate(node.width), mutate(node.offset), mutate(node.input));
  }

  throw new Error("You need to provide a valid node to mutate()!");
}

function add_user_interface(topology: c.SynthNode) {
  return new c.AudioOutput([
    new c.LPFilter(
      new c.MathsNode('*', 
        topology,
        new c.Envelope(),
        new c.MIDIGain()
      )
    )
  ]);
}

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
  console.log(baseTopology);
  console.log(baseTopology.getNodeStrings());
  const mutatedTopology = mutate(baseTopology);
  console.log(mutatedTopology.getNodeStrings());
  const twiceMutatedTopology = mutate(mutatedTopology);
  console.log(twiceMutatedTopology.getNodeStrings());
  
  const userTopology = add_user_interface(baseTopology);
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
