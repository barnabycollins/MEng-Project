import { FaustAudioWorkletNode, Faust } from "faust2webaudio";
import Meyda from "meyda";
import { MeydaAnalyzer } from "meyda/dist/esm/meyda-wa";
import { SynthNode, AudioOutput, MathsNode, Oscillator, LPFilter, Envelope, Parameter, MIDIGain, BaseNode, Constant, MIDIFreq, FrequencyModulator } from "./constructs";
import { REPLACE_CHANCE, MUTATE_CHANCE, MAX_TOPOLOGY_SIZE } from "./evolution";

function sample(array: any[]): any {
  return array[~~(Math.random() * array.length)];
}

function generate(type: new (...args: any[]) => BaseNode, ...nodeArgs: any[]): BaseNode {
  if (type === Constant) {
    let value;
    if (nodeArgs[0] !== undefined) {
      value = nodeArgs[0];
    }

    return new Constant(value);
  }
  else if (type === Parameter) {
    let value, range;
    if (nodeArgs[0] !== undefined) {
      value = nodeArgs[0];
      
      if (nodeArgs[1] !== undefined) {
        range = nodeArgs[1];
      }
    }

    return new Parameter(value, range);
  }
  else if (type === MIDIFreq) {
    return new MIDIFreq();
  }
  else if (type === MathsNode) {
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
  
      let possibleArgs = [Parameter, Oscillator, MathsNode, MIDIFreq];
      
      let choices = [];
  
      for (let i=0; i < numArguments; i++) {
        const choice = sample(possibleArgs);
        choices.push(choice);
        if (choice === MIDIFreq) {
          possibleArgs.pop();
        }
        if (choice === Parameter) {
          possibleArgs.splice(0, 1);
        }
      }
  
      function couldCarrySound(input: new (...args: any[]) => BaseNode) {
        return input === Oscillator || input === MathsNode || input === FrequencyModulator;
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
        if (choice === Oscillator || choice === MathsNode) {
          input = generate(choice);
          if (input.carriesSound) {
            carriesSound = true;
          }
        }
        else if (carriesSound) {
          input = generate(Parameter, Math.random());
        }
        else {
          input = generate(choice);
        }
        args.push(input);
      }
    }

    return new MathsNode(operation, ...args);
  }
  else if (type === Oscillator) {
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
      const frequencyNodeType = sample([MathsNode, FrequencyModulator, Parameter, MIDIFreq, MIDIFreq]);
      frequencyNode = generate(frequencyNodeType);
    }
    
    return new Oscillator(waveform, frequencyNode);
  }
  else if (type === FrequencyModulator) {
    return new FrequencyModulator(undefined, undefined, generate(Oscillator));
  }

  throw new Error("You need to provide a valid node type to generate()!");
}

function mutate(node: BaseNode): BaseNode {
  const randomValue = Math.random();

  const replaceValue = () => {
    const possibleReplacements = [MathsNode, Parameter, MIDIFreq, FrequencyModulator];
    return generate(sample(possibleReplacements));
  }

  const replaceSynth = () => {
    const possibleReplacements = [MathsNode, Oscillator];
    return generate(sample(possibleReplacements));
  }

  if (node instanceof Parameter) {

    if (randomValue < REPLACE_CHANCE) {
      return replaceValue();
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(Parameter);
    }
    return generate(Parameter, node.defaultValue, node.range);
  }
  else if (node instanceof MIDIFreq) {

    if (randomValue < REPLACE_CHANCE) {
      return replaceValue();
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(MathsNode, "*", new Parameter(Math.random()*5, {min: 0, max: 5, step: 0.01}), generate(MIDIFreq));
    }
    return generate(MIDIFreq);
  }
  else if (node instanceof MathsNode) {

    if (randomValue < REPLACE_CHANCE) {
      if (node.carriesSound) {
        return replaceValue();
      }
      else {
        return replaceSynth();
      }
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(MathsNode, undefined, ...node.inputs.map(mutate));
    }
    return generate(MathsNode, node.operation, ...node.inputs.map(mutate));
  }
  else if (node instanceof Oscillator) {
    
    if (randomValue < REPLACE_CHANCE) {
      return replaceSynth();
    }
    else if (randomValue < MUTATE_CHANCE) {
      return generate(Oscillator, undefined, mutate(node.frequency));
    }
    return generate(Oscillator, node.waveform, mutate(node.frequency));
  }
  else if (node instanceof FrequencyModulator) {

    if (randomValue < REPLACE_CHANCE) {
      return replaceValue();
    }
    return generate(FrequencyModulator, mutate(node.width), mutate(node.offset), mutate(node.input));
  }

  throw new Error("You need to provide a valid node to mutate()!");
}


class SynthContext {
  index: number;
  uiFrame: HTMLIFrameElement;

