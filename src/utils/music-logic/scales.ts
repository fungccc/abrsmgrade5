export type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';
export type ScaleType = 'major' | 'harmonicMinor' | 'melodicMinor';

export interface ScaleNote {
  name: string;
  midi: number;
}

export interface KeySignatureOption {
  id: string;
  key: string;
  clef: ClefType;
  isCorrect: boolean;
  distractorType?: 'wrongOrder' | 'wrongClef' | 'wrongAccidental';
}

export interface KeySignatureQuestion {
  promptKey: string;
  promptLabel: string;
  clef: ClefType;
  options: KeySignatureOption[];
  correctOptionId: string;
}

export interface ChromaticAuditQuestion {
  clef: ClefType;
  tonic: string;
  ascending: boolean;
  shown: ScaleNote[];
  isCorrect: boolean;
  explanation: string;
}

export interface ScaleCompletionQuestion {
  tonic: string;
  scaleType: ScaleType;
  clef: ClefType;
  notes: Array<ScaleNote | null>;
  missingIndexes: [number, number];
  optionsX: string[];
  optionsY: string[];
  answerX: string;
  answerY: string;
}

export interface ClefIdentificationQuestion {
  targetMinor: string;
  notes: ScaleNote[];
  options: ClefType[];
  correctClef: ClefType;
}

export interface KeyAnalysisQuestion {
  clef: ClefType;
  melody: ScaleNote[];
  options: string[];
  correctKey: string;
}

export interface TechnicalNamesQuestion {
  clef: ClefType;
  keyName: string;
  degreeName: string;
  shownNote: ScaleNote;
  statement: string;
  isTrue: boolean;
}

const LETTER_TO_PC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const ACC_TO_OFFSET: Record<string, number> = { bb: -2, b: -1, '': 0, '#': 1, x: 2 };
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Bb', 'Eb', 'Ab'];
const MINOR_KEYS = ['A', 'E', 'B', 'F#', 'C#', 'D', 'G', 'C', 'F', 'Bb', 'Eb'];

const KEY_SIGS: Record<string, number> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  'F#': 6,
  'C#': 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
  A: 0,
  E: 1,
  B: 2,
  'F#m': 3,
  'C#m': 4,
  'G#m': 5,
  'D#m': 6,
  'A#m': 7,
  D: -1,
  G: -2,
  C: -3,
  F: -4,
  Bb: -5,
  Eb: -6,
  Ab: -7,
};

export const DEGREE_MAPPER: Record<string, number> = {
  tonic: 1,
  supertonic: 2,
  mediant: 3,
  subdominant: 4,
  dominant: 5,
  submediant: 6,
  'leading note': 7,
  leading: 7,
};

export const KEY_SIGNATURE_POSITIONS: Record<ClefType, { sharps: number[]; flats: number[] }> = {
  treble: { sharps: [5, 3.5, 5.5, 4, 6, 4.5, 6.5], flats: [3, 4.5, 2.5, 4, 2, 3.5, 1.5] },
  bass: { sharps: [4, 2.5, 4.5, 3, 5, 3.5, 5.5], flats: [2, 3.5, 1.5, 3, 1, 2.5, 0.5] },
  alto: { sharps: [4.5, 3, 5, 3.5, 5.5, 4, 6], flats: [2.5, 4, 2, 3.5, 1.5, 3, 1] },
  tenor: { sharps: [4, 2.5, 4.5, 3, 5, 3.5, 5.5], flats: [2, 3.5, 1.5, 3, 1, 2.5, 0.5] },
};

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

