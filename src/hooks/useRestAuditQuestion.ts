import { useMemo, useState } from 'react';
import { generateRestAuditQuestion, type RestAuditQuestion } from '../utils/music-logic/restAuditGenerator';

export function useRestAuditQuestion() {
  const [question, setQuestion] = useState<RestAuditQuestion>(() => generateRestAuditQuestion());
  const [selectedJudgement, setSelectedJudgement] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = useMemo(
    () => selectedJudgement !== null && selectedJudgement === question.isNotationCorrect,
    [selectedJudgement, question.isNotationCorrect],
  );

  const submit = () => {
    if (selectedJudgement === null) return;
    setIsSubmitted(true);
  };

  const nextQuestion = () => {
    setQuestion(generateRestAuditQuestion());
    setSelectedJudgement(null);
    setIsSubmitted(false);
  };

  return {
    question,
    selectedJudgement,
    setSelectedJudgement,
    isSubmitted,
    isCorrect,
    submit,
    nextQuestion,
  };
}
