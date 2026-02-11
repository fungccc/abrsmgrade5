export type AdvancedTimeSignature = '9/8' | '12/8' | '9/4' | '5/8';

export interface AdvancedBeamingOption {
  id: string;
  label: string;
  beamGroups: number[][];
  isCorrect: boolean;
  kind: 'correct' | 'bridge' | 'over-grouping';
}

export interface AdvancedBeamingQuestion {
  timeSignature: AdvancedTimeSignature;
  noteDurations: string[];
  options: AdvancedBeamingOption[];
  correctOptionId: string;
  explanation: string;
}

interface AdvancedRule {
  id: AdvancedTimeSignature;
  totalEighths: number;
  beatUnitEighths: number;
  bigBeatGroups: number[];
}

const ADVANCED_RULES: AdvancedRule[] = [
  { id: '9/8', totalEighths: 9, beatUnitEighths: 3, bigBeatGroups: [3, 3, 3] },
  { id: '12/8', totalEighths: 12, beatUnitEighths: 3, bigBeatGroups: [3, 3, 3, 3] },
  // 9/4 big beats: 3 dotted minims (each dotted minim = 6 eighths)
  { id: '9/4', totalEighths: 18, beatUnitEighths: 6, bigBeatGroups: [6, 6, 6] },
  { id: '5/8', totalEighths: 5, beatUnitEighths: 0, bigBeatGroups: [2, 3] },
];

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function groupsToIndexes(groups: number[]): number[][] {
  const result: number[][] = [];
  let cursor = 0;

  groups.forEach((size) => {
    const indexes = Array.from({ length: size }, (_, idx) => cursor + idx);
    if (indexes.length > 1) {
      result.push(indexes);
    }
    cursor += size;
  });

  return result;
}

function makeBridgeTrap(rule: AdvancedRule): number[] {
  // Distractor 1 (The Bridge): force a beam to cross Beat 1 -> Beat 2 boundary.
  // e.g. 9/8 correct [3,3,3] becomes [4,2,3] crossing boundary at index 3.
  const [first, second, ...rest] = rule.bigBeatGroups;
  if (!first || !second) return [rule.totalEighths];

  return [first + 1, second - 1, ...rest].filter((n) => n > 0);
}

function makeOverGroupingTrap(rule: AdvancedRule): number[] {
  // Distractor 2 (Over-grouping): connect too many notes as one long beam block.
  // This hides big-beat accents (especially fatal in compound/irregular meters).
  if (rule.id === '5/8') {
    return [5];
  }

  if (rule.id === '9/4') {
    return [9, 9];
  }

  return [rule.totalEighths];
}

function explanationFor(rule: AdvancedRule): string {
  if (rule.id === '9/4') {
    return '正確答案必須呈現 9/4 的大拍結構 3+3+3（每大拍為附點二分音符）。任何跨越這三個區塊的連尾都會掩蓋重音。';
  }

  if (rule.id === '9/8') {
    return '9/8 為複拍子，應依 3+3+3 分組。若把第 1 拍尾端與第 2 拍開頭連起來，會破壞大拍感。';
  }

  if (rule.id === '12/8') {
    return '12/8 應清楚分成 3+3+3+3。過度連尾（例如一整串）會讓拍點辨識失真。';
  }

  return '5/8 為不規則拍號，本題設定為 2+3。正確連尾需忠實反映分組，不可過度合併。';
}

export function generateCompoundBeamingQuestion(): AdvancedBeamingQuestion {
  const rule = randomItem(ADVANCED_RULES);

  const options: AdvancedBeamingOption[] = [
    {
      id: 'correct',
      label: 'A',
      beamGroups: groupsToIndexes(rule.bigBeatGroups),
      isCorrect: true,
      kind: 'correct',
    },
    {
      id: 'bridge',
      label: 'B',
      beamGroups: groupsToIndexes(makeBridgeTrap(rule)),
      isCorrect: false,
      kind: 'bridge',
    },
    {
      id: 'over',
      label: 'C',
      beamGroups: groupsToIndexes(makeOverGroupingTrap(rule)),
      isCorrect: false,
      kind: 'over-grouping',
    },
  ];

  const shuffled = shuffle(options).map((option, idx) => ({
    ...option,
    label: String.fromCharCode(65 + idx),
  }));

  return {
    timeSignature: rule.id,
    noteDurations: Array.from({ length: rule.totalEighths }, () => '8'),
    options: shuffled,
    correctOptionId: shuffled.find((option) => option.isCorrect)?.id ?? 'correct',
    explanation: explanationFor(rule),
  };
}
