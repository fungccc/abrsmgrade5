import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PitchComparison2_4 } from './PitchComparison2_4';
import { PitchQuestion2_1 } from './PitchQuestion2_1';
import { PitchQuestion2_2 } from './PitchQuestion2_2';
import { TranspositionQuestion2_3 } from './TranspositionQuestion2_3';
import {
  generateEnharmonicQuestion2_2,
  generateNamingQuestion2_1,
  generatePitchComparisonQuestion2_4,
  generateTranspositionQuestion2_3,
  type EnharmonicQuestion,
  type NamedNoteQuestion,
  type PitchComparisonQuestion,
  type TranspositionAuditQuestion,
  type NoteLetter,
} from '../../utils/music-logic/pitch';

type PitchMode = '2.1' | '2.2' | '2.3' | '2.4' | 'mixed';
type PitchKind = 'name' | 'enharmonic' | 'transpose' | 'compare';

export function PitchSection(): JSX.Element {
  const [mode, setMode] = useState<PitchMode>('2.1');
  const [mixedKind, setMixedKind] = useState<PitchKind>('name');

  const [q21, setQ21] = useState<NamedNoteQuestion>(() => generateNamingQuestion2_1());
  const [q22, setQ22] = useState<EnharmonicQuestion>(() => generateEnharmonicQuestion2_2());
  const [q23, setQ23] = useState<TranspositionAuditQuestion>(() => generateTranspositionQuestion2_3());
  const [q24, setQ24] = useState<PitchComparisonQuestion>(() => generatePitchComparisonQuestion2_4());

  const [ans21, setAns21] = useState<NoteLetter | null>(null);
  const [ans22, setAns22] = useState<string | null>(null);
  const [ans23, setAns23] = useState<Record<string, 'tick' | 'cross' | null>>({});
  const [ans24, setAns24] = useState<Record<string, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const active = mode === 'mixed' ? mixedKind : mode === '2.1' ? 'name' : mode === '2.2' ? 'enharmonic' : mode === '2.3' ? 'transpose' : 'compare';

  const randomizeMixed = () => {
    const kinds: PitchKind[] = ['name', 'enharmonic', 'transpose', 'compare'];
    setMixedKind(kinds[Math.floor(Math.random() * kinds.length)]);
  };

  const resetSubmission = () => setSubmitted(false);

  const onNext = () => {
    if (active === 'name') {
      setQ21(generateNamingQuestion2_1());
      setAns21(null);
    }
    if (active === 'enharmonic') {
      setQ22(generateEnharmonicQuestion2_2());
      setAns22(null);
    }
    if (active === 'transpose') {
      setQ23(generateTranspositionQuestion2_3());
      setAns23({});
    }
    if (active === 'compare') {
      setQ24(generatePitchComparisonQuestion2_4());
      setAns24({});
    }
    if (mode === 'mixed') randomizeMixed();
    setSubmitted(false);
  };

  const canSubmit = useMemo(() => {
    if (active === 'name') return ans21 !== null;
    if (active === 'enharmonic') return ans22 !== null;
    if (active === 'transpose') return q23.checks.every((check) => ans23[check.id]);
    return q24.statements.every((s) => ans24[s.id] !== null && ans24[s.id] !== undefined);
  }, [active, ans21, ans22, ans23, ans24, q23.checks, q24.statements]);

  const activeCorrect = useMemo(() => {
    if (!submitted) return false;
    if (active === 'name') return ans21 === q21.correct;
    if (active === 'enharmonic') return ans22 === q22.correct;
    if (active === 'transpose') return q23.checks.every((check) => (ans23[check.id] === 'tick') === check.isCorrect);
    return q24.statements.every((s) => ans24[s.id] === s.answer);
  }, [submitted, active, ans21, ans22, ans23, ans24, q21.correct, q22.correct, q23.checks, q24.statements]);

  const feedback =
    active === 'name'
      ? `正確答案是 ${q21.correct}。`
      : active === 'enharmonic'
        ? `正確同音異名是 ${q22.correct}。`
        : active === 'transpose'
          ? '請逐一比對調號與每個音：移調距離、臨時記號、調號缺漏都是常見錯誤。'
          : '重點在不同譜號下中央 C 與八度位置的實際 MIDI 音高。';

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-2">
        {([
          ['2.1', '2.1 辨識音名'],
          ['2.2', '2.2 同音異名'],
          ['2.3', '2.3 移調與除錯'],
          ['2.4', '2.4 音高比較'],
          ['mixed', '隨機混合'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              resetSubmission();
              if (id === 'mixed') randomizeMixed();
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              mode === id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {active === 'name' && <PitchQuestion2_1 question={q21} selected={ans21} submitted={submitted} onSelect={setAns21} />}
      {active === 'enharmonic' && <PitchQuestion2_2 question={q22} selected={ans22} submitted={submitted} onSelect={setAns22} />}
      {active === 'transpose' && <TranspositionQuestion2_3 question={q23} marks={ans23} submitted={submitted} onMark={(id, v) => setAns23((prev) => ({ ...prev, [id]: v }))} />}
      {active === 'compare' && <PitchComparison2_4 question={q24} answers={ans24} submitted={submitted} onAnswer={(id, v) => setAns24((prev) => ({ ...prev, [id]: v }))} />}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canSubmit || submitted}
          onClick={() => setSubmitted(true)}
          className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          檢查答案
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold"
        >
          <RefreshCw size={16} /> 下一題
        </button>
      </div>

      {submitted && (
        <div className={`rounded-lg border p-3 text-sm ${activeCorrect ? 'border-emerald-400 bg-emerald-50' : 'border-red-400 bg-red-50'}`}>
          <p className="font-semibold">{activeCorrect ? '答對了！' : '再檢查一次：'}</p>
          <p>{feedback}</p>
        </div>
      )}
    </section>
  );
}
