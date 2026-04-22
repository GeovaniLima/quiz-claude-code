import type { QuizSession } from './types';

const KEY = 'claude-code-trivia:sessions';
const MAX_SESSIONS = 50;

export function saveSession(session: QuizSession): void {
  try {
    const existing = listSessions();
    const updated = [session, ...existing].slice(0, MAX_SESSIONS);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable (SSR or private browsing)
  }
}

export function listSessions(): QuizSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QuizSession[];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
