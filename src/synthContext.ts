import { FaustAudioWorkletNode, Faust } from "faust2webaudio";
import Meyda from "meyda";
import { MeydaAnalyzer } from "meyda/dist/esm/meyda-wa";
import { SynthNode, AudioOutput, MathsNode, Oscillator, LPFilter, Envelope, Parameter, MIDIGain, MIDIGate } from "./constructs";
import { MAX_TOPOLOGY_SIZE, mutate, generate, sample } from "./evolution";


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
    lp_q: string,
    midi_freq: string,
    gate: string
  };

  headless: boolean;

  constructor(index: number, context: AudioContext, topology?: SynthNode, headless: boolean = false, hearEvolution: boolean = false) {
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
    if (this.headless && !hearEvolution) {
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }
    else if (hearEvolution) {
      this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
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
      "bufferSize": 1024,
      "featureExtractors": "mfcc",
      "callback": this.mfccCallback.bind(this)
    });
    
    this.analyser.start();

    this.analysingNow = headless;
    this.mfccData = new Array(13).fill(0);

    if (topology !== undefined) {
      this.setTopology(topology);
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
      lp_q: "",
      midi_freq: "",
      gate: ""
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
      this.userTopology = new AudioOutput([
        // 0.25 gain to avoid clipping
        new MathsNode("*", this.topology, new MIDIGate(), new Parameter(0.25))
      ]);
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

    const parameters = node.getParams();

    this.params["midi_freq"] = parameters.filter(i => i.includes('freq'))[0];
    this.params["gate"] = parameters.filter(i => i.includes('gate'))[0];

    if (!this.headless) {
      // UI CONTROLS
      
      // Find UI iframe
      const uiWindow = this.uiFrame.contentWindow as Window;
      
      // Send node parameters to the UI for display
      const msg = {type: "ui", ui: node.getUI()};
      uiWindow.postMessage(msg, "*");
      
      // Make the UI update when parameters change on the backend (eg, when a control is modulated by MIDI)
      node.setOutputParamHandler((path: string, value: number) => {
        const msg = {path, value, type: "param"};
        uiWindow.postMessage(msg, "*");
      });
      
      // Add a listener for when we receive control changes from the iframe
      window.addEventListener("message", (e) => {
        node.setParamValue(e.data.path, e.data.value);
      });
  
      this.params = {
        env_a: parameters.filter(i => i.includes('MAIN_ENV_A'))[0],
        env_d: parameters.filter(i => i.includes('MAIN_ENV_D'))[0],
        env_s: parameters.filter(i => i.includes('MAIN_ENV_S'))[0],
        env_r: parameters.filter(i => i.includes('MAIN_ENV_R'))[0],
        lp_freq: parameters.filter(i => i.includes('MAIN_LP_FREQ'))[0],
        lp_q: parameters.filter(i => i.includes('MAIN_LP_Q'))[0],
        midi_freq: this.params.midi_freq,
        gate: this.params.gate
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
      results.push(await this.measureNote(65.41, this.webAudioNode));   // C2
      results.push(await this.measureNote(440, this.webAudioNode));     // A4
      results.push(await this.measureNote(2793.83, this.webAudioNode)); // F7

      if (!this.headless) {
        await this.stopAnalysing(this.webAudioNode);
      }
      
      resolve(results);
    });
  }

  async measureNote(frequency: number, node: FaustAudioWorkletNode): Promise<number[]> {

    node.setParamValue(this.params.midi_freq, frequency);
    node.setParamValue(this.params.gate, 1);

    // return a Promise that returns the MFCC data upon resolving
    return new Promise((resolve) => {
      let mfccData = Array(13);
      setTimeout(() => {
        mfccData = this.mfccData;
        node.setParamValue(this.params.gate, 0);
        resolve(mfccData);
        // allows time for the timbre to stabilise
        // (testing with identical sine waves returned low fitness for shorter bursts)
      }, 4096*1000/this.audioContext.sampleRate);
    });
  }

  cleanUp() {
    this.fullCode = "";
    
    // @ts-ignore (disconnect does exist even though TypeScript says it doesn't)
    this.webAudioNode?.disconnect(this.passthrough);
    this.webAudioNode?.destroy();
    delete this.webAudioNode;

    // Node will now be garbage collected in theory
    // (but isn't in practice - I think this is because faust2webaudio keeps a record of compiled nodes...?)
  }
}

export {SynthContext};
