import { Faust } from "faust2webaudio";
import { BaseNode, Constant, FrequencyModulator, MathsNode, MIDIFreq, Oscillator, Parameter, SynthNode } from "./constructs";
import { exportObjectToCsvFile } from "./dataExport";
import { SynthContext } from "./synthContext";

// GLOBAL EVOLUTIONARY ALGORITHM PARAMETERS
const POPULATION_SIZE = 8;
const NUM_ROUNDS = 51;
const REPLACE_CHANCE = 0.1;
const MUTATE_CHANCE = 0.3;

const MAX_TOPOLOGY_SIZE = 30;

const runInfo = [`${POPULATION_SIZE}p`, `${NUM_ROUNDS}i`, `${MUTATE_CHANCE}m`, `${REPLACE_CHANCE}r`, `nontrivial`];

type UnresolvedFitnessType = {
  topology: SynthNode | undefined,
  score: number
};

type ResolvedFitnessType = {
  topology: SynthNode,
  score: number
}

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

function sample(array: any[]): any {
  return array[~~(Math.random() * array.length)];
}

function setUpContext(context: SynthContext, faust: Faust, mutate: boolean = true): Promise<void> {
  return new Promise<void>(async (resolve) => {
    if (mutate) context.mutateSynth();
    //context.generateSynth();
    //if (regen) context.setTopology(new MathsNode("*", new Oscillator("sine", new MIDIFreq()), new Parameter(0.1)));
    //if (regen) context.setTopology(new MathsNode("*", new Oscillator("saw", new FrequencyModulator(new Parameter(1), new Parameter(0), new Oscillator("square", new MIDIFreq()))), new Parameter()));
    await context.compile(faust);
    resolve();
  });
}

async function measure(context: SynthContext) {
  const measurement = await context.measureMFCC();
  context.cleanUp();
  return measurement;
}

class Evolver {
  progressBar: HTMLDivElement;
  best: UnresolvedFitnessType;
  bests: UnresolvedFitnessType[];
  audioContext: AudioContext;
  faust: Faust;
  testContext: SynthContext;
  evolvingContexts: SynthContext[];

  constructor(progressBar: HTMLDivElement, faust: Faust, audioContext: AudioContext, hearEvolution: boolean, minContextNumber: number) {
    this.progressBar = progressBar;
    this.faust = faust;
    this.audioContext = audioContext;

    this.best = {
      topology: undefined,
      score: 0
    };
    this.bests = [];
    this.testContext = new SynthContext(minContextNumber, audioContext, undefined, true, hearEvolution);
    this.evolvingContexts = new Array(POPULATION_SIZE).fill(0).map((_, i) => new SynthContext(minContextNumber+i+1, this.audioContext, undefined, true, hearEvolution));
  }

  async evolve(topology: SynthNode) {
    this.testContext.setTopology(topology);

    await setUpContext(this.testContext, this.faust, false);
    const target = await measure(this.testContext);
  
    this.evolvingContexts.forEach(context => context.generateSynth());
  
    let roundBest: UnresolvedFitnessType = {
      topology: undefined,
      score: 0
    };
  
    let averageFitnesses = [];
    let maxFitnesses = [];
    let minFitnesses = [];
  
    for (let i = 0; i < NUM_ROUNDS; i++) {
      this.progressBar.style.width = `${(i/NUM_ROUNDS)*100}%`;
  
      console.log(`Starting round ${i}`);
      await Promise.all(this.evolvingContexts.map(context => setUpContext(context, this.faust)));

      roundBest = {
        topology: undefined,
        score: 0
      };
  
      let fitnesses = [];
  
      for (let j = 0; j < POPULATION_SIZE; j++) {
        const measurement = await measure(this.evolvingContexts[j]);
        const currentFitness = fitness(target, measurement);
        fitnesses.push(currentFitness);
  
        if (currentFitness > roundBest.score) {
          roundBest = {
            topology: this.evolvingContexts[j].topology,
            score: currentFitness
          };
  
          if (currentFitness > this.best.score) {
            this.best = {
              topology: this.evolvingContexts[j].topology,
              score: currentFitness
            };
  
            this.bests = [this.best, ...this.bests];
            console.log(`NEW BEST: ${currentFitness}`);
          }
        }
      }
      averageFitnesses.push(fitnesses.reduce((a, b) => a + b, 0)/POPULATION_SIZE);
      maxFitnesses.push(Math.max(...fitnesses));
      minFitnesses.push(Math.min(...fitnesses));
      this.evolvingContexts.forEach(context => context.setTopology((roundBest.topology as SynthNode)));
    }
  
    exportObjectToCsvFile({"Min": minFitnesses, "Average": averageFitnesses, "Max": maxFitnesses}, `fitness`, ...runInfo);
  
    return (this.bests as ResolvedFitnessType[]);
  }
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
      const numArguments = sample([2, 2, 2, 2, 2, 3, 3]);
  
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
    else if (randomValue < MUTATE_CHANCE) {
      return generate(MathsNode, "+",
      generate(MathsNode, "*",
        generate(Parameter, node.width.defaultValue),
        generate(Oscillator)
      ),
      generate(Parameter, node.offset.defaultValue)
      );
    }
    return generate(FrequencyModulator, mutate(node.width), mutate(node.offset), mutate(node.input));
  }

  throw new Error("You need to provide a valid node to mutate()!");
}

export { Evolver, POPULATION_SIZE, NUM_ROUNDS, REPLACE_CHANCE, MUTATE_CHANCE, MAX_TOPOLOGY_SIZE, mutate, generate, sample };