import { useMemo, useState } from 'react';
import { generateBeamingQuestion, type BeamingQuestion } from '../utils/music-logic/beamingQuestionGenerator';

export function useBeamingQuestion() {
  const [question, setQuestion] = useState<BeamingQuestion>(() => generateBeamingQuestion());
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = useMemo(
    () => selectedOptionId !== null && selectedOptionId === question.correctOptionId,
    [selectedOptionId, question.correctOptionId],
  );

  const submit = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
  };

  const nextQuestion = () => {
    setQuestion(generateBeamingQuestion());
    setSelectedOptionId(null);
    setIsSubmitted(false);
  };

  return {
    question,
    selectedOptionId,
    setSelectedOptionId,
    isSubmitted,
    isCorrect,
    submit,
    nextQuestion,
  };
}
