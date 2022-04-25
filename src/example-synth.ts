import { AudioOutput, MathsNode, MIDIFreq, Oscillator, Parameter } from "./constructs";


const exampleTopology = new AudioOutput([new MathsNode(
    "+",
    new Oscillator(
        "saw",
        new Oscillator(
            "sine",
            new MIDIFreq()
        )
    ),
    new Oscillator(
        "triangle",
        new MathsNode(
            "*",
            new Parameter(0.5),
            new MIDIFreq()
        )
    )
)]);

(document.getElementById("faust-code-div") as HTMLDivElement).innerText = exampleTopology.getOutputString();