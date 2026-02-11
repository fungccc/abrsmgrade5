import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { CadenceSelector5_1 } from './CadenceSelector5_1';
import { CadenceTypeQuiz5_2 } from './CadenceTypeQuiz5_2';
import { ChordAnalysis5_3 } from './ChordAnalysis5_3';
import {
  generateCadenceSelector5_1,
  generateCadenceType5_2,
  generateChordAnalysis5_3,
  type CadenceType,
  type Roman,
} from '../../utils/music-logic/chords';

type Mode = '5.1' | '5.2' | '5.3' | 'mixed';
type Kind = 'selector' | 'cadenceType' | 'analysis';

export function ChordsSection(): JSX.Element {
  const [mode, setMode] = useState<Mode>('5.1');
  const [mixed, setMixed] = useState<Kind>('selector');

  const [q51, setQ51] = useState(() => generateCadenceSelector5_1());
  const [q52, setQ52] = useState(() => generateCadenceType5_2());
  const [q53, setQ53] = useState(() => generateChordAnalysis5_3());

  const [a51, setA51] = useState<Record<string, Roman | null>>({});
  const [a52, setA52] = useState<CadenceType | null>(null);
  const [a53, setA53] = useState<Record<'A' | 'B' | 'C', string | null>>({ A: null, B: null, C: null });
  const [submitted, setSubmitted] = useState(false);

  const active: Kind = mode === 'mixed' ? mixed : mode === '5.1' ? 'selector' : mode === '5.2' ? 'cadenceType' : 'analysis';

  const randomizeMixed = () => {
    const pool: Kind[] = ['selector', 'cadenceType', 'analysis'];
    setMixed(pool[Math.floor(Math.random() * pool.length)]);
  };

  const canSubmit =
    active === 'selector'
      ? q51.boxes.every((b) => a51[b.id])
      : active === 'cadenceType'
        ? a52 !== null
        : q53.labels.every((l) => a53[l.id] !== null);

  const onNext = () => {
    if (active === 'selector') {
      setQ51(generateCadenceSelector5_1());
      setA51({});
    }
    if (active === 'cadenceType') {
      setQ52(generateCadenceType5_2());
      setA52(null);
    }
    if (active === 'analysis') {
      setQ53(generateChordAnalysis5_3());
      setA53({ A: null, B: null, C: null });
    }
    if (mode === 'mixed') randomizeMixed();
    setSubmitted(false);
  };

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {([
          ['5.1', '5.1 終止式配對'],
          ['5.2', '5.2 辨識終止式'],
          ['5.3', '5.3 和弦分析'],
          ['mixed', '隨機混合'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setMode(id); setSubmitted(false); if (id==='mixed') randomizeMixed(); }} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${mode===id?'bg-stone-900 text-white':''}`}>
            {label}
          </button>
        ))}
      </div>

      {active === 'selector' && (
        <CadenceSelector5_1
          question={q51}
          answers={a51}
          submitted={submitted}
          onSelect={(id, value) => setA51((p) => ({ ...p, [id]: value }))}
        />
      )}

      {active === 'cadenceType' && (
        <CadenceTypeQuiz5_2 question={q52} selected={a52} submitted={submitted} onSelect={setA52} />
      )}

      {active === 'analysis' && (
        <ChordAnalysis5_3
          question={q53}
          answers={a53}
          submitted={submitted}
          onSelect={(id, value) => setA53((p) => ({ ...p, [id]: value }))}
        />
      )}

      <div className="flex gap-2">
        <button type="button" disabled={!canSubmit || submitted} onClick={() => setSubmitted(true)} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Submit
        </button>
        <button type="button" onClick={onNext} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
          <RefreshCw size={16} /> 下一題
        </button>
      </div>
    </section>
  );
}
