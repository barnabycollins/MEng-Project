import("stdfaust.lib");

// DEFINITIONS
midifreq = hslider("freq[unit:Hz]", 440, 20, 20000, 1);
bend = ba.semi2ratio(hslider("pitchBend[midi:pitchwheel]", 0, -2, 2, 0.01));
frequency = vgroup("Frequency", midifreq*bend);
p10 = hslider("[10]MAIN_ENV_A (CC10)[midi:ctrl 10][scale:linear]", 0.01, 0, 10, 0.01) : si.smoo;
p11 = hslider("[11]MAIN_ENV_D (CC11)[midi:ctrl 11][scale:linear]", 0.3, 0, 10, 0.01) : si.smoo;
p12 = hslider("[12]MAIN_ENV_S (CC12)[midi:ctrl 12][scale:linear]", 0.8, 0, 1, 0.01) : si.smoo;
p13 = hslider("[13]MAIN_ENV_R (CC13)[midi:ctrl 13][scale:linear]", 0.01, 0, 10, 0.01) : si.smoo;
midigate = button("gate");
midigain = hslider("gain", 0.5, 0, 1, 0.01);
p14 = hslider("[14]MAIN_LP_FREQ (CC14)[midi:ctrl 14][scale:log]", 20000, 20, 20000, 1) : si.smoo;
p15 = hslider("[15]MAIN_LP_Q (CC15)[midi:ctrl 15][scale:log]", 0.5, 0.1, 30, 0.1) : si.smoo;

// PROCESS
process = (((vgroup("env0", en.adsr(p10, p11, p12, p13, midigate))*midigain*os.triangle(19980*(frequency-20)/19980+20)) : vgroup("Low Pass Filter", fi.resonlp(p14, p15, 1)))) : fi.dcblocker : fi.lowpass(1, 20000);