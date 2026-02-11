import { useEffect, useMemo, useRef } from 'react';
import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { InteractiveWriterQuestion, NoteObj } from '../../utils/music-logic/intervals';
import { IntervalEngine } from '../../utils/music-logic/intervals';

interface Props {
  question: InteractiveWriterQuestion;
  current: NoteObj;
  submitted: boolean;
  onMoveStep: (dir: 1 | -1) => void;
  onSetAccidental: (acc: NoteObj['accidental']) => void;
  onReset: () => void;
}

export function InteractiveIntervalWriter({ question, current, submitted, onMoveStep, onSetAccidental, onReset }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(500, 190);
    const ctx = renderer.getContext();
    const stave = new Stave(16, 46, 460);
    stave.addClef(question.clef);
    stave.setContext(ctx).draw();

    const chord = new StaveNote({
      keys: [IntervalEngine.toVexKey(question.given), IntervalEngine.toVexKey(current)],
      duration: 'w',
      clef: question.clef,
    });
    const a1 = IntervalEngine.accidentalForVex(question.given);
    const a2 = IntervalEngine.accidentalForVex(current);
    if (a1) chord.addModifier(new Accidental(a1), 0);
    if (a2) chord.addModifier(new Accidental(a2), 1);

    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([chord]);
    new Formatter().joinVoices([voice]).format([voice], 220);
    voice.draw(ctx, stave);
  }, [question, current]);

  const isExactMatch = useMemo(
    () =>
      IntervalEngine.toMidi(current) === IntervalEngine.toMidi(question.target) &&
      IntervalEngine.name(current) === IntervalEngine.name(question.target),
    [current, question.target],
  );

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">4.3 構寫音程：將上方可調整音符移到「{question.label}」（高於給定音）。</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onMoveStep(1)} className="rounded border px-3 py-1 text-sm">↑ Up</button>
        <button type="button" onClick={() => onMoveStep(-1)} className="rounded border px-3 py-1 text-sm">↓ Down</button>
        <button type="button" onClick={() => onSetAccidental('#')} className="rounded border px-3 py-1 text-sm">#</button>
        <button type="button" onClick={() => onSetAccidental('b')} className="rounded border px-3 py-1 text-sm">b</button>
        <button type="button" onClick={() => onSetAccidental('')} className="rounded border px-3 py-1 text-sm">Natural</button>
        <button type="button" onClick={onReset} className="rounded border px-3 py-1 text-sm">Reset</button>
      </div>
      {submitted && (
        <p className="text-sm">
          {isExactMatch
            ? '答案正確（含拼寫）。'
            : `尚未正確。目標是 ${IntervalEngine.name(question.target)}（不是只看同音異名）。`}
        </p>
      )}
    </div>
  );
}
