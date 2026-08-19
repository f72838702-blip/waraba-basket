-- ============================================================
--  Waraba Basket — Migration : champs joueur sur la table members
--  À exécuter une fois dans le SQL Editor Supabase.
--  Additif (garde full_name, l'app l'ignore désormais) → aucune coupure.
-- ============================================================

alter table public.members
  add column if not exists first_name    text,
  add column if not exists last_name     text,
  add column if not exists position      text,   -- Meneur / Arrière / Ailier / Ailier fort / Pivot (null pour non-joueur)
  add column if not exists shirt_number  int,    -- numéro de maillot (null pour non-joueur)
  add column if not exists height_cm     int,    -- taille en cm
  add column if not exists weight_kg     int;    -- poids en kg (null si inconnu)

-- Backfill prénom / nom pour les 3 membres déjà en base.
update public.members set first_name = 'Ibrahim', last_name = 'Touré'   where full_name = 'Ibrahim Touré';
update public.members set first_name = 'Awa',    last_name = 'Diallo'  where full_name = 'Awa Diallo';
update public.members set first_name = 'Moussa', last_name = 'Camara'   where full_name = 'Moussa Camara';

-- Profil basket réaliste pour les 3 membres (modifiable ensuite dans le Table Editor).
update public.members set
  position = 'Arrière', shirt_number = 7,  height_cm = 188, weight_kg = 78
  where full_name = 'Ibrahim Touré';

update public.members set
  position = null,      shirt_number = null, height_cm = 172, weight_kg = null
  where full_name = 'Awa Diallo';  -- entraîneuse : pas de poste / maillot / poids

update public.members set
  position = 'Pivot',   shirt_number = 33, height_cm = 196, weight_kg = 92
  where full_name = 'Moussa Camara';