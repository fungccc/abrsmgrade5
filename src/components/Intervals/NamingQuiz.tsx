import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { NamingIntervalQuestion } from '../../utils/music-logic/intervals';
import { IntervalEngine } from '../../utils/music-logic/intervals';

interface Props {
  question: NamingIntervalQuestion;
  selected: string | null;
  submitted: boolean;
  onSelect: (value: string) => void;
}

export function NamingQuiz({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(420, 180);
    const ctx = renderer.getContext();
    const stave = new Stave(16, 44, 380);
    stave.addClef(question.clef);
    stave.setContext(ctx).draw();

    // Harmonic interval (stacked notes) requirement:
    const chord = new StaveNote({
      keys: [IntervalEngine.toVexKey(question.lower), IntervalEngine.toVexKey(question.upper)],
      duration: 'w',
      clef: question.clef,
    });

    const lowAcc = IntervalEngine.accidentalForVex(question.lower);
    const highAcc = IntervalEngine.accidentalForVex(question.upper);
    if (lowAcc) chord.addModifier(new Accidental(lowAcc), 0);
    if (highAcc) chord.addModifier(new Accidental(highAcc), 1);

    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.addTickables([chord]);
    new Formatter().joinVoices([voice]).format([voice], 180);
    voice.draw(ctx, stave);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">4.1 命名音程：請選出正確音程名稱。</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="space-y-2">
        {question.options.map((o) => {
          const ok = submitted && o === question.answer;
          const wrong = submitted && selected === o && o !== question.answer;
          return (
            <label key={o} className={`flex items-center gap-2 rounded border px-3 py-2 ${ok ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}>
              <input type="radio" name="interval-name" checked={selected === o} onChange={() => onSelect(o)} />
              <span className="text-sm">{o}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
