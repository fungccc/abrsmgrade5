import { useEffect, useRef, useState } from 'react';
import { Beam, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { RhythmQuestion } from '../../utils/music-logic/rhythmGenerator';

interface RhythmQuestionProps {
  question: RhythmQuestion;
}

export function RhythmQuestionView({ question }: RhythmQuestionProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    setErrorMessage(null);

    try {
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(680, 190);
      const context = renderer.getContext();

      const stave = new Stave(20, 45, 640);
      stave.addClef('treble');
      stave.setContext(context).draw();

      const staveNotes = question.notes.map((token) => {
        const note = new StaveNote({
          keys: ['b/4'],
          duration: token.vexDuration,
          clef: 'treble',
        });

        if (token.dots) {
          for (let i = 0; i < token.dots; i += 1) {
            note.addDotToAll();
          }
        }

        return note;
      });

      const [beats, beatValue] = question.timeSignature.split('/').map(Number);
      const voice = new Voice({
        num_beats: beats,
        beat_value: beatValue,
      }).setMode(Voice.Mode.SOFT);
      voice.addTickables(staveNotes);

      new Formatter().joinVoices([voice]).format([voice], 560);
      voice.draw(context, stave);

      const beams: Beam[] = [];
      question.stemGroups.forEach((indexes) => {
        const candidates = indexes
          .map((noteIndex) => staveNotes[noteIndex])
          .filter((note) => !note.isRest() && note.getDuration().startsWith('8'));
        if (candidates.length > 1) {
          beams.push(new Beam(candidates));
        }
      });

      beams.forEach((beam) => beam.setContext(context).draw());
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知渲染錯誤';
      setErrorMessage(`譜例渲染失敗：${message}`);
    }
  }, [question]);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <p className="mb-3 text-sm font-medium text-stone-600 dark:text-stone-300">請觀察下方單一小節節奏，並判斷正確拍號：</p>
      <div ref={containerRef} className="min-h-[190px] overflow-x-auto" />
      {errorMessage && <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{errorMessage}</p>}
    </div>
  );
}
