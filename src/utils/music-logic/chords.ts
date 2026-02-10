export type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';
export type Inversion = 'a' | 'b' | 'c';
export type Roman = 'I' | 'II' | 'IV' | 'V';
export type CadenceType = 'perfect' | 'plagal' | 'imperfect';

export interface ChordBuildInput {
  key: string; // e.g. C minor
  degree: Roman;
  inversion: Inversion;
}

export interface ChordTone {
  name: string;
  midi: number;
}

export interface CadenceSelectorQuestion {
  key: string;
  melody1: ChordTone[];
  melody2: ChordTone[];
  boxes: Array<{ id: string; answer: Roman }>;
}

export interface CadenceTypeQuestion {
  key: string;
  cadenceType: CadenceType;
  leftChordTreble: ChordTone[];
  leftChordBass: ChordTone[];
  rightChordTreble: ChordTone[];
  rightChordBass: ChordTone[];
  choices: CadenceType[];
}

export interface ChordAnalysisQuestion {
  key: string;
  trebleTexture: ChordTone[];
  bassTexture: ChordTone[];
  labels: Array<{ id: 'A' | 'B' | 'C'; index: number; answer: string; choices: string[] }>;
}

const NOTE_PC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const DEGREE_INDEX: Record<Roman, number> = { I: 0, II: 1, IV: 3, V: 4 };

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function parseKey(key: string): { tonic: string; isMinor: boolean } {
  const [tonic, mode] = key.split(' ');
  return { tonic, isMinor: mode?.toLowerCase() === 'minor' };
}

function nameToMidi(name: string, octave: number): number {
  const m = name.match(/^([A-G])(b|#)?$/);
  if (!m) return 60;
  const base = NOTE_PC[m[1]];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return (octave + 1) * 12 + base + acc;
}

function midiToName(midi: number, preferFlats = false): string {
  const pc = ((midi % 12) + 12) % 12;
  return (preferFlats ? FLAT_NAMES : SHARP_NAMES)[pc];
}

function buildScale(key: string): string[] {
  const { tonic, isMinor } = parseKey(key);
  const root = nameToMidi(tonic, 4);
  const steps = isMinor ? [0, 2, 3, 5, 7, 8, 11] : [0, 2, 4, 5, 7, 9, 11];
  const preferFlats = tonic.includes('b');
  return steps.map((s) => midiToName(root + s, preferFlats));
}

export class ChordEngine {
  static buildTriad(input: ChordBuildInput): ChordTone[] {
    const { key, degree, inversion } = input;
    const { tonic, isMinor } = parseKey(key);
    const scale = buildScale(key);
    const d = DEGREE_INDEX[degree];

    // in minor: V chord must include raised leading note (harmonic minor)
    if (isMinor && degree === 'V') {
      const leadPc = (nameToMidi(tonic, 4) + 11) % 12;
      scale[6] = midiToName(leadPc + 60, tonic.includes('b'));
    }

    const root = scale[d % 7];
    const third = scale[(d + 2) % 7];
    const fifth = scale[(d + 4) % 7];

    const rootMidi = nameToMidi(root, 4);
    const thirdMidi = nameToMidi(third, 4);
    const fifthMidi = nameToMidi(fifth, 4);

    let tones: ChordTone[] = [
      { name: root, midi: rootMidi },
      { name: third, midi: thirdMidi },
      { name: fifth, midi: fifthMidi },
    ];

    // inversion a=root, b=first inversion, c=second inversion
    if (inversion === 'b') {
      tones = [tones[1], tones[2], { ...tones[0], midi: tones[0].midi + 12 }];
    }
    if (inversion === 'c') {
      tones = [tones[2], { ...tones[0], midi: tones[0].midi + 12 }, { ...tones[1], midi: tones[1].midi + 12 }];
    }

    return tones;
  }

  static cadenceProgression(type: CadenceType): [Roman, Roman] {
    if (type === 'perfect') return ['V', 'I'];
    if (type === 'plagal') return ['IV', 'I'];
    return randomItem([
      ['I', 'V'],
      ['II', 'V'],
      ['IV', 'V'],
    ] as const);
  }
}

export function generateCadenceSelector5_1(): CadenceSelectorQuestion {
  const key = randomItem(['G major', 'D major', 'F major', 'C minor']);
  const melody1 = [
    { name: 'D', midi: 62 }, { name: 'E', midi: 64 }, { name: 'F#', midi: 66 }, { name: 'G', midi: 67 },
    { name: 'A', midi: 69 }, { name: 'B', midi: 71 }, { name: 'A', midi: 69 }, { name: 'G', midi: 67 },
  ];
  const melody2 = [
    { name: 'G', midi: 67 }, { name: 'A', midi: 69 }, { name: 'B', midi: 71 }, { name: 'A', midi: 69 },
    { name: 'G', midi: 67 }, { name: 'F#', midi: 66 }, { name: 'E', midi: 64 }, { name: 'D', midi: 62 },
  ];

  const patterns: Roman[] = ['I', 'II', 'IV', 'V'];
  const boxes = Array.from({ length: 5 }, (_, i) => ({ id: `box-${i + 1}`, answer: randomItem(patterns) }));
  // cadence hints at end
  boxes[3].answer = 'V';
  boxes[4].answer = 'I';

  return { key, melody1, melody2, boxes };
}

export function generateCadenceType5_2(): CadenceTypeQuestion {
  const key = randomItem(['D major', 'F major', 'A minor', 'C major']);
  const cadenceType = randomItem(['perfect', 'plagal', 'imperfect'] as const);
  const [d1, d2] = ChordEngine.cadenceProgression(cadenceType);

  const c1 = ChordEngine.buildTriad({ key, degree: d1, inversion: 'a' });
  const c2 = ChordEngine.buildTriad({ key, degree: d2, inversion: randomItem(['a', 'b'] as const) });

  return {
    key,
    cadenceType,
    leftChordTreble: [c1[1], c1[2]],
    leftChordBass: [c1[0]],
    rightChordTreble: [c2[1], c2[2]],
    rightChordBass: [c2[0]],
    choices: ['imperfect', 'plagal', 'perfect'],
  };
}

export function generateChordAnalysis5_3(): ChordAnalysisQuestion {
  const key = randomItem(['C minor', 'G major', 'D minor']);

  const prog: Array<{ roman: Roman; inv: Inversion; label?: 'A' | 'B' | 'C' }> = [
    { roman: 'I', inv: 'a' },
    { roman: 'V', inv: 'a', label: 'A' },
    { roman: 'IV', inv: 'b', label: 'B' },
    { roman: 'V', inv: 'b', label: 'C' },
    { roman: 'I', inv: 'a' },
  ];

  const trebleTexture: ChordTone[] = [];
  const bassTexture: ChordTone[] = [];
  const labels: ChordAnalysisQuestion['labels'] = [];

  prog.forEach((p, idx) => {
    const chord = ChordEngine.buildTriad({ key, degree: p.roman, inversion: p.inv });
    bassTexture.push(chord[0]);
    trebleTexture.push(chord[1], chord[2]);

    if (p.label) {
      const answer = `${p.roman}${p.inv}`;
      const pool = shuffle(['Va', 'Vb', 'Vc', 'Ia', 'Ib', 'Ic', 'IVa', 'IVb', 'IVc', 'IIa', 'IIb']);
      const choices = shuffle([answer, ...pool.filter((x) => x !== answer).slice(0, 3)]);
      labels.push({ id: p.label, index: idx, answer, choices });
    }
  });

  return { key, trebleTexture, bassTexture, labels };
}
