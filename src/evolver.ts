import { Faust } from "faust2webaudio";
import { SynthNode } from "./constructs";
import { exportObjectToCsvFile } from "./export";
import { fitness } from "./genetic";
import { SynthContext } from "./synthContext";

type FitnessType = {
  topology: SynthNode | undefined,
  score: number
};

function test(context: SynthContext, faust: Faust): Promise<number[][]> {
  return new Promise<number[][]>(async (resolve) => {
    context.mutateSynth();
    //context.generateSynth();
    await context.compile(faust);
    const measurement = await context.measureMFCC();
    context.cleanUp();
    resolve(measurement);
  });
}

class Evolver {
  populationSize: number;
  numRounds: number;
  progressBar: HTMLDivElement;
  best: FitnessType;
  bests: FitnessType[];
  audioContext: AudioContext;
  faust: Faust;

  constructor(populationSize: number, numRounds: number, progressBar: HTMLDivElement, faust: Faust, audioContext: AudioContext) {
    this.populationSize = populationSize;
    this.numRounds = numRounds;
    this.progressBar = progressBar;
    this.faust = faust;
    this.audioContext = audioContext;

    this.best = {
      topology: undefined,
      score: 0
    };
    this.bests = [];
  }

  async evolve(target: number[][]) {
  
    let evolvingContexts: SynthContext[] = [];
    for (let i = 0; i < this.populationSize; i++) {
      evolvingContexts.push(new SynthContext(i, this.audioContext, undefined, true));
    }
  
    let measurements: number[][][];
    let roundBest: FitnessType = {
      topology: undefined,
      score: 0
    };
  
    let averageFitnesses = [];
    let maxFitnesses = [];
    let minFitnesses = [];
  
    for (let i = 0; i < this.numRounds; i++) {
      this.progressBar.style.width = `${(i/this.numRounds)*100}%`;
  
      console.log(`Starting round ${i}`);
      measurements = await Promise.all(evolvingContexts.map(context => test(context, this.faust)));
      
      roundBest = {
        topology: undefined,
        score: 0
      };
  
      let fitnesses = [];
  
      for (let j = 0; j < this.populationSize; j++) {
        const measurement = measurements[j];
        const currentFitness = fitness(target, measurement);
        fitnesses.push(currentFitness);
  
        if (currentFitness > roundBest.score) {
          roundBest = {
            topology: evolvingContexts[j].topology,
            score: currentFitness
          };
  
          if (currentFitness > this.best.score) {
            this.best = {
              topology: evolvingContexts[j].topology,
              score: currentFitness
            };
  
            this.bests = [this.best, ...this.bests];
            console.log(`NEW BEST: ${currentFitness}`);
          }
        }
      }
      averageFitnesses.push(fitnesses.reduce((a, b) => a + b, 0)/this.populationSize);
      maxFitnesses.push(Math.max(...fitnesses));
      minFitnesses.push(Math.min(...fitnesses));
      evolvingContexts.forEach(context => context.setTopology((roundBest.topology as SynthNode)));
      this.progressBar.style.width = "100%";
    }
  
    exportObjectToCsvFile({"Min": minFitnesses, "Average": averageFitnesses, "Max": maxFitnesses}, `fitness${this.populationSize}p${this.numRounds}i`);
  
    return this.bests;
  }
}

export { Evolver };