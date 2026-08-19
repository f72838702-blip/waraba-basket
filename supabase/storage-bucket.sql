-- ============================================================
--  Waraba Basket — Bucket Storage pour les photos de membres
--  À exécuter une seule fois dans le SQL Editor Supabase
--  (Dashboard > SQL Editor > New query > Run).
--
--  Le bucket a déjà été créé via l'API Storage (service role) le
--  19/08/2026. Ce script est fourni pour la reproductibilité : il est
--  idempotent et recréera le bucket si besoin.
-- ============================================================

-- Bucket public : les photos sont servies sur une URL publique (lue par
-- /member/[id] et /members). Les écritures restent réservées au back-office
-- côté serveur (clé service role → RLS contournée).
insert into storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
values (
  'members-photos',
  'members-photos',
  true,
  '{image/jpeg,image/png,image/webp}',
  4194304   -- 4 Mo
)
on conflict (id) do update
  set public = true,
      allowed_mime_types = '{image/jpeg,image/png,image/webp}',
      file_size_limit = 4194304;

-- Pas de politique RLS nécessaire pour la lecture : un bucket `public` sert
-- ses objets via l'URL publique sans contrôle supplémentaire. Les uploads se
-- font côté serveur avec la clé service role (contourne RLS).