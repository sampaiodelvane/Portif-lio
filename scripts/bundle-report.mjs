// Relatório de bundle: o que a home baixa no carregamento inicial (antes de qualquer lazy).
// Uso: npm run build && npm run perf:bundle
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const DIST = 'dist'
const html = readFileSync(join(DIST, 'index.html'), 'utf8')

const gz = (file) => gzipSync(readFileSync(join(DIST, file))).length
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`

// Recursos que o navegador baixa ao abrir qualquer URL: script de entrada, modulepreload e CSS.
const initial = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1])
const initialGzip = initial.reduce((sum, file) => sum + gz(file), 0)

const assets = readdirSync(join(DIST, 'assets'))
  .filter((f) => /\.(js|css)$/.test(f))
  .map((f) => {
    const path = `assets/${f}`
    return { file: f, raw: statSync(join(DIST, path)).size, gzip: gz(path) }
  })
  .sort((a, b) => b.gzip - a.gzip)

console.log('\nCarregamento inicial (gzip):')
for (const file of initial) console.log(`  ${kb(gz(file)).padStart(9)}  ${file}`)
console.log(`  ${kb(initialGzip).padStart(9)}  TOTAL\n`)

console.log('Maiores chunks (gzip / bruto):')
for (const a of assets.slice(0, 12)) {
  console.log(`  ${kb(a.gzip).padStart(9)} / ${kb(a.raw).padStart(9)}  ${a.file}`)
}
console.log(`\n  ${assets.length} arquivos JS/CSS no total\n`)
