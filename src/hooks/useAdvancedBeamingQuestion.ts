import { useMemo, useState } from 'react';
import { generateCompoundBeamingQuestion, type AdvancedBeamingQuestion } from '../utils/music-logic/advancedBeamingGenerator';

export function useAdvancedBeamingQuestion() {
  const [question, setQuestion] = useState<AdvancedBeamingQuestion>(() => generateCompoundBeamingQuestion());
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
    setQuestion(generateCompoundBeamingQuestion());
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
