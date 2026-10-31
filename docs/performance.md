# Performance — Fase 5

Meta da entrega: **Lighthouse Mobile ≥ 80**. Resultado: **97–100** em todas as páginas públicas.

## Como medir

```bash
npm run build
npm run perf:bundle                       # bytes do carregamento inicial (gzip)
npm run perf:lighthouse                   # mobile, mediana de 3 execuções por página
npm run perf:lighthouse -- --with-injected   # idem, sem bloquear scripts de antivírus
```

O perfil é o mobile padrão do Lighthouse 13 (Moto G Power, 4G lenta simulada, CPU 4× mais
lenta), sobre o **build de produção** servido por `vite preview`. Relatórios completos ficam em
`reports/` (fora do git).

### Por que existem duas medições

A máquina de desenvolvimento roda o **Kaspersky Web Anti-Virus**, que injeta um script de
185 kB (`gc.kis.v2.scr.kaspersky-labs.com/main.js`) em toda página aberta no Chrome. Ele
sozinho gerava 1,5 s de "render-blocking", 65 kB de "JS não minificado", 35 kB de "JS legado" e
o alerta de HTTP — nada disso pertence ao site. O script de medição bloqueia essa URL por
padrão (`blockedUrlPatterns`); a coluna "com injeção" mostra o efeito para referência.

## Antes × depois (mediana de 3 execuções)

### Sem o script injetado (número representativo do site)

| Página      | Performance  | LCP                 | CLS           | Acessibilidade | SEO          |
| ----------- | ------------ | ------------------- | ------------- | -------------- | ------------ |
| `/`         | 96 → **100** | 2,51 s → **1,24 s** | 0,068 → **0** | 100 → 100      | 91 → **100** |
| `/projetos` | 93 → **98**  | 2,66 s → **2,41 s** | 0,108 → **0** | 98 → **100**   | 91 → **100** |
| `/contato`  | 96 → **97**  | 2,65 s → 2,55 s     | 0,032 → **0** | 100 → 100      | 91 → **100** |

### Com o script injetado (pior caso local)

| Página      | Performance | LCP                 |
| ----------- | ----------- | ------------------- |
| `/`         | 87 → **97** | 3,63 s → **2,15 s** |
| `/projetos` | 84 → **89** | 3,67 s → 3,52 s     |
| `/contato`  | 88 → 88     | 3,68 s → 3,67 s     |

### Best Practices (81 local)

As únicas falhas restantes são ambientais:

- `is-on-https`: a requisição `http://` do antivírus (o site não faz nenhuma requisição HTTP;
  na Vercel tudo é HTTPS).
- `errors-in-console` em `/projetos` em algumas rodadas: **403 do GitHub** porque dezenas de
  execuções seguidas do Lighthouse (cada uma com perfil limpo, sem o cache por ETag) esgotaram a
  cota de 60 req/h do IP. A página trata o caso e mostra a mensagem de limite.

## O que mudou e por quê

| Mudança                                                                  | Problema medido                                                                                                                              | Efeito                                                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Home fora do code-splitting (import estático) e vitrine de projetos lazy | O `<h1>` (elemento de LCP) estava num chunk lazy: o navegador só o descobria depois de executar o JS principal — uma ida e volta extra na 4G | LCP da home −51% (2,51 s → 1,24 s)                                                                       |
| `<main>` com `min-h-dvh`                                                 | O rodapé aparecia na tela durante o carregamento e era empurrado para baixo quando o conteúdo chegava                                        | CLS 0,068–0,108 → **0**                                                                                  |
| `zod` → `zod/mini`                                                       | API encadeada do Zod impede tree-shaking                                                                                                     | Chunk de schemas 24,5 kB → **7,4 kB** gzip (−70%)                                                        |
| Vendors em chunks próprios (`codeSplitting.groups`)                      | React + Query + código do app no mesmo arquivo: qualquer deploy invalidava 76 kB do cache                                                    | Deploy que só muda o app invalida **8 kB** (o resto continua em cache, com `immutable` no `vercel.json`) |
| `public/robots.txt`                                                      | Sem o arquivo, o fallback de SPA devolvia o `index.html` como robots.txt (inválido)                                                          | SEO 91 → **100**                                                                                         |
| Títulos dos cards `h2` na página de projetos                             | Salto `h1 → h3`                                                                                                                              | Acessibilidade 98 → **100**                                                                              |
| Preload por intenção (`preloadOnIntent`)                                 | Clique numa rota lazy esperava o download do chunk                                                                                           | Chunk começa a baixar no hover/foco/toque; não afeta o Lighthouse, melhora a navegação real              |

## Bundle inicial (gzip)

|                                    | Antes                         | Depois             |
| ---------------------------------- | ----------------------------- | ------------------ |
| JS + CSS no carregamento inicial   | 116,8 kB                      | 120,4 kB           |
| Código do app (muda a cada deploy) | dentro de um arquivo de 76 kB | **8,1 kB** isolado |

O carregamento inicial ficou **3,6 kB maior** de propósito: a home agora vem no bundle principal.
É um trade-off consciente — poucos bytes a mais em troca de eliminar uma ida e volta de rede
antes do LCP, que é o que pesa no celular.

Fora do carregamento inicial (só nas rotas que precisam): `supabase-js` 54 kB (apenas `/login` e
`/admin` com Supabase configurado), React Hook Form + resolvers 13 kB (`/contato`, `/login`).

## Resiliência: stale-if-error

As medições repetidas esgotaram a cota da API do GitHub e revelaram um caso real: o GitHub
responde **403 até para requisições condicionais** (ETag) quando a cota acaba, e o app
descartava os dados que já tinha salvos. Agora `github-client.ts` devolve a última resposta
salva quando a cota acaba ou a rede cai; o erro só aparece para quem nunca carregou a lista.
Verificado no navegador com a cota zerada: `/projetos` exibiu os 6 repositórios salvos.

## Imagens

O site não usa imagens raster: ícones são SVG (Lucide, importados um a um) e a tipografia usa
fontes do sistema (zero download de fonte). Se imagens forem adicionadas, a regra no
`CLAUDE.md` é WebP/AVIF, `width`/`height` explícitos e `loading="lazy"` abaixo da dobra.

## Próximos passos possíveis

- **Gerar a lista de repositórios no build** (fetch com token no CI → JSON estático no `dist/`):
  elimina o limite de 60 req/h por visitante e tiraria a API do caminho crítico de `/projetos`.
- Medir em produção (Vercel) com o PageSpeed Insights para ter dados sem interferência local.
