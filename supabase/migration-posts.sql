-- ============================================================
-- Matam Waraba — Articles / Actualités / Matchs / Partenariats
-- À exécuter dans le SQL Editor Supabase du projet wbiibtkklwmwzcicshfm.
-- Table additive : ne touche pas aux tables existantes.
-- ============================================================

-- Articles publiés sur la page d'accueil (matchs à venir, actualités,
-- partenariats, événements...). Rédigés depuis le back-office /admin/posts.
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  title       text not null,
  category    text not null,             -- match | actualite | partenariat | evenement
  excerpt     text not null,             -- accroche courte affichée sur la carte
  content     text,                      -- détails complets (optionnel)
  image_url   text,                      -- illustration (bucket members-photos, optionnel)
  event_date  date,                      -- date du match / événement (optionnel)
  published   boolean not null default true
);

-- Index : liste publique triée par date de création.
create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

-- Active RLS : aucun accès public direct. L'application serveur lit et écrit
-- via la clé service role, qui contourne RLS. Pas de policy publique.
alter table public.posts enable row level security;
