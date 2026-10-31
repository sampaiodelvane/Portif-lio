// Lighthouse MOBILE (perfil padrão: Moto G Power, 4G lenta, CPU 4x mais lenta) no build de produção.
// Uso: npm run build && npm run perf:lighthouse [-- --runs=3]
// Roda cada URL N vezes e reporta a MEDIANA (Lighthouse varia de uma execução para outra).
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

const PORT = 4180
const BASE = `http://localhost:${PORT}`
const ROUTES = ['/', '/projetos', '/contato']
const RUNS = Number(process.argv.find((a) => a.startsWith('--runs='))?.split('=')[1] ?? 3)
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']

// Antivírus que injetam scripts em toda página (ex.: Kaspersky Web Anti-Virus) distorcem a
// medição local: +185 kB de JS, bloqueio de renderização e alerta de HTTP que não são do site.
// --with-injected mede com eles, para comparação.
const BLOCK_INJECTED = !process.argv.includes('--with-injected')
const BLOCKED_URL_PATTERNS = ['*kaspersky-labs.com*', '*scr.kaspersky*']

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function waitForServer(url, timeoutMs = 15_000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // servidor ainda subindo
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`Servidor não respondeu em ${url}`)
}

const server = spawn(
  process.execPath,
  ['node_modules/vite/bin/vite.js', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore' },
)

const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new'] })
const summary = {}

try {
  await waitForServer(BASE)
  mkdirSync('reports', { recursive: true })

  for (const route of ROUTES) {
    const runs = []
    for (let i = 0; i < RUNS; i++) {
      const result = await lighthouse(`${BASE}${route}`, {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: CATEGORIES,
        blockedUrlPatterns: BLOCK_INJECTED ? BLOCKED_URL_PATTERNS : [],
      })
      const { categories, audits } = result.lhr
      runs.push({
        scores: Object.fromEntries(
          CATEGORIES.map((c) => [c, Math.round(categories[c].score * 100)]),
        ),
        fcp: audits['first-contentful-paint'].numericValue,
        lcp: audits['largest-contentful-paint'].numericValue,
        tbt: audits['total-blocking-time'].numericValue,
        cls: audits['cumulative-layout-shift'].numericValue,
      })
      const name = route === '/' ? 'home' : route.slice(1)
      writeFileSync(`reports/lighthouse-${name}-${i + 1}.json`, result.report)
    }

    summary[route] = {
      ...Object.fromEntries(CATEGORIES.map((c) => [c, median(runs.map((r) => r.scores[c]))])),
      'FCP (s)': (median(runs.map((r) => r.fcp)) / 1000).toFixed(2),
      'LCP (s)': (median(runs.map((r) => r.lcp)) / 1000).toFixed(2),
      'TBT (ms)': Math.round(median(runs.map((r) => r.tbt))),
      CLS: median(runs.map((r) => r.cls)).toFixed(3),
    }
    console.log(`✓ ${route}`)
  }

  console.log(
    `\nLighthouse mobile — mediana de ${RUNS} execução(ões)` +
      (BLOCK_INJECTED
        ? ' — scripts injetados por antivírus bloqueados'
        : ' — COM scripts injetados'),
  )
  console.table(summary)
  writeFileSync('reports/lighthouse-summary.json', JSON.stringify(summary, null, 2))
} finally {
  await chrome.kill()
  server.kill()
}