  mfccBars: HTMLDivElement[];

  topology!: SynthNode;
  processCode!: string;
  userTopology!: AudioOutput;
  fullCode: string;
  webAudioNode: FaustAudioWorkletNode | undefined;
  analyser: MeydaAnalyzer | undefined;

  audioContext: AudioContext;
  passthrough: GainNode;
  gainNode: GainNode;

  paramCount: number;
  envCount: number;
  fmCount: number;
  lpFilterCount: number;

  analysingNow: boolean;

  mfccData: number[];

  params: {
    env_a: string,
    env_d: string,
    env_s: string,
    env_r: string,
    lp_freq: string,
    lp_q: string
  };

  headless: boolean;

  constructor(index: number, context: AudioContext, topology?: SynthNode, headless: boolean = false) {
    this.index = index;
    this.uiFrame = document.getElementById(`ui${index}`) as HTMLIFrameElement;

    this.paramCount = 0;
    this.envCount = 0;
    this.fmCount = 0;
    this.lpFilterCount = 0;
    this.fullCode = ""; // populated on compile

    this.mfccBars = [];

    this.audioContext = context;
    this.gainNode = new GainNode(context, {gain: 1});
    this.gainNode.connect(context.destination);
    this.passthrough = new GainNode(context, {gain: 1});
    this.passthrough.connect(this.gainNode);

    this.headless = headless;
    if (this.headless) {
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }
    else {
      const mfccCoefficientCount = 13;
      for (let i = 0; i < mfccCoefficientCount; i++) {
        this.mfccBars.push(document.getElementById(`bar-${index}-${i}`) as HTMLDivElement);
      }
    }
  
    this.analyser = Meyda.createMeydaAnalyzer({
      "audioContext": this.audioContext,
      "source": this.passthrough,
      "bufferSize": 512,
      "featureExtractors": "mfcc",
      "callback": this.mfccCallback.bind(this)
    });
    
    this.analyser.start();

    this.analysingNow = headless;
    this.mfccData = new Array(13).fill(0);

    if (topology !== undefined) {
      this.topology = topology;
    }
    else {
      this.generateSynth();
    }

    this.params = {
      env_a: "",
      env_d: "",
      env_s: "",
      env_r: "",
      lp_freq: "",
      lp_q: ""
    }
  }

  setTopology(topology: SynthNode) {
    this.topology = topology;
    this.processCode = this.topology.getNodeStrings().processCode;
    this.addOutputInterface();
  }

  resetCounts() {
    this.paramCount = 0;
    this.envCount = 0;
    this.fmCount = 0;
    this.lpFilterCount = 0;
  }
  
  generateSynth() {
    const possibleNodes = [MathsNode, Oscillator];
  
    const rootNodeType = sample(possibleNodes);
    let rootNode = generate(rootNodeType);
  
    while (!rootNode.carriesSound || rootNode.graphSize > MAX_TOPOLOGY_SIZE) {
      rootNode = generate(rootNodeType);
    }
  
    this.topology = rootNode;

    this.processCode = rootNode.getNodeStrings().processCode;

    this.addOutputInterface();
  }

  mutateSynth() {
    let rootNode = mutate(this.topology);
    while (!rootNode.carriesSound || rootNode.graphSize > MAX_TOPOLOGY_SIZE) {
      rootNode = mutate(this.topology);
    }

    this.topology = rootNode;
    this.processCode = this.topology.getNodeStrings().processCode;
    this.addOutputInterface();
  }

  addOutputInterface() {
    if (this.headless) {
      this.userTopology = new AudioOutput([this.topology]);
    }
    else {
      this.userTopology = new AudioOutput([
        new LPFilter(
          new MathsNode('*',
            new Envelope(
              new Parameter(0.01, {min: 0, max: 10, step: 0.01}, `MAIN_ENV_A`),
              new Parameter(0.3, {min: 0, max: 10, step: 0.01}, `MAIN_ENV_D`),
              new Parameter(0.8, {min: 0, max: 1, step: 0.01}, `MAIN_ENV_S`),
              new Parameter(0.01, {min: 0, max: 10, step: 0.01}, `MAIN_ENV_R`)
            ),
            new MIDIGain(),
            this.topology
          ),
          new Parameter(20000, {min: 20, max: 20000, step: 1}, `MAIN_LP_FREQ`),
          new Parameter(0.5, {min: 0.1, max: 30, step: 0.1}, `MAIN_LP_Q`)
        )
      ]);
    }
  }

