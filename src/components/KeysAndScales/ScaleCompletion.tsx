import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, TextNote, Voice } from 'vexflow';
import type { ScaleCompletionQuestion } from '../../utils/music-logic/scales';

interface Props {
  question: ScaleCompletionQuestion;
  x: string | null;
  y: string | null;
  submitted: boolean;
  onSelectX: (v: string) => void;
  onSelectY: (v: string) => void;
}

function makeNote(name: string, clef: string): StaveNote {
  const letter = name[0].toLowerCase();
  const accidental = name.slice(1);
  const n = new StaveNote({ keys: [`${letter}/4`], duration: 'q', clef });
  if (accidental) n.addModifier(new Accidental(accidental === 'x' ? '##' : accidental), 0);
  return n;
}

export function ScaleCompletion({ question, x, y, submitted, onSelectX, onSelectY }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(980, 170);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 36, 940);
    stave.addClef(question.clef);
    stave.setContext(ctx).draw();

    const notes = question.notes.map((n, idx) => {
      if (n) return makeNote(n.name, question.clef);
      return new TextNote({ text: idx === question.missingIndexes[0] ? 'X' : 'Y', duration: 'q', line: 9 });
    });

    const voice = new Voice({ num_beats: notes.length, beat_value: 4 });
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 860);
    voice.draw(ctx, stave);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">3.4 音階填空：完成 {question.tonic} {question.scaleType === 'harmonicMinor' ? 'harmonic minor' : 'melodic minor'} 音階。</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold">X</p>
          <div className="flex flex-wrap gap-2">{question.optionsX.map((o) => <button key={o} type="button" onClick={() => onSelectX(o)} className={`rounded border px-2 py-1 text-xs ${x===o?'bg-stone-900 text-white':''}`}>{o}</button>)}</div>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold">Y</p>
          <div className="flex flex-wrap gap-2">{question.optionsY.map((o) => <button key={o} type="button" onClick={() => onSelectY(o)} className={`rounded border px-2 py-1 text-xs ${y===o?'bg-stone-900 text-white':''}`}>{o}</button>)}</div>
        </div>
      </div>
      {submitted && <p className="text-sm">{x === question.answerX && y === question.answerY ? '填答正確。' : `答案：X=${question.answerX}，Y=${question.answerY}`}</p>}
    </div>
  );
}
