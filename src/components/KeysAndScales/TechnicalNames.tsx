import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { TechnicalNamesQuestion } from '../../utils/music-logic/scales';

interface Props {
  question: TechnicalNamesQuestion;
  selected: boolean | null;
  submitted: boolean;
  onSelect: (value: boolean) => void;
}

export function TechnicalNames({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(320, 150);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 30, 290);
    stave.addClef(question.clef);
    stave.setContext(ctx).draw();

    const note = new StaveNote({ keys: [`${question.shownNote.name[0].toLowerCase()}/4`], duration: 'w', clef: question.clef });
    const acc = question.shownNote.name.slice(1);
    if (acc) note.addModifier(new Accidental(acc === 'x' ? '##' : acc), 0);

    const voice = new Voice({ numBeats: 4, beatValue: 4 });
    voice.addTickables([note]);
    new Formatter().joinVoices([voice]).format([voice], 160);
    voice.draw(ctx, stave);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div ref={ref} className="overflow-x-auto" />
      <p className="text-sm">3.7 {question.statement} - True/False?</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSelect(true)} className={`rounded border px-3 py-1 ${selected===true?'bg-stone-900 text-white':''}`}>TRUE</button>
        <button type="button" onClick={() => onSelect(false)} className={`rounded border px-3 py-1 ${selected===false?'bg-stone-900 text-white':''}`}>FALSE</button>
      </div>
      {submitted && <p className="text-sm">{selected === question.isTrue ? '判斷正確。' : '判斷錯誤。'}</p>}
    </div>
  );
}
