// Bloqueia commits que incluam arquivos .env reais (segunda barreira além do .gitignore).
// Permite apenas .env.example. Uso: node scripts/check-env-staged.mjs [--all]
//   sem flag → verifica arquivos no stage (pre-commit)
//   --all    → verifica todos os arquivos versionados (CI)
import { execFileSync } from 'node:child_process'
import { basename } from 'node:path'

const checkAll = process.argv.includes('--all')
const args = checkAll ? ['ls-files'] : ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
const output = execFileSync('git', args, { encoding: 'utf8' })

const isRealEnvFile = (file) => {
  const name = basename(file)
  return /^\.env(\..+)?$/.test(name) && name !== '.env.example'
}

const offenders = output.split(/\r?\n/).filter(Boolean).filter(isRealEnvFile)

if (offenders.length > 0) {
  console.error('\n✖ Arquivo(s) de ambiente não podem ir para o repositório:')
  for (const file of offenders) console.error(`  - ${file}`)
  console.error('\nRemova do stage com: git rm --cached <arquivo>\n')
  process.exit(1)
}
