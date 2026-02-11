import { useEffect, useRef, useState } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { NamedNoteQuestion, NoteLetter } from '../../utils/music-logic/pitch';
import { PitchLogic } from '../../utils/music-logic/pitch';

interface Props {
  question: NamedNoteQuestion;
  selected: NoteLetter | null;
  submitted: boolean;
  onSelect: (note: NoteLetter) => void;
}

export function PitchQuestion2_1({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    setError(null);

    try {
      const renderer = new Renderer(el, Renderer.Backends.SVG);
      renderer.resize(380, 170);
      const ctx = renderer.getContext();
      const stave = new Stave(16, 45, 340);
      stave.addClef(question.clef);
      stave.setContext(ctx).draw();

      const n = question.note;
      const note = new StaveNote({ keys: [PitchLogic.toVexKey(n)], duration: 'w', clef: question.clef });
      const acc = PitchLogic.vexAccidental(n);
      if (acc) note.addModifier(new Accidental(acc), 0);

      const voice = new Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables([note]);
      new Formatter().joinVoices([voice]).format([voice], 220);
      voice.draw(ctx, stave);
    } catch (e) {
      setError(e instanceof Error ? e.message : '未知錯誤');
    }
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-sm text-stone-600 dark:text-stone-300">2.1 辨識音名：請選出此音符的音名字母。</p>
      <div ref={ref} className="overflow-x-auto" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
        {question.choices.map((c) => {
          const isCorrect = submitted && c === question.correct;
          const isWrong = submitted && selected === c && c !== question.correct;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onSelect(c)}
              className={`rounded border px-3 py-2 text-sm font-semibold ${
                isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : isWrong
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : selected === c
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
