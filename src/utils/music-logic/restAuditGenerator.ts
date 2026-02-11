export type RestAuditTimeSignature = '3/4' | '4/4' | '6/8';

export interface BarToken {
  startUnits: number;
  durationUnits: number;
  vexDuration: string;
  isRest: boolean;
  dots?: number;
}

export interface RestAuditQuestion {
  timeSignature: RestAuditTimeSignature;
  tokens: BarToken[];
  isNotationCorrect: boolean;
  explanation: string;
}

interface BarTemplate {
  timeSignature: RestAuditTimeSignature;
  totalUnits: number;
  correctTokens: BarToken[];
}

function token(startUnits: number, durationUnits: number, isRest: boolean, dotted = false): BarToken {
  if (durationUnits === 1) return { startUnits, durationUnits, vexDuration: isRest ? '8r' : '8', isRest };
  if (durationUnits === 2) return { startUnits, durationUnits, vexDuration: isRest ? 'qr' : 'q', isRest };
  if (durationUnits === 3) return { startUnits, durationUnits, vexDuration: isRest ? 'qr' : 'q', isRest, dots: dotted ? 1 : undefined };
  return { startUnits, durationUnits: 4, vexDuration: isRest ? 'hr' : 'h', isRest };
}

const TEMPLATES: BarTemplate[] = [
  {
    timeSignature: '4/4',
    totalUnits: 8,
    correctTokens: [token(0, 2, false), token(2, 2, true), token(4, 2, false), token(6, 2, true)],
  },
  {
    timeSignature: '3/4',
    totalUnits: 6,
    correctTokens: [token(0, 2, false), token(2, 2, true), token(4, 2, true)],
  },
  {
    timeSignature: '6/8',
    totalUnits: 6,
    correctTokens: [token(0, 1, false), token(1, 1, true), token(2, 1, true), token(3, 1, false), token(4, 1, false), token(5, 1, false)],
  },
];

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function cloneTokens(tokens: BarToken[]): BarToken[] {
  return tokens.map((t) => ({ ...t }));
}

/**
 * Error injector for Q1.5.
 * It may intentionally break ABRSM rest notation rules while preserving bar duration.
 */
export function injectRestError(barData: BarTemplate): { tokens: BarToken[]; isCorrupted: boolean; reason: string } {
  const shouldCorrupt = Math.random() < 0.55;
  if (!shouldCorrupt) {
    return {
      tokens: cloneTokens(barData.correctTokens),
      isCorrupted: false,
      reason: '此小節休止符寫法符合該拍號分拍規則。',
    };
  }

  if (barData.timeSignature === '4/4') {
    // Classic error: use minim rest across beat 2 to beat 3 boundary.
    const corrupted = [token(0, 2, false), token(2, 4, true), token(6, 2, true)];
    return {
      tokens: corrupted,
      isCorrupted: true,
      reason: '4/4 中不應用二分休止符跨越第 2 拍與第 3 拍（小節中線）。應切分為符合拍點的休止符。',
    };
  }

  if (barData.timeSignature === '3/4') {
    // Wrong: one minim rest covering beat 2 and 3.
    const corrupted = [token(0, 2, false), token(2, 4, true)];
    return {
      tokens: corrupted,
      isCorrupted: true,
      reason: '3/4 中第 2、3 拍不應合併為單一二分休止符，應保留每拍可辨識性。',
    };
  }

  // 6/8 compound error: quarter rest used in the back part of first compound beat
  // where the notation should normally reflect quaver-level placement.
  const corrupted = [token(0, 1, false), token(1, 2, true), token(3, 1, false), token(4, 1, false), token(5, 1, false)];
  return {
    tokens: corrupted,
    isCorrupted: true,
    reason: '6/8 是複拍子，休止符需反映 3+3 的拍群。這裡以單一四分休止符覆蓋細分位置，寫法不恰當。',
  };
}

export function generateRestAuditQuestion(): RestAuditQuestion {
  const bar = randomItem(TEMPLATES);
  const injected = injectRestError(bar);

  return {
    timeSignature: bar.timeSignature,
    tokens: injected.tokens,
    isNotationCorrect: !injected.isCorrupted,
    explanation: injected.reason,
  };
}
