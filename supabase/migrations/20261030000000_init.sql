-- Portfólio CP3 — esquema inicial (Supabase / PostgreSQL)
-- Aplicar no SQL Editor do Supabase ou com `supabase db push`.
--
-- Modelo de segurança (RLS):
--   visitante anônimo → só INSERE mensagem de contato e LÊ projetos em destaque
--   admin (linha em admin_users) → lê/atualiza/apaga mensagens e altera destaques
-- A anon key é pública por design; quem protege os dados são as políticas abaixo.

-- ---------------------------------------------------------------------------
-- Admins: usuários do Supabase Auth autorizados a usar o painel.
-- Depois de criar o usuário em Authentication > Users:
--   insert into public.admin_users (user_id) values ('<uuid do usuário>');
-- E desative cadastro público em Authentication > Providers > Email.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Sem políticas: ninguém lê/escreve pela API. Só o próprio banco (funções security definer).

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Mensagens de contato
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 254 and email like '%_@_%'),
  subject text not null default '' check (char_length(subject) <= 120),
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy "anon pode enviar mensagem"
  on public.contact_messages for insert
  to anon, authenticated
  with check (read_at is null);

create policy "admin lê mensagens"
  on public.contact_messages for select
  to authenticated
  using ((select public.is_admin()));

create policy "admin marca como lida"
  on public.contact_messages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admin apaga mensagem"
  on public.contact_messages for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Projetos em destaque (nome do repositório no GitHub + ordem)
-- ---------------------------------------------------------------------------
create table if not exists public.featured_projects (
  repo_name text primary key check (char_length(repo_name) between 1 and 100),
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now()
);

alter table public.featured_projects enable row level security;

create policy "todos leem destaques"
  on public.featured_projects for select
  to anon, authenticated
  using (true);

-- Escrita só pela função abaixo (atômica). Nenhuma política de insert/update/delete direta.

create or replace function public.set_featured_projects(repo_names text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'permissão negada' using errcode = '42501';
  end if;

  if coalesce(array_length(repo_names, 1), 0) > 6 then
    raise exception 'no máximo 6 destaques';
  end if;

  delete from public.featured_projects where true;

  insert into public.featured_projects (repo_name, position)
  select name, (ordinality - 1)::smallint
  from unnest(repo_names) with ordinality as t(name, ordinality);
end;
$$;

revoke all on function public.set_featured_projects(text[]) from public, anon;
grant execute on function public.set_featured_projects(text[]) to authenticated;
