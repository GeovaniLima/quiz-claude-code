'use client';

import type { Level } from '@/lib/types';
import { LEVEL_LABELS } from '@/lib/types';

interface LevelSelectorProps {
  selected: Level | null;
  onChange: (level: Level) => void;
}

const LEVELS: Level[] = ['iniciante', 'intermediario', 'avancado', 'expert'];

export default function LevelSelector({ selected, onChange }: LevelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Selecione o nível">
      {LEVELS.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
            ${
              selected === level
                ? 'bg-claude text-white shadow-sm'
                : 'bg-white text-ink border border-ink/20 hover:border-claude hover:text-claude'
            }
          `}
          aria-pressed={selected === level}
        >
          {LEVEL_LABELS[level]}
        </button>
      ))}
    </div>
  );
}
