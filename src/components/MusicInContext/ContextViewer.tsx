import { useEffect, useRef, useState } from 'react';
import {
  Accidental,
  Articulation,
  Beam,
  Curve,
  Formatter,
  Renderer,
  Stave,
  StaveConnector,
  StaveNote,
  TextNote,
  Voice,
} from 'vexflow';
import type { MusicalContext, NoteEvent } from '../../utils/music-logic/context-engine';

interface Props {
  context: MusicalContext;
}


function toVexKeySignature(keySignature: string): string {
  const [tonic, mode] = keySignature.split(' ');
  if (!tonic) return 'C';
  return mode?.toLowerCase().startsWith('minor') ? `${tonic}m` : tonic;
}

function toVexKey(pitch: string): string {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 'c/4';
  const [, letter, accidental, octave] = match;
  return `${letter.toLowerCase()}${accidental}/${octave}`;
}

function addModifiers(note: StaveNote, event: NoteEvent): void {
  if (event.pitch.includes('#')) note.addModifier(new Accidental('#'), 0);
  if (event.pitch.includes('b')) note.addModifier(new Accidental('b'), 0);
  if (event.articulation === 'staccato') note.addModifier(new Articulation('a.').setPosition(3), 0);
  if (event.articulation === 'accent') note.addModifier(new Articulation('a>').setPosition(3), 0);
}



function beatsFromDuration(duration: NoteEvent['duration']): number {
  if (duration === 'h') return 2;
  if (duration === 'q') return 1;
  if (duration === '8') return 0.5;
  return 0.25;
}

function restDurationFromRemaining(remaining: number): 'q' | '8' | '16' {
  if (remaining >= 1) return 'q';
  if (remaining >= 0.5) return '8';
  return '16';
}

function buildNotes(events: NoteEvent[], clef: 'treble' | 'bass', beatsPerBar = 2): StaveNote[] {
  const notes = events.map((event) => {
    const note = new StaveNote({
      clef,
      keys: [toVexKey(event.pitch)],
      duration: event.duration,
    });
    addModifiers(note, event);
    return note;
  });

  const totalBeats = events.reduce((sum, event) => sum + beatsFromDuration(event.duration), 0);
  let remaining = Math.max(0, beatsPerBar - totalBeats);

  while (remaining > 0.0001) {
    const restDuration = restDurationFromRemaining(remaining);
    notes.push(
      new StaveNote({
        clef,
        keys: ['b/4'],
        duration: `${restDuration}r`,
      }),
    );
    remaining -= beatsFromDuration(restDuration);
  }

  return notes;
}

export function ContextViewer({ context }: Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    setError(null);

    try {
      const renderer = new Renderer(el, Renderer.Backends.SVG);
      renderer.resize(980, 460);
      const ctx = renderer.getContext();

      const barsPerRow = 4;
      const barWidth = 220;
      const rowTop = [40, 240];
      const vexKeySignature = toVexKeySignature(context.keySignature);

      for (let row = 0; row < 2; row += 1) {
        const startIndex = row * barsPerRow;
        const trebleStaves: Stave[] = [];
        const bassStaves: Stave[] = [];

        for (let i = 0; i < barsPerRow; i += 1) {
          const barIndex = startIndex + i;
          const bar = context.bars[barIndex];
          if (!bar) continue;

          const x = 20 + i * barWidth;
          const upper = new Stave(x, rowTop[row], barWidth);
          const lower = new Stave(x, rowTop[row] + 90, barWidth);

          if (barIndex === 0) {
            upper.addClef('treble').addKeySignature(vexKeySignature).addTimeSignature(context.timeSignature);
            lower.addClef('bass').addKeySignature(vexKeySignature).addTimeSignature(context.timeSignature);
            upper.setText(context.tempoText, 1, { shift_y: -20 });
          } else if (i === 0) {
            upper.addClef('treble').addKeySignature(vexKeySignature);
            lower.addClef('bass').addKeySignature(vexKeySignature);
          }

          if (bar.RH.crescendo) {
            upper.setText('cresc.', 3, { shift_y: 70 });
          }
          if (bar.RH.diminuendo) {
            upper.setText('dim.', 3, { shift_y: 82 });
          }


          upper.setContext(ctx).draw();
          lower.setContext(ctx).draw();

          const connector = new StaveConnector(upper, lower).setType(StaveConnector.type.SINGLE_LEFT);
          connector.setContext(ctx).draw();
          if (i === barsPerRow - 1) {
            new StaveConnector(upper, lower).setType(StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();
          }

          const rhNotes = buildNotes(bar.RH.notes, 'treble');
          const lhNotes = buildNotes(bar.LH.notes, 'bass');

          const rhVoice = new Voice({ numBeats: 2, beatValue: 4 }).setMode(Voice.Mode.SOFT);
          const lhVoice = new Voice({ numBeats: 2, beatValue: 4 }).setMode(Voice.Mode.SOFT);
          rhVoice.addTickables(rhNotes);
          lhVoice.addTickables(lhNotes);

          new Formatter().joinVoices([rhVoice]).format([rhVoice], barWidth - 25);
          new Formatter().joinVoices([lhVoice]).format([lhVoice], barWidth - 25);
          rhVoice.draw(ctx, upper);
          lhVoice.draw(ctx, lower);

          Beam.generateBeams(rhNotes).forEach((beam) => beam.setContext(ctx).draw());
          Beam.generateBeams(lhNotes).forEach((beam) => beam.setContext(ctx).draw());

          const slurStarts = rhNotes
            .map((note, idx) => ({ note, idx }))
            .filter(({ idx }) => bar.RH.notes[idx].slurStart)
            .map(({ idx }) => idx);
          slurStarts.forEach((startIdx) => {
            const endIdx = bar.RH.notes.findIndex((note, idx) => idx >= startIdx && note.slurEnd);
            if (endIdx > startIdx) {
              new Curve(rhNotes[startIdx], rhNotes[endIdx], { cps: [{ x: 0, y: 18 }, { x: 0, y: 18 }] })
                .setContext(ctx)
                .draw();
            }
          });

          if (bar.RH.dynamics) {
            new TextNote({
              text: bar.RH.dynamics,
              duration: 'q',
              line: 9,
            })
              .setStave(upper)
              .setContext(ctx)
              .setX(x + 8)
              .draw();
          }


          trebleStaves.push(upper);
          bassStaves.push(lower);
        }

        if (trebleStaves.length > 0 && bassStaves.length > 0) {
          new StaveConnector(trebleStaves[0], bassStaves[0]).setType(StaveConnector.type.BRACE).setContext(ctx).draw();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to render score');
    }
  }, [context]);

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-900">
      <h2 className="mb-2 text-xl font-semibold">7 Music in Context</h2>
      <p className="mb-3 text-sm text-stone-600 dark:text-stone-300">Study this music for piano and then answer the questions below.</p>
      <div ref={containerRef} className="overflow-x-auto" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
