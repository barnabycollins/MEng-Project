import { Faust, FaustAudioWorkletNode } from "faust2webaudio";
import Meyda from "meyda";

type WaveformType = 'sine' | 'saw' | 'square' | 'triangle';

type NodeStringsType = {definitions: string[], processCode: string};
type MathsOperationType = '+' | '-' | '*' | '/';

type ParamRangeType = {min: number, max: number, step: number};

class BaseNode {
	carriesSound: boolean;
	graphSize: number;

	constructor() {
		this.carriesSound = false;
		this.graphSize = 1;
	}

	getNodeStrings(): NodeStringsType {
		return {definitions: [], processCode: ''};
	}
}

class VGroup extends BaseNode {
  name: string;
  input: BaseNode;

  constructor(name: string, input: BaseNode) {
    super();

    this.name = name;
    this.input = input;
  }

  getNodeStrings(): NodeStringsType {
    const inputStrings = this.input.getNodeStrings();
    return {definitions: inputStrings.definitions, processCode: `vgroup("${this.name}", ${inputStrings.processCode})`};
  }
}

class ValueNode extends BaseNode {
	constructor() {
		super();
	}
}

class MIDIGate extends ValueNode {
	getNodeStrings(): NodeStringsType {
		return {definitions: [`midigate = button("gate");`], processCode: `midigate`};
	}
}

class MIDIFreq extends ValueNode {
	getNodeStrings(): NodeStringsType {
		return {definitions: [], processCode: `(frequency-20)/19980`};
	}
}

class MIDIGain extends ValueNode {
	getNodeStrings(): NodeStringsType {
		return {definitions: [`midigain = hslider("gain", 0.5, 0, 1, 0.01);`], processCode: `midigain`};
	}
}

class Constant extends ValueNode {
	value: number;

	constructor(value: number | undefined = undefined) {
		super();
		if (value === undefined) {
			value = Math.random();
		}
		this.value = value;
	}

	getNodeStrings(): NodeStringsType {
		return {definitions: [], processCode: `${this.value}`};
	}
}

let paramCount = 10;
class Parameter extends ValueNode {
	index: number;
	name: string;
	varName: string;
	defaultValue: number;
	range: ParamRangeType;
	scale: "linear" | "log";

	constructor(defaultValue: number | undefined = undefined, range: ParamRangeType = {min: 0, max: 1, step: 0.001}, name?: string) {
		super();

    this.index = paramCount;
    paramCount += 1;

		if (name === undefined) {
			this.name = `parameter${this.index}`;
		}
		else {
			this.name = name;
		}

		this.varName = `p${this.index}`;
		if (defaultValue === undefined) {
			defaultValue = Math.random();
		}
		this.defaultValue = defaultValue;

		this.range = range;

		this.scale = this.range.min <= 0 ? "linear" : "log";
	}

	getNodeStrings(): NodeStringsType {
    // Faust gets sad if you try and reference CC messages that don't exist
    const midiString = this.index < 128 ? `[midi:ctrl ${this.index}]` : "";
		return {definitions: [`${this.varName} = hslider("[${this.index}]${this.name} (CC${this.index})${midiString}[scale:${this.scale}]", ${this.defaultValue}, ${this.range.min}, ${this.range.max}, ${this.range.step}) : si.smoo;`], processCode: this.varName};
	}
}

let envCount = 0;
class Envelope extends ValueNode {
	adsr: {
		a: ValueNode,
		d: ValueNode,
		s: ValueNode,
		r: ValueNode
	};
	gate: ValueNode;

	name: string;
	varName: string;

