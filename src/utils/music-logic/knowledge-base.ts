export type TermCategory = 'tempo' | 'dynamics' | 'character' | 'articulation' | 'expression';

export interface MusicTerm {
  term: string;
  definition: string;
  category: TermCategory;
}

export interface InstrumentFact {
  id: string;
  name: string;
  family: 'Woodwind' | 'Brass' | 'Strings' | 'Percussion' | 'Keyboard' | 'Voice';
  reed: 'None' | 'Single' | 'Double';
  definitePitch: boolean;
  range: 'very-low' | 'low' | 'mid-low' | 'mid' | 'mid-high' | 'high' | 'very-high';
}

export type OrnamentType = 'trill' | 'upper turn' | 'upper mordent' | 'lower mordent' | 'appoggiatura' | 'acciaccatura';

export interface OrnamentPattern {
  type: OrnamentType;
  notes: string[];
  smallFirst?: boolean;
  tuplet?: number;
}

export interface TermsQuestion {
  term: MusicTerm;
  options: string[];
  answer: string;
}

export interface OrnamentQuestion {
  pattern: OrnamentPattern;
  options: OrnamentType[];
  answer: OrnamentType;
}

export interface InstrumentStatement {
  id: string;
  text: string;
  answer: boolean;
}

export interface InstrumentFactsQuestion {
  statements: InstrumentStatement[];
}

export const TERMS_DICTIONARY: MusicTerm[] = [
  { term: 'morendo', definition: 'dying away', category: 'dynamics' },
  { term: 'largamente', definition: 'broadly', category: 'tempo' },
  { term: 'mesto', definition: 'sad', category: 'character' },
  { term: 'dolce', definition: 'sweetly', category: 'character' },
  { term: 'agitato', definition: 'agitated', category: 'character' },
  { term: 'sostenuto', definition: 'sustained', category: 'expression' },
  { term: 'accelerando', definition: 'getting faster', category: 'tempo' },
  { term: 'ritardando', definition: 'getting slower', category: 'tempo' },
  { term: 'smorzando', definition: 'dying away in tone and speed', category: 'dynamics' },
  { term: 'marcato', definition: 'marked/accented', category: 'articulation' },
  { term: 'sehr ruhig', definition: 'very calm', category: 'character' },
  { term: 'rasch', definition: 'quickly', category: 'tempo' },
  { term: 'zart', definition: 'delicately', category: 'character' },
  { term: 'crescendo', definition: 'gradually getting louder', category: 'dynamics' },
  { term: 'diminuendo', definition: 'gradually getting softer', category: 'dynamics' },
];

export const INSTRUMENT_DATABASE: InstrumentFact[] = [
  { id: 'flute', name: 'Flute', family: 'Woodwind', reed: 'None', definitePitch: true, range: 'high' },
  { id: 'oboe', name: 'Oboe', family: 'Woodwind', reed: 'Double', definitePitch: true, range: 'mid-high' },
  { id: 'clarinet', name: 'Clarinet', family: 'Woodwind', reed: 'Single', definitePitch: true, range: 'mid' },
  { id: 'bassoon', name: 'Bassoon', family: 'Woodwind', reed: 'Double', definitePitch: true, range: 'low' },
  { id: 'trumpet', name: 'Trumpet', family: 'Brass', reed: 'None', definitePitch: true, range: 'high' },
  { id: 'horn', name: 'French Horn', family: 'Brass', reed: 'None', definitePitch: true, range: 'mid-low' },
  { id: 'trombone', name: 'Trombone', family: 'Brass', reed: 'None', definitePitch: true, range: 'low' },
  { id: 'violin', name: 'Violin', family: 'Strings', reed: 'None', definitePitch: true, range: 'high' },
  { id: 'cello', name: 'Cello', family: 'Strings', reed: 'None', definitePitch: true, range: 'mid-low' },
  { id: 'double-bass', name: 'Double Bass', family: 'Strings', reed: 'None', definitePitch: true, range: 'very-low' },
  { id: 'cymbals', name: 'Cymbals', family: 'Percussion', reed: 'None', definitePitch: false, range: 'mid' },
  { id: 'snare', name: 'Side Drum', family: 'Percussion', reed: 'None', definitePitch: false, range: 'mid' },
  { id: 'soprano', name: 'Soprano', family: 'Voice', reed: 'None', definitePitch: true, range: 'very-high' },
  { id: 'mezzo', name: 'Mezzo-soprano', family: 'Voice', reed: 'None', definitePitch: true, range: 'high' },
];

