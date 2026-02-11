import { useMemo, useState } from 'react';
import { generateRestCompletionQuestion, type RestQuestion } from '../utils/music-logic/restGenerator';

export function useRestQuestion() {
  const [question, setQuestion] = useState<RestQuestion>(() => generateRestCompletionQuestion());
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = useMemo(
    () => selectedOptionId !== null && selectedOptionId === question.correctOptionId,
    [question.correctOptionId, selectedOptionId],
  );

  const submit = () => {
    if (!selectedOptionId) return;
    setIsSubmitted(true);
  };

  const nextQuestion = () => {
    setQuestion(generateRestCompletionQuestion());
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
