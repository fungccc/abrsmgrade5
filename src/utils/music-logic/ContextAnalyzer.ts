import type { Hand, IntervalType, MusicalContext, NoteEvent, SymbolType } from './context-engine';

const SEMITONE_TO_INTERVAL: Record<number, IntervalType> = {
  1: 'm2',
  2: 'M2',
  3: 'm3',
  4: 'M3',
  5: 'P4',
  7: 'P5',
  8: 'm6',
  9: 'M6',
  10: 'm7',
  11: 'M7',
  12: 'P8',
};

const LETTER_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function pitchClass(pitch: string): string {
  const match = pitch.match(/^([A-G][#b]?)/);
  return match ? match[1] : pitch;
}

function normalizePitchClass(pc: string): string {
  const enharmonicMap: Record<string, string> = {
    Db: 'C#',
    Eb: 'D#',
    Gb: 'F#',
    Ab: 'G#',
    Bb: 'A#',
    Fb: 'E',
    Cb: 'B',
    E#: 'F',
    B#: 'C',
  };
  return enharmonicMap[pc] ?? pc;
}

function pitchClassToSemitone(pc: string): number {
  const normalized = normalizePitchClass(pc);
  const letter = normalized[0];
  const accidental = normalized[1] ?? '';
  const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return (LETTER_TO_SEMITONE[letter] + accidentalOffset + 12) % 12;
}

function transposePitchClass(pc: string, semitones: number): string {
  const root = pitchClassToSemitone(pc);
  return CHROMATIC_SHARP[(root + semitones + 12) % 12];
}

function pitchToMidi(pitch: string): number {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 60;
  const [, letter, accidental, octaveText] = match;
  const accidentalOffset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  const octave = Number(octaveText);
  return (octave + 1) * 12 + LETTER_TO_SEMITONE[letter] + accidentalOffset;
}

function getIntervalType(noteA: string, noteB: string): IntervalType | null {
  const semitones = Math.abs(pitchToMidi(noteB) - pitchToMidi(noteA));
  return SEMITONE_TO_INTERVAL[semitones] ?? null;
}

export class ContextAnalyzer {
  constructor(public readonly context: MusicalContext) {}

  getNotesInBar(barIndex: number, hand: Hand): NoteEvent[] {
    return this.context.bars[barIndex - 1]?.[hand].notes ?? [];
  }

  countIntervals(intervalType: IntervalType): number {
    let count = 0;
    (['RH', 'LH'] as const).forEach((hand) => {
      this.context.bars.forEach((bar) => {
        const notes = bar[hand].notes;
        for (let i = 0; i < notes.length - 1; i += 1) {
          if (getIntervalType(notes[i].pitch, notes[i + 1].pitch) === intervalType) count += 1;
        }
      });
    });
    return count;
  }

  findSymbol(symbolType: SymbolType): number[] {
    const found: number[] = [];
    this.context.bars.forEach((bar, idx) => {
      const barNumber = idx + 1;
      if (symbolType === 'crescendo' && (bar.RH.crescendo || bar.LH.crescendo)) found.push(barNumber);
      if (symbolType === 'diminuendo' && (bar.RH.diminuendo || bar.LH.diminuendo)) found.push(barNumber);
      if (symbolType === 'staccato' && [...bar.RH.notes, ...bar.LH.notes].some((n) => n.articulation === 'staccato')) {
        found.push(barNumber);
      }
    });
    return found;
  }

  getRange(): { lowest: { pitch: string; midi: number }; highest: { pitch: string; midi: number } } {
    const allNotes = this.context.bars.flatMap((bar) => [...bar.RH.notes, ...bar.LH.notes]);
    const mapped = allNotes.map((n) => ({ pitch: n.pitch, midi: pitchToMidi(n.pitch) }));
    const lowest = mapped.reduce((acc, curr) => (curr.midi < acc.midi ? curr : acc), mapped[0]);
    const highest = mapped.reduce((acc, curr) => (curr.midi > acc.midi ? curr : acc), mapped[0]);
    return { lowest, highest };
  }

  getRangeForBars(startBar: number, endBar: number, hand: Hand): { low: number; high: number; centerMidi: number } {
    const notes = this.context.bars
      .slice(startBar - 1, endBar)
      .flatMap((bar) => bar[hand].notes)
      .map((note) => pitchToMidi(note.pitch));
    const low = Math.min(...notes);
    const high = Math.max(...notes);
    const centerMidi = Math.round((low + high) / 2);
    return { low, high, centerMidi };
  }

  barHasInterval(barNumber: number, hand: Hand, intervalType: IntervalType): boolean {
    const notes = this.getNotesInBar(barNumber, hand);
    for (let i = 0; i < notes.length - 1; i += 1) {
      if (getIntervalType(notes[i].pitch, notes[i + 1].pitch) === intervalType) return true;
    }
    return false;
  }

  largestMelodicIntervalInBar(barNumber: number, hand: Hand): IntervalType | null {
    const notes = this.getNotesInBar(barNumber, hand);
    let largest: IntervalType | null = null;
    let maxSemitones = -1;
    for (let i = 0; i < notes.length - 1; i += 1) {
      const semitones = Math.abs(pitchToMidi(notes[i + 1].pitch) - pitchToMidi(notes[i].pitch));
      if (semitones > maxSemitones && SEMITONE_TO_INTERVAL[semitones]) {
        maxSemitones = semitones;
        largest = SEMITONE_TO_INTERVAL[semitones];
      }
    }
    return largest;
  }

  beginsLightly(): boolean {
    const first = this.context.bars[0];
    return first.RH.dynamics === 'pp' || first.RH.dynamics === 'p' || first.LH.dynamics === 'pp' || first.LH.dynamics === 'p';
  }

  endsOnSubdominant(): boolean {
    const keyRoot = this.context.keySignature.split(' ')[0];
    const subdominantRoot = transposePitchClass(keyRoot, 5);
    const isMinor = this.context.keySignature.toLowerCase().includes('minor');
    const chordSemitones = isMinor ? [0, 3, 7] : [0, 4, 7];
    const subdominantTriad = chordSemitones.map((step) => transposePitchClass(subdominantRoot, step));

    const lastBar = this.context.bars[this.context.bars.length - 1];
    const pcs = [...lastBar.RH.notes, ...lastBar.LH.notes].map((n) => normalizePitchClass(pitchClass(n.pitch)));
    return subdominantTriad.every((pc) => pcs.includes(pc));
  }

  getMediantPitchClass(): string {
    const keyRoot = this.context.keySignature.split(' ')[0];
    return transposePitchClass(keyRoot, 3);
  }

  countScaleDegreeInHand(targetPitchClass: string, hand: Hand): number {
    const normalizedTarget = normalizePitchClass(targetPitchClass);
    return this.context.bars
      .flatMap((bar) => bar[hand].notes)
      .filter((n) => normalizePitchClass(pitchClass(n.pitch)) === normalizedTarget).length;
  }

  findMatchingRhythmAndArticulation(barNumber: number, hand: Hand): number[] {
    const source = this.getNotesInBar(barNumber, hand);
    const sourceShape = source.map((n) => `${n.duration}:${n.articulation ?? '-'}`).join('|');

    return this.context.bars
      .map((bar, idx) => ({ idx: idx + 1, shape: bar[hand].notes.map((n) => `${n.duration}:${n.articulation ?? '-'}`).join('|') }))
      .filter((entry) => entry.shape === sourceShape)
      .map((entry) => entry.idx);
  }
}
