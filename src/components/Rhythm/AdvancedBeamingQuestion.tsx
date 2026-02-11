import { useEffect, useRef } from 'react';
import { Beam, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
import type { AdvancedBeamingQuestion } from '../../utils/music-logic/advancedBeamingGenerator';

interface AdvancedBeamingQuestionProps {
  question: AdvancedBeamingQuestion;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  isSubmitted: boolean;
}

interface AdvancedOptionProps {
  optionId: string;
  label: string;
  timeSignature: string;
  durations: string[];
  beamGroups: number[][];
  isSelected: boolean;
  isCorrect: boolean;
  isWrongSelected: boolean;
  isSubmitted: boolean;
  onClick: () => void;
}

function optionStyle(isSelected: boolean, isCorrect: boolean, isWrongSelected: boolean, isSubmitted: boolean): string {
  if (!isSubmitted) {
    return isSelected
      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
      : 'border-stone-300 bg-white hover:border-stone-500 dark:border-stone-600 dark:bg-stone-900';
  }

  if (isCorrect) return 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200';
  if (isWrongSelected) return 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200';
  return 'border-stone-300 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400';
}

function AdvancedOptionCard({
  optionId,
  label,
  timeSignature,
  durations,
  beamGroups,
  isSelected,
  isCorrect,
  isWrongSelected,
  isSubmitted,
  onClick,
}: AdvancedOptionProps): JSX.Element {
  const staveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = staveRef.current;
    if (!container) return;

    // rerender-safe: clear previous SVG so question switching never overlays.
    container.innerHTML = '';

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(720, 165);
    const context = renderer.getContext();

    const stave = new Stave(12, 36, 684);
    stave.addClef('treble').addTimeSignature(timeSignature);
    stave.setContext(context).draw();

    const notes = durations.map((duration) => new StaveNote({ keys: ['b/4'], duration, clef: 'treble' }));
    const [beats, beatValue] = timeSignature.split('/').map(Number);
    const voice = new Voice({ num_beats: beats, beat_value: beatValue });

    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 620);
    voice.draw(context, stave);

    // Manual beaming (no AutoBeam): create a Beam from each index-group returned by generator.
    beamGroups.forEach((group) => {
      const beamNotes = group.map((idx) => notes[idx]).filter(Boolean);
      if (beamNotes.length > 1) {
        new Beam(beamNotes).setContext(context).draw();
      }
    });
  }, [beamGroups, durations, timeSignature]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${optionStyle(isSelected, isCorrect, isWrongSelected, isSubmitted)}`}
      aria-label={`選項 ${label} ${optionId}`}
    >
      <p className="mb-2 text-sm font-semibold">選項 {label}</p>
      <div ref={staveRef} className="min-h-[150px] overflow-x-auto" />
    </button>
  );
}

export function AdvancedBeamingQuestionView({
  question,
  selectedOptionId,
  onSelect,
  isSubmitted,
}: AdvancedBeamingQuestionProps): JSX.Element {
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600 dark:text-stone-300">
        題目 1.4：請選出最符合拍點邊界的連尾方式（拍號：<span className="font-semibold">{question.timeSignature}</span>）。
      </p>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = isSubmitted && option.isCorrect;
          const isWrongSelected = isSubmitted && isSelected && !option.isCorrect;

          return (
            <AdvancedOptionCard
              key={option.id}
              optionId={option.id}
              label={option.label}
              timeSignature={question.timeSignature}
              durations={question.noteDurations}
              beamGroups={option.beamGroups}
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
