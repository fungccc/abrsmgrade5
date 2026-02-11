import { useEffect, useRef, useState } from 'react';
import { Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { RestAuditQuestion } from '../../utils/music-logic/restAuditGenerator';

interface RestAuditQuestionProps {
  question: RestAuditQuestion;
  selectedJudgement: boolean | null;
  onSelectJudgement: (value: boolean) => void;
  isSubmitted: boolean;
}

export function RestAuditQuestionView({
  question,
  selectedJudgement,
  onSelectJudgement,
  isSubmitted,
}: RestAuditQuestionProps): JSX.Element {
  const staveRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const container = staveRef.current;
    if (!container) return;

    // rerender-safe clearing for question switching.
    container.innerHTML = '';
    setErrorMessage(null);

    try {
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(760, 190);
      const context = renderer.getContext();

      const stave = new Stave(18, 46, 720);
      stave.addClef('treble').addTimeSignature(question.timeSignature);
      stave.setContext(context).draw();

      const notes = question.tokens.map((token) => {
        const note = new StaveNote({ keys: ['b/4'], duration: token.vexDuration, clef: 'treble' });
        if (token.dots) {
          for (let i = 0; i < token.dots; i += 1) note.addDotToAll();
        }
        return note;
      });

      const [beats, beatValue] = question.timeSignature.split('/').map(Number);
      const voice = new Voice({ num_beats: beats, beat_value: beatValue }).setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);

      new Formatter().joinVoices([voice]).format([voice], 620);
      voice.draw(context, stave);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '未知渲染錯誤';
      setErrorMessage(`渲染失敗：${msg}`);
    }
  }, [question]);

  const isCorrectChoice = isSubmitted && selectedJudgement !== null && selectedJudgement === question.isNotationCorrect;

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-sm text-stone-600 dark:text-stone-300">題目 1.5：判斷此小節休止符寫法是正確（✓）還是錯誤（✗）。</p>
      <div ref={staveRef} className="min-h-[180px] overflow-x-auto" />
      {errorMessage && <p className="text-sm text-red-600 dark:text-red-300">{errorMessage}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelectJudgement(true)}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            selectedJudgement === true
              ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
              : 'border-stone-300 bg-white hover:border-stone-500 dark:border-stone-600 dark:bg-stone-900'
          }`}
        >
          ✓ Correct
        </button>
        <button
          type="button"
          onClick={() => onSelectJudgement(false)}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            selectedJudgement === false
              ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
              : 'border-stone-300 bg-white hover:border-stone-500 dark:border-stone-600 dark:bg-stone-900'
          }`}
        >
          ✗ Incorrect
        </button>
      </div>

      {isSubmitted && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            isCorrectChoice
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-100'
              : 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-100'
          }`}
        >
          {isCorrectChoice ? '判斷正確！' : '判斷有誤，請看解析：'} {question.explanation}
        </p>
      )}
    </div>
  );
}
