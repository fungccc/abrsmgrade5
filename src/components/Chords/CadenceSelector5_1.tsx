import { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { CadenceSelectorQuestion, Roman } from '../../utils/music-logic/chords';

interface Props {
  question: CadenceSelectorQuestion;
  answers: Record<string, Roman | null>;
  submitted: boolean;
  onSelect: (id: string, value: Roman) => void;
}

function renderMelody(container: HTMLDivElement, notes: CadenceSelectorQuestion['melody1']): void {
  container.innerHTML = '';
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(920, 150);
  const ctx = renderer.getContext();
  const stave = new Stave(8, 30, 890);
  stave.addClef('treble').addTimeSignature('3/4');
  stave.setContext(ctx).draw();

  const staveNotes = notes.map((n) => new StaveNote({ keys: [`${n.name[0].toLowerCase()}/4`], duration: '8', clef: 'treble' }));
  const voice = new Voice({ num_beats: notes.length, beat_value: 8 });
  voice.addTickables(staveNotes);
  new Formatter().joinVoices([voice]).format([voice], 760);
  voice.draw(ctx, stave);
}

export function CadenceSelector5_1({ question, answers, submitted, onSelect }: Props): JSX.Element {
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const romans: Roman[] = ['I', 'II', 'IV', 'V'];

  useEffect(() => {
    if (topRef.current) renderMelody(topRef.current, question.melody1);
    if (bottomRef.current) renderMelody(bottomRef.current, question.melody2);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">5.1 終止式配對：在方格選擇 I, II, IV 或 V。</p>

      <div className="relative overflow-x-auto">
        <div ref={topRef} />
        {/* bracket mock by absolute CSS lines */}
        <div className="pointer-events-none absolute bottom-3 left-[62%] h-5 w-28 border-b border-stone-700" />
        <div className="pointer-events-none absolute bottom-3 left-[78%] h-5 w-20 border-b border-stone-700" />
      </div>

      <div className="relative overflow-x-auto">
        <div ref={bottomRef} />
        <div className="pointer-events-none absolute bottom-3 left-[36%] h-5 w-28 border-b border-stone-700" />
        <div className="pointer-events-none absolute bottom-3 left-[56%] h-5 w-28 border-b border-stone-700" />
        <div className="pointer-events-none absolute bottom-3 left-[78%] h-5 w-20 border-b border-stone-700" />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {question.boxes.map((box) => {
          const selected = answers[box.id] ?? null;
          const ok = submitted && selected === box.answer;
          const bad = submitted && selected !== null && selected !== box.answer;
          return (
            <div key={box.id} className={`rounded border p-2 ${ok ? 'border-emerald-500 bg-emerald-50' : bad ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}>
              <p className="mb-2 text-xs text-stone-600">{box.id}</p>
              <select value={selected ?? ''} onChange={(e) => onSelect(box.id, e.target.value as Roman)} className="w-full rounded border px-2 py-1 text-sm">
                <option value="">請選擇</option>
                {romans.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
