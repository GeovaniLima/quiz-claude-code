export type Category = 'negocio' | 'setup' | 'comandos' | 'mcp-sdk';
export type Level = 'iniciante' | 'intermediario' | 'avancado' | 'expert';

export interface Question {
  id: string;
  category: Category;
  level: Level;
  statement: string;
  answer: boolean;
  explanation: string;
  docUrl?: string;
}

export interface QuizAnswer {
  questionId: string;
  chosen: boolean;
  correct: boolean;
  timeSpentMs: number;
}

export interface QuizSession {
  id: string;
  category: Category;
  level: Level;
  startedAt: string;
  finishedAt?: string;
  answers: QuizAnswer[];
  score: number;
  rating: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  negocio: 'Negócio',
  setup: 'Setup',
  comandos: 'Comandos & Hooks',
  'mcp-sdk': 'MCP & SDK',
};

export const LEVEL_LABELS: Record<Level, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
  expert: 'Expert',
};