export const ORNAMENT_PATTERNS: OrnamentPattern[] = [
  { type: 'trill', notes: ['e/5', 'f/5', 'e/5', 'f/5', 'e/5'], tuplet: 5 },
  { type: 'upper turn', notes: ['d/5', 'e/5', 'd/5', 'c/5', 'd/5'] },
  { type: 'upper mordent', notes: ['d/5', 'e/5', 'd/5'] },
  { type: 'lower mordent', notes: ['d/5', 'c/5', 'd/5'] },
  { type: 'appoggiatura', notes: ['e/5', 'd/5'], smallFirst: true },
  { type: 'acciaccatura', notes: ['c#/5', 'd/5'], smallFirst: true },
];

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

export function generateTermsQuestion(): TermsQuestion {
  const term = randomItem(TERMS_DICTIONARY);
  const sameCategory = TERMS_DICTIONARY.filter((t) => t.category === term.category && t.term !== term.term).map((t) => t.definition);
  const fallback = TERMS_DICTIONARY.filter((t) => t.term !== term.term).map((t) => t.definition);
  const distractors = shuffle([...sameCategory, ...fallback]).filter((d, idx, arr) => arr.indexOf(d) === idx).slice(0, 3);
  return {
    term,
    options: shuffle([term.definition, ...distractors]),
    answer: term.definition,
  };
}

export function generateOrnamentQuestion(): OrnamentQuestion {
  const pattern = randomItem(ORNAMENT_PATTERNS);
  const options = shuffle([
    pattern.type,
    ...ORNAMENT_PATTERNS.filter((p) => p.type !== pattern.type).map((p) => p.type).slice(0, 3),
  ] as OrnamentType[]).slice(0, 4);

  return { pattern, options, answer: pattern.type };
}

const RANGE_WEIGHT: Record<InstrumentFact['range'], number> = {
  'very-low': 0,
  low: 1,
  'mid-low': 2,
  mid: 3,
  'mid-high': 4,
  high: 5,
  'very-high': 6,
};

export function generateInstrumentQuestion(): InstrumentFactsQuestion {
  const statements: InstrumentStatement[] = [];

  const a = randomItem(INSTRUMENT_DATABASE);
  const fam = randomItem(['Woodwind', 'Brass', 'Strings', 'Percussion'] as const);
  statements.push({
    id: 'family',
    text: `${a.name} is a ${fam} instrument.`,
    answer: a.family === fam,
  });

  const i1 = randomItem(INSTRUMENT_DATABASE);
  const i2 = randomItem(INSTRUMENT_DATABASE.filter((i) => i.id !== i1.id));
  statements.push({
    id: 'pitch',
    text: `${i1.name} usually plays at a higher pitch than ${i2.name}.`,
    answer: RANGE_WEIGHT[i1.range] > RANGE_WEIGHT[i2.range],
  });

  const r = randomItem(INSTRUMENT_DATABASE);
  const reedType = randomItem(['Single', 'Double'] as const);
  statements.push({
    id: 'mechanics',
    text: `${r.name} uses a ${reedType.toLowerCase()} reed.`,
    answer: r.reed === reedType,
  });

  const p = randomItem(INSTRUMENT_DATABASE.filter((i) => i.family === 'Percussion'));
  statements.push({
    id: 'definite',
    text: `${p.name} produces sounds of definite pitch.`,
    answer: p.definitePitch,
  });

  const v1 = INSTRUMENT_DATABASE.find((i) => i.id === 'mezzo')!;
  const v2 = INSTRUMENT_DATABASE.find((i) => i.id === 'soprano')!;
  statements.push({
    id: 'voice',
    text: `${v1.name} has a lower range than ${v2.name}.`,
    answer: RANGE_WEIGHT[v1.range] < RANGE_WEIGHT[v2.range],
  });

  return { statements };
}
