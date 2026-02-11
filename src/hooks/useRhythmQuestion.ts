import { useMemo, useState } from 'react';
import { generateRhythmQuestion, type RhythmQuestion, type TimeSignatureId } from '../utils/music-logic/rhythmGenerator';

interface UseRhythmQuestionResult {
  question: RhythmQuestion;
  selectedChoice: TimeSignatureId | null;
  setSelectedChoice: (value: TimeSignatureId) => void;
  isSubmitted: boolean;
  isCorrect: boolean;
  submit: () => void;
  nextQuestion: () => void;
}

export function useRhythmQuestion(): UseRhythmQuestionResult {
  const [question, setQuestion] = useState<RhythmQuestion>(() => generateRhythmQuestion());
  const [selectedChoice, setSelectedChoice] = useState<TimeSignatureId | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = useMemo(() => selectedChoice === question.timeSignature, [selectedChoice, question.timeSignature]);

  const submit = () => {
    if (!selectedChoice) return;
    setIsSubmitted(true);
  };

  const nextQuestion = () => {
    setQuestion(generateRhythmQuestion());
    setSelectedChoice(null);
    setIsSubmitted(false);
  };

  return {
    question,
    selectedChoice,
    setSelectedChoice,
    isSubmitted,
    isCorrect,
    submit,
    nextQuestion,
  };
}
