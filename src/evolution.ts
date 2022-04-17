import { Faust } from "faust2webaudio";
import { SynthNode } from "./constructs";
import { exportObjectToCsvFile } from "./dataExport";
import { SynthContext } from "./synthContext";

// GLOBAL EVOLUTIONARY ALGORITHM PARAMETERS
const POPULATION_SIZE = 1;
const NUM_ROUNDS = 1;
const REPLACE_CHANCE = 0.07;
const MUTATE_CHANCE = 0.2;

const MAX_TOPOLOGY_SIZE = 20;

const runInfo = [`fitness`, `${POPULATION_SIZE}p`, `${NUM_ROUNDS}i`, `${MUTATE_CHANCE}m`, `${REPLACE_CHANCE}r`, `sine`, `newFitness`];

type FitnessType = {
  topology: SynthNode | undefined,
  score: number
};


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

function test(context: SynthContext, faust: Faust, mutate: boolean = true): Promise<number[][]> {
  return new Promise<number[][]>(async (resolve) => {
    if (mutate) context.mutateSynth();
    //context.generateSynth();
    //if (regen) context.setTopology(new MathsNode("*", new Oscillator("sine", new MIDIFreq()), new Parameter(0.1)));
    //if (regen) context.setTopology(new MathsNode("*", new Oscillator("saw", new FrequencyModulator(new Parameter(1), new Parameter(0), new Oscillator("square", new MIDIFreq()))), new Parameter()));
    await context.compile(faust);
    const measurement = await context.measureMFCC();
    context.cleanUp();
    resolve(measurement);
  });
}

class Evolver {
  progressBar: HTMLDivElement;
  best: FitnessType;
  bests: FitnessType[];
  audioContext: AudioContext;
  faust: Faust;
  testContext: SynthContext;
  evolvingContexts: SynthContext[];

  constructor(progressBar: HTMLDivElement, faust: Faust, audioContext: AudioContext) {
    this.progressBar = progressBar;
    this.faust = faust;
    this.audioContext = audioContext;

    this.best = {
      topology: undefined,
      score: 0
    };
    this.bests = [];
    this.testContext = new SynthContext(0, audioContext, undefined, true);
    this.evolvingContexts = new Array(POPULATION_SIZE).fill(0).map((_, i) => new SynthContext(i+1, this.audioContext, undefined, true));
  }

  async evolve(topology: SynthNode) {
    this.testContext.setTopology(topology);

    const target = await test(this.testContext, this.faust, false);
  
    this.evolvingContexts.forEach(context => context.generateSynth());
  
    let measurements: number[][][];
    let roundBest: FitnessType = {
      topology: undefined,
      score: 0
    };
  
    let averageFitnesses = [];
    let maxFitnesses = [];
    let minFitnesses = [];
  
    for (let i = 0; i < NUM_ROUNDS; i++) {
      this.progressBar.style.width = `${(i/NUM_ROUNDS)*100}%`;
  
      console.log(`Starting round ${i}`);
      measurements = await Promise.all(this.evolvingContexts.map(context => test(context, this.faust)));
      
      roundBest = {
        topology: undefined,
        score: 0
      };
  
      let fitnesses = [];
  
      for (let j = 0; j < POPULATION_SIZE; j++) {
        const measurement = measurements[j];
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
  
    exportObjectToCsvFile({"Min": minFitnesses, "Average": averageFitnesses, "Max": maxFitnesses}, ...runInfo);
  
    return this.bests;
  }
}

export { Evolver, REPLACE_CHANCE, MUTATE_CHANCE, MAX_TOPOLOGY_SIZE };