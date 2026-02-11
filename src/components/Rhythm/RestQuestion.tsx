import { useEffect, useRef, useState } from 'react';
import { Dot, Formatter, Renderer, Stave, StaveNote, TextNote, Voice, type Tickable } from 'vexflow';
import type { RestQuestion, RestQuestionOption } from '../../utils/music-logic/restGenerator';

interface RestQuestionViewProps {
  question: RestQuestion;
  selectedOption: RestQuestionOption | null;
}

export function RestQuestionView({ question, selectedOption }: RestQuestionViewProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    setErrorMessage(null);

    try {
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(760, 210);
      const context = renderer.getContext();

      const stave = new Stave(18, 50, 720);
      stave.addClef('treble').addTimeSignature(question.timeSignature);
      stave.setContext(context).draw();

      const notes: Tickable[] = question.givenNotes.map((token) => {
        const note = new StaveNote({ keys: ['b/4'], duration: token.vexDuration, clef: 'treble' });
        if (token.dots) note.addModifier(new Dot(), 0);
        return note;
      });

      if (selectedOption) {
        selectedOption.rests.forEach((rest) => {
          const r = new StaveNote({ keys: ['b/4'], duration: rest.vexDuration, clef: 'treble' });
          if (rest.dots) r.addModifier(new Dot(), 0);
          notes.push(r);
        });
      } else {
        notes.push(
          new TextNote({
            text: ' ? ',
            duration: `${question.missingDurationUnits}/8`,
            line: 9,
          }).setStyle({ fillStyle: '#57534e', strokeStyle: '#57534e' }),
        );
      }

      const [beats, beatValue] = question.timeSignature.split('/').map(Number);
      const voice = new Voice({ numBeats: beats, beatValue: beatValue }).setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);
      new Formatter().joinVoices([voice]).format([voice], 600);
      voice.draw(context, stave);
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知錯誤';
      setErrorMessage(`渲染失敗：${message}`);
    }
  }, [question, selectedOption]);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <p className="mb-3 text-sm font-medium text-stone-600 dark:text-stone-300">
        題目 1.2：請選出正確休止符組合，完整填補小節中的「?」區域。
      </p>
      <div ref={containerRef} className="min-h-[200px] overflow-x-auto" />
      {errorMessage && <p className="mt-2 text-sm text-red-600 dark:text-red-300">{errorMessage}</p>}
    </div>
  );
}
