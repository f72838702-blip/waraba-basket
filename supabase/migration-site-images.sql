-- ============================================================
-- Matam Waraba — Images personnalisables de la page d'accueil
-- À exécuter dans le SQL Editor Supabase du projet wbiibtkklwmwzcicshfm.
-- Table additive : ne touche pas aux tables existantes.
-- ============================================================

-- Remplacements d'images de l'accueil (hero, équipes, staff…), pilotés
-- depuis /admin/images. Clé fixe (hero, u10, u11…), valeur = URL Storage.
-- Pas de ligne = l'accueil utilise l'image par défaut de /public/images.
create table if not exists public.site_images (
  key        text primary key,
  image_url  text not null,
  updated_at timestamptz not null default now()
);

-- Active RLS : aucun accès public. Lecture/écriture via la clé service role
-- (côté serveur uniquement).
alter table public.site_images enable row level security;
