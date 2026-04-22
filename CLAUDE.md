# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Claude Code Trivia** — Quiz Web Verdadeiro/Falso em pt-BR sobre o Claude Code (CLI da Anthropic). Especificação completa em `prd.md`.

## Commands

```bash
npm run dev        # dev server on http://localhost:3000
npm run build      # production build (must pass before shipping)
npm run lint       # ESLint
npx vitest         # run all tests
npx vitest run lib/quizEngine.test.ts   # run a single test file
```

> The project has not been scaffolded yet. Run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` first.

## Architecture

**Stack:** Next.js 15 (App Router) · TypeScript 5 · Tailwind CSS 4

### Domain layer (`lib/`) — no UI dependencies

| File | Responsibility |
|---|---|
| `lib/types.ts` | Shared types: `Question`, `QuizSession`, `Category`, `Level` |
| `lib/questions.ts` | Static pool of 40 seed questions exported as `QUESTIONS: Question[]` |
| `lib/quizEngine.ts` | Pure functions: `drawQuestions()`, `calcScore()`, `getRating()` |
| `lib/storage.ts` | localStorage wrapper: `saveSession()`, `listSessions()`, `clearHistory()` |

Implement and test the domain layer first before building any UI.

### Routing (App Router)

| Route | Type | Purpose |
|---|---|---|
| `/` | Server Component | Category + Level selection |
| `/quiz` | Client Component | Active quiz: timer, answers, progress |
| `/result` | Client Component | Score, rating, share button |
| `/history` | Client Component | localStorage session history |

`/quiz` and `/result` receive `cat` and `lvl` as search params; `/result` also receives `sid` (session id).

### State management

No global state manager — `useState`/`useReducer` inside Client Components only. Quiz state lives in `/quiz/page.tsx` and is written to localStorage via `lib/storage.ts` when the session ends.

## Design tokens

```
bg: #F5F1EB (cream)   accent: #CC785C (Claude orange)
text: #1F1E1D          success: #4A7C59   error: #B84A4A
card: #FFFFFF + shadow-sm   rounded-2xl
```

Font: Inter (body) + JetBrains Mono (code snippets in explanations).

## Keyboard shortcuts (quiz screen)

`V` = Verdadeiro · `F` = Falso · `Enter` / `→` = Próxima pergunta

## Scoring rules

- Correct answer: +10 pts
- Correct answer in < 10 s: +15 pts (10 + 5 bonus)
- Wrong or timer expired: 0 pts
- Timer: 30 s per question; pauses while explanation is shown