	constructor(
    a = new Parameter(0.01, {min: 0, max: 10, step: 0.01}, `env${envCount}a`),
    d = new Parameter(0.3, {min: 0, max: 10, step: 0.01}, `env${envCount}d`),
    s = new Parameter(0.8, {min: 0, max: 1, step: 0.01}, `env${envCount}s`),
    r = new Parameter(0.1, {min: 0, max: 10, step: 0.01}, `env${envCount}r`),
    gate = new MIDIGate()
  ) {
		super();

		this.adsr = {
			a: a,
			d: d,
			s: s,
			r: r
		};
		this.gate = gate;

		this.name = `env${envCount}`;
		this.varName = `e${envCount}`;
		
		this.graphSize = 1 +
			a.graphSize +
			d.graphSize +
			s.graphSize +
			r.graphSize +
			gate.graphSize;

		envCount += 1;
	}

	getNodeStrings(): NodeStringsType {
		let aStrings = this.adsr.a.getNodeStrings(), dStrings = this.adsr.d.getNodeStrings(), sStrings = this.adsr.s.getNodeStrings(), rStrings = this.adsr.r.getNodeStrings();
		let gateStrings = this.gate.getNodeStrings();

		const defs = [...aStrings.definitions, ...dStrings.definitions, ...sStrings.definitions, ...rStrings.definitions, ...gateStrings.definitions];
		const procCode = `vgroup("${this.name}", en.adsr(${aStrings.processCode}, ${dStrings.processCode}, ${sStrings.processCode}, ${rStrings.processCode}, ${gateStrings.processCode}))`;

		return {definitions: defs, processCode: procCode};
	}
}

class MathsNode extends ValueNode {
	operation: MathsOperationType;
	inputs: (ValueNode | SynthNode)[];

	constructor(operation: MathsOperationType, ...inputs: (ValueNode | SynthNode)[]) {
		super();
		this.operation = operation;
		this.inputs = inputs;
		this.carriesSound = inputs.some(input => input.carriesSound);
		this.graphSize = 1;

		for (let i of inputs) {
			this.graphSize += i.graphSize;
		}
	}

	getNodeStrings(): NodeStringsType {
		const inputStrings: NodeStringsType[] = this.inputs.map(input => input.getNodeStrings());
		let defs: string[] = [];
		inputStrings.map(strings => defs.push(...strings.definitions));

		const processCodes = inputStrings.map(strings => strings.processCode);

		return {definitions: defs, processCode: `(${processCodes.join(this.operation)})`};
	}
}


class SynthNode extends BaseNode {
	constructor() {
		super();
	}
}

class Oscillator extends SynthNode {
	waveform: WaveformType;
	frequency: ValueNode;

	waveformMap = {
		'sine': 'os.oscsin',
		'saw': 'os.sawtooth',
		'square': 'os.square',
		'triangle': 'os.triangle'
	};
	
	constructor(waveform: WaveformType, frequency: ValueNode) {
		super();
		this.waveform = waveform;
		this.frequency = frequency;
		this.carriesSound = true;

		this.graphSize = 1 + frequency.graphSize;
	}

	getNodeStrings(): NodeStringsType {
		const frequencyStrings = this.frequency.getNodeStrings();
		return {definitions: frequencyStrings.definitions, processCode: `${this.waveformMap[this.waveform]}(19980*${frequencyStrings.processCode}+20)`};
	}
}

let fmCount = 0;
class FrequencyModulator extends SynthNode {
	width: Parameter;
	offset: Parameter;
	input: SynthNode;
	name: string;

	constructor(
		width = new Parameter(undefined, undefined, `fm${fmCount}width`),
		offset = new Parameter(undefined, undefined, `fm${fmCount}offset`),
		input: SynthNode
	) {
		super();

		this.width = width;
		this.offset = offset
		this.input = input;

		this.name = `fm${fmCount}`;
		this.graphSize = 1 +
			width.graphSize +
			offset.graphSize +
			input.graphSize;
		
		fmCount += 1;
	}

	getNodeStrings(): NodeStringsType {
		const inputStrings: NodeStringsType[] = [this.width, this.offset, this.input].map(input => input.getNodeStrings());
		let defs: string[] = [];
		inputStrings.map(strings => defs.push(...strings.definitions));

		const processCodes = inputStrings.map(strings => strings.processCode);


		return {definitions: defs, processCode: `((${processCodes[0]}*${processCodes[2]})+${processCodes[1]})`};
	}
}

