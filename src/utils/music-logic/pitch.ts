export type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';
export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = 'bb' | 'b' | '' | '#' | 'x';

export interface PitchNote {
  letter: NoteLetter;
  accidental: Accidental;
  octave: number;
}

export interface NamedNoteQuestion {
  clef: ClefType;
  note: PitchNote;
  choices: NoteLetter[];
  correct: NoteLetter;
}

export interface EnharmonicQuestion {
  clef: ClefType;
  source: PitchNote;
  choices: string[];
  correct: string;
}

export interface TranspositionAuditQuestion {
  clef: ClefType;
  modelKey: string;
  answerKey: string;
  wrongAnswerKey: string;
  model: PitchNote[];
  expected: PitchNote[];
  shown: PitchNote[];
  checks: Array<{ id: string; label: string; isCorrect: boolean }>;
  prompt: string;
}

export interface PitchComparisonQuestion {
  bars: Array<{ id: 'A' | 'B' | 'C'; clef: ClefType; notes: PitchNote[] }>;
  statements: Array<{ id: string; text: string; answer: boolean }>;
}

const NATURAL_TO_SEMITONE: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const ACCIDENTAL_TO_OFFSET: Record<Accidental, number> = {
  bb: -2,
  b: -1,
  '': 0,
  '#': 1,
  x: 2,
};

const CHROMATIC_SHARP: Array<[NoteLetter, Accidental]> = [
  ['C', ''], ['C', '#'], ['D', ''], ['D', '#'], ['E', ''], ['F', ''], ['F', '#'], ['G', ''], ['G', '#'], ['A', ''], ['A', '#'], ['B', ''],
];

const CHROMATIC_FLAT: Array<[NoteLetter, Accidental]> = [
  ['C', ''], ['D', 'b'], ['D', ''], ['E', 'b'], ['E', ''], ['F', ''], ['G', 'b'], ['G', ''], ['A', 'b'], ['A', ''], ['B', 'b'], ['B', ''],
];