function parseName(note: string): { letter: string; accidental: string } {
  const m = note.match(/^([A-G])(bb|b|#|x)?$/);
  if (!m) return { letter: 'C', accidental: '' };
  return { letter: m[1], accidental: m[2] ?? '' };
}

function noteToMidi(name: string, octave = 4): number {
  const { letter, accidental } = parseName(name);
  return (octave + 1) * 12 + LETTER_TO_PC[letter] + (ACC_TO_OFFSET[accidental] ?? 0);
}

function midiToName(midi: number, preferFlats = false): string {
  const pc = ((midi % 12) + 12) % 12;
  return (preferFlats ? FLAT_NOTES : SHARP_NOTES)[pc];
}

export class ScaleEngine {
  static getScale(tonic: string, type: ScaleType, octave = 4): ScaleNote[] {
    const rootMidi = noteToMidi(tonic, octave);
    const intervals =
      type === 'major'
        ? [0, 2, 4, 5, 7, 9, 11, 12]
        : type === 'harmonicMinor'
          ? [0, 2, 3, 5, 7, 8, 11, 12]
          : [0, 2, 3, 5, 7, 9, 11, 12];

    return intervals.map((step) => {
      const midi = rootMidi + step;
      return { midi, name: midiToName(midi, tonic.includes('b')) };
    });
  }

  static getMelodicMinorDescending(tonic: string, octave = 5): ScaleNote[] {
    const root = noteToMidi(tonic, octave);
    const desc = [12, 10, 8, 7, 5, 3, 2, 0];
    return desc.map((d) => {
      const midi = root + d;
      return { midi, name: midiToName(midi, tonic.includes('b')) };
    });
  }

  static getDegreeNameToNumber(term: string): number {
    return DEGREE_MAPPER[term.toLowerCase()] ?? 1;
  }

  static getDegreeNote(keyTonic: string, type: ScaleType, degree: number): ScaleNote {
    const scale = ScaleEngine.getScale(keyTonic, type);
    return scale[Math.max(0, Math.min(7, degree - 1))];
  }
}

export function generateKeySignatureQuiz(): KeySignatureQuestion {
  const major = Math.random() > 0.4;
  const tonic = major ? randomItem(MAJOR_KEYS) : randomItem(MINOR_KEYS);
  const promptKey = major ? tonic : `${tonic}m`;
  const promptLabel = `${tonic} ${major ? 'Major' : 'minor'}`;
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);

  const correct: KeySignatureOption = { id: 'correct', key: promptKey, clef, isCorrect: true };
  const wrongOrder: KeySignatureOption = {
    id: 'wrong-order',
    key: Math.abs((KEY_SIGS[promptKey] ?? 0)) > 0 ? (KEY_SIGS[promptKey] ?? 0) > 0 ? `${randomItem(['D', 'A', 'E'])}` : `${randomItem(['Bb', 'Eb', 'Ab'])}` : 'G',
    clef,
    isCorrect: false,
    distractorType: 'wrongOrder',
  };
  const wrongClef: KeySignatureOption = { id: 'wrong-clef', key: promptKey, clef: randomItem(['treble', 'bass', 'alto', 'tenor'] as const), isCorrect: false, distractorType: 'wrongClef' };
  const wrongAcc: KeySignatureOption = {
    id: 'wrong-acc',
    key: (KEY_SIGS[promptKey] ?? 0) >= 0 ? randomItem(['F', 'Bb', 'Eb']) : randomItem(['D', 'A', 'E']),
    clef,
    isCorrect: false,
    distractorType: 'wrongAccidental',
  };

  const options = shuffle([correct, wrongOrder, wrongClef, wrongAcc]).map((o, i) => ({ ...o, id: `opt-${i}` }));
  return { promptKey, promptLabel, clef, options, correctOptionId: options.find((o) => o.isCorrect)?.id ?? 'opt-0' };
}

export function generateChromaticScaleAudit(): ChromaticAuditQuestion {
  const tonic = randomItem(['C', 'Eb', 'F', 'G'] as const);
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const ascending = Math.random() > 0.5;
  const start = noteToMidi(tonic, clef === 'bass' ? 2 : 4);
  const useCorrect = Math.random() > 0.5;

  const steps = Array.from({ length: 8 }, (_, i) => i);
  const shown = steps.map((i) => {
    const midi = ascending ? start + i : start + (7 - i);
    const preferFlats = ascending ? !useCorrect : useCorrect;
    return { midi, name: midiToName(midi, preferFlats) };
  });

  return {
    clef,
    tonic,
    ascending,
    shown,
    isCorrect: useCorrect,
    explanation: '本系統以 ABRSM 基礎規則：上行多用升記號、下行多用降記號來判斷。',
  };
}

export function generateScaleCompletion(): ScaleCompletionQuestion {
  const tonic = randomItem(['B', 'C#', 'Eb', 'F#', 'G'] as const);
  const scaleType = randomItem(['harmonicMinor', 'melodicMinor'] as const);
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const asc = ScaleEngine.getScale(tonic, scaleType, clef === 'bass' ? 2 : 4);
  const notes = [...asc] as Array<ScaleNote | null>;

  const missingIndexes: [number, number] = [2, 6];
  const answerX = notes[missingIndexes[0]]?.name ?? 'C';
  const answerY = notes[missingIndexes[1]]?.name ?? 'D';
  notes[missingIndexes[0]] = null;
  notes[missingIndexes[1]] = null;

  const optionsX = shuffle([answerX, midiToName(noteToMidi(answerX) + 1), midiToName(noteToMidi(answerX) - 1, true), randomItem(['A#', 'Bb', 'E'])]).slice(0, 4);
  const optionsY = shuffle([answerY, midiToName(noteToMidi(answerY) + 1), midiToName(noteToMidi(answerY) - 1, true), randomItem(['F#', 'Gb', 'C'])]).slice(0, 4);

  return { tonic, scaleType, clef, notes, missingIndexes, optionsX, optionsY, answerX, answerY };
}

export function generateClefIdentification(): ClefIdentificationQuestion {
  const targetMinor = randomItem(['A minor', 'E minor', 'F# minor', 'C minor'] as const);
  const root = targetMinor.split(' ')[0];
  const notes = ScaleEngine.getScale(root, 'harmonicMinor', 3).slice(0, 8);
  const options: ClefType[] = ['treble', 'bass', 'alto', 'tenor'];
  const correctClef = randomItem(options);
  return { targetMinor, notes, options, correctClef };
}

export function generateKeyAnalysis(): KeyAnalysisQuestion {
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const pair = randomItem([
    { correct: 'G minor', alt: 'Bb major', characteristic: 'F#' },
    { correct: 'D minor', alt: 'F major', characteristic: 'C#' },
    { correct: 'E major', alt: 'C# minor', characteristic: 'D#' },
  ] as const);

  const tonic = pair.correct.split(' ')[0];
  const melody = ScaleEngine.getScale(tonic, pair.correct.includes('minor') ? 'harmonicMinor' : 'major', clef === 'bass' ? 2 : 4).slice(0, 6);
  melody[2] = { name: pair.characteristic, midi: noteToMidi(pair.characteristic, clef === 'bass' ? 2 : 4) };

  const options = shuffle([pair.correct, pair.alt, randomItem(['A major', 'B minor', 'F# major']), randomItem(['E minor', 'C major', 'D major'])]).slice(0, 4);
  return { clef, melody, options, correctKey: pair.correct };
}

export function generateTechnicalNames(): TechnicalNamesQuestion {
  const degreeNames = ['Subdominant', 'Leading note', 'Submediant', 'Dominant'] as const;
  const keyName = randomItem(['B major', 'A minor', 'F# minor', 'Eb major'] as const);
  const degreeName = randomItem(degreeNames);
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);

  const tonic = keyName.split(' ')[0];
  const type: ScaleType = keyName.includes('major') ? 'major' : 'harmonicMinor';
  const degree = ScaleEngine.getDegreeNameToNumber(degreeName.toLowerCase());
  const correctNote = ScaleEngine.getDegreeNote(tonic, type, degree);

  const isTrue = Math.random() > 0.5;
  const shownNote = isTrue ? correctNote : { ...correctNote, midi: correctNote.midi + 1, name: midiToName(correctNote.midi + 1) };

  return {
    clef,
    keyName,
    degreeName,
    shownNote,
    statement: `This is the ${degreeName} in ${keyName}`,
    isTrue,
  };
}
