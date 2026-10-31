// Chaves hierárquicas: invalidar ['github', user] limpa tudo daquele usuário.
export const githubKeys = {
  all: ['github'] as const,
  user: (username: string) => [...githubKeys.all, username] as const,
  repos: (username: string) => [...githubKeys.user(username), 'repos'] as const,
  repo: (username: string, repoName: string) =>
    [...githubKeys.user(username), 'repo', repoName] as const,
  languages: (username: string, repoName: string) =>
    [...githubKeys.repo(username, repoName), 'languages'] as const,
}
