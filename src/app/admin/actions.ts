"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  isAdmin,
  verifyPassword,
  createAdminSession,
  clearAdminSession,
} from "@/lib/auth";
import {
  insertMember,
  updateMember,
  deleteMember,
  uploadMemberPhoto,
  deleteMemberPhoto,
  type MemberInput,
} from "@/lib/members-data";
import type { MemberStatus } from "@/types/member";

/**
 * Server Actions du back-office admin.
 * Chaque action reverifie l'authentification côté serveur : le rendu d'une page
 * protégée n'est pas une frontière de sécurité (la requête peut contourner l'UI).
 */

// ---- Types d'état retournés aux formulaires (useActionState) ----

export type LoginState = { error?: string };

export type CreateMemberState = {
  ok?: boolean;
  error?: string;
  /** UUID du membre créé. */
  id?: string;
  /** URL relative de la fiche créée, ex. /member/<uuid> */
  url?: string;
  /** Nom d'affichage du membre créé (Prénom NOM). */
  name?: string;
};

/** Même shape que CreateMemberState (réutilisé par l'édition). */
export type UpdateMemberState = CreateMemberState;

export type DeleteMemberState = {
  ok?: boolean;
  error?: string;
  /** Nom d'affichage du membre supprimé (pour le retour UI). */
  name?: string;
};

// ---- Allowlists de validation ----

const STATUSES: MemberStatus[] = ["active", "inactive"];
const POSITIONS = ["Meneur", "Arrière", "Ailier", "Ailier fort", "Pivot"];

