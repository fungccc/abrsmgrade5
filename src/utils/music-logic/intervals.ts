export type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';
export type Accidental = 'bb' | 'b' | '' | '#' | 'x';
export type IntervalQuality = 'perfect' | 'major' | 'minor' | 'augmented' | 'diminished';

export interface NoteObj {
  letter: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  accidental: Accidental;
  octave: number;
}

export interface IntervalResult {
  number: number;
  quality: IntervalQuality;
  isCompound: boolean;
  simplifiedNumber: number;
  semitones: number;
}

export interface NamingIntervalQuestion {
  clef: ClefType;
  lower: NoteObj;
  upper: NoteObj;
  answer: string;
  options: string[];
}

export interface QualityQuestion {
  lowClef: ClefType;
  highClef: ClefType;
  lower: NoteObj;
  upper: NoteObj;
  answer: IntervalQuality;
}

export interface InteractiveWriterQuestion {
  clef: ClefType;
  given: NoteObj;
  targetNumber: number;
  targetQuality: IntervalQuality;
  target: NoteObj;
  label: string;
}

const LETTERS: NoteObj['letter'][] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_TO_PC: Record<NoteObj['letter'], number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ACC_TO_OFFSET: Record<Accidental, number> = { bb: -2, b: -1, '': 0, '#': 1, x: 2 };
const OFFSET_TO_ACC: Record<number, Accidental> = { [-2]: 'bb', [-1]: 'b', [0]: '', [1]: '#', [2]: 'x' };
const PERFECT_CLASS = new Set([1, 4, 5]);

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

function intervalBaseSemitones(simpleNum: number): number {
  if (simpleNum === 1) return 0;
  if (simpleNum === 2) return 2;
  if (simpleNum === 3) return 4;
  if (simpleNum === 4) return 5;
  if (simpleNum === 5) return 7;
  if (simpleNum === 6) return 9;
  return 11;
}

function desiredSemitones(number: number, quality: IntervalQuality): number {
  const simple = ((number - 1) % 7) + 1;
  const octaves = Math.floor((number - 1) / 7);
  const base = intervalBaseSemitones(simple) + octaves * 12;

  if (PERFECT_CLASS.has(simple)) {
    if (quality === 'perfect') return base;
    if (quality === 'augmented') return base + 1;
    if (quality === 'diminished') return base - 1;
    return base;
  }

  if (quality === 'major') return base;
  if (quality === 'minor') return base - 1;
  if (quality === 'augmented') return base + 1;
  if (quality === 'diminished') return base - 2;
  return base;
}

export class IntervalEngine {
  static toMidi(note: NoteObj): number {
    return (note.octave + 1) * 12 + LETTER_TO_PC[note.letter] + ACC_TO_OFFSET[note.accidental];
  }

  static toVexKey(note: NoteObj): string {
    return `${note.letter.toLowerCase()}/${note.octave}`;
  }

  static accidentalForVex(note: NoteObj): string | null {
    if (!note.accidental) return null;
    return note.accidental === 'x' ? '##' : note.accidental;
  }

  static name(note: NoteObj): string {
    return `${note.letter}${note.accidental}`;
  }

  static calculate(a: NoteObj, b: NoteObj): IntervalResult {
    const low = IntervalEngine.toMidi(a) <= IntervalEngine.toMidi(b) ? a : b;
    const high = low === a ? b : a;

    const semitones = IntervalEngine.toMidi(high) - IntervalEngine.toMidi(low);
    const li = LETTERS.indexOf(low.letter);
    const hi = LETTERS.indexOf(high.letter);
    const letterSpan = hi - li + (high.octave - low.octave) * 7;
    const number = letterSpan + 1;
    const simplifiedNumber = ((number - 1) % 7) + 1;
    const isCompound = number > 8;

    const expectedPerfectOrMajor = desiredSemitones(number, PERFECT_CLASS.has(simplifiedNumber) ? 'perfect' : 'major');
    const diff = semitones - expectedPerfectOrMajor;

    let quality: IntervalQuality = 'perfect';
    if (PERFECT_CLASS.has(simplifiedNumber)) {
      if (diff === 0) quality = 'perfect';
      else if (diff > 0) quality = 'augmented';
      else quality = 'diminished';
    } else {
      if (diff === 0) quality = 'major';
      else if (diff === -1) quality = 'minor';
      else if (diff > 0) quality = 'augmented';
      else quality = 'diminished';
    }

    return { number, quality, isCompound, simplifiedNumber, semitones };
  }

