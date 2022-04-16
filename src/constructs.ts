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







export {VGroup, MIDIGate, MIDIFreq, MIDIGain, Constant, Parameter, Envelope, MathsNode, Oscillator, FrequencyModulator, LPFilter, AudioOutput, SynthNode, BaseNode};
