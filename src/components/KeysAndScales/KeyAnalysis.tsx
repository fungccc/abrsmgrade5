import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { KeyAnalysisQuestion } from '../../utils/music-logic/scales';

interface Props {
  question: KeyAnalysisQuestion;
  selected: string | null;
  submitted: boolean;
  onSelect: (value: string) => void;
}

export function KeyAnalysis({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(860, 170);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 36, 820);
    stave.addClef(question.clef).addTimeSignature('4/4');
    stave.setContext(ctx).draw();

    const notes = question.melody.map((n) => {
      const note = new StaveNote({ keys: [`${n.name[0].toLowerCase()}/4`], duration: '8', clef: question.clef });
      const acc = n.name.slice(1);
      if (acc) note.addModifier(new Accidental(acc === 'x' ? '##' : acc), 0);
      return note;
    });

    const voice = new Voice({ num_beats: notes.length, beat_value: 8 });
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 680);
    voice.draw(ctx, stave);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">3.3 調性分析：選出這段旋律最可能的調。</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {question.options.map((o) => <button key={o} type="button" onClick={() => onSelect(o)} className={`rounded border px-3 py-1 text-sm ${selected===o?'bg-stone-900 text-white':''}`}>{o}</button>)}
      </div>
      {submitted && <p className="text-sm">{selected === question.correctKey ? '正確。' : `正確答案：${question.correctKey}`}</p>}
    </div>
  );
}
