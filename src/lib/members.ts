import type { Member } from "@/types/member";

/**
 * Données de démonstration des membres.
 * À remplacer par une requête Supabase :
 *   const { data } = await supabase.from("members").select("*").eq("id", id).single()
 */
const MEMBERS: Member[] = [
  {
    id: "0001",
    full_name: "Ibrahim Touré",
    role: "Joueur",
    category: "Senior",
    status: "active",
    photo_url: null,
  },
  {
    id: "0002",
    full_name: "Awa Diallo",
    role: "Entraîneuse",
    category: "U17",
    status: "active",
    photo_url: null,
  },
  {
    id: "0003",
    full_name: "Moussa Camara",
    role: "Joueur",
    category: "Veteran",
    status: "inactive",
    photo_url: null,
  },
];

export async function getMemberById(id: string): Promise<Member | undefined> {
  return MEMBERS.find((m) => m.id === id);
}

export async function getAllMembers(): Promise<Member[]> {
  return MEMBERS;
}

/** Initiales affichées quand aucune photo n'est disponible. */
export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}