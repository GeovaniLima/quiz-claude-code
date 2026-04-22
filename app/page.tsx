'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategoryCard from '@/components/CategoryCard';
import LevelSelector from '@/components/LevelSelector';
import type { Category, Level } from '@/lib/types';

const CATEGORIES: { id: Category; label: string; description: string; icon: string }[] = [
  {
    id: 'negocio',
    label: 'Negócio',
    description: 'O que é, para quem serve e como o Claude Code se posiciona no mercado.',
    icon: '💼',
  },
  {
    id: 'setup',
    label: 'Setup',
    description: 'Instalação, configuração, autenticação e ambientes suportados.',
    icon: '⚙️',
  },
  {
    id: 'comandos',
    label: 'Comandos & Hooks',
    description: 'Slash commands, hooks, atalhos de teclado e automações.',
    icon: '⌨️',
  },
  {
    id: 'mcp-sdk',
    label: 'MCP & SDK',
    description: 'Model Context Protocol, Agent SDK, subagentes e integrações avançadas.',
    icon: '🔌',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  function handleStart() {
    if (!selectedCategory || !selectedLevel) return;
    router.push(`/quiz?cat=${selectedCategory}&lvl=${selectedLevel}`);
  }

  const canStart = selectedCategory !== null && selectedLevel !== null;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-claude/10 mb-4">
            <span className="text-3xl" aria-hidden="true">🤖</span>
          </div>
          <h1 className="text-3xl font-bold text-ink mb-2">Claude Code Trivia</h1>
          <p className="text-ink/60 text-sm leading-relaxed max-w-xs mx-auto">
            Teste seus conhecimentos sobre o Claude Code — o CLI oficial da Anthropic.
          </p>
        </div>

        {/* Category selection */}
        <section aria-labelledby="cat-heading" className="mb-6">
          <h2 id="cat-heading" className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-3">
            1. Escolha uma categoria
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat.id}
                label={cat.label}
                description={cat.description}
                icon={cat.icon}
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </section>

        {/* Level selection */}
        <section aria-labelledby="lvl-heading" className="mb-8">
          <h2 id="lvl-heading" className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-3">
            2. Escolha o nível
          </h2>
          <LevelSelector selected={selectedLevel} onChange={setSelectedLevel} />
        </section>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`
            w-full py-4 rounded-2xl font-bold text-base transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
            ${canStart
              ? 'bg-claude text-white hover:bg-claude-dark shadow-md hover:shadow-lg active:scale-98'
              : 'bg-ink/10 text-ink/30 cursor-not-allowed'}
          `}
          aria-disabled={!canStart}
        >
          Começar Quiz →
        </button>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-ink/40 mb-3">
            10 perguntas · Verdadeiro ou Falso · 30s por pergunta
          </p>
          <a href="/history" className="text-xs text-claude hover:underline">
            Ver histórico →
          </a>
        </div>
      </div>
    </main>
  );
}
