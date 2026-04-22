'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import type { QuizSession } from '@/lib/types';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/types';
import { listSessions } from '@/lib/storage';
import ShareButton from '@/components/ShareButton';

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sid = params.get('sid');
  const [session, setSession] = useState<QuizSession | null>(null);

  useEffect(() => {
    if (!sid) { router.replace('/'); return; }
    const sessions = listSessions();
    const found = sessions.find((s) => s.id === sid);
    if (!found) { router.replace('/'); return; }
    setSession(found);
  }, [sid, router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink/50 text-sm">Carregando resultado...</p>
      </div>
    );
  }

  const total = session.answers.length;
  const correct = session.answers.filter((a) => a.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const totalTimeMs = session.answers.reduce((s, a) => s + a.timeSpentMs, 0);
  const totalSec = Math.round(totalTimeMs / 1000);

  const ratingEmoji =
    pct === 100 ? '🏆' : pct >= 91 ? '🥇' : pct >= 71 ? '🥈' : pct >= 41 ? '🥉' : '📚';

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3" aria-hidden="true">{ratingEmoji}</span>
          <h1 className="text-2xl font-bold text-ink mb-1">{session.rating}</h1>
          <p className="text-sm text-ink/50">
            {CATEGORY_LABELS[session.category]} · {LEVEL_LABELS[session.level]}
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-claude">{session.score}</p>
              <p className="text-xs text-ink/50 mt-1">pontos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{correct}/{total}</p>
              <p className="text-xs text-ink/50 mt-1">acertos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{pct}%</p>
              <p className="text-xs text-ink/50 mt-1">aproveitamento</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-ink/8 text-center">
            <p className="text-xs text-ink/40">Tempo total: {totalSec}s</p>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <h2 className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-3">Resumo</h2>
          <div className="flex gap-1.5 flex-wrap">
            {session.answers.map((a, i) => (
              <div
                key={a.questionId}
                title={`Pergunta ${i + 1}: ${a.correct ? 'Correta' : 'Errada'}`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                  ${a.correct ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <ShareButton session={session} />

          <Link
            href={`/?cat=${session.category}&lvl=${session.level}`}
            className="
              w-full py-3 rounded-xl bg-claude text-white font-semibold text-sm text-center
              hover:bg-claude-dark transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
            "
          >
            Jogar novamente →
          </Link>

          <Link
            href="/"
            className="
              w-full py-3 rounded-xl border border-ink/20 text-ink font-medium text-sm text-center
              hover:border-claude hover:text-claude transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
            "
          >
            Escolher outra categoria
          </Link>

          <Link
            href="/history"
            className="text-center text-xs text-ink/40 hover:text-claude transition-colors"
          >
            Ver histórico →
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-ink/50 text-sm">Carregando...</p></div>}>
      <ResultContent />
    </Suspense>
  );
}
