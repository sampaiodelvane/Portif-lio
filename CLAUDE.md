# CLAUDE.md — Regras do projeto para agentes de IA

Este arquivo é o **harness** do projeto: toda sessão de IA (Claude Code ou outro agente) deve ler e
seguir estas regras antes de gerar código, commits ou documentação. Ele é versionado junto com o
código, então mudanças de regra passam por commit e revisão como qualquer outra mudança.

## Contexto

Portfólio pessoal (CP3 — Stack e Harness Engineering, FIAP). SPA em **Vite + React 19 +
TypeScript**, deploy na **Vercel**. Lista repositórios públicos do GitHub, tem formulário de
contato e um painel administrativo protegido.

## Stack (não trocar sem registrar o trade-off no README)

| Camada        | Escolha                                                            |
| ------------- | ------------------------------------------------------------------ |
| Build         | Vite 8                                                             |
| UI            | React 19 + TypeScript 7 (strict)                                   |
| Estilo        | Tailwind CSS v4 (tokens em `src/index.css`, sem `tailwind.config`) |
| Rotas         | React Router v7 (modo declarativo/SPA) + `React.lazy`              |
| Dados remotos | TanStack Query v5                                                  |
| Formulários   | React Hook Form + Zod                                              |
| Auth / BD     | Supabase (Auth + Postgres com RLS)                                 |
| Ícones        | Lucide (import por ícone, nunca o pacote inteiro)                  |
| Qualidade     | Biome (lint + format), Husky, lint-staged, commitlint              |
| Testes        | Vitest + Testing Library + jsdom                                   |

## Arquitetura em camadas (`src/`)

```
src/
  components/   UI reutilizável, sem acesso direto a API. Subpasta ui/ para primitivos.
  pages/        Uma pasta/arquivo por rota. Compõe componentes + hooks. Única camada com default export (exigido pelo React.lazy).
  routes/       Árvore de rotas, guards (ProtectedRoute), lazy imports.
  services/     Acesso a APIs externas (GitHub, Supabase, EmailJS). Funções puras e tipadas, sem React.
  hooks/        Hooks que ligam services ao React (useQuery/useMutation) e lógica de UI reutilizável.
  context/      Providers globais (tema, auth). Pouco estado aqui; dados remotos ficam no TanStack Query.
  types/        Tipos de domínio compartilhados (Repo, ContactMessage...).
  lib/          Utilitários genéricos (cn, formatadores, env tipado, queryClient).
  test/         Setup e utilitários de teste.
```

**Direção das dependências:** `pages → components/hooks → services → types`.
- `components/` nunca importa de `services/` nem de `pages/`.
- `services/` nunca importa React.
- Variáveis de ambiente são lidas **apenas** em `src/lib/env.ts` (validadas com Zod), nunca com
  `import.meta.env` espalhado pelo código.

## Nomenclatura

- **Componentes React:** `PascalCase.tsx` (ex.: `ProjectCard.tsx`), export nomeado.
- **Hooks:** prefixo `use`, arquivo `camelCase.ts` (ex.: `useRepos.ts`).
- **Rotas, serviços e utilitários:** `kebab-case.ts` (ex.: `github-service.ts`, `route-paths.ts`).
- **Testes:** ao lado do arquivo testado, `Nome.test.tsx`.
- **Tipos:** `PascalCase`, sem prefixo `I`.
- Exports **nomeados** em todo lugar, exceto páginas (lazy) e arquivos `*.config.*`.
- Imports internos sempre via alias `@/`.

O Biome valida nomes de arquivo (`useFilenamingConvention`) e default exports (`noDefaultExport`).

## Identidade visual — obrigatório

Estilo **editorial e sóbrio**. O site não pode parecer "template de IA".
- Paleta: papel/grafite + tinta + **um único acento** terroso (tokens `paper`, `surface`, `ink`,
  `muted`, `line`, `accent`). Use os tokens, nunca cores hexadecimais soltas.
- Tipografia: serifada nos títulos (`font-serif`), sans nos textos, mono para metadados.
- **Proibido:** neon, glow/`box-shadow` colorido, gradientes roxo/azul/ciano, glassmorphism,
  efeito "aurora", texto com gradiente, partículas, emojis decorativos.
- Movimento discreto e sempre respeitando `prefers-reduced-motion`.
- Acessibilidade: contraste AA, foco visível, landmarks semânticos, `alt` em toda imagem.

## Performance (meta: Lighthouse Mobile ≥ 80)

- Toda página entra por `React.lazy` + `Suspense` com skeleton.
- Bibliotecas pesadas (3D, gráficos, Supabase no dashboard) só via `import()` dinâmico.
- Imagens em WebP/AVIF, `loading="lazy"`, `width`/`height` definidos.

## Segurança e ambiente

- **Nunca** criar, ler para o chat ou commitar `.env`, `.env.local` ou similares. Só `.env.example`
  (chaves sem valores) é versionado. O hook de pre-commit e o CI bloqueiam `.env` reais.
- Variáveis `VITE_*` são públicas (vão para o bundle). Segredo de servidor nunca vai para o front.
- Segurança do Supabase vem de RLS, não de esconder a anon key.

## Commits — Conventional Commits (validado pelo commitlint)

```
<tipo>(escopo opcional): descrição curta no imperativo, em português
```
Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore` (principais) e `perf`, `style`, `ci`,
`build`. Um commit = uma mudança lógica. Exemplos:
- `feat(github): lista repositórios com cache do TanStack Query`
- `test(dashboard): cobre redirecionamento sem sessão`
- `chore: configura Husky e lint-staged`

## Branches

- `main` é estável e sempre passa no CI (deploy de produção na Vercel).
- Cada funcionalidade em branch semântica a partir da `main`:
  `feature/routing-theme`, `feature/github-integration`, `feature/contact-form`,
  `feature/dashboard-auth`, `chore/...`, `fix/...`, `docs/...`.
- Merge na `main` só com lint, typecheck, testes e build verdes.

## Fluxo de trabalho do agente

1. Ler este arquivo e o README antes de começar.
2. Trabalhar por fase, em branch própria, com commits pequenos.
3. Antes de cada commit rodar: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
4. Toda funcionalidade nova com teste quando houver regra de negócio (validação, guarda de rota).
5. Decisão de arquitetura nova → registrar na tabela de trade-offs do README.

## Comandos (Windows: usar `npm.cmd` no PowerShell)

| Ação            | Comando                                                |
| --------------- | ------------------------------------------------------ |
| Dev server      | `npm run dev`                                          |
| Lint / corrigir | `npm run lint` / `npm run lint:fix`                    |
| Typecheck       | `npm run typecheck`                                    |
| Testes          | `npm test` / `npm run test:watch` / `npm run coverage` |
| Build           | `npm run build`                                        |
