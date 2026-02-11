import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { EnharmonicQuestion } from '../../utils/music-logic/pitch';
import { PitchLogic } from '../../utils/music-logic/pitch';

interface Props {
  question: EnharmonicQuestion;
  selected: string | null;
  submitted: boolean;
  onSelect: (choice: string) => void;
}

export function PitchQuestion2_2({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(380, 170);
    const ctx = renderer.getContext();
    const stave = new Stave(16, 45, 340);
    stave.addClef(question.clef);
    stave.setContext(ctx).draw();

    const note = new StaveNote({ keys: [PitchLogic.toVexKey(question.source)], duration: 'w', clef: question.clef });
    const acc = PitchLogic.vexAccidental(question.source);
    if (acc) note.addModifier(new Accidental(acc), 0);

    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.addTickables([note]);
    new Formatter().joinVoices([voice]).format([voice], 220);
    voice.draw(ctx, stave);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-sm text-stone-600 dark:text-stone-300">2.2 同音異名：請選出等音。</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {question.choices.map((choice) => {
          const isCorrect = submitted && choice === question.correct;
          const isWrong = submitted && selected === choice && choice !== question.correct;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onSelect(choice)}
              className={`rounded border px-3 py-2 text-sm font-semibold ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : isWrong
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : selected === choice
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white'
              }`}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
