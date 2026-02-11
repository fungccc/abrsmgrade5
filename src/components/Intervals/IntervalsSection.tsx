import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { InteractiveIntervalWriter } from './InteractiveIntervalWriter';
import { NamingQuiz } from './NamingQuiz';
import { QualitySelector } from './QualitySelector';
import {
  generateNamingQuestion,
  generateQualityQuestion,
  generateWriterQuestion,
  type IntervalQuality,
  type NoteObj,
} from '../../utils/music-logic/intervals';

const LETTERS: NoteObj['letter'][] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

type Mode = '4.1' | '4.2' | '4.3' | 'mixed';
type Kind = 'naming' | 'quality' | 'writer';

function moveDiatonic(note: NoteObj, dir: 1 | -1): NoteObj {
  const i = LETTERS.indexOf(note.letter);
  const ni = i + dir;
  const wrapped = ((ni % 7) + 7) % 7;
  const octaveDelta = ni < 0 ? -1 : ni > 6 ? 1 : 0;
  return { ...note, letter: LETTERS[wrapped], octave: note.octave + octaveDelta };
}

export function IntervalsSection(): JSX.Element {
  const [mode, setMode] = useState<Mode>('4.1');
  const [mixedKind, setMixedKind] = useState<Kind>('naming');

  const [q41, setQ41] = useState(() => generateNamingQuestion());
  const [q42, setQ42] = useState(() => generateQualityQuestion());
  const [q43, setQ43] = useState(() => generateWriterQuestion());

  const [a41, setA41] = useState<string | null>(null);
  const [a42, setA42] = useState<IntervalQuality | null>(null);
  const [current43, setCurrent43] = useState<NoteObj>(q43.target);
  const [submitted, setSubmitted] = useState(false);

  const active: Kind = mode === 'mixed' ? mixedKind : mode === '4.1' ? 'naming' : mode === '4.2' ? 'quality' : 'writer';

  const randomizeMixed = () => {
    const pool: Kind[] = ['naming', 'quality', 'writer'];
    setMixedKind(pool[Math.floor(Math.random() * pool.length)]);
  };

  const canSubmit = active === 'naming' ? a41 !== null : active === 'quality' ? a42 !== null : true;

  const onNext = () => {
    if (active === 'naming') {
      setQ41(generateNamingQuestion());
      setA41(null);
    }
    if (active === 'quality') {
      setQ42(generateQualityQuestion());
      setA42(null);
    }
    if (active === 'writer') {
      const q = generateWriterQuestion();
      setQ43(q);
      setCurrent43(q.target);
    }
    if (mode === 'mixed') randomizeMixed();
    setSubmitted(false);
  };

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {([
          ['4.1', '4.1 命名音程'],
          ['4.2', '4.2 判斷性質'],
          ['4.3', '4.3 構寫音程'],
          ['mixed', '隨機混合'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setMode(id); setSubmitted(false); if (id==='mixed') randomizeMixed(); }} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${mode===id ? 'bg-stone-900 text-white' : ''}`}>
            {label}
          </button>
        ))}
      </div>

      {active === 'naming' && <NamingQuiz question={q41} selected={a41} submitted={submitted} onSelect={setA41} />}
      {active === 'quality' && <QualitySelector question={q42} selected={a42} submitted={submitted} onSelect={setA42} />}
      {active === 'writer' && (
        <InteractiveIntervalWriter
          question={q43}
          current={current43}
          submitted={submitted}
          onMoveStep={(d) => setCurrent43((p) => moveDiatonic(p, d))}
          onSetAccidental={(acc) => setCurrent43((p) => ({ ...p, accidental: acc }))}
          onReset={() => setCurrent43(q43.target)}
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
