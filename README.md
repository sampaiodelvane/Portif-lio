# Portfólio — CP3 Stack e Harness Engineering

SPA em Vite + React 19 + TypeScript, com deploy na Vercel.

> README completo (arquitetura, trade-offs, harness de IA e roteiro do vídeo) será escrito na Fase 6.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

## Scripts

| Script              | O que faz                                |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento              |
| `npm run build`     | Typecheck + build de produção em `dist/` |
| `npm run lint`      | Biome (lint + formatação + imports)      |
| `npm run typecheck` | TypeScript em modo strict                |
| `npm test`          | Vitest + Testing Library                 |

Regras para agentes de IA e convenções do projeto: [CLAUDE.md](CLAUDE.md).
