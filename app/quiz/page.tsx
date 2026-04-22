'use client';

import { useCallback, useEffect, useReducer } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { Category, Level, Question, QuizAnswer, QuizSession } from '@/lib/types';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/types';
import { drawQuestions, createSession, finalizeSession } from '@/lib/quizEngine';
import { saveSession } from '@/lib/storage';
import ProgressBar from '@/components/ProgressBar';
import ScoreDisplay from '@/components/ScoreDisplay';
import Timer from '@/components/Timer';
import QuestionCard from '@/components/QuestionCard';
import ExplanationPanel from '@/components/ExplanationPanel';

const TIMER_START = 30;

interface QuizState {
  phase: 'loading' | 'playing' | 'explaining' | 'finished';
  questions: Question[];
  currentIndex: number;
  answers: QuizAnswer[];
  score: number;
  timerSeconds: number;
  questionStartTime: number;
  session: QuizSession | null;
}

type QuizAction =
  | { type: 'START'; questions: Question[]; session: QuizSession }
  | { type: 'ANSWER'; chosen: boolean; timeSpentMs: number }
  | { type: 'NEXT' }
  | { type: 'TICK'; remaining: number }
  | { type: 'EXPIRE' };

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        phase: 'playing',
        questions: action.questions,
        session: action.session,
        currentIndex: 0,
        answers: [],
        score: 0,
        timerSeconds: TIMER_START,
        questionStartTime: Date.now(),
      };

    case 'ANSWER': {
      const q = state.questions[state.currentIndex];
      const correct = action.chosen === q.answer;
      const bonus = correct && action.timeSpentMs < 10_000 ? 5 : 0;
      const newAnswer: QuizAnswer = {
        questionId: q.id,
        chosen: action.chosen,
        correct,
        timeSpentMs: action.timeSpentMs,
      };
      return {
        ...state,
        phase: 'explaining',
        answers: [...state.answers, newAnswer],
        score: state.score + (correct ? 10 + bonus : 0),
      };
    }

    case 'EXPIRE': {
      const q = state.questions[state.currentIndex];
      const newAnswer: QuizAnswer = {
        questionId: q.id,
        chosen: false,
        correct: false,
        timeSpentMs: TIMER_START * 1000,
      };
      return {
        ...state,
        phase: 'explaining',
        answers: [...state.answers, newAnswer],
      };
    }

    case 'NEXT': {
      const isLast = state.currentIndex >= state.questions.length - 1;
      if (isLast) return { ...state, phase: 'finished' };
      return {
        ...state,
        phase: 'playing',
        currentIndex: state.currentIndex + 1,
        timerSeconds: TIMER_START,
        questionStartTime: Date.now(),
      };
    }

    case 'TICK':
      return { ...state, timerSeconds: action.remaining };

    default:
      return state;
  }
}

const initialState: QuizState = {
  phase: 'loading',
  questions: [],
  currentIndex: 0,
  answers: [],
  score: 0,
  timerSeconds: TIMER_START,
  questionStartTime: Date.now(),
  session: null,
};

function QuizContent() {
  const router = useRouter();
  const params = useSearchParams();
  const cat = params.get('cat') as Category;
  const lvl = params.get('lvl') as Level;

  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    if (!cat || !lvl) { router.replace('/'); return; }
    const questions = drawQuestions(cat, lvl);
    const session = createSession(cat, lvl);
    dispatch({ type: 'START', questions, session });
  }, [cat, lvl, router]);

  // Persist and redirect when finished
  useEffect(() => {
    if (state.phase !== 'finished' || !state.session) return;
    const final = finalizeSession(state.session, state.answers);
    saveSession(final);
    router.replace(`/result?sid=${final.id}`);
  }, [state.phase, state.session, state.answers, router]);

  const handleAnswer = useCallback((chosen: boolean) => {
    const timeSpentMs = Date.now() - state.questionStartTime;
    dispatch({ type: 'ANSWER', chosen, timeSpentMs });
  }, [state.questionStartTime]);

  const handleExpire = useCallback(() => {
    dispatch({ type: 'EXPIRE' });
  }, []);

  const handleTick = useCallback((remaining: number) => {
    dispatch({ type: 'TICK', remaining });
  }, []);

  const handleNext = useCallback(() => {
    dispatch({ type: 'NEXT' });
  }, []);

  if (state.phase === 'loading' || state.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink/50 text-sm">Carregando...</p>
      </div>
    );
  }

  const currentQuestion = state.questions[state.currentIndex];
  const isExplaining = state.phase === 'explaining';
  const lastAnswer = state.answers[state.answers.length - 1];
  const isLast = state.currentIndex === state.questions.length - 1;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar current={state.currentIndex + (isExplaining ? 1 : 0)} total={state.questions.length} />
          </div>
          <Timer
            seconds={state.timerSeconds}
            isPaused={isExplaining}
            onTick={handleTick}
            onExpire={handleExpire}
          />
          <ScoreDisplay score={state.score} />
        </div>

        {/* Category/level badge */}
        <div className="flex gap-2 text-xs text-ink/50">
          <span>{CATEGORY_LABELS[cat]}</span>
          <span>·</span>
          <span>{LEVEL_LABELS[lvl]}</span>
          <span>·</span>
          <span>{state.currentIndex + 1}/{state.questions.length}</span>
        </div>

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={isExplaining}
        />

        {/* Explanation */}
        {isExplaining && lastAnswer && (
          <ExplanationPanel
            question={currentQuestion}
            wasCorrect={lastAnswer.correct}
            isLast={isLast}
            onNext={handleNext}
          />
        )}
      </div>
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-ink/50 text-sm">Carregando...</p></div>}>
      <QuizContent />
    </Suspense>
  );
}
