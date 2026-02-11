import { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { PitchComparisonQuestion } from '../../utils/music-logic/pitch';
import { PitchLogic } from '../../utils/music-logic/pitch';

interface Props {
  question: PitchComparisonQuestion;
  answers: Record<string, boolean | null>;
  submitted: boolean;
  onAnswer: (id: string, value: boolean) => void;
}

function BarView({ id, clef, note }: { id: string; clef: string; note: string }): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(280, 140);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 32, 250);
    stave.addClef(clef).addTimeSignature('3/4');
    stave.setContext(ctx).draw();

    const staveNote = new StaveNote({ keys: [note], duration: 'w', clef });
    const voice = new Voice({ numBeats: 3, beatValue: 4 });
    voice.addTickables([staveNote]);
    new Formatter().joinVoices([voice]).format([voice], 120);
    voice.draw(ctx, stave);
  }, [clef, note]);

  return (
    <div className="rounded border border-stone-300 p-2">
      <p className="text-sm font-semibold">Bar {id}</p>
      <div ref={ref} className="overflow-x-auto" />
    </div>
  );
}

export function PitchComparison2_4({ question, answers, submitted, onAnswer }: Props): JSX.Element {
  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-sm text-stone-600 dark:text-stone-300">2.4 音高比較：比較 A/B/C 的實際音高，判斷下列敘述 True/False。</p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {question.bars.map((bar) => (
          <BarView key={bar.id} id={bar.id} clef={bar.clef} note={PitchLogic.toVexKey(bar.notes[0])} />
        ))}
      </div>

      <div className="space-y-2">
        {question.statements.map((s) => {
          const selected = answers[s.id];
          const isCorrect = submitted && selected !== null && selected === s.answer;
          const isWrong = submitted && selected !== null && selected !== s.answer;

          return (
            <div key={s.id} className={`rounded border p-2 ${isCorrect ? 'border-emerald-400' : isWrong ? 'border-red-400' : 'border-stone-300'}`}>
              <p className="mb-2 text-sm">{s.text}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => onAnswer(s.id, true)} className={`rounded px-3 py-1 text-xs ${selected === true ? 'bg-stone-900 text-white' : 'bg-stone-100'}`}>
                  TRUE
                </button>
                <button type="button" onClick={() => onAnswer(s.id, false)} className={`rounded px-3 py-1 text-xs ${selected === false ? 'bg-stone-900 text-white' : 'bg-stone-100'}`}>
                  FALSE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
