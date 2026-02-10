import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { IntervalQuality, QualityQuestion } from '../../utils/music-logic/intervals';
import { IntervalEngine } from '../../utils/music-logic/intervals';

interface Props {
  question: QualityQuestion;
  selected: IntervalQuality | null;
  submitted: boolean;
  onSelect: (v: IntervalQuality) => void;
}

function drawSingle(container: HTMLDivElement, clef: string, noteKey: string, accidental: string | null): void {
  container.innerHTML = '';
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(220, 130);
  const ctx = renderer.getContext();
  const stave = new Stave(8, 30, 200);
  stave.addClef(clef);
  stave.setContext(ctx).draw();
  const note = new StaveNote({ keys: [noteKey], duration: 'w', clef });
  if (accidental) note.addModifier(new Accidental(accidental), 0);
  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.addTickables([note]);
  new Formatter().joinVoices([voice]).format([voice], 120);
  voice.draw(ctx, stave);
}

export function QualitySelector({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const lowRef = useRef<HTMLDivElement | null>(null);
  const highRef = useRef<HTMLDivElement | null>(null);
  const choices: IntervalQuality[] = ['perfect', 'major', 'minor', 'diminished', 'augmented'];

  useEffect(() => {
    if (lowRef.current) {
      drawSingle(lowRef.current, question.lowClef, IntervalEngine.toVexKey(question.lower), IntervalEngine.accidentalForVex(question.lower));
    }
    if (highRef.current) {
      drawSingle(highRef.current, question.highClef, IntervalEngine.toVexKey(question.upper), IntervalEngine.accidentalForVex(question.upper));
    }
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">4.2 判斷性質：請選出音程 quality。</p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div ref={lowRef} className="overflow-x-auto" />
        <div ref={highRef} className="overflow-x-auto" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {choices.map((q) => {
          const ok = submitted && q === question.answer;
          const wrong = submitted && selected === q && q !== question.answer;
          return (
            <button key={q} type="button" onClick={() => onSelect(q)} className={`rounded border px-3 py-2 text-sm font-semibold ${ok ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-red-500 bg-red-50' : selected === q ? 'bg-stone-900 text-white' : 'border-stone-300'}`}>
              {q}
            </button>
          );
        })}
      </div>
    </div>
  );
}
