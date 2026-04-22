# Claude Code Trivia

Quiz web de Verdadeiro/Falso em pt-BR sobre o **Claude Code** — CLI oficial da Anthropic para desenvolvimento agêntico no terminal. Aprenda sobre capacidades, setup, comandos, Hooks, MCP e SDK de forma gamificada, com feedback imediato e explicações didáticas.

## Demo

- **Home:** escolha de categoria + nível
- **Quiz:** 10 perguntas sequenciais com timer de 30s
- **Resultado:** pontuação, % de acerto, rating e compartilhamento
- **Histórico:** últimas sessões salvas em `localStorage`

## Funcionalidades

- 4 categorias: **Negócio**, **Setup**, **Comandos & Hooks**, **MCP & SDK**
- 4 níveis de dificuldade: **Iniciante**, **Intermediário**, **Avançado**, **Expert**
- 10 perguntas sorteadas aleatoriamente por sessão, sem repetição
- Timer de 30s por pergunta (pausa durante a explicação)
- Explicação didática após cada resposta, com link para documentação oficial quando disponível
- Pontuação com bônus por rapidez:
  - `+10` pts por acerto
  - `+15` pts se acertar em menos de 10s
  - `0` pts se errar ou o timer expirar
- Rating final baseado em % de acertos (Iniciante → Mestre do Claude Code)
- Compartilhamento via Web Share API com fallback para clipboard
- Histórico persistido em `localStorage` (últimas 50 sessões)
- Navegação por teclado: **V** (Verdadeiro), **F** (Falso), **Enter/→** (Próxima)

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 4 |
| Testes | Vitest + Testing Library |
| Persistência | localStorage |

## Começando

Pré-requisitos: **Node.js 20+** e **npm**.

```bash
# instalar dependências
npm install

# subir o dev server em http://localhost:3000
npm run dev
```

## Scripts

```bash
npm run dev          # dev server
npm run build        # build de produção
npm run start        # servir build de produção
npm run lint         # ESLint
npm run test         # roda a suíte de testes
npm run test:watch   # testes em modo watch
```

## Estrutura

```
quiz/
├── app/
│   ├── page.tsx              # seleção de categoria + nível
│   ├── quiz/page.tsx         # tela de perguntas
│   ├── result/page.tsx       # resultado final
│   └── history/page.tsx      # histórico local
├── components/               # UI (QuestionCard, Timer, ProgressBar, ...)
├── lib/
│   ├── types.ts              # tipos compartilhados
│   ├── questions.ts          # pool de 40 perguntas seed
│   ├── quizEngine.ts         # sorteio, pontuação, rating
│   └── storage.ts            # wrapper localStorage
├── prd.md                    # especificação completa do produto
└── CLAUDE.md                 # guia para Claude Code
```

A camada de domínio em [lib/](lib/) não possui dependências de UI — toda a lógica de negócio vive ali e é testável de forma isolada.

## Design

Paleta inspirada na marca Claude:

| Uso | Cor |
|---|---|
| Background | `#F5F1EB` (cream) |
| Accent | `#CC785C` (laranja Claude) |
| Texto | `#1F1E1D` |
| Sucesso | `#4A7C59` |
| Erro | `#B84A4A` |

Tipografia: **Inter** (UI) + **JetBrains Mono** (snippets em explicações).
Layout mobile-first com `max-width: 640px`.

## Regras de pontuação

| Situação | Pontos |
|---|---|
| Acerto | +10 |
| Acerto em < 10s | +15 (10 + bônus de 5) |
| Erro ou timer expirado | 0 |

Pontuação máxima por sessão: **150 pontos** (10 × 15).

### Rating final

| % acertos | Rating |
|---|---|
| 0–40% | Iniciante — Bora estudar! |
| 41–70% | Conhecedor — Continue praticando! |
| 71–90% | Expert — Muito bom! |
| 91–100% | Mestre do Claude Code 🏆 |

## Roadmap

- [x] Fluxo completo home → quiz → resultado → histórico
- [x] 40 perguntas seed distribuídas em 4 categorias × 4 níveis
- [x] Persistência local e compartilhamento
- [ ] Ranking global com Supabase
- [ ] Autenticação (GitHub/Google)
- [ ] Multi-idioma (en-US)
- [ ] Painel admin para editar perguntas
- [ ] Expansão do pool para 100+ perguntas

A especificação completa está em [prd.md](prd.md).

## Contribuindo

Contribuições são bem-vindas — especialmente **novas perguntas**! Ao sugerir uma pergunta:

1. Garanta que é **factualmente correta** (consulte https://docs.claude.com/en/docs/claude-code quando houver dúvida)
2. Inclua `explanation` didática e, quando possível, `docUrl` apontando para documentação oficial
3. Respeite a distribuição sugerida por nível dentro de cada categoria

Antes de abrir um PR:

```bash
npm run lint
npm run test
npm run build
```

## Licença

MIT.
