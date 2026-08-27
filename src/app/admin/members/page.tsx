import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ExternalLink, Users, Pencil } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getAllMembers } from "@/lib/members-data";
import { fullName, getInitials } from "@/lib/members";
import DeleteMemberButton from "@/components/admin/DeleteMemberButton";

export const metadata = {
  title: "Membres — Admin Matam Waraba",
};

/**
 * Liste admin des membres existants + accès au formulaire de création.
 * Chaque ligne : partie gauche (lien vers la fiche publique) + partie droite
 * (Modifier / Supprimer). Accès réservé : redirige vers /admin/login si non
 * authentifié.
 */
export default async function AdminMembersPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const members = await getAllMembers();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-black text-white">
          <Users className="h-6 w-6 text-gold-light" />
          Membres du club
        </h1>
        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 font-bold text-midnight transition hover:bg-gold-light"
        >
          <Plus className="h-4 w-4" />
          Créer une fiche
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-midnight-light px-4 py-8 text-center text-slate-400">
          Aucun membre pour le moment. Cliquez sur « Créer une fiche » pour
          commencer.
        </p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => {
            const name = fullName(m);
            return (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-midnight-light px-4 py-3 transition hover:border-gold/40"
              >
                {/* Partie gauche : lien vers la fiche publique */}
                <Link
                  href={`/member/${m.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/40 bg-royal-dark text-sm font-bold text-gold-light">
                    {m.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo_url}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(m)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {m.role} · {m.category}
                      {m.position ? ` · ${m.position}` : ""}
                      {m.shirt_number != null ? ` · №${m.shirt_number}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      m.status === "active"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {m.status === "active" ? "Valide" : "Inactive"}
                  </span>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-slate-500 transition group-hover:text-gold-light" />
                </Link>

                {/* Partie droite : actions */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/members/${m.id}/edit`}
                    title="Modifier la fiche"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:border-gold/40 hover:text-gold-light"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Modifier</span>
                  </Link>
                  <DeleteMemberButton id={m.id} name={name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}