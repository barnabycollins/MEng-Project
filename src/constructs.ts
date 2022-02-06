
type WaveformType = 'sine' | 'saw' | 'square' | 'triangle';

type NodeStringsType = [string[], string];
type MathsOperationType = '+' | '-' | '*' | '/';

class BaseNode {
    getNodeStrings(): NodeStringsType {
        return [[], 'Base Class!'];
    }
}

class ValueNode extends BaseNode {
    constructor() {
        super();
    }
}

class MIDIGate extends ValueNode {
    getNodeStrings(): NodeStringsType {
        return [[`midigate = button("gate");`], `midigate`];
    }
}

class MIDIFreq extends ValueNode {
    getNodeStrings(): NodeStringsType {
        return [[`midifreq = nentry("freq[unit:Hz]", 440, 20, 20000, 1);`], `midifreq`];
    }
}

class MIDIGain extends ValueNode {
    getNodeStrings(): NodeStringsType {
        return [[`midigain = nentry("gain", 0.5, 0, 0.5, 0.01);`], `midigain`];
    }
}

class MathsNode extends ValueNode {
    operation: MathsOperationType;
    inputL: ValueNode | SynthNode;
    inputR: ValueNode | SynthNode;

    constructor(operation: MathsOperationType, inputL: ValueNode | SynthNode, inputR: ValueNode | SynthNode) {
        super();
        this.operation = operation;
        this.inputL = inputL;
        this.inputR = inputR;
    }

    getNodeStrings(): NodeStringsType {
        const [inputLTop, inputLValue] = this.inputL.getNodeStrings();
        const [inputRTop, inputRValue] = this.inputR.getNodeStrings();

        return [[...inputLTop, ...inputRTop], `${inputLValue}${this.operation}${inputRValue}`];
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
        const [freqTop, freqValue] = this.frequency.getNodeStrings();
        return [freqTop, `${this.waveformMap[this.waveform]}(${freqValue})`];
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
        
        inputStrings.map((nodeStrings) => topStrings.push(...nodeStrings[0]));

        let processStrings = inputStrings.map(nodeStrings => nodeStrings[1]);

        const graphString = `import("stdfaust.lib");
// TOP STATEMENTS
${topStrings.join('\n')}

// PROCESS
process = ${processStrings.join(' + ')};
`;

        return graphString;
    }
}

export {MIDIGate, MIDIFreq, MIDIGain, MathsNode, Oscillator, AudioOutput};
