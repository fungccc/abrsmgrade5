import { ContextAnalyzer } from './ContextAnalyzer';
import { MOCK_SONG } from './mock-song';
import { INSTRUMENT_DATABASE } from './knowledge-base';

export type Hand = 'RH' | 'LH';
export type SymbolType = 'diminuendo' | 'crescendo' | 'staccato';
export type IntervalType = 'm2' | 'M2' | 'm3' | 'M3' | 'P4' | 'P5' | 'm6' | 'M6' | 'm7' | 'M7' | 'P8';

export interface NoteEvent {
  pitch: string;
  duration: '16' | '8' | 'q' | 'h';
  articulation?: 'staccato' | 'tenuto' | 'accent';
  ornament?: 'trill' | 'mordent' | 'turn' | 'acciaccatura' | 'appoggiatura';
  slurStart?: boolean;
  slurEnd?: boolean;
}

export interface StaffBar {
  notes: NoteEvent[];
  dynamics?: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'sf';
  crescendo?: boolean;
  diminuendo?: boolean;
}

export interface MusicalBar {
  RH: StaffBar;
  LH: StaffBar;
}

export interface MusicalContext {
  title: string;
  tempoText: string;
  keySignature: string;
  timeSignature: string;
  staves: [Hand, Hand];
  bars: MusicalBar[];
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export interface ClefTranspositionOption {
  id: 'A' | 'B' | 'C';
  clef: 'alto' | 'bass' | 'tenor';
  notes: string[];
  description: string;
  isCorrect: boolean;
}

export interface ClefTranspositionQuestion {
  sourceBar: number;
  sourceHand: Hand;
  prompt: string;
  options: ClefTranspositionOption[];
  answerId: ClefTranspositionOption['id'];
}

function transposeOctave(pitch: string, octaves: number): string {
  const match = pitch.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return pitch;
  return `${match[1]}${Number(match[2]) + octaves}`;
}

export function createClefTranspositionQuestion(context: MusicalContext = MOCK_SONG): ClefTranspositionQuestion {
  const sourceBar = 2;
  const rhNotes = context.bars[sourceBar - 1].RH.notes.map((n) => n.pitch);
  const optionA: ClefTranspositionOption = {
    id: 'A',
    clef: 'alto',
    notes: rhNotes.map((pitch) => transposeOctave(pitch, -1)),
    description: 'Correct transposition: same melody contour written one octave lower in alto clef.',
    isCorrect: true,
  };

  const optionB: ClefTranspositionOption = {
    id: 'B',
    clef: 'bass',
    notes: rhNotes.map((pitch) => transposeOctave(pitch, -2)),
    description: 'Incorrect: shifted too low (an extra octave).',
    isCorrect: false,
  };

  const contourBroken = [...rhNotes];
  if (contourBroken.length > 2) {
    [contourBroken[1], contourBroken[2]] = [contourBroken[2], contourBroken[1]];
  }
  const optionC: ClefTranspositionOption = {
    id: 'C',
    clef: 'tenor',
    notes: contourBroken.map((pitch) => transposeOctave(pitch, -1)),
    description: 'Incorrect: octave is right but the melody contour is altered.',
    isCorrect: false,
  };

  const options = [optionA, optionB, optionC];
  return {
    sourceBar,
    sourceHand: 'RH',
    prompt: 'Compare the options to the right-hand part of bar 2. Choose the only correctly written transposition one octave lower.',
    options,
    answerId: optionA.id,
  };
}

export interface ContextAssertion {
  id: string;
  text: string;
  answer: boolean;
}

export function createContextAssertions(analyzer = new ContextAnalyzer(MOCK_SONG)): ContextAssertion[] {
  const range = analyzer.getRange();
  return [
    {
      id: 'begins-lightly',
      text: 'The beginning of the music should be played lightly.',
      answer: analyzer.beginsLightly(),
    },
    {
      id: 'ends-subdominant',
      text: `The music ends on the subdominant chord of ${analyzer.context.keySignature}.`,
      answer: analyzer.endsOnSubdominant(),
    },
    {
      id: 'bar7-major-third',
      text: 'The largest melodic interval in the left-hand part of bar 7 is a major 3rd.',
      answer: analyzer.largestMelodicIntervalInBar(7, 'LH') === 'M3',
    },
    {
      id: 'highest-note',
      text: 'The highest note in the music is C#6.',
      answer: range.highest.pitch === 'C#6',
    },
    {
      id: 'bar7-gets-quieter',
      text: 'The music gets quieter in bar 7.',
      answer: analyzer.findSymbol('diminuendo').includes(7),
    },
  ];
}

export interface InstrumentSuitabilityQuestion {
  prompt: string;
  bars: [number, number];
  options: string[];
  answer: string;
}

const RANGE_WEIGHT: Record<string, number> = {
  'very-low': 43,
  low: 50,
  'mid-low': 55,
  mid: 60,
  'mid-high': 65,
  high: 72,
  'very-high': 79,
};

export function createInstrumentSuitabilityQuestion(analyzer = new ContextAnalyzer(MOCK_SONG)): InstrumentSuitabilityQuestion {
  const bars: [number, number] = [3, 4];
  const phraseRange = analyzer.getRangeForBars(bars[0], bars[1], 'RH');
  const candidates = ['Bassoon', 'Oboe', 'Trombone', 'Double Bass'];

  const scored = candidates
    .map((name) => INSTRUMENT_DATABASE.find((i) => i.name === name))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((instrument) => {
      const centerDistance = Math.abs(RANGE_WEIGHT[instrument.range] - phraseRange.centerMidi);
      return { instrument: instrument.name, score: centerDistance };
    })
    .sort((a, b) => a.score - b.score);

  return {
    prompt: 'Which instrument is best suited to play the right-hand phrase in bars 3–4 so that it sounds at the same pitch?',
    bars,
    options: candidates,
    answer: scored[0]?.instrument ?? randomItem(candidates),
  };
}

export interface MediantCountQuestion {
  prompt: string;
  options: number[];
  answer: number;
}

export function createMediantCountQuestion(analyzer = new ContextAnalyzer(MOCK_SONG)): MediantCountQuestion {
  const mediant = analyzer.getMediantPitchClass();
  const count = analyzer.countScaleDegreeInHand(mediant, 'LH');
  return {
    prompt: `How many times does the mediant note in the key of ${analyzer.context.keySignature} appear in the left-hand part?`,
    options: [4, 5, 6, 8],
    answer: count,
  };
}

export interface StructureSymbolsQuestion {
  rhythmPrompt: string;
  rhythmAnswer: number;
  diminuendoPrompt: string;
  diminuendoAnswer: number;
}

export function createStructureSymbolsQuestion(analyzer = new ContextAnalyzer(MOCK_SONG)): StructureSymbolsQuestion {
  const match = analyzer.findMatchingRhythmAndArticulation(3, 'RH').find((bar) => bar !== 3) ?? 4;
  const diminuendoBar = analyzer.findSymbol('diminuendo')[0] ?? 7;

  return {
    rhythmPrompt: 'Bar 3 has the same rhythm and articulation as bar ____.',
    rhythmAnswer: match,
    diminuendoPrompt: 'There is a diminuendo in bar ____.',
    diminuendoAnswer: diminuendoBar,
  };
}
