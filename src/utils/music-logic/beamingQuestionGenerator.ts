export type BeamingTimeSignature = '3/4' | '4/4' | '6/8' | '5/8' | '7/8';

export interface BeamingOption {
  id: string;
  label: string;
  beamGroups: number[][];
  isCorrect: boolean;
  trapType?: 'syncopation' | 'compound' | 'irregular';
}

export interface BeamingQuestion {
  timeSignature: BeamingTimeSignature;
  noteDurations: string[];
  options: BeamingOption[];
  correctOptionId: string;
  explanation: string;
}

interface BeamingRule {
  id: BeamingTimeSignature;
  totalEighths: number;
  correctGrouping: number[];
  family: 'simple' | 'compound' | 'irregular';
}

const RULES: BeamingRule[] = [
  { id: '3/4', totalEighths: 6, correctGrouping: [2, 2, 2], family: 'simple' },
  { id: '4/4', totalEighths: 8, correctGrouping: [2, 2, 2, 2], family: 'simple' },
  { id: '6/8', totalEighths: 6, correctGrouping: [3, 3], family: 'compound' },
  { id: '5/8', totalEighths: 5, correctGrouping: [2, 3], family: 'irregular' },
  { id: '7/8', totalEighths: 7, correctGrouping: [2, 2, 3], family: 'irregular' },
];

function randomItem<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function groupingToIndexes(grouping: number[]): number[][] {
  const result: number[][] = [];
  let cursor = 0;
  grouping.forEach((size) => {
    const group = Array.from({ length: size }, (_, idx) => cursor + idx);
    if (group.length > 1) {
      result.push(group);
    }
    cursor += size;
  });
  return result;
}

function buildSyncopationTrap(rule: BeamingRule): number[] {
  // Incorrect Case 1: Cross a strong beat boundary (notably 4/4 beat 2 -> beat 3 middle line).
  if (rule.id === '4/4') {
    return [4, 4]; // crosses the middle-of-bar boundary at 4 eighth-notes.
  }

  if (rule.id === '3/4') {
    return [4, 2]; // hides beat-2 accent by over-beaming first four quavers.
  }

  if (rule.id === '6/8') {
    return [4, 2]; // wrong in compound: should be 3+3, not 4+2.
  }

  if (rule.id === '5/8') {
    return [3, 2]; // flips expected 2+3 grouping.
  }

  return [2, 3, 2]; // 7/8 trap crossing expected 2+2+3 accents.
}

function buildCompoundTrap(rule: BeamingRule): number[] {
  // Incorrect Case 2: Apply compound-style grouping in simple time or vice versa.
  if (rule.id === '3/4') {
    return [3, 3]; // looks like 6/8
  }

  if (rule.id === '6/8') {
    return [2, 2, 2]; // looks like simple triple subdivisions
  }

  if (rule.id === '4/4') {
    return [3, 3, 2]; // creates false compound accents
  }

  if (rule.id === '5/8') {
    return [1, 2, 2]; // weak irregular representation
  }

  return [3, 2, 2]; // alternative but treated as wrong for this generated accent model
}

function buildIrregularTrap(rule: BeamingRule): number[] {
  if (rule.id === '7/8') {
    return [7]; // one long beam hides irregular grouping entirely
  }
  if (rule.id === '5/8') {
    return [5];
  }
  if (rule.id === '4/4') {
    return [2, 4, 2]; // crosses middle while over-emphasizing beat 3-4 block
  }
  if (rule.id === '3/4') {
    return [6];
  }
  return [6];
}

function buildExplanation(rule: BeamingRule): string {
  if (rule.id === '4/4') {
    return '正確連尾需顯示每拍（2+2+2+2），不可把第 2 拍與第 3 拍跨中線連在一起，否則會模糊小節重音。';
  }

  if (rule.id === '3/4') {
    return '3/4 應呈現 2+2+2（三拍子），不能連成 3+3；3+3 會看起來像 6/8 的複拍子分組。';
  }

  if (rule.id === '6/8') {
    return '6/8 是複拍子，連尾應為 3+3，代表兩個附點四分音符大拍；若連成 2+2+2 會誤導成單拍子感。';
  }

  if (rule.id === '5/8') {
    return '5/8 屬不規則拍號，需清楚顯示固定分組（本題採 2+3）；錯誤連尾常把重音位置顛倒或隱藏。';
  }

  return '7/8 屬不規則拍號，需明確呈現 2+2+3 的重音結構；若一整串相連，會失去拍號辨識線索。';
}

function createOptions(rule: BeamingRule): BeamingOption[] {
  const patterns: BeamingOption[] = [
    {
      id: 'correct',
      label: 'A',
      beamGroups: groupingToIndexes(rule.correctGrouping),
      isCorrect: true,
    },
    {
      id: 'sync',
      label: 'B',
      beamGroups: groupingToIndexes(buildSyncopationTrap(rule)),
      isCorrect: false,
      trapType: 'syncopation',
    },
    {
      id: 'compound',
      label: 'C',
      beamGroups: groupingToIndexes(buildCompoundTrap(rule)),
      isCorrect: false,
      trapType: 'compound',
    },
    {
      id: 'irregular',
      label: 'D',
      beamGroups: groupingToIndexes(buildIrregularTrap(rule)),
      isCorrect: false,
      trapType: 'irregular',
    },
  ];

  return shuffle(patterns).map((option, idx) => ({ ...option, label: String.fromCharCode(65 + idx) }));
}

export function generateBeamingQuestion(): BeamingQuestion {
  const rule = randomItem(RULES);
  const options = createOptions(rule);
  const correctOptionId = options.find((option) => option.isCorrect)?.id ?? 'correct';

  return {
    timeSignature: rule.id,
    noteDurations: Array.from({ length: rule.totalEighths }, () => '8'),
    options,
    correctOptionId,
    explanation: buildExplanation(rule),
  };
}
