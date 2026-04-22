'use client';

import { useEffect } from 'react';
import type { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (chosen: boolean) => void;
  disabled: boolean;
}

export default function QuestionCard({ question, onAnswer, disabled }: QuestionCardProps) {
  useEffect(() => {
    if (disabled) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'v' || e.key === 'V') onAnswer(true);
      if (e.key === 'f' || e.key === 'F') onAnswer(false);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [disabled, onAnswer]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 w-full">
      <p className="text-ink font-medium text-lg leading-relaxed mb-8">
        {question.statement}
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => !disabled && onAnswer(true)}
          disabled={disabled}
          className={`
            flex-1 py-4 rounded-xl font-semibold text-sm transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success
            ${disabled
              ? 'bg-success/10 text-success/50 cursor-not-allowed'
              : 'bg-success/10 text-success hover:bg-success hover:text-white active:scale-95'}
          `}
          aria-label="Responder Verdadeiro (tecla V)"
        >
          Verdadeiro
          {!disabled && <span className="ml-2 text-xs opacity-50">[V]</span>}
        </button>

        <button
          onClick={() => !disabled && onAnswer(false)}
          disabled={disabled}
          className={`
            flex-1 py-4 rounded-xl font-semibold text-sm transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-danger
            ${disabled
              ? 'bg-danger/10 text-danger/50 cursor-not-allowed'
              : 'bg-danger/10 text-danger hover:bg-danger hover:text-white active:scale-95'}
          `}
          aria-label="Responder Falso (tecla F)"
        >
          Falso
          {!disabled && <span className="ml-2 text-xs opacity-50">[F]</span>}
        </button>
      </div>
    </div>
  );
}
