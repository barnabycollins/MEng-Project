
import * as c from "./constructs";
function sample(array: any[]): any {
  return array[~~(Math.random() * array.length)];

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
    const possibleReplacements = [c.MathsNode, c.Oscillator];
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

export {generate, generate_graph, mutate, add_user_interface, fitness};
