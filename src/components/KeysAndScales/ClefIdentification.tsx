import { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { ClefIdentificationQuestion, ClefType } from '../../utils/music-logic/scales';

interface Props {
  question: ClefIdentificationQuestion;
  selected: ClefType | null;
  submitted: boolean;
  onSelect: (clef: ClefType) => void;
}

export function ClefIdentification({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(930, 160);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 36, 890);
    stave.setContext(ctx).draw();

    const notes = question.notes.map((n) => new StaveNote({ keys: [`${n.name[0].toLowerCase()}/4`], duration: '8', clef: 'treble' }));
    const voice = new Voice({ numBeats: notes.length, beatValue: 8 });
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 760);
    voice.draw(ctx, stave);
  }, [question]);

  const options: ClefType[] = ['treble', 'bass', 'alto', 'tenor'];

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">3.5 譜號反推：若此旋律為 {question.targetMinor}，應使用哪個譜號？</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {options.map((c) => <button key={c} type="button" onClick={() => onSelect(c)} className={`rounded border px-3 py-1 text-sm ${selected===c?'bg-stone-900 text-white':''}`}>{c}</button>)}
      </div>
      {submitted && <p className="text-sm">{selected === question.correctClef ? '判斷正確。' : `正確譜號：${question.correctClef}`}</p>}
    </div>
  );
}
