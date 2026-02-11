import { useEffect, useRef } from 'react';
import { Renderer, Stave } from 'vexflow';
import type { KeySignatureQuestion } from '../../utils/music-logic/scales';

interface Props {
  question: KeySignatureQuestion;
  selected: string | null;
  submitted: boolean;
  onSelect: (id: string) => void;
}

function KeySigOption({ keyName, clef, selected, submitted, isCorrect, onClick }: { keyName: string; clef: string; selected: boolean; submitted: boolean; isCorrect: boolean; onClick: () => void }): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';
    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(230, 120);
    const ctx = renderer.getContext();
    const stave = new Stave(8, 26, 210);
    stave.addClef(clef).addKeySignature(keyName);
    stave.setContext(ctx).draw();
  }, [clef, keyName]);

  const cls = submitted
    ? isCorrect
      ? 'border-emerald-500 bg-emerald-50'
      : selected
        ? 'border-red-500 bg-red-50'
        : 'border-stone-300'
    : selected
      ? 'border-stone-900 bg-stone-900 text-white'
      : 'border-stone-300';

  return (
    <button type="button" onClick={onClick} className={`rounded-lg border p-2 ${cls}`}>
      <div ref={ref} className="overflow-x-auto" />
    </button>
  );
}

export function KeySignatureQuiz({ question, selected, submitted, onSelect }: Props): JSX.Element {
  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">3.1/3.2 調號辨識：選出 {question.promptLabel} 的正確調號。</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {question.options.map((option) => (
          <KeySigOption
            key={option.id}
            keyName={option.key}
            clef={option.clef}
            selected={selected === option.id}
            submitted={submitted}
            isCorrect={option.id === question.correctOptionId}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
