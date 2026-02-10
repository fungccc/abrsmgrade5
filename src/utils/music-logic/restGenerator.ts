export type RestTimeSignature = '2/4' | '3/4' | '4/4' | '6/8' | '9/8' | '12/8';

export interface RestToken {
  durationUnits: number; // eighth-note units
  vexDuration: string;
  dots?: number;
}

export interface RestQuestionOption {
  id: string;
  rests: RestToken[];
  label: string;
  isCorrect: boolean;
}

export interface RestQuestion {
  timeSignature: RestTimeSignature;
  givenNotes: RestToken[];
  missingDurationUnits: number;
  startBeatUnits: number;
  options: RestQuestionOption[];
  correctOptionId: string;
  explanation: string;
}

interface MeterRule {
  id: RestTimeSignature;
  totalUnits: number;
  beatUnits: number;
  groups: number[]; // compound grouping or simple beat grouping in eighth units
  family: 'simple' | 'compound';
}

const METER_RULES: MeterRule[] = [
  { id: '2/4', totalUnits: 4, beatUnits: 2, groups: [2, 2], family: 'simple' },
  { id: '3/4', totalUnits: 6, beatUnits: 2, groups: [2, 2, 2], family: 'simple' },
  { id: '4/4', totalUnits: 8, beatUnits: 2, groups: [2, 2, 2, 2], family: 'simple' },
  { id: '6/8', totalUnits: 6, beatUnits: 3, groups: [3, 3], family: 'compound' },
  { id: '9/8', totalUnits: 9, beatUnits: 3, groups: [3, 3, 3], family: 'compound' },
  { id: '12/8', totalUnits: 12, beatUnits: 3, groups: [3, 3, 3, 3], family: 'compound' },
];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function restTokenFromUnits(units: number): RestToken {
  if (units === 1) return { durationUnits: 1, vexDuration: '8r' };
  if (units === 2) return { durationUnits: 2, vexDuration: 'qr' };
  if (units === 3) return { durationUnits: 3, vexDuration: 'qr', dots: 1 };
  if (units === 4) return { durationUnits: 4, vexDuration: 'hr' };
  return { durationUnits: 1, vexDuration: '8r' };
}

function splitInsideSpan(length: number, family: MeterRule['family']): number[] {
  // Compound time rule: preserve dotted-crotchet beat feel (3 eighths per beat group),
  // so we prefer [3] over [2+1] whenever a full compound beat is empty.
  const preferred = family === 'compound' ? [3, 2, 1] : [4, 2, 1];
  const out: number[] = [];
  let rem = length;
  while (rem > 0) {
    const pick = preferred.find((x) => x <= rem) ?? 1;
    out.push(pick);
    rem -= pick;
  }
  return out;
}

/**
 * 計算符合 ABRSM 休止符書寫規則的「正確休止符分解」。
 *
 * @param timeSignature 拍號
 * @param remainingDuration 缺少的總時值（以八分音符為單位）
 * @param startBeat 缺口開始位置（以八分音符為單位，從小節開頭起算）
 */
export function calculateCorrectRestNotation(
  timeSignature: RestTimeSignature,
  remainingDuration: number,
  startBeat: number,
): RestToken[] {
  const meter = METER_RULES.find((m) => m.id === timeSignature);
  if (!meter) return [];

  const end = startBeat + remainingDuration;
  const boundaries = new Set<number>([startBeat, end]);

  // 4/4: must not hide the middle-of-bar division between beat 2 and 3.
  // In eighth-note units this middle boundary is at position 4.
  if (timeSignature === '4/4' && startBeat < 4 && end > 4) {
    boundaries.add(4);
  }

  // Compound time rule (6/8, 9/8, 12/8): rests should reflect dotted-crotchet beat groups.
  // Therefore we add every 3-eighth boundary so rest symbols cannot cross group borders.
  if (meter.family === 'compound') {
    for (let pos = 0; pos <= meter.totalUnits; pos += meter.beatUnits) {
      if (pos > startBeat && pos < end) {
        boundaries.add(pos);
      }
    }
  }

  const sorted = [...boundaries].sort((a, b) => a - b);
  const units: number[] = [];

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const span = sorted[i + 1] - sorted[i];
    units.push(...splitInsideSpan(span, meter.family));
  }

  return units.map(restTokenFromUnits);
}