let lpFilterCount = 0;
class LPFilter extends SynthNode {
	input: SynthNode;
	frequency: ValueNode;
	q: ValueNode;

	constructor(
		input: SynthNode,
		frequency = new Parameter(20000, {min: 20, max: 20000, step: 1}, `lp${lpFilterCount}freq`),
		q = new Parameter(0.5, {min: 0.1, max: 30, step: 0.1}, `lp${lpFilterCount}q`)
	) {
		super();
		this.input = input;
		this.frequency = frequency;
		this.q = q;

		this.graphSize = 1 + input.graphSize + frequency.graphSize + q.graphSize;
		this.carriesSound = input.carriesSound;
	}

	getNodeStrings(): NodeStringsType {
		const inputStrings: NodeStringsType[] = [this.input, this.frequency, this.q].map(input => input.getNodeStrings());
		let defs: string[] = [];
		inputStrings.map(strings => defs.push(...strings.definitions));

		const processCodes = inputStrings.map(strings => strings.processCode);

		return {definitions: defs, processCode: `(${processCodes[0]} : vgroup("Low Pass Filter", fi.resonlp(${processCodes[1]}, ${processCodes[2]}, 1)))`}
	}
}

class AudioOutput extends SynthNode {
	inputs: SynthNode[];

	constructor(inputs: SynthNode[]) {
		super();
		this.inputs = inputs;
		this.graphSize = 0;

		for (let i of inputs) {
			this.graphSize += i.graphSize;
		}
	}
	
	getOutputString(): string {
		const inputStrings: NodeStringsType[] = this.inputs.map((input) => input.getNodeStrings());

		let definitions: string[] = [
			`midifreq = hslider("freq[unit:Hz]", 440, 20, 20000, 1);`,
			`bend = ba.semi2ratio(hslider("pitchBend[midi:pitchwheel]", 0, -2, 2, 0.01));`,
			`frequency = vgroup("Frequency", midifreq*bend);`
		];
		
		inputStrings.map((nodeStrings) => definitions.push(...nodeStrings.definitions));

		let processStrings = inputStrings.map(nodeStrings => nodeStrings.processCode);

		const graphString = `import("stdfaust.lib");\n\n// DEFINITIONS\n${definitions.join('\n')}\n\n// PROCESS\nprocess = (${processStrings.join(' + ')}) : fi.dcblocker : fi.lowpass(1, 20000);`;

		return graphString;
	}
}









function sample(array: any[]): any {
  return array[~~(Math.random() * array.length)];
}

class SynthContext {
  index: number;
  uiFrame: HTMLIFrameElement;

  mfccBars: HTMLDivElement[];

  topology!: SynthNode;
  processCode: string;
  userTopology!: AudioOutput;
  fullCode: string;
  webAudioNode!: FaustAudioWorkletNode;

  audioContext: AudioContext;
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

  constructor(index: number, context: AudioContext, topology?: SynthNode) {
    this.index = index;
    this.uiFrame = document.getElementById(`ui${index}`) as HTMLIFrameElement;

    this.paramCount = 0;
    this.envCount = 0;
    this.fmCount = 0;
    this.lpFilterCount = 0;
    this.fullCode = ""; // populated on compile

    this.audioContext = context;
    this.gainNode = new GainNode(context, {gain: 1});
    this.gainNode.connect(context.destination);

    this.analysingNow = false;
    this.mfccData = new Array(13).fill(0);

    const mfccCoefficientCount = 13;

    this.mfccBars = [];
    for (let i = 0; i < mfccCoefficientCount; i++) {
      this.mfccBars.push(document.getElementById(`bar-${index}-${i}`) as HTMLDivElement);
    }
    document.getElementById(`process-code-show-${index}`)?.addEventListener("click", this.showProcessCode.bind(this));
    document.getElementById(`full-code-show-${index}`)?.addEventListener("click", this.showFullCode.bind(this));

    if (topology !== undefined) {
      this.topology = topology;
    }
    else {
      this.generateSynth();
    }

    this.processCode = this.topology.getNodeStrings().processCode;

    this.params = {
      env_a: "",
      env_d: "",
      env_s: "",
      env_r: "",
      lp_freq: "",
      lp_q: ""
    }

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
    let rootNode = this.generate(rootNodeType);
  
    while (!rootNode.carriesSound || rootNode.graphSize > 50) {
      this.resetCounts();
      rootNode = this.generate(rootNodeType);
    }
  
    this.topology = rootNode;
  }

