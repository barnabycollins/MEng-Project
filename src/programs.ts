
export const code = `
import("stdfaust.lib");
process = ba.pulsen(1, 10000) : pm.djembe(60, 0.3, 0.4, 1) <: dm.freeverb_demo;
`;

export const polycode = `
import("stdfaust.lib");
process = ba.pulsen(1, 10000) : pm.djembe(ba.hz2midikey(freq), 0.3, 0.4, 1) * gate * gain with {
  freq = hslider("freq", 440, 40, 8000, 1);
  gain = hslider("gain", 0.5, 0, 1, 0.01);
  gate = button("gate");
};
effect = dm.freeverb_demo;
`;

export const midicode = `
declare name "ClarinetMIDI";
declare description "Simple MIDI-controllable clarinet physical model with physical parameters.";
declare license "MIT";
declare copyright "(c)Romain Michon, CCRMA (Stanford University), GRAME";

import("stdfaust.lib");

process = pm.clarinet_ui_MIDI <: _,_;
`;
