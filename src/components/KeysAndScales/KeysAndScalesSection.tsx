import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ChromaticScaleAudit } from './ChromaticScaleAudit';
import { ClefIdentification } from './ClefIdentification';
import { KeyAnalysis } from './KeyAnalysis';
import { KeySignatureQuiz } from './KeySignatureQuiz';
import { ScaleCompletion } from './ScaleCompletion';
import { TechnicalNames } from './TechnicalNames';
import {
  generateChromaticScaleAudit,
  generateClefIdentification,
  generateKeyAnalysis,
  generateKeySignatureQuiz,
  generateScaleCompletion,
  generateTechnicalNames,
  type ClefType,
} from '../../utils/music-logic/scales';

type Mode = '3.1' | '3.3' | '3.4' | '3.5' | '3.6' | '3.7' | 'mixed';
type Kind = 'keySig' | 'analysis' | 'completion' | 'clef' | 'chromatic' | 'technical';

export function KeysAndScalesSection(): JSX.Element {
  const [mode, setMode] = useState<Mode>('3.1');
  const [mixed, setMixed] = useState<Kind>('keySig');

  const [qSig, setQSig] = useState(() => generateKeySignatureQuiz());
  const [qAna, setQAna] = useState(() => generateKeyAnalysis());
  const [qComp, setQComp] = useState(() => generateScaleCompletion());
  const [qClef, setQClef] = useState(() => generateClefIdentification());
  const [qChr, setQChr] = useState(() => generateChromaticScaleAudit());
  const [qTech, setQTech] = useState(() => generateTechnicalNames());

  const [aSig, setASig] = useState<string | null>(null);
  const [aAna, setAAna] = useState<string | null>(null);
  const [aX, setAX] = useState<string | null>(null);
  const [aY, setAY] = useState<string | null>(null);
  const [aClef, setAClef] = useState<ClefType | null>(null);
  const [aChr, setAChr] = useState<boolean | null>(null);
  const [aTech, setATech] = useState<boolean | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const active: Kind = mode === 'mixed' ? mixed : mode === '3.1' ? 'keySig' : mode === '3.3' ? 'analysis' : mode === '3.4' ? 'completion' : mode === '3.5' ? 'clef' : mode === '3.6' ? 'chromatic' : 'technical';

  const randomizeMixed = () => {
    const pool: Kind[] = ['keySig', 'analysis', 'completion', 'clef', 'chromatic', 'technical'];
    setMixed(pool[Math.floor(Math.random() * pool.length)]);
  };

  const canSubmit =
    active === 'keySig'
      ? aSig !== null
      : active === 'analysis'
        ? aAna !== null
        : active === 'completion'
          ? aX !== null && aY !== null
          : active === 'clef'
            ? aClef !== null
            : active === 'chromatic'
              ? aChr !== null
              : aTech !== null;

  const onNext = () => {
    if (active === 'keySig') {
      setQSig(generateKeySignatureQuiz());
      setASig(null);
    }
    if (active === 'analysis') {
      setQAna(generateKeyAnalysis());
      setAAna(null);
    }
    if (active === 'completion') {
      setQComp(generateScaleCompletion());
      setAX(null);
      setAY(null);
    }
    if (active === 'clef') {
      setQClef(generateClefIdentification());
      setAClef(null);
    }
    if (active === 'chromatic') {
      setQChr(generateChromaticScaleAudit());
      setAChr(null);
    }
    if (active === 'technical') {
      setQTech(generateTechnicalNames());
      setATech(null);
    }
    if (mode === 'mixed') randomizeMixed();
    setSubmitted(false);
  };

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {([
          ['3.1', '3.1/3.2 調號辨識'],
          ['3.3', '3.3 調性分析'],
          ['3.4', '3.4 音階填空'],
          ['3.5', '3.5 譜號反推'],
          ['3.6', '3.6 半音階'],
          ['3.7', '3.7 音級名稱'],
          ['mixed', '隨機混合'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setMode(id); setSubmitted(false); if (id === 'mixed') randomizeMixed(); }} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${mode===id?'bg-stone-900 text-white':''}`}>
            {label}
          </button>
        ))}
      </div>

      {active === 'keySig' && <KeySignatureQuiz question={qSig} selected={aSig} submitted={submitted} onSelect={setASig} />}
      {active === 'analysis' && <KeyAnalysis question={qAna} selected={aAna} submitted={submitted} onSelect={setAAna} />}
      {active === 'completion' && <ScaleCompletion question={qComp} x={aX} y={aY} submitted={submitted} onSelectX={setAX} onSelectY={setAY} />}
      {active === 'clef' && <ClefIdentification question={qClef} selected={aClef} submitted={submitted} onSelect={setAClef} />}
      {active === 'chromatic' && <ChromaticScaleAudit question={qChr} selected={aChr} submitted={submitted} onSelect={setAChr} />}
      {active === 'technical' && <TechnicalNames question={qTech} selected={aTech} submitted={submitted} onSelect={setATech} />}

      <div className="flex gap-2">
        <button type="button" disabled={!canSubmit || submitted} onClick={() => setSubmitted(true)} className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          檢查答案
        </button>
        <button type="button" onClick={onNext} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
          <RefreshCw size={16} /> 下一題
        </button>
      </div>
    </section>
  );
}
