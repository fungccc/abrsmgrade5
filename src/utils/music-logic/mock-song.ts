import type { MusicalContext } from './context-engine';

export const MOCK_SONG: MusicalContext = {
  title: 'Music in Context',
  tempoText: 'Vivace',
  keySignature: 'F# minor',
  timeSignature: '2/4',
  staves: ['RH', 'LH'],
  bars: [
    {
      RH: {
        dynamics: 'pp',
        notes: [
          { pitch: 'C#5', duration: '16', slurStart: true },
          { pitch: 'D5', duration: '16' },
          { pitch: 'C#5', duration: '16' },
          { pitch: 'E5', duration: '16' },
          { pitch: 'A4', duration: '16', articulation: 'staccato' },
          { pitch: 'B4', duration: '16' },
          { pitch: 'A4', duration: '16' },
          { pitch: 'G#4', duration: '16', slurEnd: true },
        ],
      },
      LH: {
        notes: [
          { pitch: 'F#3', duration: 'q' },
          { pitch: 'C#3', duration: 'q' },
        ],
      },
    },
    {
      RH: {
        notes: [
          { pitch: 'B4', duration: '16', slurStart: true },
          { pitch: 'A4', duration: '16' },
          { pitch: 'G#4', duration: '16' },
          { pitch: 'F#4', duration: '16', articulation: 'staccato' },
          { pitch: 'G#4', duration: '8' },
          { pitch: 'A4', duration: '8', slurEnd: true },
        ],
      },
      LH: {
        notes: [
          { pitch: 'F#3', duration: '8' },
          { pitch: 'A3', duration: '8' },
          { pitch: 'C#4', duration: '8' },
          { pitch: 'A3', duration: '8' },
        ],
      },
    },
    {
      RH: {
        notes: [
          { pitch: 'G#4', duration: '16', slurStart: true },
          { pitch: 'F#4', duration: '16' },
          { pitch: 'E4', duration: '16' },
          { pitch: 'D4', duration: '16' },
          { pitch: 'E4', duration: '8', articulation: 'staccato' },
          { pitch: 'F#4', duration: '8', slurEnd: true },
        ],
      },
      LH: {
        notes: [
          { pitch: 'B2', duration: 'q' },
          { pitch: 'D3', duration: 'q' },
        ],
      },
    },
    {
      RH: {
        crescendo: true,
        notes: [
          { pitch: 'A4', duration: '16' },
          { pitch: 'B4', duration: '16', articulation: 'staccato' },
          { pitch: 'C#5', duration: '16' },
          { pitch: 'D5', duration: '16' },
          { pitch: 'E5', duration: '16' },
          { pitch: 'D5', duration: '16' },
          { pitch: 'C#5', duration: '16' },
          { pitch: 'B4', duration: '16' },
        ],
      },
      LH: {
        notes: [
          { pitch: 'A2', duration: '8' },
          { pitch: 'C#3', duration: '8' },
          { pitch: 'E3', duration: '8' },
          { pitch: 'C#3', duration: '8' },
        ],
      },
    },
    {
      RH: {
        dynamics: 'f',
        notes: [
          { pitch: 'E5', duration: '16', slurStart: true },
          { pitch: 'F#5', duration: '16' },
          { pitch: 'E5', duration: '16' },
          { pitch: 'G#5', duration: '16' },
          { pitch: 'D5', duration: '8' },
          { pitch: 'C#5', duration: '8', slurEnd: true },
        ],
      },
      LH: {
        notes: [
          { pitch: 'F#3', duration: '8' },
          { pitch: 'C#4', duration: '8' },
          { pitch: 'A3', duration: '8' },
          { pitch: 'F#3', duration: '8' },
        ],
      },
    },
    {
      RH: {
        dynamics: 'p',
        notes: [
          { pitch: 'E5', duration: '8', articulation: 'staccato' },
          { pitch: 'F#5', duration: '8' },
          { pitch: 'E5', duration: '8', articulation: 'staccato' },
          { pitch: 'D5', duration: '8' },
        ],
      },
      LH: {
        notes: [
          { pitch: 'D3', duration: '8' },
          { pitch: 'F#3', duration: '8' },
          { pitch: 'A3', duration: '8' },
          { pitch: 'F#3', duration: '8' },
        ],
      },
    },
    {
      RH: {
        crescendo: true,
        diminuendo: true,
        notes: [
          { pitch: 'C#5', duration: 'q' },
          { pitch: 'C#6', duration: 'q', articulation: 'accent' },
        ],
      },
      LH: {
        notes: [
          { pitch: 'A3', duration: '16' },
          { pitch: 'B3', duration: '16' },
          { pitch: 'A3', duration: '16' },
          { pitch: 'G#3', duration: '16' },
          { pitch: 'F#3', duration: '16' },
          { pitch: 'E3', duration: '16' },
          { pitch: 'D3', duration: '16' },
          { pitch: 'C#3', duration: '16' },
        ],
      },
    },
    {
      RH: {
        dynamics: 'sf',
        notes: [
          { pitch: 'F#5', duration: '8', articulation: 'accent' },
          { pitch: 'E5', duration: '8' },
          { pitch: 'D5', duration: '8' },
          { pitch: 'C#5', duration: '8' },
        ],
      },
      LH: {
        notes: [
          { pitch: 'B2', duration: '8' },
          { pitch: 'D3', duration: '8' },
          { pitch: 'F#3', duration: '8' },
          { pitch: 'B3', duration: '8' },
        ],
      },
    },
  ],
};
