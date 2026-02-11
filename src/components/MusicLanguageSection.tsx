import { useMemo, useState } from 'react';
import {
  generateInstrumentQuestion,
  generateOrnamentQuestion,
  generateTermsQuestion,
} from '../utils/music-logic/knowledge-base';

type Mode = '6.1' | '6.2' | '6.3';

export function MusicLanguageSection(): JSX.Element {
  const [mode, setMode] = useState<Mode>('6.1');

  const [termsQuestion, setTermsQuestion] = useState(() => generateTermsQuestion());
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [submittedTerm, setSubmittedTerm] = useState(false);

  const [ornamentQuestion, setOrnamentQuestion] = useState(() => generateOrnamentQuestion());
  const [selectedOrnament, setSelectedOrnament] = useState<string | null>(null);
  const [submittedOrnament, setSubmittedOrnament] = useState(false);

  const [instrumentQuestion, setInstrumentQuestion] = useState(() => generateInstrumentQuestion());
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [submittedInstrument, setSubmittedInstrument] = useState(false);

  const instrumentScore = useMemo(() => {
    const total = instrumentQuestion.statements.length;
    const correct = instrumentQuestion.statements.filter((s) => answers[s.id] === s.answer).length;
    return { total, correct };
  }, [answers, instrumentQuestion.statements]);

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Section 6: Terms, Signs, Instruments</h2>
        <p className="text-sm text-stone-600 dark:text-stone-300">Practice musical terminology, ornaments, and instrument facts.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['6.1', '6.2', '6.3'] as const).map((id) => (
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

      {mode === '6.1' && (
        <div className="space-y-3 rounded-lg border border-stone-200 p-4">
          <p className="font-semibold">6.1 Musical Terms</p>
          <p>
            What does <span className="italic">{termsQuestion.term.term}</span> mean?
          </p>
          <div className="grid gap-2">
            {termsQuestion.options.map((option) => {
              const isCorrect = submittedTerm && option === termsQuestion.answer;
              const isWrong = submittedTerm && selectedTerm === option && option !== termsQuestion.answer;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedTerm(option)}
                  className={`rounded border px-3 py-2 text-left ${
                    isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrong ? 'border-red-500 bg-red-50' : selectedTerm === option ? 'border-stone-900' : 'border-stone-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSubmittedTerm(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Check 6.1
            </button>
            <button
              type="button"
              onClick={() => {
                setTermsQuestion(generateTermsQuestion());
                setSelectedTerm(null);
                setSubmittedTerm(false);
              }}
              className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold"
            >
              Next 6.1
            </button>
          </div>
        </div>
      )}

      {mode === '6.2' && (
        <div className="space-y-3 rounded-lg border border-stone-200 p-4">
          <p className="font-semibold">6.2 Written-out Ornaments</p>
          <p className="text-sm text-stone-600">Identify the ornament type from the written sequence.</p>
          <div className="rounded border border-stone-300 bg-stone-50 p-3 font-mono text-sm">{ornamentQuestion.pattern.notes.join('  -  ')}</div>
          <div className="grid gap-2">
            {ornamentQuestion.options.map((option) => {
              const isCorrect = submittedOrnament && option === ornamentQuestion.answer;
              const isWrong = submittedOrnament && selectedOrnament === option && option !== ornamentQuestion.answer;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedOrnament(option)}
                  className={`rounded border px-3 py-2 text-left capitalize ${
                    isCorrect ? 'border-emerald-500 bg-emerald-50' : isWrong ? 'border-red-500 bg-red-50' : selectedOrnament === option ? 'border-stone-900' : 'border-stone-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSubmittedOrnament(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Check 6.2
            </button>
            <button
              type="button"
              onClick={() => {
                setOrnamentQuestion(generateOrnamentQuestion());
                setSelectedOrnament(null);
                setSubmittedOrnament(false);
              }}
              className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold"
            >
              Next 6.2
            </button>
          </div>
        </div>
      )}

      {mode === '6.3' && (
        <div className="space-y-3 rounded-lg border border-stone-200 p-4">
          <p className="font-semibold">6.3 Instrument Statements (True/False)</p>
          {instrumentQuestion.statements.map((statement) => {
            const selected = answers[statement.id];
            const isCorrect = submittedInstrument && selected === statement.answer;
            const isWrong = submittedInstrument && selected !== null && selected !== undefined && selected !== statement.answer;
            return (
              <div key={statement.id} className="rounded border border-stone-200 p-3">
                <p className="mb-2 text-sm">{statement.text}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [statement.id]: true }))}
                    className={`rounded border px-3 py-1 text-sm ${selected === true ? 'bg-stone-900 text-white' : ''}`}
                  >
                    True
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [statement.id]: false }))}
                    className={`rounded border px-3 py-1 text-sm ${selected === false ? 'bg-stone-900 text-white' : ''}`}
                  >
                    False
                  </button>
                  {submittedInstrument && (
                    <span className={`text-sm font-semibold ${isCorrect ? 'text-emerald-600' : isWrong ? 'text-red-600' : 'text-stone-500'}`}>
                      {isCorrect ? 'Correct' : isWrong ? 'Incorrect' : 'Not answered'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex gap-2">
            <button type="button" onClick={() => setSubmittedInstrument(true)} className="rounded bg-stone-900 px-4 py-2 text-sm font-semibold text-white">
              Check 6.3
            </button>
            <button
              type="button"
              onClick={() => {
                setInstrumentQuestion(generateInstrumentQuestion());
                setAnswers({});
                setSubmittedInstrument(false);
              }}
              className="rounded border border-stone-300 px-4 py-2 text-sm font-semibold"
            >
              Next 6.3
            </button>
          </div>

          {submittedInstrument && (
            <p className="text-sm font-semibold">
              Score: {instrumentScore.correct}/{instrumentScore.total}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
