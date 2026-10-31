import type { PortfolioProject } from '@/types/portfolio'

/**
 * Vitrine do portfólio — curadoria manual.
 *
 * - A ORDEM deste array é a ordem de exibição (e o padrão da home sem destaques escolhidos).
 * - `title` é o nome exibido; `repoName` é o nome real no GitHub (usado para buscar estrelas,
 *   data e linguagens dos repositórios públicos).
 * - Repositórios privados não aparecem na API pública do GitHub: tudo vem daqui.
 * - `draft: true` = texto provisório, pendente de revisão do autor.
 */
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    slug: 'gb-higienizacoes',
    repoName: 'gb-higienizacoes',
    title: 'G&B Higienizações',
    context: 'Projeto real para cliente',
    visibility: 'private',
    liveUrl: 'https://gb-higienizacoes.vercel.app/',
    summary:
      'Landing page, catálogo de orçamentos com envio para o WhatsApp e painel administrativo para uma empresa de higienização.',
    description:
      'Aplicação mobile-first feita para uma empresa de higienização e impermeabilização de estofados. O site do cliente une uma landing page de conversão a um catálogo interativo de serviços; o painel administrativo organiza funil de vendas, orçamentos, agenda, preços, estoque e caixa, com dados no Supabase atualizados em tempo real.',
    features: [
      'Catálogo com carrinho persistente e cobrança por unidade, par ou m² fracionado',
      'Pedido estruturado enviado direto para o WhatsApp da empresa',
      'Comparador de fotos antes/depois com arraste',
      'Orçamento enviado ao cliente por link de aceite: aceitar, renegociar ou recusar',
      'Agenda de serviços com lançamento automático no fluxo de caixa ao concluir',
      'Pesquisa de satisfação pós-serviço e publicação de depoimentos autorizados',
      'Gestão de preços (individual e reajuste em massa), estoque e insumos',
      'Supabase com regras de acesso (RLS) e tempo real; modo local para demonstração',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Supabase', 'CSS Modules'],
  },
  {
    slug: 'pagina-de-vinhos',
    repoName: 'Landing-Page---Tema-Livre-CHP-Front-End-Design-',
    title: 'Página de Vinhos',
    context: 'FIAP · Front-End Design',
    visibility: 'public',
    liveUrl: 'https://sampaiodelvane.github.io/Landing-Page---Tema-Livre-CHP-Front-End-Design-/',
    summary:
      'Landing page de vendas de vinhos com carrinho completo, criada com Vibecoding e com o processo de IA documentado.',
    description:
      'Atividade de Front-End Design: uma landing page de tema livre construída com apoio de ferramentas de IA (Vibecoding). Além da página, o projeto documenta o processo — prompts e suas versões, pesquisas, decisões de design, identidade visual e as correções pedidas à IA até a versão final.',
    features: [
      'Catálogo de rótulos com safra e preço; notas de avaliação só quando há fonte confiável',
      'Carrinho com adicionar, remover e alterar quantidades, subtotais e total',
      'Carrinho salvo no navegador (localStorage)',
      'Finalização com resumo do pedido e número gerado',
      'Layout responsivo com identidade visual própria',
      'Registro do encadeamento de prompts entre ChatGPT, Gemini e Claude',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
  },
  {
    slug: 'novo-tv-time',
    repoName: 'CHP4-WebDevelopment',
    title: 'Novo TV Time',
    context: 'FIAP · Web Development',
    visibility: 'public',
    summary:
      'Recriação do TV Time em React: acompanhe séries, temporadas e episódios com dados da API do TMDB.',
    description:
      'Trabalho acadêmico de Web Development que recria o app TV Time. O projeto seguiu Spec Driven Development: requisitos e arquitetura foram especificados e revisados antes do código. Os dados das séries vêm da API do TMDB e o progresso do usuário fica salvo no navegador.',
    features: [
      'Busca de séries na API do TMDB, em português',
      'Visão geral da série e navegação por temporadas e episódios',
      'Minha Lista com episódios assistidos e barra de progresso',
      'Página de estatísticas do que foi assistido',
      'Estados de carregamento, lista vazia, erro e página 404',
      'Progresso salvo no navegador (Web Storage API)',
    ],
    stack: ['React', 'JavaScript', 'Vite', 'TMDB API'],
  },
  {
    slug: 'escala-rede-7',
    repoName: 'escalasrede7',
    title: 'Escala Rede 7',
    context: 'Sistema corporativo',
    visibility: 'private',
    liveUrl: 'https://escalasrede7.lovable.app/login',
    summary:
      'Sistema para montar, validar, fechar e exportar as escalas de trabalho dos postos da Rede 7, com regras trabalhistas automáticas.',
    description:
      'Sistema corporativo de gestão de escalas operacionais dos postos da Rede 7. Gerentes montam a grade mensal de cada posto, o sistema valida as regras trabalhistas em tempo real e a administração fecha o período e exporta a escala para a folha de pagamento. O acesso é restrito a e-mails corporativos, com permissões por perfil.',
    features: [
      'Grade mensal de escala por posto e competência, com período configurável',
      'Validações trabalhistas automáticas: interjornada, folga semanal, domingo no período e dias consecutivos',
      'Justificativas obrigatórias para exceções antes da impressão',
      'Checklist de completude por posto e por colaborador',
      'Fechamento de período pelo administrador, bloqueando a edição dos gerentes',
      'Importação de postos e colaboradores por planilha XLSX',
      'Exportação em TXT no layout Senior 00800 (Troca de Horário)',
      'Impressão otimizada, com separação por turno',
      'Perfis de acesso (super admin, admin e gerente) com segurança no banco (RLS), restrito ao domínio @rede7.com.br',
    ],
    stack: ['React', 'TypeScript', 'TanStack Start', 'Tailwind CSS', 'shadcn/ui', 'PostgreSQL'],
  },
  {
    slug: 'terravis',
    repoName: 'TerraVis',
    title: 'TerraVis',
    context: 'FIAP · Global Solution (em grupo)',
    visibility: 'public',
    liveUrl: 'https://sampaiodelvane.github.io/TerraVis/',
    summary:
      'Plataforma de inteligência orbital que leva dados de satélite a pequenos e médios produtores rurais.',
    description:
      'Projeto da Global Solution da FIAP, desenvolvido em grupo: a página apresenta a TerraVis, plataforma que transforma dados espaciais abertos em decisões para o campo — monitoramento de lavouras, queimadas, enchentes e da melhor janela de plantio — e inclui a modelagem matemática dos indicadores.',
    features: [
      'Módulo NDVI: imagens do Sentinel-2 para detectar anomalias na vegetação',
      'Módulo Queimadas: focos de calor do NASA FIRMS próximos às propriedades',
      'Módulo Enchentes: radar Sentinel-1 SAR, que enxerga através de nuvens e chuva',
      'Módulo Plantio: 30 anos de histórico climático do Copernicus C3S',
      'Modelagem matemática do ciclo NDVI (polinomial) e do risco de queimada (exponencial)',
      'Gráficos dos modelos gerados com Python',
    ],
    stack: ['HTML', 'CSS', 'Python'],
  },
  {
    slug: 'fiap-connect',
    repoName: 'fiapconnect',
    title: 'FIAP Connect',
    context: 'Rede social acadêmica',
    visibility: 'private',
    summary:
      'Rede social exclusiva para alunos da FIAP, com grupos de estudo e lista de tarefas para os trabalhos em equipe.',
    description:
      'Rede social restrita a alunos da FIAP para organizar a vida acadêmica em grupo: os alunos criam grupos de estudo fechados e colaborativos e acompanham as tarefas de cada trabalho numa lista compartilhada. Usa contas e logins reais, com acesso limitado ao domínio @fiap.com.br.',
    features: [
      'Acesso restrito a e-mails @fiap.com.br, com contas e login reais',
      'Criação de grupos de estudo fechados',
      'Grupos colaborativos entre os membros',
      'Lista de tarefas (to-do) dos trabalhos dentro de cada grupo',
    ],
    stack: ['TypeScript'],
  },
]

export function findProjectBySlug(slug: string): PortfolioProject | undefined {
  const normalized = slug.toLowerCase()
  return PORTFOLIO_PROJECTS.find((project) => project.slug === normalized)
}
