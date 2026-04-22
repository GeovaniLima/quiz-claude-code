'use client';

import type { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  label: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export default function CategoryCard({
  label,
  description,
  icon,
  selected,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl bg-white shadow-sm p-5
        border-2 transition-all duration-200
        hover:shadow-md hover:-translate-y-0.5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-claude focus-visible:ring-offset-2
        ${selected ? 'border-claude shadow-md' : 'border-transparent'}
      `}
      aria-pressed={selected}
    >
      <span className="text-2xl mb-2 block" aria-hidden="true">{icon}</span>
      <span className="block font-semibold text-ink text-sm">{label}</span>
      <span className="block text-xs text-ink/60 mt-1 leading-relaxed">{description}</span>
    </button>
  );
}