  mutateSynth() {
    this.resetCounts();
    this.topology = this.mutate(this.topology);
    this.addOutputInterface();
  }

  addOutputInterface() {
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

  async compile(faust: Faust) {
    const constructedCode = this.userTopology.getOutputString();

    this.fullCode = constructedCode;

    // Compile a new Web Audio node from faust code
    let node: FaustAudioWorkletNode;
    node = await faust.getNode(constructedCode, { audioCtx: this.audioContext, useWorklet: true, voices: 4, args: { "-I": "libraries/" } }) as FaustAudioWorkletNode;
    
    // Connect the node's output to Web Audio
    // @ts-ignore (connect does exist even though TypeScript says it doesn't)
    node.connect(this.gainNode);


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
  
    const meydaAnalyser = Meyda.createMeydaAnalyzer({
      "audioContext": this.audioContext,
      "source": node,
      "bufferSize": 512,
      "featureExtractors": "mfcc",
      "callback": this.mfccCallback.bind(this)
    });
    
    meydaAnalyser.start();
    
    this.webAudioNode = node;

    const parameters = this.webAudioNode.getParams();

    this.params = {
      env_a: parameters.filter(i => i.includes('MAIN_ENV_A'))[0],
      env_d: parameters.filter(i => i.includes('MAIN_ENV_D'))[0],
      env_s: parameters.filter(i => i.includes('MAIN_ENV_S'))[0],
      env_r: parameters.filter(i => i.includes('MAIN_ENV_R'))[0],
      lp_freq: parameters.filter(i => i.includes('MAIN_LP_FREQ'))[0],
      lp_q: parameters.filter(i => i.includes('MAIN_LP_Q'))[0]
    };
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

  showProcessCode() {
    (document.getElementById("code-box") as HTMLDivElement).innerText = this.processCode;
    (document.getElementById("code-overlay") as HTMLDivElement).style.display = "flex";
  }

  showFullCode() {
    (document.getElementById("code-box") as HTMLDivElement).innerText = this.fullCode;
    (document.getElementById("code-overlay") as HTMLDivElement).style.display = "flex";
  }

  startAnalysing() {
    for (let i of [this.params.env_a, this.params.env_d, this.params.env_r]) {
      this.webAudioNode.setParamValue(i, 0);
    }
    this.webAudioNode.setParamValue(this.params.env_s, 1);

    this.webAudioNode.setParamValue(this.params.lp_freq, 20000);
    this.webAudioNode.setParamValue(this.params.lp_q, 0.1);
    
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

    this.analysingNow = true;
  }

  stopAnalysing(): Promise<void> {
    // allow 20ms so that the envelope's re-enabled release doesn't let any sound through
    return new Promise((resolve) => {
      setTimeout(() => {
        this.webAudioNode.setParamValue(this.params.env_a, 0.01);
        this.webAudioNode.setParamValue(this.params.env_d, 0.3);
        this.webAudioNode.setParamValue(this.params.env_s, 0.8);
        this.webAudioNode.setParamValue(this.params.env_r, 0.01);
        this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
  
        this.analysingNow = false;
        
        resolve();
      }, 20);
    })
  }

  async measureMFCC(): Promise<number[][]> {
    this.startAnalysing();
    return new Promise(async (resolve) => {

      let results: number[][] = [];
      results.push(await this.measureNote(36));   // C2
      results.push(await this.measureNote(69));   // A4
      results.push(await this.measureNote(101));  // F7

      await this.stopAnalysing();
      
      resolve(results);
    });
  }

  async measureNote(midiNote: number): Promise<number[]> {

    this.webAudioNode.keyOn(0, midiNote, 127);

    // return a Promise that returns the MFCC data upon resolving
    return new Promise((resolve) => {
      let mfccData = Array(13);
      setTimeout(() => {
        mfccData = this.mfccData;
        this.webAudioNode.keyOff(0, midiNote, 127);
        resolve(mfccData);
      }, 4096*1000/this.audioContext.sampleRate);
    });
  }

  generate(type: new (...args: any[]) => BaseNode, ...nodeArgs: any[]): BaseNode {
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
    
        const possibleArgs = [Oscillator, Parameter, MathsNode, MIDIFreq];
        
        let choices = [];
    
        for (let i=0; i < numArguments; i++) {
          const choice = sample(possibleArgs);
          choices.push(choice);
          if (choice === MIDIFreq) {
            possibleArgs.pop();
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
            input = this.generate(choice);
            if (input.carriesSound) {
              carriesSound = true;
            }
          }
          else if (carriesSound) {
            input = this.generate(Parameter, Math.random());
          }
          else {
            input = this.generate(choice);
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
        frequencyNode = this.generate(frequencyNodeType);
      }
      
      return new Oscillator(waveform, frequencyNode);
    }
    else if (type === FrequencyModulator) {
      return new FrequencyModulator(undefined, undefined, this.generate(Oscillator));
    }
  
    throw new Error("You need to provide a valid node type to this.generate()!");
  }

  mutate(node: BaseNode): BaseNode {
    const REPLACE_CHANCE = 0.03;
    const MUTATE_CHANCE = 0.1;

    const replaceValue = () => {
      const possibleReplacements = [MathsNode, Parameter, MIDIFreq, FrequencyModulator];
      return this.generate(sample(possibleReplacements));
    }

    const replaceSynth = () => {
      const possibleReplacements = [MathsNode, Oscillator];
      return this.generate(sample(possibleReplacements));
    }

    if (node instanceof Parameter) {
      const randomValue = Math.random();

      if (randomValue < REPLACE_CHANCE) {
        return replaceValue();
      }
      else if (randomValue < MUTATE_CHANCE) {
        return this.generate(Parameter);
      }
      return this.generate(Parameter, node.defaultValue);
    }
    else if (node instanceof MIDIFreq) {
      const randomValue = Math.random();

      if (randomValue < REPLACE_CHANCE) {
        return replaceValue();
      }
      else if (randomValue < MUTATE_CHANCE) {
        return this.generate(MathsNode, "*", new Parameter(Math.random()*5, {min: 0, max: 5, step: 0.01}), this.generate(MIDIFreq));
      }
      return this.generate(MIDIFreq);
    }
    else if (node instanceof MathsNode) {
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
        return this.generate(MathsNode, undefined, ...node.inputs.map(this.mutate));
      }
      return this.generate(MathsNode, node.operation, ...node.inputs.map(this.mutate));
    }
    else if (node instanceof Oscillator) {
      const randomValue = Math.random();
      
      if (randomValue < REPLACE_CHANCE) {
        return replaceSynth();
      }
      else if (randomValue < MUTATE_CHANCE) {
        return this.generate(Oscillator, undefined, this.mutate(node.frequency));
      }
      return this.generate(Oscillator, node.waveform, this.mutate(node.frequency));
    }
    else if (node instanceof FrequencyModulator) {
      const randomValue = Math.random();

      if (randomValue < REPLACE_CHANCE) {
        return replaceValue();
      }
      return this.generate(FrequencyModulator, this.mutate(node.width), this.mutate(node.offset), this.mutate(node.input));
    }

    throw new Error("You need to provide a valid node to mutate()!");
  }
}

export {VGroup, MIDIGate, MIDIFreq, MIDIGain, Constant, Parameter, Envelope, MathsNode, Oscillator, FrequencyModulator, LPFilter, AudioOutput, SynthNode, BaseNode, SynthContext};
