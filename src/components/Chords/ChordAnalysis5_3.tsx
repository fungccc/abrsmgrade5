import { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveConnector, StaveNote, Voice } from 'vexflow';
import type { ChordAnalysisQuestion } from '../../utils/music-logic/chords';

interface Props {
  question: ChordAnalysisQuestion;
  answers: Record<'A' | 'B' | 'C', string | null>;
  submitted: boolean;
  onSelect: (id: 'A' | 'B' | 'C', value: string) => void;
}

export function ChordAnalysis5_3({ question, answers, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(980, 260);
    const ctx = renderer.getContext();

    const top = new Stave(16, 40, 930);
    const bottom = new Stave(16, 150, 930);
    top.addClef('treble').addTimeSignature('4/4').addKeySignature(question.key.split(' ')[0]);
    bottom.addClef('bass').addTimeSignature('4/4').addKeySignature(question.key.split(' ')[0]);
    top.setContext(ctx).draw();
    bottom.setContext(ctx).draw();

    new StaveConnector(top, bottom).setType('singleLeft').setContext(ctx).draw();
    new StaveConnector(top, bottom).setType('brace').setContext(ctx).draw();

    const topNotes = question.trebleTexture.map((n) => new StaveNote({ keys: [`${n.name[0].toLowerCase()}/5`], duration: '8', clef: 'treble' }));
    const bottomNotes = question.bassTexture.map((n) => new StaveNote({ keys: [`${n.name[0].toLowerCase()}/3`], duration: 'q', clef: 'bass' }));

    const vt = new Voice({ numBeats: topNotes.length, beatValue: 8 }).addTickables(topNotes);
    const vb = new Voice({ numBeats: bottomNotes.length, beatValue: 4 }).addTickables(bottomNotes);

    new Formatter().joinVoices([vt]).joinVoices([vb]).format([vt], 780).format([vb], 780);
    vt.draw(ctx, top);
    vb.draw(ctx, bottom);
  }, [question]);

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">5.3 和弦分析與轉位：命名 A/B/C 標記和弦。</p>

      <div className="relative overflow-x-auto">
        <div ref={ref} />
        {/* label/bracket overlay (TextBracket fallback) */}
        <div className="pointer-events-none absolute left-[34%] top-2 border border-stone-700 px-1 text-xs">A</div>
        <div className="pointer-events-none absolute left-[56%] top-2 border border-stone-700 px-1 text-xs">B</div>
        <div className="pointer-events-none absolute left-[70%] top-2 border border-stone-700 px-1 text-xs">C</div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {question.labels.map((label) => {
          const selected = answers[label.id];
          const ok = submitted && selected === label.answer;
          const bad = submitted && selected !== null && selected !== label.answer;
          return (
            <div key={label.id} className={`rounded border p-2 ${ok ? 'border-emerald-500 bg-emerald-50' : bad ? 'border-red-500 bg-red-50' : 'border-stone-300'}`}>
              <p className="mb-2 text-sm font-semibold">Chord {label.id}</p>
              <div className="grid grid-cols-2 gap-2">
                {label.choices.map((c) => (
                  <button key={c} type="button" onClick={() => onSelect(label.id, c)} className={`rounded border px-2 py-1 text-sm ${selected===c?'bg-stone-900 text-white':''}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
