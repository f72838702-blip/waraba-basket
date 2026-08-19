"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  isAdmin,
  verifyPassword,
  createAdminSession,
  clearAdminSession,
} from "@/lib/auth";
import { insertMember, type NewMemberInput } from "@/lib/members-data";
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

  const first_name = str(formData.get("first_name"));
  const last_name = str(formData.get("last_name"));

  if (!first_name || !last_name) {
    return { error: "Le prénom et le nom sont obligatoires." };
  }

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

  const photoRaw = str(formData.get("photo_url"));
  const photo_url = photoRaw === "" ? null : photoRaw;

  const input: NewMemberInput = {
    first_name,
    last_name,
    role,
    category,
    status,
    photo_url,
    position,
    shirt_number,
    height_cm,
    weight_kg,
  };

  const result = await insertMember(input);
  if ("error" in result) {
    return { error: result.error };
  }

  // L'annuaire public et la liste admin doivent refléter le nouveau membre.
  revalidatePath("/members");
  revalidatePath("/admin/members");

  const name = `${first_name} ${last_name.toUpperCase()}`;
  return { ok: true, id: result.id, url: `/member/${result.id}`, name };
}