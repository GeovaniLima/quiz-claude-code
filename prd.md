# PRD — Claude Code Trivia

> Product Requirements Document para um Quiz Web Verdadeiro/Falso sobre o Claude Code (CLI da Anthropic).
> Este documento é a especificação completa para que uma sessão do Claude Code construa o projeto do zero.

---

## 1. Visão Geral (Negócio)

- **Nome do produto:** Claude Code Trivia
- **Pitch:** Quiz Verdadeiro/Falso interativo em pt-BR para aprender sobre Claude Code de forma gamificada
- **Público-alvo:** Desenvolvedores, estudantes de IA, profissionais de tech interessados em ferramentas de AI coding
- **Proposta de valor:** Aprendizado rápido (5–10 min/sessão) cobrindo capacidades, setup, comandos e recursos avançados do Claude Code, com feedback imediato e explicações didáticas
- **Objetivos de sucesso (métricas):**
  - Taxa de conclusão do quiz > 70%
  - Tempo médio de sessão entre 5 e 10 minutos
  - NPS qualitativo positivo em feedback pós-sessão (V2)

---

## 2. Personas

| Persona | Descrição | O que espera do quiz |
|---|---|---|
| **Iniciante curioso** | Ouviu falar do Claude Code, quer entender o que é antes de instalar | Perguntas de negócio/conceito claras, sem jargão técnico |
| **Dev que já usa** | Usa Claude Code no dia a dia, quer testar conhecimento avançado | Perguntas sobre Hooks, MCP, SDK e recursos menos documentados |
| **Instrutor/Palestrante** | Usa o quiz em talks, workshops e cursos como ferramenta didática | Explicações precisas com links de documentação oficial |

---

## 3. Funcionalidades (User Stories)

- Como jogador, quero **escolher uma categoria** (Negócio / Setup / Comandos & Hooks / MCP & SDK) para focar em um tema específico
- Como jogador, quero **escolher um nível** (Iniciante / Intermediário / Avançado / Expert) compatível com meu conhecimento
- Como jogador, quero **responder perguntas Verdadeiro/Falso** com feedback visual imediato
- Como jogador, quero **ver uma explicação didática** após cada resposta, com link para documentação oficial quando aplicável
- Como jogador, quero **ver um timer de 30 segundos** por pergunta para adicionar desafio
- Como jogador, quero **ver barra de progresso e pontuação** em tempo real durante a sessão
- Como jogador, quero **ver tela de resultado final** com acertos, tempo total e nível de "mestria" alcançado
- Como jogador, quero **compartilhar meu resultado** em redes sociais (via Web Share API com fallback para clipboard)
- Como jogador, quero **revisar o histórico das minhas tentativas** (persistido em localStorage)

---

## 4. Regras de Negócio

### Sessão de Quiz
- **10 perguntas** por sessão, sorteadas aleatoriamente do pool da **categoria + nível** escolhidos
- Se o pool tiver menos de 10 perguntas do nível exato, completar com nível adjacente da mesma categoria
- Perguntas não se repetem dentro da mesma sessão

### Pontuação
- **+10 pontos** por resposta correta
- **0 pontos** por resposta errada ou timer expirado
- **+5 pontos de bônus** se responder em menos de 10 segundos *e* acertar
- Pontuação máxima por sessão: **150 pontos** (10 × 15)

### Timer
- **30 segundos** por pergunta
- Ao expirar, conta como resposta errada e avança automaticamente
- Timer **pausa** enquanto a explicação está sendo exibida

### Classificação Final (baseada em % de acertos)

| % de acertos | Rating |
|---|---|
| 0 – 40% | Iniciante — Bora estudar! |
| 41 – 70% | Conhecedor — Continue praticando! |
| 71 – 90% | Expert — Muito bom! |
| 91 – 100% | Mestre do Claude Code 🏆 |

### Explicação
- Toda pergunta tem um campo `explanation` (texto didático) e opcionalmente `docUrl` (link para documentação oficial)
- Exibida imediatamente após o jogador responder ou o timer expirar
- Jogador clica em "Próxima" para continuar

---

## 5. Arquitetura Técnica

### Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 4 |
| Fontes | Inter (sans-serif) + JetBrains Mono (code) |
| Persistência local | localStorage |
| Persistência remota (V2) | Supabase — schema previsto, integração adiada |
| Deploy alvo | Vercel (ou estático via `next export`) |

### Estrutura de diretórios

