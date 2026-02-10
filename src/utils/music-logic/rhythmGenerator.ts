export type TimeSignatureId = '2/4' | '3/4' | '4/4' | '5/4' | '6/8' | '7/8' | '9/8' | '12/8';

export interface RhythmToken {
  id: string;
  durationUnits: number; // in eighth-note units
  vexDuration: string;
  isRest: boolean;
  dots?: number;
}

export interface RhythmQuestion {
  timeSignature: TimeSignatureId;
  stemGroups: number[][];
  notes: RhythmToken[];
  choices: TimeSignatureId[];
  explanation: string;
}

interface TimeSignatureRule {
  id: TimeSignatureId;
  groups: number[]; // each group length in eighth-note units
  family: 'simple' | 'compound' | 'irregular';
}

const TIME_SIGNATURE_RULES: TimeSignatureRule[] = [
  { id: '2/4', groups: [2, 2], family: 'simple' },
  { id: '3/4', groups: [2, 2, 2], family: 'simple' },
  { id: '4/4', groups: [2, 2, 2, 2], family: 'simple' },
  { id: '5/4', groups: [4, 2, 4], family: 'irregular' },
  { id: '6/8', groups: [3, 3], family: 'compound' },
  { id: '7/8', groups: [2, 2, 3], family: 'irregular' },
  { id: '9/8', groups: [3, 3, 3], family: 'compound' },
  { id: '12/8', groups: [3, 3, 3, 3], family: 'compound' },
];

const SIMPLE_DURATIONS = [1, 2, 4] as const;
const COMPOUND_DURATIONS = [1, 2, 3] as const;

const CHOICE_POOL: TimeSignatureId[] = TIME_SIGNATURE_RULES.map((rule) => rule.id);

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function buildVexDuration(durationUnits: number, isRest: boolean): { vexDuration: string; dots?: number } {
  const restSuffix = isRest ? 'r' : '';

  if (durationUnits === 1) {
    return { vexDuration: `8${restSuffix}` };
  }
  if (durationUnits === 2) {
    return { vexDuration: `q${restSuffix}` };
  }
  if (durationUnits === 3) {
    return { vexDuration: `q${restSuffix}`, dots: 1 };
  }
  if (durationUnits === 4) {
    return { vexDuration: `h${restSuffix}` };
  }

  return { vexDuration: `8${restSuffix}` };
}

function splitGroupByRules(groupSize: number, family: TimeSignatureRule['family']): number[] {
  const result: number[] = [];
  let remaining = groupSize;
  const durations = family === 'compound' ? COMPOUND_DURATIONS : SIMPLE_DURATIONS;

  while (remaining > 0) {
    const valid = durations.filter((value) => value <= remaining);
    const picked = randomItem(valid);
    result.push(picked);
    remaining -= picked;
  }

  return result;
}

function createChoiceSet(correct: TimeSignatureId): TimeSignatureId[] {
  const distractors = shuffle(CHOICE_POOL.filter((id) => id !== correct)).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function buildExplanation(rule: TimeSignatureRule): string {
  if (rule.family === 'compound') {
    return `正確答案是 ${rule.id}。這是複拍子，節奏明顯以每組 3 個八分音符分拍（例如 6/8 = 3+3，9/8 = 3+3+3），每一拍感受接近附點四分音符。`;
  }

  if (rule.id === '5/4') {
    return '正確答案是 5/4。這是不規則拍號，總長度是 10 個八分音符，常見分組可視為 2+1+2 拍（以四分音符為基本單位）。';
  }

  if (rule.id === '7/8') {
    return '正確答案是 7/8。這是不規則拍號，常見分組為 2+2+3（以八分音符聚合），最後一組三連長度是辨識重點。';
  }

  return `正確答案是 ${rule.id}。這是單拍子，小節以平均的 2 個八分音符為一拍分組（例如 3/4 會是 2+2+2）。`;
}

export function generateRhythmQuestion(): RhythmQuestion {
  const rule = randomItem(TIME_SIGNATURE_RULES);

  const notes: RhythmToken[] = [];
  const stemGroups: number[][] = [];
  let indexCursor = 0;

  rule.groups.forEach((groupSize, groupIndex) => {
    const chunks = splitGroupByRules(groupSize, rule.family);
    const tokenIndexes: number[] = [];

    chunks.forEach((chunkSize, chunkIndex) => {
      const isRest = Math.random() < 0.22 && !(groupIndex === 0 && chunkIndex === 0);
      const duration = buildVexDuration(chunkSize, isRest);

      notes.push({
        id: `${groupIndex}-${chunkIndex}-${chunkSize}`,
        durationUnits: chunkSize,
        vexDuration: duration.vexDuration,
        dots: duration.dots,
        isRest,
      });

      tokenIndexes.push(indexCursor);
      indexCursor += 1;
    });

    if (tokenIndexes.length > 1) {
      stemGroups.push(tokenIndexes);
    }
  });

  return {
    timeSignature: rule.id,
    notes,
    stemGroups,
    choices: createChoiceSet(rule.id),
    explanation: buildExplanation(rule),
  };
}
