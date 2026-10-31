import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        // Bibliotecas em chunks próprios e estáveis: um deploy que muda só o código do app
        // não invalida o cache do React/Router/Query no navegador de quem já visitou.
        // Supabase e Zod NÃO entram aqui: continuam só nos chunks lazy que os usam.
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 3,
            },
            { name: 'vendor-router', test: /node_modules[\\/]react-router[\\/]/, priority: 2 },
            { name: 'vendor-query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 2 },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
    },
  },
})