```
quiz/
├── prd.md                         # Este documento
├── README.md                      # Instruções de uso/desenvolvimento
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── app/
│   ├── layout.tsx                 # Layout raiz + fontes + metadata
│   ├── page.tsx                   # Tela inicial: seleção categoria+nível
│   ├── quiz/page.tsx              # Tela de perguntas
│   ├── result/page.tsx            # Tela de resultado final
│   └── history/page.tsx           # Histórico local (localStorage)
├── components/
│   ├── CategoryCard.tsx
│   ├── LevelSelector.tsx
│   ├── QuestionCard.tsx
│   ├── Timer.tsx
│   ├── ProgressBar.tsx
│   ├── ScoreDisplay.tsx
│   ├── ExplanationPanel.tsx
│   └── ShareButton.tsx
├── lib/
│   ├── questions.ts               # Pool de perguntas (dados seed)
│   ├── quizEngine.ts              # Lógica: sorteio, pontuação, rating
│   ├── storage.ts                 # Wrapper localStorage
│   └── types.ts                   # Tipos compartilhados
└── public/
    └── claude-logo.svg
```

### Tipos principais (`lib/types.ts`)

```ts
export type Category = 'negocio' | 'setup' | 'comandos' | 'mcp-sdk';
export type Level = 'iniciante' | 'intermediario' | 'avancado' | 'expert';

export interface Question {
  id: string;
  category: Category;
  level: Level;
  statement: string;       // afirmação V/F
  answer: boolean;         // resposta correta
  explanation: string;     // explicação didática
  docUrl?: string;         // link opcional para doc oficial
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
  startedAt: string;       // ISO 8601
  finishedAt?: string;
  answers: QuizAnswer[];
  score: number;
  rating: string;
}
```

### Fluxo de navegação

```
/                       →  escolher categoria + nível  →  [Começar]
    ↓
/quiz?cat=X&lvl=Y       →  10 perguntas sequenciais    →  [Finalizar]
    ↓
/result?sid=<id>        →  pontuação + rating + share  →  [Jogar novamente] | [Histórico]
    ↓
/history                →  lista de QuizSessions do localStorage
```

### Persistência

- **localStorage key:** `claude-code-trivia:sessions`
- **Formato:** `QuizSession[]` serializado em JSON
- Limitar a últimas **50 sessões** para evitar crescimento ilimitado
- Wrapper `lib/storage.ts` expõe `saveSession()`, `listSessions()`, `clearHistory()`

---

## 6. Pool de Perguntas

- **40 perguntas no release inicial** (10 por categoria × 4 categorias)
- **Distribuição por nível dentro de cada categoria:** 3 iniciante + 3 intermediário + 2 avançado + 2 expert
- Arquivo `lib/questions.ts` exporta `export const QUESTIONS: Question[] = [...]`
- Toda pergunta deve ter **fonte verificável** (`docUrl` ou comentário adjacente)

### Exemplos seed (a expandir durante o desenvolvimento)

| Categoria | Nível | Afirmação | Resposta |
|---|---|---|---|
| Negócio | Iniciante | "Claude Code é um CLI oficial da Anthropic." | ✅ Verdadeiro |
| Negócio | Iniciante | "Claude Code é um produto concorrente do GitHub Copilot focado em desenvolvimento agêntico no terminal." | ✅ Verdadeiro |
| Setup | Intermediário | "Claude Code suporta tanto Node.js quanto Python para seu runtime principal." | ❌ Falso (roda em Node.js) |
| Setup | Intermediário | "É possível usar o Claude Code em VS Code, JetBrains e no terminal." | ✅ Verdadeiro |
| Comandos | Avançado | "Hooks do Claude Code são configurados em `settings.json` e permitem executar comandos shell em eventos como PreToolUse e PostToolUse." | ✅ Verdadeiro |
| Comandos | Iniciante | "O comando `/init` gera um arquivo CLAUDE.md com documentação do codebase." | ✅ Verdadeiro |
| MCP & SDK | Expert | "MCP (Model Context Protocol) permite que Claude Code acesse recursos externos via servidores conectados." | ✅ Verdadeiro |
| MCP & SDK | Avançado | "O Claude Agent SDK permite criar agentes customizados reutilizando as mesmas primitivas do Claude Code." | ✅ Verdadeiro |

> Perguntas devem ser **factualmente corretas** — quando houver dúvida, consultar https://docs.claude.com/en/docs/claude-code

---

## 7. Design & UX

### Paleta (Claude brand)

