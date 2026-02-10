import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BeamingQuestionView } from './components/Rhythm/BeamingQuestion';
import { RestQuestionView } from './components/Rhythm/RestQuestion';
import { RhythmQuestionView } from './components/Rhythm/RhythmQuestion';
import { useBeamingQuestion } from './hooks/useBeamingQuestion';
import { useRestQuestion } from './hooks/useRestQuestion';
import { useRhythmQuestion } from './hooks/useRhythmQuestion';
import type { TimeSignatureId } from './utils/music-logic/rhythmGenerator';

const PROJECT_STRUCTURE = [
  'src/',
  '  components/',
  '    Rhythm/',
  '      RhythmQuestion.tsx',
  '      RestQuestion.tsx',
  '      BeamingQuestion.tsx',
  '  hooks/',
  '    useRhythmQuestion.ts',
  '    useRestQuestion.ts',
  '    useBeamingQuestion.ts',
  '  utils/',
  '    music-logic/',
  '      rhythmGenerator.ts',
  '      restGenerator.ts',
  '      beamingQuestionGenerator.ts',
  '  App.tsx',
  '  main.tsx',
  '  styles/index.css',
] as const;

type SectionMode = '1.1' | '1.2' | '1.3' | 'mixed';
type QuestionKind = 'time-signature' | 'rest' | 'beaming';

function RhythmPage(): JSX.Element {
  const [mode, setMode] = useState<SectionMode>('1.1');
  const [mixedType, setMixedType] = useState<QuestionKind>('time-signature');

  const rhythm = useRhythmQuestion();
  const rest = useRestQuestion();
  const beaming = useBeamingQuestion();

  const activeType: QuestionKind = mode === 'mixed' ? mixedType : mode === '1.1' ? 'time-signature' : mode === '1.2' ? 'rest' : 'beaming';

  const randomizeMixed = () => {
    const pool: QuestionKind[] = ['time-signature', 'rest', 'beaming'];
    setMixedType(pool[Math.floor(Math.random() * pool.length)]);
  };

  const onNextQuestion = () => {
    if (activeType === 'time-signature') rhythm.nextQuestion();
    if (activeType === 'rest') rest.nextQuestion();
    if (activeType === 'beaming') beaming.nextQuestion();

    if (mode === 'mixed') randomizeMixed();
  };

  const onSubmit = () => {
    if (activeType === 'time-signature') rhythm.submit();
    if (activeType === 'rest') rest.submit();
    if (activeType === 'beaming') beaming.submit();
  };

  const activeSubmitted =
    activeType === 'time-signature' ? rhythm.isSubmitted : activeType === 'rest' ? rest.isSubmitted : beaming.isSubmitted;

  const activeCorrect = activeType === 'time-signature' ? rhythm.isCorrect : activeType === 'rest' ? rest.isCorrect : beaming.isCorrect;

  const canSubmit =
    activeType === 'time-signature'
      ? !!rhythm.selectedChoice
      : activeType === 'rest'
        ? !!rest.selectedOptionId
        : !!beaming.selectedOptionId;

  const selectedRestOption = useMemo(
    () => rest.question.options.find((option) => option.id === rest.selectedOptionId) ?? null,
    [rest.question.options, rest.selectedOptionId],
  );

  const getChoiceClass = (choice: TimeSignatureId): string => {
    if (!rhythm.isSubmitted) {
      return rhythm.selectedChoice === choice
        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
        : 'border-stone-300 bg-white hover:border-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:hover:border-stone-400';
    }
    if (choice === rhythm.question.timeSignature) {
      return 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200';
    }
    if (choice === rhythm.selectedChoice) {
      return 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200';
    }
    return 'border-stone-300 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400';
  };

  const activeExplanation =
    activeType === 'time-signature'
      ? rhythm.question.explanation
      : activeType === 'rest'
        ? rest.question.explanation
        : beaming.question.explanation;

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-8 text-stone-800 dark:text-stone-100 md:px-6">
      <header className="space-y-2 border-b border-stone-300 pb-4 dark:border-stone-700">
        <h1 className="text-3xl font-bold tracking-tight">ABRSM 五級樂理｜節奏無限題庫</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">單元 1：Rhythm（1.1 辨識拍號、1.2 填補休止符、1.3 音符組合與連尾規則）</p>
      </header>

      <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <h2 className="mb-2 text-lg font-semibold">建議專案結構（src）</h2>
        <pre className="overflow-x-auto rounded-lg bg-stone-100 p-3 text-sm leading-6 dark:bg-stone-800">{PROJECT_STRUCTURE.join('\n')}</pre>
      </section>

      <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
        <div className="flex flex-wrap items-center gap-2">
          {([
            ['1.1', '1.1 辨識拍號'],
            ['1.2', '1.2 填補休止符'],
            ['1.3', '1.3 連尾規則'],
            ['mixed', '隨機混合'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                if (id === 'mixed') randomizeMixed();
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                mode === id
                  ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                  : 'border-stone-300 dark:border-stone-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeType === 'time-signature' && (
          <>
            <h2 className="text-lg font-semibold">題目 1.1：請圈選正確拍號</h2>
            <RhythmQuestionView question={rhythm.question} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {rhythm.question.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => rhythm.setSelectedChoice(choice)}
                  className={`rounded-lg border px-4 py-3 text-lg font-semibold transition ${getChoiceClass(choice)}`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </>
        )}

        {activeType === 'rest' && (
          <>
            <h2 className="text-lg font-semibold">題目 1.2：填補休止符</h2>
            <RestQuestionView question={rest.question} selectedOption={selectedRestOption} />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {rest.question.options.map((option) => {
                const active = option.id === rest.selectedOptionId;
                const isCorrect = rest.isSubmitted && option.isCorrect;
                const isWrongSelected = rest.isSubmitted && active && !option.isCorrect;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => rest.setSelectedOptionId(option.id)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : isWrongSelected
                          ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200'
                          : active
                            ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                            : 'border-stone-300 bg-white hover:border-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:hover:border-stone-400'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {activeType === 'beaming' && (
          <>
            <h2 className="text-lg font-semibold">題目 1.3：音符組合與連尾規則</h2>
            <BeamingQuestionView
              question={beaming.question}
              selectedOptionId={beaming.selectedOptionId}
              onSelect={beaming.setSelectedOptionId}
              isSubmitted={beaming.isSubmitted}
            />
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || activeSubmitted}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
          >
            檢查答案
          </button>
          <button
            type="button"
            onClick={onNextQuestion}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold hover:border-stone-500 dark:border-stone-600 dark:hover:border-stone-400"
          >
            <RefreshCw size={16} />
            下一題
          </button>
        </div>

        {activeSubmitted && (
          <div
            className={`rounded-lg border p-4 text-sm leading-7 ${
              activeCorrect
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-100'
                : 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-100'
            }`}
          >
            <p className="font-semibold">{activeCorrect ? '答對了！' : '答錯了，請看解析：'}</p>
            <p>{activeExplanation}</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<RhythmPage />} />
    </Routes>
  );
}
