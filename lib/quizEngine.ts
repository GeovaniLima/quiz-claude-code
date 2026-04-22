import { QUESTIONS } from './questions';
import type { Category, Level, Question, QuizAnswer, QuizSession } from './types';

const LEVEL_ORDER: Level[] = ['iniciante', 'intermediario', 'avancado', 'expert'];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function drawQuestions(
  category: Category,
  level: Level,
  count = 10,
): Question[] {
  const exact = QUESTIONS.filter(
    (q) => q.category === category && q.level === level,
  );

  if (exact.length >= count) {
    return shuffleArray(exact).slice(0, count);
  }

  // fallback: complementa com outros níveis da mesma categoria (adjacentes primeiro)
  const pool = [...exact];
  const levelIdx = LEVEL_ORDER.indexOf(level);

  // ordenar outros níveis por distância do nível solicitado
  const otherLevels = LEVEL_ORDER
    .map((lvl, i) => ({ lvl, dist: Math.abs(i - levelIdx) }))
    .filter(({ dist }) => dist > 0)
    .sort((a, b) => a.dist - b.dist)
    .map(({ lvl }) => lvl);

  for (const lvl of otherLevels) {
    if (pool.length >= count) break;
    const extras = QUESTIONS.filter(
      (q) => q.category === category && q.level === lvl && !pool.find((p) => p.id === q.id),
    );
    pool.push(...extras);
  }

  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

export function calcScore(answers: QuizAnswer[]): number {
  return answers.reduce((total, a) => {
    if (!a.correct) return total;
    const bonus = a.timeSpentMs < 10_000 ? 5 : 0;
    return total + 10 + bonus;
  }, 0);
}

export function getRating(correctCount: number, total: number): string {
  if (total === 0) return 'Iniciante — Bora estudar!';
  const pct = (correctCount / total) * 100;
  if (pct <= 40) return 'Iniciante — Bora estudar!';
  if (pct <= 70) return 'Conhecedor — Continue praticando!';
  if (pct <= 90) return 'Expert — Muito bom!';
  return 'Mestre do Claude Code 🏆';
}

export function createSession(
  category: Category,
  level: Level,
): QuizSession {
  return {
    id: crypto.randomUUID(),
    category,
    level,
    startedAt: new Date().toISOString(),
    answers: [],
    score: 0,
    rating: '',
  };
}

export function finalizeSession(
  session: QuizSession,
  answers: QuizAnswer[],
): QuizSession {
  const score = calcScore(answers);
  const correctCount = answers.filter((a) => a.correct).length;
  return {
    ...session,
    answers,
    score,
    rating: getRating(correctCount, answers.length),
    finishedAt: new Date().toISOString(),
  };
}
