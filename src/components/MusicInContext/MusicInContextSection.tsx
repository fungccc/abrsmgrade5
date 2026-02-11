import { useMemo, useState } from 'react';
import { ContextViewer } from './ContextViewer';
import { ContextAnalyzer } from '../../utils/music-logic/ContextAnalyzer';
import {
  createClefTranspositionQuestion,
  createContextAssertions,
  createInstrumentSuitabilityQuestion,
  createMediantCountQuestion,
  createStructureSymbolsQuestion,
} from '../../utils/music-logic/context-engine';
import { MOCK_SONG } from '../../utils/music-logic/mock-song';

const analyzer = new ContextAnalyzer(MOCK_SONG);

type Mode = '7.1' | '7.2' | '7.3' | '7.4' | '7.5';

export function MusicInContextSection(): JSX.Element {
  const [mode, setMode] = useState<Mode>('7.1');

  const clefQuestion = useMemo(() => createClefTranspositionQuestion(MOCK_SONG), []);
  const assertions = useMemo(() => createContextAssertions(analyzer), []);
  const instrumentQuestion = useMemo(() => createInstrumentSuitabilityQuestion(analyzer), []);
  const mediantQuestion = useMemo(() => createMediantCountQuestion(analyzer), []);
  const structureQuestion = useMemo(() => createStructureSymbolsQuestion(analyzer), []);

  const [selected71, setSelected71] = useState<string | null>(null);
  const [submitted71, setSubmitted71] = useState(false);

  const [selected72, setSelected72] = useState<Record<string, boolean | null>>({});
  const [submitted72, setSubmitted72] = useState(false);

  const [selected73, setSelected73] = useState<string | null>(null);
  const [submitted73, setSubmitted73] = useState(false);

  const [selected74, setSelected74] = useState<number | null>(null);
  const [submitted74, setSubmitted74] = useState(false);

  const [answer75a, setAnswer75a] = useState('');
  const [answer75b, setAnswer75b] = useState('');
  const [submitted75, setSubmitted75] = useState(false);

  return (
    <section className="space-y-4">
      <ContextViewer context={MOCK_SONG} />

      <div className="flex flex-wrap gap-2">
        {(['7.1', '7.2', '7.3', '7.4', '7.5'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${mode === id ? 'bg-stone-900 text-white' : 'bg-white'}`}
          >
            {id}
          </button>
        ))}
      </div>

      {mode === '7.1' && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="font-semibold">7.1 Clef Transposition</p>
          <p>{clefQuestion.prompt}</p>
          {clefQuestion.options.map((option) => {
            const isCorrect = submitted71 && option.id === clefQuestion.answerId;
            const isWrong = submitted71 && selected71 === option.id && option.id !== clefQuestion.answerId;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelected71(option.id)}
                className={`block w-full rounded-lg border p-3 text-left ${
                  isCorrect
                    ? 'border-emerald-500 bg-emerald-50'
                    : isWrong
                      ? 'border-red-500 bg-red-50'
                      : selected71 === option.id
                        ? 'border-stone-900'
                        : 'border-stone-300'
                }`}
              >
                <p className="font-semibold">Option {option.id} ({option.clef} clef)</p>
                <p className="text-sm">{option.notes.join(' - ')}</p>
                <p className="text-xs text-stone-600">{option.description}</p>
              </button>
            );
          })}
          <button type="button" onClick={() => setSubmitted71(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
            Check 7.1
          </button>
        </div>
      )}

      {mode === '7.2' && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="font-semibold">7.2 True / False</p>
          {assertions.map((item) => {
            const chosen = selected72[item.id];
            const isCorrect = submitted72 && chosen === item.answer;
            const isWrong = submitted72 && chosen !== null && chosen !== undefined && chosen !== item.answer;
            return (
              <div key={item.id} className="rounded border border-stone-200 p-3">
                <p className="mb-2">{item.text}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected72((prev) => ({ ...prev, [item.id]: true }))}
                    className={`rounded border px-3 py-1 ${chosen === true ? 'bg-stone-900 text-white' : 'bg-white'}`}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected72((prev) => ({ ...prev, [item.id]: false }))}
                    className={`rounded border px-3 py-1 ${chosen === false ? 'bg-stone-900 text-white' : 'bg-white'}`}
                  >
                    False
                  </button>
                  {submitted72 && <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-600' : isWrong ? 'text-red-600' : 'text-stone-500'}`}>{isCorrect ? 'Correct' : isWrong ? 'Incorrect' : 'Not answered'}</span>}
                </div>
              </div>
            );
          })}
          <button type="button" onClick={() => setSubmitted72(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
            Check 7.2
          </button>
        </div>
      )}

      {mode === '7.3' && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="font-semibold">7.3 Instrument suitability</p>
          <p>{instrumentQuestion.prompt}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {instrumentQuestion.options.map((option) => {
              const isCorrect = submitted73 && option === instrumentQuestion.answer;
              const isWrong = submitted73 && selected73 === option && option !== instrumentQuestion.answer;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected73(option)}
                  className={`rounded border px-3 py-2 ${
                    isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrong ? 'border-red-500 bg-red-50' : selected73 === option ? 'border-stone-900' : 'border-stone-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setSubmitted73(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
            Check 7.3
          </button>
        </div>
      )}

      {mode === '7.4' && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="font-semibold">7.4 Counting</p>
          <p>{mediantQuestion.prompt}</p>
          <div className="flex gap-2">
            {mediantQuestion.options.map((option) => {
              const isCorrect = submitted74 && option === mediantQuestion.answer;
              const isWrong = submitted74 && selected74 === option && option !== mediantQuestion.answer;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected74(option)}
                  className={`rounded border px-4 py-2 ${
                    isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrong ? 'border-red-500 bg-red-50' : selected74 === option ? 'border-stone-900' : 'border-stone-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => setSubmitted74(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
            Check 7.4
          </button>
        </div>
      )}

      {mode === '7.5' && (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
          <p className="font-semibold">7.5 Structure & symbols</p>
          <label className="block text-sm">
            {structureQuestion.rhythmPrompt}
            <input
              type="number"
              className="ml-2 rounded border border-stone-300 px-2 py-1"
              value={answer75a}
              onChange={(e) => setAnswer75a(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            {structureQuestion.diminuendoPrompt}
            <input
              type="number"
              className="ml-2 rounded border border-stone-300 px-2 py-1"
              value={answer75b}
              onChange={(e) => setAnswer75b(e.target.value)}
            />
          </label>
          <button type="button" onClick={() => setSubmitted75(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
            Check 7.5
          </button>
          {submitted75 && (
            <div className="rounded border border-stone-200 bg-stone-50 p-3 text-sm">
              <p>
                (a) {Number(answer75a) === structureQuestion.rhythmAnswer ? '✅' : '❌'} Correct answer: bar {structureQuestion.rhythmAnswer}
              </p>
              <p>
                (b) {Number(answer75b) === structureQuestion.diminuendoAnswer ? '✅' : '❌'} Correct answer: bar {structureQuestion.diminuendoAnswer}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
