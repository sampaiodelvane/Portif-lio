// Flags de build do Vite. Módulo SEM dependências de propósito: é importado pelo layout
// (bundle inicial). Ler isso de lib/env.ts arrastaria o Zod para o caminho crítico (+8 kB gzip).
// Variáveis VITE_* (configuração do usuário) continuam só em lib/env.ts, com validação.

/** Build de produção (`vite build`). Falso em dev e nos testes. */
export const isProduction: boolean = import.meta.env.PROD

/** Servidor de desenvolvimento (`vite`). Também verdadeiro nos testes (Vitest). */
export const isDevelopment: boolean = import.meta.env.DEV

/** Execução pelo Vitest. */
export const isTest: boolean = import.meta.env.MODE === 'test'
