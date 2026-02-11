import { useEffect, useRef, useState } from 'react';
import { Beam, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { BeamingQuestion } from '../../utils/music-logic/beamingQuestionGenerator';

interface BeamingQuestionProps {
  question: BeamingQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  isSubmitted: boolean;
}

function getOptionClass(isSelected: boolean, isCorrect: boolean, isWrongSelected: boolean, isSubmitted: boolean): string {
  if (!isSubmitted) {
    return isSelected
      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
      : 'border-stone-300 bg-white hover:border-stone-500 dark:border-stone-600 dark:bg-stone-900';
  }

  if (isCorrect) {
    return 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200';
  }

  if (isWrongSelected) {
    return 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200';
  }

  return 'border-stone-300 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400';
}

interface OptionCardProps {
  label: string;
  durations: string[];
  beamGroups: number[][];
  timeSignature: string;
  isSelected: boolean;
  isCorrect: boolean;
  isWrongSelected: boolean;
  isSubmitted: boolean;
  onClick: () => void;
}

function OptionCard({
  label,
  durations,
  beamGroups,
  timeSignature,
  isSelected,
  isCorrect,
  isWrongSelected,
  isSubmitted,
  onClick,
}: OptionCardProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure no stale SVG/canvas from previous question remains.
    container.innerHTML = '';
    setErrorMessage(null);

    try {
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(330, 160);

      const context = renderer.getContext();
      const stave = new Stave(12, 36, 304);
      stave.addClef('treble').addTimeSignature(timeSignature);
      stave.setContext(context).draw();

      const notes = durations.map(
        (duration) =>
          new StaveNote({
            keys: ['b/4'],
            duration,
            clef: 'treble',
          }),
      );

      const beamedIndexes = new Set(beamGroups.flatMap((group) => group));
      beamedIndexes.forEach((idx) => {
        const n = notes[idx];
        if (n) {
          n.setFlagStyle({ fillStyle: 'transparent', strokeStyle: 'transparent' });
        }
      });

      const [beats, beatValue] = timeSignature.split('/').map(Number);
      const voice = new Voice({ numBeats: beats, beatValue: beatValue }).setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);

      new Formatter().joinVoices([voice]).format([voice], 240);
      voice.draw(context, stave);

      // Manual beam control (no AutoBeam):
      // We convert each index group from logic into a Beam instance explicitly.
      beamGroups.forEach((group) => {
        const beamNotes = group.map((idx) => notes[idx]).filter(Boolean);
        if (beamNotes.length > 1) {
          new Beam(beamNotes).setContext(context).draw();
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知渲染錯誤';
      setErrorMessage(`譜例渲染失敗：${message}`);
    }
  }, [beamGroups, durations, timeSignature]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition ${getOptionClass(isSelected, isCorrect, isWrongSelected, isSubmitted)}`}
    >
      <p className="mb-2 text-sm font-semibold">選項 {label}</p>
      <div ref={containerRef} className="min-h-[150px] overflow-x-auto" />
      {errorMessage && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{errorMessage}</p>}
    </button>
  );
}

export function BeamingQuestionView({ question, selectedOptionId, onSelect, isSubmitted }: BeamingQuestionProps): JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600 dark:text-stone-300">
        題目 1.3：以下選項節奏音符相同，但連尾方式不同。請選出符合拍號 <span className="font-semibold">{question.timeSignature}</span>{' '}
        的正確分組。
      </p>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = isSubmitted && option.isCorrect;
          const isWrongSelected = isSubmitted && isSelected && !option.isCorrect;

          return (
            <OptionCard
              key={option.id}
              label={option.label}
              durations={question.noteDurations}
              beamGroups={option.beamGroups}
              timeSignature={question.timeSignature}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isWrongSelected={isWrongSelected}
              isSubmitted={isSubmitted}
              onClick={() => onSelect(option.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
