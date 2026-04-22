'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { QuizSession } from '@/lib/types';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/types';
import { listSessions, clearHistory } from '@/lib/storage';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setSessions(listSessions());
  }, []);

  function handleClear() {
    if (!confirming) { setConfirming(true); return; }
    clearHistory();
    setSessions([]);
    setConfirming(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">Histórico</h1>
            <p className="text-xs text-ink/50 mt-0.5">{sessions.length} sessão(ões)</p>
          </div>
          <Link href="/" className="text-sm text-claude hover:underline">← Voltar</Link>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <span className="text-4xl block mb-3" aria-hidden="true">📭</span>
            <p className="text-ink/50 text-sm">Nenhuma sessão ainda.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-claude hover:underline">
              Jogar agora →
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-6">
              {sessions.map((s) => {
                const correct = s.answers.filter((a) => a.correct).length;
                const pct = s.answers.length > 0 ? Math.round((correct / s.answers.length) * 100) : 0;
                const date = new Date(s.startedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                });

                return (
                  <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
                      ${pct >= 91 ? 'bg-success/15 text-success'
                      : pct >= 71 ? 'bg-claude/15 text-claude'
                      : pct >= 41 ? 'bg-ink/10 text-ink'
                      : 'bg-danger/10 text-danger'}`}
                    >
                      {pct}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{s.rating}</p>
                      <p className="text-xs text-ink/50 mt-0.5">
                        {CATEGORY_LABELS[s.category]} · {LEVEL_LABELS[s.level]} · {s.score} pts
                      </p>
                    </div>
                    <p className="text-xs text-ink/40 shrink-0">{date}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleClear}
              className={`
                w-full py-3 rounded-xl text-sm font-medium transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2
                ${confirming
                  ? 'bg-danger text-white'
                  : 'border border-danger/30 text-danger hover:bg-danger/5'}
              `}
            >
              {confirming ? 'Clique novamente para confirmar' : 'Limpar histórico'}
            </button>
            {confirming && (
              <button onClick={() => setConfirming(false)} className="w-full mt-2 text-xs text-ink/40 hover:text-ink">
                Cancelar
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
