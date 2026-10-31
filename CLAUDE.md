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
| Rotas         | React Router v8 (data router, SPA) + `React.lazy`                  |
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
  services/     Acesso a APIs externas (GitHub, Supabase, FormSubmit). Funções puras e tipadas, sem React.
  hooks/        Hooks que ligam services ao React (useQuery/useMutation) e lógica de UI reutilizável.
  context/      Providers globais (tema, auth). Pouco estado aqui; dados remotos ficam no TanStack Query.
  content/      Conteúdo editorial (catálogo curado de projetos). Dados estáticos, sem lógica.
  types/        Tipos de domínio compartilhados (PortfolioProject, ContactMessage...).
  lib/          Utilitários genéricos (cn, formatadores, env tipado, queryClient).
  test/         Setup e utilitários de teste.
```

**Direção das dependências:** `pages → components/hooks → services → types`.
- `components/` nunca importa de `services/` nem de `pages/`.
- `services/` nunca importa React.
- Variáveis de ambiente são lidas **apenas** em `src/lib/env.ts` (validadas com Zod), nunca com
  `import.meta.env` espalhado pelo código.
- Flags de build (`PROD`, `DEV`, modo teste) ficam em `src/lib/build-mode.ts`, módulo **sem
  dependências**: o layout o importa, e ler essas flags de `env.ts` levaria o Zod para o bundle
  inicial (+8 kB gzip — já aconteceu, detectado pelo `perf:bundle`).

## Nomenclatura

- **Componentes React:** `PascalCase.tsx` (ex.: `ProjectCard.tsx`), export nomeado.
- **Hooks:** prefixo `use`, arquivo `camelCase.ts` (ex.: `useRepos.ts`).
- **Rotas, serviços e utilitários:** `kebab-case.ts` (ex.: `github-service.ts`, `route-paths.ts`).
- **Testes:** ao lado do arquivo testado, `Nome.test.tsx`.
- **Tipos:** `PascalCase`, sem prefixo `I`.
- Exports **nomeados** em todo lugar, exceto páginas (lazy) e arquivos `*.config.*`.
- Imports internos sempre via alias `@/`.

O Biome valida nomes de arquivo (`useFilenamingConvention`) e default exports (`noDefaultExport`).

## Padrões de rotas, contexto e erros

- **Nova página:** criar em `src/pages/NomePage.tsx` (default export), registrar o caminho em
  `routes/route-paths.ts` e a rota com `lazy()` em `routes/app-routes.tsx`. Nunca escrever URL
  "na mão" — usar `ROUTE_PATHS` ou helpers como `projectPath(repoName)`.
- **Título da aba:** cada página renderiza seu próprio `<title>` (React 19 move para o `<head>`).
- **Imports do router:** tudo de `react-router`; só `RouterProvider` vem de `react-router/dom`.
- **Contexto:** o objeto do contexto fica em `context/*-context.ts` e o Provider em
  `context/*Provider.tsx`, para não quebrar o Fast Refresh. O consumo é sempre via hook em
  `hooks/` (ex.: `useTheme`), que lança erro se usado fora do Provider.
- **Erros:** `RouteErrorPage` é o `errorElement` e **não** pode ser lazy (precisa funcionar
  quando um chunk falha). Rotas desconhecidas caem no `path: '*'` (404 dentro do layout).
- **Vitrine de projetos:** a fonte é `src/content/projects.ts` (curadoria manual; a ordem do
  array é a ordem de exibição). A API do GitHub só _complementa_ projetos `visibility: 'public'`
  (data, linguagens, link) via `mergeWithGithub`; privados nunca são consultados. Para incluir um
  projeto: adicionar ao catálogo com `slug` kebab-case único, `title`, `context`, `summary`
  (≤ 160 caracteres), `description`, ≥ 3 `features` e `stack`. Texto não revisado pelo autor
  leva `draft: true`. O teste `content/projects.test.ts` valida essas regras.
- **Dados remotos:** componente nunca chama `fetch`. Fluxo: `services/*` (fetch + validação Zod +
  mapeamento para tipos de domínio) → `hooks/use*` (TanStack Query, chaves em
  `hooks/github-query-keys.ts`) → componentes. Erros da API são `GithubApiError` com `kind`;
  a UI escolhe a mensagem pelo `kind`, nunca pelo texto.
- **Cota do GitHub (60 req/h sem token):** não reduzir `staleTime` sem motivo, não fazer retry de
  `rate-limit`/`not-found`, manter o cache por ETag de `github-client.ts`.
- **Testes sem rede:** o setup bloqueia `fetch` e zera `VITE_*`. Use `mockFetch()` e
  `vi.stubEnv()`; renderize páginas com `renderRoute()` de `src/test/`.
- **stale-if-error:** com cota esgotada ou sem rede, `github-client.ts` devolve a última
  resposta salva (cache por ETag) em vez de erro. Só sem nada salvo a UI mostra o erro.
- **Tema:** chave `portfolio-theme` no localStorage, usada também pelo script inline do
  `index.html` (evita flash). Se mudar a chave, mudar nos dois lugares.

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

Resultado atual: 97–100 (detalhes e método em `docs/performance.md`).

- Toda página entra por `React.lazy` + `Suspense` com skeleton, registrada em
  `routes/page-loaders.ts`. **Exceção:** a `HomePage` é estática porque contém o LCP.
- Links para rotas lazy usam `preloadOnIntent(page)` (baixa o chunk no hover/foco/toque).
- Bibliotecas pesadas (3D, gráficos, Supabase no dashboard) só via `import()` dinâmico.
- Validação com `zod/mini` (API funcional, tree-shakeable). Não importar de `'zod'`.
- Skeleton com o mesmo tamanho do conteúdo final; nada pode empurrar layout visível (CLS 0).
- Imagens em WebP/AVIF, `loading="lazy"`, `width`/`height` definidos.
- Mudou algo no caminho crítico? Rode `npm run build && npm run perf:bundle && npm run
  perf:lighthouse` e compare com `docs/performance.md`. O Lighthouse local gasta cota da API do
  GitHub (60 req/h): evite rodar em loop.

## Segurança e ambiente

- **Nunca** criar, ler para o chat ou commitar `.env`, `.env.local` ou similares. Só `.env.example`
  (chaves sem valores) é versionado. O hook de pre-commit e o CI bloqueiam `.env` reais.
- Variáveis `VITE_*` são públicas (vão para o bundle). Segredo de servidor nunca vai para o front.
- Segurança do Supabase vem de RLS, não de esconder a anon key. Toda tabela nova entra com
  `enable row level security` e políticas explícitas em `supabase/migrations/`.
- **Backend com duas implementações** (`services/backend/`): `supabase-*` quando
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` existem; senão `local-backend` (modo
  demonstração em localStorage). Componentes e hooks só conhecem as interfaces de
  `backend-types.ts` — nunca importam uma implementação diretamente.
- Operações públicas (contato, destaques) usam REST com `fetch`; o `supabase-js` só é carregado
  por import dinâmico em `/login` e `/admin`. Não importar `@supabase/supabase-js` fora de
  `supabase-admin.ts`.
- Redirecionamento pós-login passa sempre por `safeRedirectPath()` (bloqueia open redirect).

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
  `feature/routing-theme`, `feature/github-integration`, `feature/contact-dashboard`
  (formulário + painel, pois compartilham a camada de backend), `chore/...`, `fix/...`,
  `docs/...`.
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
