// Conventional Commits — regra declarada no CLAUDE.md e verificada no hook commit-msg.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'test', 'docs', 'chore', 'perf', 'style', 'ci', 'build'],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
}
