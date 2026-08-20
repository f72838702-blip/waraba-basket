-- ============================================================
-- Waraba Basket — Messages de contact (formulaire public)
-- À exécuter dans le SQL Editor Supabase du projet wbiibtkklwmwzcicshfm.
-- Table additive : ne touche pas aux tables existantes.
-- ============================================================

-- Table des messages envoyés via le formulaire de contact public.
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  message     text not null,
  is_read     boolean not null default false
);

-- Index pour trier par date (liste admin « plus récents d'abord »).
create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- Active RLS : aucun accès public (anon / authenticated n'ont ni lecture ni
-- écriture). L'application serveur écrit et lit via la clé service role,
-- qui contourne RLS. Seul le serveur (server actions gardées par isAdmin pour
-- la lecture, formulaire public pour l'écriture validée côté serveur) y accède.
alter table public.contact_messages enable row level security;

-- Aucune policy : RLS bloque tout sauf la clé service role (bypass explicite).
-- (Ne pas ajouter de policy INSERT publique : on ne veut pas qu'un client
-- anonyme écrive directement en base hors du server action validé.)