/** Parse un entier facultatif : vide/invalid → null. */
function parseOptionalInt(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

function str(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim();
}

/**
 * Valide et extrait les champs scalaires communs à la création et à l'édition
 * (tout sauf la photo, dont la logique diffère entre create et update).
 * Retourne les champs parsés ; l'appelant reverifie `first_name`/`last_name`
 * (requis) selon le contexte.
 */
function parseMemberScalars(formData: FormData): {
  first_name: string;
  last_name: string;
  role: string;
  category: string;
  status: MemberStatus;
  position: string | null;
  shirt_number: number | null;
  height_cm: number | null;
  weight_kg: number | null;
} {
  const first_name = str(formData.get("first_name"));
  const last_name = str(formData.get("last_name"));

  const role = str(formData.get("role")) || "Joueur";
  const category = str(formData.get("category")) || "Senior";

  const statusRaw = str(formData.get("status"));
  const status: MemberStatus = STATUSES.includes(statusRaw as MemberStatus)
    ? (statusRaw as MemberStatus)
    : "active";

  const positionRaw = str(formData.get("position"));
  const position = POSITIONS.includes(positionRaw) ? positionRaw : null;

  const shirt_number = parseOptionalInt(formData.get("shirt_number"));
  const height_cm = parseOptionalInt(formData.get("height_cm"));
  const weight_kg = parseOptionalInt(formData.get("weight_kg"));

  return {
    first_name,
    last_name,
    role,
    category,
    status,
    position,
    shirt_number,
    height_cm,
    weight_kg,
  };
}

// ---- Actions ----

/** Connexion admin : vérifie le mot de passe puis pose le cookie de session. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = str(formData.get("password"));
  if (!password) {
    return { error: "Veuillez saisir le mot de passe." };
  }
  if (!verifyPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }
  await createAdminSession();
  redirect("/admin/members/new");
}

/** Déconnexion : supprime le cookie et retourne à l'écran de login. */
export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

/**
 * Création d'une fiche membre. Valide tous les champs, insère via le client
 * service role côté serveur, invalide le cache de l'annuaire public.
 */
export async function createMemberAction(
  _prev: CreateMemberState,
  formData: FormData
): Promise<CreateMemberState> {
  // Garde-fou serveur (défense en profondeur) : ne jamais se fier à la page.
  if (!(await isAdmin())) {
    return { error: "Non autorisé. Veuillez vous reconnecter." };
  }

  const scalars = parseMemberScalars(formData);
  if (!scalars.first_name || !scalars.last_name) {
    return { error: "Le prénom et le nom sont obligatoires." };
  }

  // Photo : un fichier uploadé (caméra ou mémoire) prend la priorité sur le
  // champ URL. Si aucun des deux n'est renseigné → null (initiales affichées).
  const photoFile = formData.get("photo_file");
  let photo_url: string | null = null;

  if (photoFile instanceof File && photoFile.size > 0) {
    const uploaded = await uploadMemberPhoto(photoFile);
    if ("error" in uploaded) {
      return { error: `Photo : ${uploaded.error}` };
    }
    photo_url = uploaded.url;
  } else {
    const photoRaw = str(formData.get("photo_url"));
    photo_url = photoRaw === "" ? null : photoRaw;
  }

  const input: MemberInput = {
    ...scalars,
    photo_url,
  };

  const result = await insertMember(input);
  if ("error" in result) {
    return { error: result.error };
  }

  // L'annuaire public et la liste admin doivent refléter le nouveau membre.
  revalidatePath("/members");
  revalidatePath("/admin/members");

  const name = `${scalars.first_name} ${scalars.last_name.toUpperCase()}`;
  return { ok: true, id: result.id, url: `/member/${result.id}`, name };
}

/**
 * Édition d'une fiche membre. Valide les champs (scalaires partagés avec la
 * création), gère la photo (remplacement / suppression / conservation), met à
 * jour la ligne, et invalide le cache des pages concernées.
 */
export async function updateMemberAction(
  _prev: UpdateMemberState,
  formData: FormData
): Promise<UpdateMemberState> {
  if (!(await isAdmin())) {
    return { error: "Non autorisé. Veuillez vous reconnecter." };
  }

  const id = str(formData.get("id"));
  if (!id) {
    return { error: "Membre introuvable (identifiant manquant)." };
  }

  const scalars = parseMemberScalars(formData);
  if (!scalars.first_name || !scalars.last_name) {
    return { error: "Le prénom et le nom sont obligatoires." };
  }

  // ---- Photo (logique propre à l'édition) ----
  const existingPhotoUrl = str(formData.get("current_photo_url")) || null;
  const photoFile = formData.get("photo_file");
  const removePhoto = str(formData.get("remove_photo")) === "1";

  let photo_url: string | null = existingPhotoUrl;

  if (photoFile instanceof File && photoFile.size > 0) {
    // Nouvelle photo : on upload, puis on libère l'ancien objet Storage
    // (best-effort) si la photo actuelle appartenait à notre bucket.
    const uploaded = await uploadMemberPhoto(photoFile);
    if ("error" in uploaded) {
      return { error: `Photo : ${uploaded.error}` };
    }
    await deleteMemberPhoto(existingPhotoUrl);
    photo_url = uploaded.url;
  } else if (removePhoto) {
    // Suppression demandée : on retire l'URL et on libère le bucket.
    await deleteMemberPhoto(existingPhotoUrl);
    photo_url = null;
  }
  // Sinon : on conserve existingPhotoUrl tel quel.

  const input: MemberInput = {
    ...scalars,
    photo_url,
  };

  const result = await updateMember(id, input);
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/members");
  revalidatePath("/admin/members");
  revalidatePath(`/member/${id}`);

  const name = `${scalars.first_name} ${scalars.last_name.toUpperCase()}`;
  return { ok: true, id, url: `/member/${id}`, name };
}

/**
 * Suppression d'une fiche membre. Retire la ligne et (best-effort) l'objet
 * photo Storage associé, puis invalide le cache. `name` est un champ caché
 * display-only (non fiable côté serveur, juste pour le retour UI).
 */
export async function deleteMemberAction(
  _prev: DeleteMemberState,
  formData: FormData
): Promise<DeleteMemberState> {
  if (!(await isAdmin())) {
    return { error: "Non autorisé. Veuillez vous reconnecter." };
  }

  const id = str(formData.get("id"));
  if (!id) {
    return { error: "Membre introuvable (identifiant manquant)." };
  }

  const name = str(formData.get("name")) || "ce membre";

  const result = await deleteMember(id);
  if ("error" in result) {
    return { error: result.error };
  }

  revalidatePath("/members");
  revalidatePath("/admin/members");
  revalidatePath(`/member/${id}`);

  return { ok: true, name };
}