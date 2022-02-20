
type WaveformType = 'sine' | 'saw' | 'square' | 'triangle';

type NodeStringsType = {definitions: string[], processCode: string};
type MathsOperationType = '+' | '-' | '*' | '/';

type ParamRangeType = {min: number, max: number, step: number};

class BaseNode {
    getNodeStrings(): NodeStringsType {
        return {definitions: [], processCode: ''};
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
        return {definitions: [
            `midifreq = hslider("freq[unit:Hz]", 440, 20, 20000, 1);`,
            `bend = ba.semi2ratio(hslider("pitchBend[midi:pitchwheel]", 0, -2, 2, 0.01));`
        ], processCode: `vgroup("Frequency", midifreq*bend)`};
    }
}

class MIDIGain extends ValueNode {
    getNodeStrings(): NodeStringsType {
        return {definitions: [`midigain = hslider("gain", 0.5, 0, 1, 0.01);`], processCode: `midigain`};
    }
}

class Constant extends ValueNode {
    value: number;

    constructor(value: number) {
        super();

        this.value = value;
    }

    getNodeStrings(): NodeStringsType {
        return {definitions: [], processCode: `${this.value}`};
    }
}

let paramCount = 0;
class Parameter extends ValueNode {
    index: number;
    name: string;
    varName: string;
    defaultValue: number;
    range: ParamRangeType;

    constructor(defaultValue: number, range: ParamRangeType = {min: 0, max: 20000, step: 0.1}, name: undefined | string = undefined) {
        super();

        this.index = paramCount;
        paramCount += 1;
        if (name === undefined) {
            this.name = `parameter${this.index}`;
        }
        else {
            this.name = name;
        }

        this.varName = `p${this.index}`
        this.defaultValue = defaultValue;
        this.range = range;
    }

    getNodeStrings(): NodeStringsType {
        return {definitions: [`${this.varName} = hslider("${this.name} (CC${this.index})[midi:ctrl ${this.index}]", ${this.defaultValue}, ${this.range.min}, ${this.range.max}, ${this.range.step});`], processCode: this.varName};
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
            d = new Parameter(0.01, {min: 0, max: 10, step: 0.01}, `env${envCount}d`),
            s = new Parameter(0.8, {min: 0, max: 1, step: 0.01}, `env${envCount}s`),
            r = new Parameter(0.1, {min: 0, max: 10, step: 0.01}, `env${envCount}r`),
            gate = new MIDIGate()) {
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
    }

    getNodeStrings(): NodeStringsType {
        const inputStrings: NodeStringsType[] = this.inputs.map(input => input.getNodeStrings());
        let defs: string[] = [];
        inputStrings.map(strings => defs.push(...strings.definitions));

        const processCodes = inputStrings.map(strings => strings.processCode);

        return {definitions: defs, processCode: `${processCodes.join(this.operation)}`};
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
    }

    getNodeStrings(): NodeStringsType {
        const frequencyStrings = this.frequency.getNodeStrings();
        return {definitions: frequencyStrings.definitions, processCode: `${this.waveformMap[this.waveform]}(${frequencyStrings.processCode})`};
    }
}

class AudioOutput extends SynthNode {
    inputs: SynthNode[];

    constructor(inputs: SynthNode[]) {
        super();
        this.inputs = inputs;
    }
    
    getOutputString(): string {
        const inputStrings: NodeStringsType[] = this.inputs.map((input) => input.getNodeStrings());

        let topStrings: string[] = [];
        
        inputStrings.map((nodeStrings) => topStrings.push(...nodeStrings.definitions));

        let processStrings = inputStrings.map(nodeStrings => nodeStrings.processCode);

        const graphString = `import("stdfaust.lib");

// DEFINITIONS
${topStrings.join('\n')}

// PROCESS
process = ${processStrings.join(' + ')};
`;

        return graphString;
    }
}

export {MIDIGate, MIDIFreq, MIDIGain, Constant, Parameter, Envelope, MathsNode, Oscillator, AudioOutput};