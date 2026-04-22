'use client';

import { useEffect } from 'react';
import type { Question } from '@/lib/types';

interface ExplanationPanelProps {
  question: Question;
  wasCorrect: boolean;
  isLast: boolean;
  onNext: () => void;
}

export default function ExplanationPanel({ question, wasCorrect, isLast, onNext }: ExplanationPanelProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === 'ArrowRight') onNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNext]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        rounded-2xl p-5 border-l-4 animate-in slide-in-from-bottom-4 duration-300
        ${wasCorrect
          ? 'bg-success/8 border-success'
          : 'bg-danger/8 border-danger'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl" aria-hidden="true">{wasCorrect ? '✅' : '❌'}</span>
        <span className={`font-semibold text-sm ${wasCorrect ? 'text-success' : 'text-danger'}`}>
          {wasCorrect ? 'Correto!' : `Errado! A resposta é ${question.answer ? 'Verdadeiro' : 'Falso'}.`}
        </span>
      </div>

      <p className="text-ink/80 text-sm leading-relaxed mb-3">{question.explanation}</p>

      {question.docUrl && (
        <a
          href={question.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-claude hover:underline"
          aria-label="Abrir documentação oficial (abre em nova aba)"
        >
          Ver documentação ↗
        </a>
      )}

      <button
        onClick={onNext}
        className="
          mt-4 w-full py-3 rounded-xl bg-claude text-white font-semibold text-sm
          hover:bg-claude-dark transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
          active:scale-98
        "
        aria-label={isLast ? 'Ver resultado (Enter)' : 'Próxima pergunta (Enter)'}
      >
        {isLast ? 'Ver resultado →' : 'Próxima →'}
        <span className="ml-2 text-xs opacity-60">[Enter]</span>
      </button>
    </div>
  );
}