  static buildAbove(base: NoteObj, number: number, quality: IntervalQuality): NoteObj {
    const steps = number - 1;
    const li = LETTERS.indexOf(base.letter);
    const targetLi = (li + steps) % 7;
    const octaveJump = Math.floor((li + steps) / 7);
    const letter = LETTERS[targetLi];
    const octave = base.octave + octaveJump;

    const naturalTarget: NoteObj = { letter, accidental: '', octave };
    const naturalDistance = IntervalEngine.toMidi(naturalTarget) - IntervalEngine.toMidi({ ...base, accidental: '' });
    const want = desiredSemitones(number, quality);
    const accOffset = Math.max(-2, Math.min(2, want - naturalDistance));

    return { letter, accidental: OFFSET_TO_ACC[accOffset] ?? '', octave };
  }

  static label(interval: IntervalResult): string {
    const n = interval.isCompound ? `compound ${interval.number}` : `${interval.number}`;
    return `${interval.quality} ${n}`;
  }
}

function randomNote(minOct = 3, maxOct = 5): NoteObj {
  return {
    letter: randomItem(LETTERS),
    accidental: randomItem(['', '#', 'b', 'x', 'bb'] as const),
    octave: randomItem(Array.from({ length: maxOct - minOct + 1 }, (_, i) => minOct + i)),
  };
}

export function generateNamingQuestion(): NamingIntervalQuestion {
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const lower = randomNote(clef === 'bass' ? 2 : 3, clef === 'bass' ? 4 : 5);
  const targetNum = randomItem([2, 3, 4, 5, 6, 7, 9, 10, 11, 12]);
  const targetQual = randomItem(['perfect', 'major', 'minor', 'augmented', 'diminished'] as const);
  const upper = IntervalEngine.buildAbove(lower, targetNum, targetQual);
  const ansObj = IntervalEngine.calculate(lower, upper);
  const answer = IntervalEngine.label(ansObj);

  const qErr = IntervalEngine.label({ ...ansObj, quality: ansObj.quality === 'perfect' ? 'major' : 'perfect' });
  const nErr = IntervalEngine.label({ ...ansObj, number: ansObj.number + 1 });
  const cErr = ansObj.isCompound ? IntervalEngine.label({ ...ansObj, number: ansObj.simplifiedNumber, isCompound: false }) : IntervalEngine.label({ ...ansObj, number: ansObj.number + 7, isCompound: true });
  const options = shuffle([answer, qErr, nErr, cErr]);

  return { clef, lower, upper, answer, options };
}

export function generateQualityQuestion(): QualityQuestion {
  const lowClef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const highClef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const lower = randomNote(2, 4);
  const number = randomItem([3, 4, 5, 6, 7, 9, 10]);
  const quality = randomItem(['perfect', 'major', 'minor', 'diminished', 'augmented'] as const);
  const upper = IntervalEngine.buildAbove(lower, number, quality);

  return { lowClef, highClef, lower, upper, answer: IntervalEngine.calculate(lower, upper).quality };
}

export function generateWriterQuestion(): InteractiveWriterQuestion {
  const clef = randomItem(['treble', 'bass', 'alto', 'tenor'] as const);
  const given = randomNote(clef === 'bass' ? 2 : 3, clef === 'bass' ? 3 : 4);
  const number = randomItem([3, 5, 7, 10, 12]);
  const quality = randomItem(['perfect', 'major', 'minor', 'augmented', 'diminished'] as const);
  const target = IntervalEngine.buildAbove(given, number, quality);
  const label = `${number > 8 ? 'compound ' : ''}${quality} ${number}`;

  return { clef, given, targetNumber: number, targetQuality: quality, target, label };
}
