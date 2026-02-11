import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdvancedBeamingQuestionView } from './components/Rhythm/AdvancedBeamingQuestion';
import { BeamingQuestionView } from './components/Rhythm/BeamingQuestion';
import { RestAuditQuestionView } from './components/Rhythm/RestAuditQuestion';
import { RestQuestionView } from './components/Rhythm/RestQuestion';
import { RhythmQuestionView } from './components/Rhythm/RhythmQuestion';
import { PitchSection } from './components/Pitch/PitchSection';
import { KeysAndScalesSection } from './components/KeysAndScales/KeysAndScalesSection';
import { IntervalsSection } from './components/Intervals/IntervalsSection';
import { ChordsSection } from './components/Chords/ChordsSection';
import { useAdvancedBeamingQuestion } from './hooks/useAdvancedBeamingQuestion';
import { useBeamingQuestion } from './hooks/useBeamingQuestion';
import { useRestAuditQuestion } from './hooks/useRestAuditQuestion';
import { useRestQuestion } from './hooks/useRestQuestion';
import { useRhythmQuestion } from './hooks/useRhythmQuestion';
import { MusicInContextSection } from './components/MusicInContext/MusicInContextSection';
import { MusicLanguageSection } from './components/MusicLanguageSection';
import { SectionErrorBoundary } from './components/common/SectionErrorBoundary';
import type { TimeSignatureId } from './utils/music-logic/rhythmGenerator';

type SectionMode = '1.1' | '1.2' | '1.3' | '1.4' | '1.5' | 'mixed';
type QuestionKind = 'time-signature' | 'rest' | 'beaming' | 'advanced-beaming' | 'rest-audit';
type Chapter = 'rhythm' | 'pitch' | 'keys' | 'intervals' | 'chords' | 'language' | 'context';

