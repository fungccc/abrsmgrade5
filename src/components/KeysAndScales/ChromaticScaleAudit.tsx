import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { ChromaticAuditQuestion } from '../../utils/music-logic/scales';

interface Props {
  question: ChromaticAuditQuestion;
  selected: boolean | null;
  submitted: boolean;
  onSelect: (value: boolean) => void;
}

export function ChromaticScaleAudit({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(860, 160);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 35, 820);
    stave.addClef(question.clef);
    stave.setContext(ctx).draw();

    const notes = question.shown.map((n) => {
      const [letter, accidental = ''] = [n.name[0], n.name.slice(1)];
      const note = new StaveNote({ keys: [`${letter.toLowerCase()}/4`], duration: '8', clef: question.clef });
      if (accidental) note.addModifier(new Accidental(accidental === 'x' ? '##' : accidental), 0);
      return note;
    });

    const voice = new Voice({ num_beats: notes.length, beat_value: 8 });
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 700);
    voice.draw(ctx, stave);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">3.6 半音階判斷：這是正確寫法嗎？</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="flex gap-2">
        <button type="button" onClick={() => onSelect(true)} className={`rounded border px-3 py-1 ${selected === true ? 'bg-stone-900 text-white' : 'bg-white'}`}>TRUE</button>
        <button type="button" onClick={() => onSelect(false)} className={`rounded border px-3 py-1 ${selected === false ? 'bg-stone-900 text-white' : 'bg-white'}`}>FALSE</button>
      </div>
      {submitted && <p className="text-sm">{question.isCorrect === selected ? '判斷正確。' : `判斷錯誤：${question.explanation}`}</p>}
    </div>
  );
}