| Uso | Cor | Hex |
|---|---|---|
| Background principal | Cream | `#F5F1EB` |
| Primary accent | Laranja Claude | `#CC785C` |
| Texto primário | Quase preto | `#1F1E1D` |
| Sucesso | Verde suave | `#4A7C59` |
| Erro | Vermelho suave | `#B84A4A` |
| Card/surface | Branco + sombra sutil | `#FFFFFF` |

### Layout

- **Mobile-first**, max-width `640px` centralizado
- **Tipografia:** títulos em Inter 600, body em Inter 400, código em JetBrains Mono
- **Botões:** min `48px` de altura para alvo de toque confortável
- **Transições:** `transition-all duration-200` em hovers/trocas de estado
- **Cards:** `rounded-2xl shadow-sm bg-white`

### Acessibilidade

- Contraste mínimo AA em todos os textos
- Navegação por teclado: **V** = Verdadeiro, **F** = Falso, **Enter/→** = Próxima
- `aria-live="polite"` para feedback de resposta
- `aria-label` em botões de ícone

---

## 8. Roadmap

### V1 — Em escopo (esta entrega)

- ✅ Fluxo completo: home → quiz → resultado → histórico
- ✅ 40 perguntas seed distribuídas (10/categoria)
- ✅ Persistência em localStorage
- ✅ Compartilhamento via Web Share API (fallback clipboard)
- ✅ Timer e pontuação com bônus
- ✅ Explicação didática por pergunta

### V2+ — Fora de escopo (futuras iterações)

- 🔜 Ranking global com Supabase
- 🔜 Autenticação (GitHub/Google)
- 🔜 Multi-idioma (en-US)
- 🔜 Modo multiplayer / desafio amigo
- 🔜 Painel admin para editar perguntas
- 🔜 Expansão do pool para 100+ perguntas
- 🔜 Modo "carreira" com desbloqueio de níveis

---

## 9. Critérios de Aceite (V1)

- [ ] `npm install && npm run dev` sobe o projeto sem erros
- [ ] Tela inicial permite selecionar categoria + nível de forma clara
- [ ] 10 perguntas são sorteadas aleatoriamente e apresentadas uma por vez
- [ ] Timer de 30s funciona por pergunta e reinicia ao avançar
- [ ] Bônus de +5 pontos aplicado corretamente quando resposta correta ocorre em < 10s
- [ ] Explicação aparece após cada resposta com link quando disponível
- [ ] Tela de resultado mostra pontuação, % de acerto, rating e tempo total
- [ ] Histórico é gravado em localStorage e listado em `/history`
- [ ] Botão compartilhar gera texto apropriado com pontuação e link
- [ ] Paleta Claude (laranja/creme) aplicada consistentemente
- [ ] Layout responsivo funciona em telas ≥ 320px
- [ ] `npm run build` passa sem erros de tipo ou lint
- [ ] Navegação por teclado (V/F/Enter) funcional

---

## 10. Verificação E2E (manual)

1. `cd quiz && npm install && npm run dev`
2. Abrir http://localhost:3000
3. Escolher categoria "Negócio" + nível "Iniciante" → clicar em **Começar**
4. Responder as 10 perguntas → validar feedback visual, explicação e timer
5. Testar resposta rápida (< 10s) → validar bônus de +5 pontos
6. Deixar timer expirar em uma pergunta → validar que conta como erro e avança
7. Chegar à tela de resultado → validar pontuação, % acerto e rating
8. Testar botão **Compartilhar** → validar texto gerado e fallback clipboard
9. Acessar `/history` → validar gravação da sessão
10. Repetir com outra categoria/nível → validar sorteio aleatório (perguntas diferentes)
11. Testar navegação por teclado (V, F, Enter)
12. `npm run build` → validar build de produção sem erros

---

## 11. Notas para o Implementador

- **Começar pelo domínio:** implementar `lib/types.ts` → `lib/questions.ts` (com seed) → `lib/quizEngine.ts` → `lib/storage.ts` antes de qualquer UI
- **Componentes "burros":** manter componentes de UI sem lógica de domínio — toda regra vive em `lib/`
- **Server vs Client Components:** tela inicial pode ser Server; `/quiz` e `/result` precisam ser Client (estado, timer, localStorage)
- **Testes:** pelo menos testes unitários para `quizEngine` (sorteio, pontuação, rating). Framework sugerido: Vitest
- **Não over-engineer:** V1 não precisa de gerenciador de estado global — `useState` e `useReducer` bastam
- **Accessibility first:** não deixar para depois, incluir `aria-*` desde a primeira versão dos componentes
