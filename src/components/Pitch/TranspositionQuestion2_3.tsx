import { useEffect, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { TranspositionAuditQuestion } from '../../utils/music-logic/pitch';
import { PitchLogic } from '../../utils/music-logic/pitch';

interface Props {
  question: TranspositionAuditQuestion;
  marks: Record<string, 'tick' | 'cross' | null>;
  submitted: boolean;
  onMark: (id: string, value: 'tick' | 'cross') => void;
}

function drawBar(container: HTMLDivElement, clef: string, key: string, notesData: TranspositionAuditQuestion['model']): void {
  container.innerHTML = '';
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(780, 180);
  const ctx = renderer.getContext();
  const stave = new Stave(12, 40, 740);
  stave.addClef(clef).addKeySignature(key).addTimeSignature('6/8');
  stave.setContext(ctx).draw();

  const notes = notesData.map((n) => {
    const note = new StaveNote({ keys: [PitchLogic.toVexKey(n)], duration: '8', clef });
    const acc = PitchLogic.vexAccidental(n);
    if (acc) note.addModifier(new Accidental(acc), 0);
    return note;
  });

  const voice = new Voice({ numBeats: 6, beatValue: 8 });
  voice.addTickables(notes);
  new Formatter().joinVoices([voice]).format([voice], 560);
  voice.draw(ctx, stave);
}

export function TranspositionQuestion2_3({ question, marks, submitted, onMark }: Props): JSX.Element {
  const topRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (topRef.current) drawBar(topRef.current, question.clef, question.modelKey, question.model);
    if (bottomRef.current) drawBar(bottomRef.current, question.clef, question.wrongAnswerKey, question.shown);
  }, [question]);

  return (
    <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-sm text-stone-600 dark:text-stone-300">2.3 移調與除錯：{question.prompt}</p>
      <div className="overflow-x-auto" ref={topRef} />
      <div className="overflow-x-auto" ref={bottomRef} />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {question.checks.map((check) => {
          const selected = marks[check.id];
          const correct = submitted && ((selected === 'tick') === check.isCorrect);
          const wrong = submitted && !((selected === 'tick') === check.isCorrect);
          return (
            <div key={check.id} className={`rounded border p-2 ${correct ? 'border-emerald-400' : wrong ? 'border-red-400' : 'border-stone-300'}`}>
              <p className="mb-2 text-xs font-semibold text-stone-600">{check.label}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => onMark(check.id, 'tick')} className={`rounded px-2 py-1 text-xs ${selected === 'tick' ? 'bg-stone-900 text-white' : 'bg-stone-100'}`}>
                  ✓
                </button>
                <button type="button" onClick={() => onMark(check.id, 'cross')} className={`rounded px-2 py-1 text-xs ${selected === 'cross' ? 'bg-stone-900 text-white' : 'bg-stone-100'}`}>
                  ✗
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
