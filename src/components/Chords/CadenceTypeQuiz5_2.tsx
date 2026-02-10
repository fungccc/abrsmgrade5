import { useEffect, useRef } from 'react';
import { Formatter, Renderer, Stave, StaveConnector, StaveNote, Voice } from 'vexflow';
import type { CadenceType, CadenceTypeQuestion } from '../../utils/music-logic/chords';

interface Props {
  question: CadenceTypeQuestion;
  selected: CadenceType | null;
  submitted: boolean;
  onSelect: (value: CadenceType) => void;
}

export function CadenceTypeQuiz5_2({ question, selected, submitted, onSelect }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const renderer = new Renderer(el, Renderer.Backends.SVG);
    renderer.resize(920, 230);
    const ctx = renderer.getContext();

    const top = new Stave(20, 35, 860);
    const bottom = new Stave(20, 130, 860);
    top.addClef('treble').addTimeSignature('4/4');
    bottom.addClef('bass').addTimeSignature('4/4');
    top.setContext(ctx).draw();
    bottom.setContext(ctx).draw();

    new StaveConnector(top, bottom).setType('singleLeft').setContext(ctx).draw();
    new StaveConnector(top, bottom).setType('brace').setContext(ctx).draw();

    const leftTop = new StaveNote({ keys: question.leftChordTreble.map((n) => `${n.name[0].toLowerCase()}/5`), duration: 'h', clef: 'treble' });
    const rightTop = new StaveNote({ keys: question.rightChordTreble.map((n) => `${n.name[0].toLowerCase()}/5`), duration: 'h', clef: 'treble' });
    const leftBottom = new StaveNote({ keys: question.leftChordBass.map((n) => `${n.name[0].toLowerCase()}/3`), duration: 'h', clef: 'bass' });
    const rightBottom = new StaveNote({ keys: question.rightChordBass.map((n) => `${n.name[0].toLowerCase()}/3`), duration: 'h', clef: 'bass' });

    const vTop = new Voice({ num_beats: 4, beat_value: 4 }).addTickables([leftTop, rightTop]);
    const vBottom = new Voice({ num_beats: 4, beat_value: 4 }).addTickables([leftBottom, rightBottom]);

    new Formatter().joinVoices([vTop]).joinVoices([vBottom]).formatToStave([vTop], top).formatToStave([vBottom], bottom);
    vTop.draw(ctx, top);
    vBottom.draw(ctx, bottom);
  }, [question]);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <p className="text-sm">5.2 辨識終止式：請命名下列終止式類型。</p>
      <div ref={ref} className="overflow-x-auto" />
      <div className="grid grid-cols-3 gap-2">
        {question.choices.map((c) => {
          const ok = submitted && c === question.cadenceType;
          const bad = submitted && selected === c && c !== question.cadenceType;
          return (
            <button key={c} type="button" onClick={() => onSelect(c)} className={`rounded border px-3 py-2 text-sm font-semibold ${ok ? 'border-emerald-500 bg-emerald-50' : bad ? 'border-red-500 bg-red-50' : selected===c ? 'bg-stone-900 text-white' : 'border-stone-300'}`}>
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}