  async compile(faust: Faust) {
    //console.log(`Context ${this.index} beginning compilation. Graph contains ${this.userTopology.graphSize} nodes.`);
    const constructedCode = this.userTopology.getOutputString();

    this.fullCode = constructedCode;

    // Compile a new Web Audio node from faust code
    let node: FaustAudioWorkletNode;
    node = await faust.getNode(constructedCode, { audioCtx: this.audioContext, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;
    
    // Connect the node's output to Web Audio
    // @ts-ignore (connect does exist even though TypeScript says it doesn't)
    node.connect(this.passthrough);
    
    this.webAudioNode = node;

    if (!this.headless) {
      // UI CONTROLS
      
      // Find UI iframe
      const uiWindow = this.uiFrame.contentWindow as Window;
      
      // Make the UI update when parameters change on the backend (eg, when a control is modulated by MIDI)
      node.setOutputParamHandler((path: string, value: number) => {
        const msg = {path, value, type: "param"};
        uiWindow.postMessage(msg, "*");
      });
      
      // Send node parameters to the UI for display
      const msg = {type: "ui", ui: node.getUI()};
      uiWindow.postMessage(msg, "*");
      
      // Add a listener for when we receive control changes from the iframe
      window.addEventListener("message", (e) => {
        node.setParamValue(e.data.path, e.data.value);
      });

      const parameters = node.getParams();
  
      this.params = {
        env_a: parameters.filter(i => i.includes('MAIN_ENV_A'))[0],
        env_d: parameters.filter(i => i.includes('MAIN_ENV_D'))[0],
        env_s: parameters.filter(i => i.includes('MAIN_ENV_S'))[0],
        env_r: parameters.filter(i => i.includes('MAIN_ENV_R'))[0],
        lp_freq: parameters.filter(i => i.includes('MAIN_LP_FREQ'))[0],
        lp_q: parameters.filter(i => i.includes('MAIN_LP_Q'))[0]
      };
    }
  }

  mfccCallback(values: number[]) {
    if (this.analysingNow) {
      this.mfccData = values;
    }
    else {
      for (let i = 0; i < values.length; i++) {
        this.mfccBars[i].style.height = `${Math.min(values[i], 100)}px`;
      }
    }
  }

  checkNodeExists(value: FaustAudioWorkletNode | undefined): asserts value is FaustAudioWorkletNode {
    if (value === undefined) throw new Error("Cannot analyse an uncompiled node!");
  }

  allNotesOff() {
    this.webAudioNode?.allNotesOff();
  }
  midiMessage(data: number[] | Uint8Array) {
    this.webAudioNode?.midiMessage(data);
  }

  startAnalysing(node: FaustAudioWorkletNode) {

    for (let i of [this.params.env_a, this.params.env_d, this.params.env_r]) {
      node.setParamValue(i, 0);
    }
    node.setParamValue(this.params.env_s, 1);

    node.setParamValue(this.params.lp_freq, 20000);
    node.setParamValue(this.params.lp_q, 0.1);
    
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

    this.analysingNow = true;
  }

  stopAnalysing(node: FaustAudioWorkletNode): Promise<void> {
    // allow 20ms so that the envelope's re-enabled release doesn't let any sound through
    return new Promise((resolve) => {
      setTimeout(() => {
        node.setParamValue(this.params.env_a, 0.01);
        node.setParamValue(this.params.env_d, 0.3);
        node.setParamValue(this.params.env_s, 0.8);
        node.setParamValue(this.params.env_r, 0.01);
        this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
  
        this.analysingNow = false;
        
        resolve();
      }, 20);
    })
  }

  async measureMFCC(): Promise<number[][]> {
    this.checkNodeExists(this.webAudioNode);
    
    if (!this.headless) {
      this.startAnalysing(this.webAudioNode);
    }
    return new Promise(async (resolve) => {
      this.checkNodeExists(this.webAudioNode);

      let results: number[][] = [];
      results.push(await this.measureNote(36, this.webAudioNode));   // C2
      results.push(await this.measureNote(69, this.webAudioNode));   // A4
      results.push(await this.measureNote(101, this.webAudioNode));  // F7

      if (!this.headless) {
        await this.stopAnalysing(this.webAudioNode);
      }
      
      resolve(results);
    });
  }

  async measureNote(midiNote: number, node: FaustAudioWorkletNode): Promise<number[]> {

    node.keyOn(0, midiNote, 127);

    // return a Promise that returns the MFCC data upon resolving
    return new Promise((resolve) => {
      let mfccData = Array(13);
      setTimeout(() => {
        mfccData = this.mfccData;
        node.keyOff(0, midiNote, 127);
        resolve(mfccData);
      }, 4096*1000/this.audioContext.sampleRate);
    });
  }

  cleanUp() {
    //console.log(`Cleaning up context ${this.index}`);
    this.fullCode = "";
    
    // @ts-ignore (disconnect does exist even though TypeScript says it doesn't)
    this.webAudioNode?.disconnect(this.passthrough);
    this.webAudioNode?.destroy();
    delete this.webAudioNode;

    // Node will now be garbage collected (in theory)!
  }
}

export {SynthContext};