function RhythmSection(): JSX.Element {
  const [mode, setMode] = useState<SectionMode>('1.1');
  const [mixedType, setMixedType] = useState<QuestionKind>('time-signature');

  const rhythm = useRhythmQuestion();
  const rest = useRestQuestion();
  const beaming = useBeamingQuestion();
  const advancedBeaming = useAdvancedBeamingQuestion();
  const restAudit = useRestAuditQuestion();

  const activeType: QuestionKind =
    mode === 'mixed'
      ? mixedType
      : mode === '1.1'
        ? 'time-signature'
        : mode === '1.2'
          ? 'rest'
          : mode === '1.3'
            ? 'beaming'
            : mode === '1.4'
              ? 'advanced-beaming'
              : 'rest-audit';

  const randomizeMixed = () => {
    const pool: QuestionKind[] = ['time-signature', 'rest', 'beaming', 'advanced-beaming', 'rest-audit'];
    setMixedType(pool[Math.floor(Math.random() * pool.length)]);
  };

  const onNextQuestion = () => {
    if (activeType === 'time-signature') rhythm.nextQuestion();
    if (activeType === 'rest') rest.nextQuestion();
    if (activeType === 'beaming') beaming.nextQuestion();
    if (activeType === 'advanced-beaming') advancedBeaming.nextQuestion();
    if (activeType === 'rest-audit') restAudit.nextQuestion();
    if (mode === 'mixed') randomizeMixed();
  };

  const onSubmit = () => {
    if (activeType === 'time-signature') rhythm.submit();
    if (activeType === 'rest') rest.submit();
    if (activeType === 'beaming') beaming.submit();
    if (activeType === 'advanced-beaming') advancedBeaming.submit();
    if (activeType === 'rest-audit') restAudit.submit();
  };

  const activeSubmitted =
    activeType === 'time-signature'
      ? rhythm.isSubmitted
      : activeType === 'rest'
        ? rest.isSubmitted
        : activeType === 'beaming'
          ? beaming.isSubmitted
          : activeType === 'advanced-beaming'
            ? advancedBeaming.isSubmitted
            : restAudit.isSubmitted;

  const activeCorrect =
    activeType === 'time-signature'
      ? rhythm.isCorrect
      : activeType === 'rest'
        ? rest.isCorrect
        : activeType === 'beaming'
          ? beaming.isCorrect
          : activeType === 'advanced-beaming'
            ? advancedBeaming.isCorrect
            : restAudit.isCorrect;

  const canSubmit =
    activeType === 'time-signature'
      ? !!rhythm.selectedChoice
      : activeType === 'rest'
        ? !!rest.selectedOptionId
        : activeType === 'beaming'
          ? !!beaming.selectedOptionId
          : activeType === 'advanced-beaming'
            ? !!advancedBeaming.selectedOptionId
            : restAudit.selectedJudgement !== null;

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
    if (choice === rhythm.question.timeSignature) return 'border-emerald-500 bg-emerald-50 text-emerald-700';
    if (choice === rhythm.selectedChoice) return 'border-red-500 bg-red-50 text-red-700';
    return 'border-stone-300 bg-white text-stone-500';
  };

  const activeExplanation =
    activeType === 'time-signature'
      ? rhythm.question.explanation
      : activeType === 'rest'
        ? rest.question.explanation
        : activeType === 'beaming'
          ? beaming.question.explanation
          : activeType === 'advanced-beaming'
            ? advancedBeaming.question.explanation
            : restAudit.question.explanation;

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
      <div className="flex flex-wrap items-center gap-2">
        {([
          ['1.1', '1.1 辨識拍號'],
          ['1.2', '1.2 填補休止符'],
          ['1.3', '1.3 連尾規則'],
          ['1.4', '1.4 進階音符組合'],
          ['1.5', '1.5 休止符改錯'],
          ['mixed', '隨機混合'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMode(id);
              if (id === 'mixed') randomizeMixed();
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${mode === id ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'}`}
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
              <button key={choice} type="button" onClick={() => rhythm.setSelectedChoice(choice)} className={`rounded-lg border px-4 py-3 text-lg font-semibold transition ${getChoiceClass(choice)}`}>
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
            {rest.question.options.map((option) => (
              <button key={option.id} type="button" onClick={() => rest.setSelectedOptionId(option.id)} className="rounded-lg border px-4 py-3 text-left text-sm font-semibold">
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}

      {activeType === 'beaming' && (
        <>
          <h2 className="text-lg font-semibold">題目 1.3：音符組合與連尾規則</h2>
          <BeamingQuestionView question={beaming.question} selectedOptionId={beaming.selectedOptionId} onSelect={beaming.setSelectedOptionId} isSubmitted={beaming.isSubmitted} />
        </>
      )}

      {activeType === 'advanced-beaming' && (
        <>
          <h2 className="text-lg font-semibold">題目 1.4：進階音符組合</h2>
          <AdvancedBeamingQuestionView question={advancedBeaming.question} selectedOptionId={advancedBeaming.selectedOptionId} onSelect={advancedBeaming.setSelectedOptionId} isSubmitted={advancedBeaming.isSubmitted} />
        </>
      )}

      {activeType === 'rest-audit' && (
        <>
          <h2 className="text-lg font-semibold">題目 1.5：休止符改錯</h2>
          <RestAuditQuestionView question={restAudit.question} selectedJudgement={restAudit.selectedJudgement} onSelectJudgement={restAudit.setSelectedJudgement} isSubmitted={restAudit.isSubmitted} />
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onSubmit} disabled={!canSubmit || activeSubmitted} className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          檢查答案
        </button>
        <button type="button" onClick={onNextQuestion} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold">
          <RefreshCw size={16} /> 下一題
        </button>
      </div>

      {activeSubmitted && activeType !== 'rest-audit' && (
        <div className={`rounded-lg border p-4 text-sm ${activeCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
          <p className="font-semibold">{activeCorrect ? '答對了！' : '答錯了，請看解析：'}</p>
          <p>{activeExplanation}</p>
        </div>
      )}
    </section>
  );
}


function getChapterTitle(chapter: Chapter): string {
  if (chapter === 'rhythm') return 'Section 1: Rhythm';
  if (chapter === 'pitch') return 'Section 2: Pitch';
  if (chapter === 'keys') return 'Section 3: Keys & Scales';
  if (chapter === 'intervals') return 'Section 4: Intervals';
  if (chapter === 'chords') return 'Section 5: Chords';
  if (chapter === 'language') return 'Section 6: Terms, Signs, Instruments';
  return 'Section 7: Music in Context';
}

function HomePage(): JSX.Element {
  const [chapter, setChapter] = useState<Chapter>('rhythm');

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-8 text-stone-800 dark:text-stone-100 md:px-6">
      <header className="space-y-2 border-b border-stone-300 pb-4 dark:border-stone-700">
        <h1 className="text-3xl font-bold tracking-tight">ABRSM 五級樂理｜Infinite Question Generator</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">Section 1 Rhythm / Section 2 Pitch / Section 3 Keys and Scales / Section 4 Intervals / Section 5 Chords / Section 6 Terms, Signs, Instruments / Section 7 Music in Context</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setChapter('rhythm')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'rhythm' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 1: Rhythm
        </button>
        <button type="button" onClick={() => setChapter('pitch')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'pitch' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 2: Pitch
        </button>
        <button type="button" onClick={() => setChapter('keys')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'keys' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 3: Keys & Scales
        </button>
        <button type="button" onClick={() => setChapter('intervals')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'intervals' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 4: Intervals
        </button>
        <button type="button" onClick={() => setChapter('chords')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'chords' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 5: Chords
        </button>
        <button type="button" onClick={() => setChapter('language')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'language' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 6: Terms, Signs, Instruments
        </button>
        <button type="button" onClick={() => setChapter('context')} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${chapter === 'context' ? 'bg-stone-900 text-white' : 'bg-white'}`}>
          Section 7: Music in Context
        </button>
      </div>

      <SectionErrorBoundary key={chapter} sectionName={getChapterTitle(chapter)}>
        {chapter === 'rhythm' ? <RhythmSection /> : chapter === 'pitch' ? <PitchSection /> : chapter === 'keys' ? <KeysAndScalesSection /> : chapter === 'intervals' ? <IntervalsSection /> : chapter === 'chords' ? <ChordsSection /> : chapter === 'language' ? <MusicLanguageSection /> : <MusicInContextSection />}
      </SectionErrorBoundary>
    </main>
  );
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
