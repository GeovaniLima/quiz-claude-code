'use client';

import { useState } from 'react';
import type { QuizSession } from '@/lib/types';

interface ShareButtonProps {
  session: QuizSession;
}

export default function ShareButton({ session }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const text = `Fiz ${session.score} pts no Claude Code Trivia — ${session.rating}! Teste seus conhecimentos sobre o Claude Code.`;

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text, title: 'Claude Code Trivia' });
        return;
      } catch {
        // fallback se usuário cancelar ou não suportado
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // silently ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="
        flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-claude text-claude
        font-semibold text-sm hover:bg-claude hover:text-white transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
      "
      aria-label="Compartilhar resultado"
    >
      <span aria-hidden="true">{copied ? '✓' : '↗'}</span>
      {copied ? 'Copiado!' : 'Compartilhar resultado'}
    </button>
  );
}