const CLEF_POOL: ClefType[] = ['treble', 'bass', 'alto', 'tenor', 'alto', 'tenor'];
const LETTERS: NoteLetter[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class PitchLogic {
  static toMidi(note: PitchNote): number {
    const base = NATURAL_TO_SEMITONE[note.letter];
    const acc = ACCIDENTAL_TO_OFFSET[note.accidental];
    return (note.octave + 1) * 12 + base + acc;
  }

  static formatName(note: PitchNote): string {
    return `${note.letter}${note.accidental}`;
  }

  static toVexKey(note: PitchNote): string {
    const letter = note.letter.toLowerCase();
    return `${letter}/${note.octave}`;
  }

  static vexAccidental(note: PitchNote): string | null {
    if (!note.accidental) return null;
    if (note.accidental === 'x') return '##';
    return note.accidental;
  }

  static fromMidi(midi: number, preferFlats = false): PitchNote {
    const octave = Math.floor(midi / 12) - 1;
    const pc = ((midi % 12) + 12) % 12;
    const [letter, accidental] = (preferFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP)[pc];
    return { letter, accidental, octave };
  }

  static getEnharmonics(note: PitchNote): PitchNote[] {
    const midi = PitchLogic.toMidi(note);
    const candidates: PitchNote[] = [];

    LETTERS.forEach((letter) => {
      (['bb', 'b', '', '#', 'x'] as Accidental[]).forEach((accidental) => {
        for (let octave = note.octave - 1; octave <= note.octave + 1; octave += 1) {
          const test: PitchNote = { letter, accidental, octave };
          if (PitchLogic.toMidi(test) === midi && PitchLogic.formatName(test) !== PitchLogic.formatName(note)) {
            candidates.push(test);
          }
        }
      });
    });

    const unique = new Map<string, PitchNote>();
    candidates.forEach((c) => unique.set(PitchLogic.formatName(c), c));
    return [...unique.values()];
  }

  static transposePitch(note: PitchNote, semitones: number, preferFlats = false): PitchNote {
    const midi = PitchLogic.toMidi(note) + semitones;
    return PitchLogic.fromMidi(midi, preferFlats);
  }

  static transposeMelody(melody: PitchNote[], semitones: number, preferFlats = false): PitchNote[] {
    return melody.map((note) => PitchLogic.transposePitch(note, semitones, preferFlats));
  }
}

function randomNoteWithAccidental(minMidi = 52, maxMidi = 79): PitchNote {
  const midi = Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
  const preferFlats = Math.random() > 0.5;
  return PitchLogic.fromMidi(midi, preferFlats);
}

export function generateNamingQuestion2_1(): NamedNoteQuestion {
  const clef = randomItem(CLEF_POOL);
  const note = randomNoteWithAccidental(50, 78);
  return {
    clef,
    note,
    choices: LETTERS,
    correct: note.letter,
  };
}

export function generateEnharmonicQuestion2_2(): EnharmonicQuestion {
  const clef = randomItem(CLEF_POOL);
  const accidentals: Accidental[] = ['', '#', 'b', 'x', 'bb'];
  let source: PitchNote = {
    letter: randomItem(LETTERS),
    accidental: randomItem(accidentals),
    octave: randomItem([3, 4, 5]),
  };

  let enh = PitchLogic.getEnharmonics(source);
  let attempts = 0;
  while (enh.length < 2 && attempts < 20) {
    source = {
      letter: randomItem(LETTERS),
      accidental: randomItem(accidentals),
      octave: randomItem([3, 4, 5]),
    };
    enh = PitchLogic.getEnharmonics(source);
    attempts += 1;
  }

  const correct = randomItem(enh);
  const wrong = shuffle([
    PitchLogic.fromMidi(PitchLogic.toMidi(source) + 1),
    PitchLogic.fromMidi(PitchLogic.toMidi(source) - 1, true),
    source,
    ...enh.filter((e) => PitchLogic.formatName(e) !== PitchLogic.formatName(correct)),
  ])
    .filter((n, idx, arr) => arr.findIndex((x) => PitchLogic.formatName(x) === PitchLogic.formatName(n)) === idx)
    .slice(0, 2);

  const choices = shuffle([PitchLogic.formatName(correct), ...wrong.map(PitchLogic.formatName)]).slice(0, 3);

  return {
    clef,
    source,
    choices,
    correct: PitchLogic.formatName(correct),
  };
}

export function injectTranspositionErrors(expected: PitchNote[]): PitchNote[] {
  return expected.map((note, idx) => {
    if (Math.random() > 0.45) return note;

    if (idx % 2 === 0) {
      // pitch distance error: wrong transposition by +1 semitone
      return PitchLogic.transposePitch(note, 1);
    }

    // accidental spelling error: keep midi near but respell flat/sharp preference
    const midi = PitchLogic.toMidi(note);
    return PitchLogic.fromMidi(midi, note.accidental === '#');
  });
}

export function generateTranspositionQuestion2_3(): TranspositionAuditQuestion {
  const clef = randomItem(CLEF_POOL);
  const model = [randomNoteWithAccidental(57, 74), randomNoteWithAccidental(55, 72), randomNoteWithAccidental(59, 76), randomNoteWithAccidental(57, 74)];
  const semitones = -3; // down a minor 3rd
  const expected = PitchLogic.transposeMelody(model, semitones, true);
  const shown = injectTranspositionErrors(expected);

  const answerKey = 'f';
  const wrongAnswerKey = Math.random() > 0.5 ? 'g' : 'd';

  const checks = [
    { id: 'key', label: '調號', isCorrect: false },
    ...shown.map((note, idx) => ({
      id: `n-${idx}`,
      label: `音符 ${idx + 1}`,
      isCorrect: PitchLogic.toMidi(note) === PitchLogic.toMidi(expected[idx]),
    })),
  ];

  return {
    clef,
    modelKey: 'g',
    answerKey,
    wrongAnswerKey,
    model,
    expected,
    shown,
    checks,
    prompt: '上方為原調旋律，下方為下行小三度移調答案。請判斷調號與每個音符是否正確。',
  };
}

export function generatePitchComparisonQuestion2_4(): PitchComparisonQuestion {
  const baseMidi = randomItem([60, 62, 64, 65, 67]);
  const noteA = PitchLogic.fromMidi(baseMidi);
  const noteB = PitchLogic.fromMidi(baseMidi + randomItem([0, -12, 12]));
  const noteC = PitchLogic.fromMidi(baseMidi + randomItem([0, 12]));

  const bars: PitchComparisonQuestion['bars'] = [
    { id: 'A', clef: randomItem(['treble', 'alto']), notes: [noteA] },
    { id: 'B', clef: randomItem(['bass', 'tenor']), notes: [noteB] },
    { id: 'C', clef: randomItem(['alto', 'tenor', 'treble']), notes: [noteC] },
  ];

  const statements = [
    { id: 's1', text: 'A 和 B 的實際音高相同。', answer: PitchLogic.toMidi(noteA) === PitchLogic.toMidi(noteB) },
    { id: 's2', text: 'B 比 C 低一個八度。', answer: PitchLogic.toMidi(noteB) + 12 === PitchLogic.toMidi(noteC) },
    { id: 's3', text: 'C 比 A 高一個八度。', answer: PitchLogic.toMidi(noteC) === PitchLogic.toMidi(noteA) + 12 },
  ];

  return { bars, statements };
}
