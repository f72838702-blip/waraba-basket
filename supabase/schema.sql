-- ============================================================
--  Waraba Basket — Schéma de la table `members`
--  À exécuter une seule fois dans le SQL Editor Supabase
--  (Dashboard > SQL Editor > New query > Run).
-- ============================================================

-- Extension nécessaire pour gen_random_uuid() (déjà présente sur la plupart
-- des projets Supabase ; on garde un garde-fou idempotent).
create extension if not exists pgcrypto;

-- Table des membres du club.
-- Reflète l'interface TypeScript `Member` (src/types/member.ts).
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  role        text not null,
  category    text not null,
  status      text not null default 'active'
              check (status in ('active', 'inactive')),
  photo_url   text,
  created_at  timestamptz not null default now()
);

-- Index secondaire utile pour le tri alphabétique de la liste.
create index if not exists members_full_name_idx
  on public.members (full_name);

-- ------------------------------------------------------------
--  Row Level Security
--  La lecture est ouverte à tous (anon + service role).
--  La service role contourne RLS : les écritures restent réservées
--  au back-office / aux scripts serveurs.
-- ------------------------------------------------------------
alter table public.members enable row level security;

drop policy if exists "members_select_public" on public.members;
create policy "members_select_public"
  on public.members
  for select
  using (true);

-- ------------------------------------------------------------
--  Seed : les 3 membres de démonstration initiaux.
--  Idempotent : on n'insère que si la table est vide.
-- ------------------------------------------------------------
insert into public.members (full_name, role, category, status)
select * from (values
  ('Ibrahim Touré',  'Joueur',      'Senior',   'active'),
  ('Awa Diallo',     'Entraîneuse', 'U17',      'active'),
  ('Moussa Camara',  'Joueur',      'Veteran',  'inactive')
) as seed(full_name, role, category, status)
where not exists (select 1 from public.members);