function notesFromUnits(units: number): RestToken[] {
  const tokens: RestToken[] = [];
  let rem = units;
  while (rem > 0) {
    if (rem >= 4) {
      tokens.push({ durationUnits: 4, vexDuration: 'h' });
      rem -= 4;
    } else if (rem >= 2) {
      tokens.push({ durationUnits: 2, vexDuration: 'q' });
      rem -= 2;
    } else {
      tokens.push({ durationUnits: 1, vexDuration: '8' });
      rem -= 1;
    }
  }
  return tokens;
}

function labelFromRests(rests: RestToken[]): string {
  return rests
    .map((r) => {
      if (r.durationUnits === 4) return '二分休止符';
      if (r.durationUnits === 3) return '附點四分休止符';
      if (r.durationUnits === 2) return '四分休止符';
      return '八分休止符';
    })
    .join(' + ');
}

function buildDistractors(meter: MeterRule, missing: number, correct: RestToken[]): RestToken[][] {
  const distractorSets: RestToken[][] = [];

  // Wrong #1: merge to maximum single rests (often crosses forbidden boundaries)
  distractorSets.push(splitInsideSpan(missing, 'simple').map(restTokenFromUnits));

  // Wrong #2: all eighth rests (valid duration but weak notation)
  distractorSets.push(Array.from({ length: missing }, () => restTokenFromUnits(1)));

  // Wrong #3: if compound, force quarter-based split that ignores 3+3 grouping
  if (meter.family === 'compound') {
    const weird: RestToken[] = [];
    let rem = missing;
    while (rem > 0) {
      const take = rem >= 2 ? 2 : 1;
      weird.push(restTokenFromUnits(take));
      rem -= take;
    }
    distractorSets.push(weird);
  } else {
    // Simple fallback: dotted quarter misuse
    if (missing >= 3) {
      const wrong = [restTokenFromUnits(3), ...splitInsideSpan(missing - 3, 'simple').map(restTokenFromUnits)];
      distractorSets.push(wrong);
    }
  }

  const unique = new Map<string, RestToken[]>();
  const correctKey = correct.map((r) => r.durationUnits).join('-');
  for (const d of distractorSets) {
    const key = d.map((r) => r.durationUnits).join('-');
    if (key !== correctKey && !unique.has(key)) {
      unique.set(key, d);
    }
  }

  return [...unique.values()].slice(0, 3);
}

function buildExplanation(question: RestQuestion, correct: RestToken[]): string {
  const combo = labelFromRests(correct);
  if (question.timeSignature === '4/4') {
    return `正確寫法是：${combo}。在 4/4 中，休止符不應跨越第 2 與第 3 拍的中線，所以需要先在中線切開再記寫。`;
  }
  if (question.timeSignature === '6/8' || question.timeSignature === '9/8' || question.timeSignature === '12/8') {
    return `正確寫法是：${combo}。這是複拍子（${question.timeSignature}），休止符必須反映每組 3 個八分音符（附點四分音符）的大拍分組。`;
  }
  return `正確寫法是：${combo}。休止符需清楚呈現每一拍的結構，不可用不恰當的大休止符遮蔽拍點。`;
}

export function generateRestCompletionQuestion(): RestQuestion {
  const meter = randomItem(METER_RULES);

  const possibleStarts = Array.from({ length: meter.totalUnits - 1 }, (_, idx) => idx + 1)
    .filter((start) => meter.totalUnits - start >= 2);
  const startBeatUnits = randomItem(possibleStarts);
  const missingDurationUnits = meter.totalUnits - startBeatUnits;

  const givenNotes = notesFromUnits(startBeatUnits);
  const correct = calculateCorrectRestNotation(meter.id, missingDurationUnits, startBeatUnits);
  const distractors = buildDistractors(meter, missingDurationUnits, correct);

  const options: RestQuestionOption[] = shuffle([
    { id: 'correct', rests: correct, label: labelFromRests(correct), isCorrect: true },
    ...distractors.map((rests, idx) => ({ id: `d-${idx}`, rests, label: labelFromRests(rests), isCorrect: false })),
  ]).slice(0, 4);

  const correctOptionId = options.find((option) => option.isCorrect)?.id ?? 'correct';

  return {
    timeSignature: meter.id,
    givenNotes,
    missingDurationUnits,
    startBeatUnits,
    options,
    correctOptionId,
    explanation: buildExplanation(
      {
        timeSignature: meter.id,
        givenNotes,
        missingDurationUnits,
        startBeatUnits,
        options,
        correctOptionId,
        explanation: '',
      },
      correct,
    ),
  };
}
