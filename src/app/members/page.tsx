import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import type { Metadata } from "next";
import { getAllMembers } from "@/lib/members-data";
import { fullName, getInitials } from "@/lib/members";

export const metadata: Metadata = {
  title: "Effectif — Waraba Basket",
  description:
    "Annuaire des membres et joueurs du club Waraba Basket : joueurs, entraîneurs et dirigeants.",
};

/**
 * Annuaire public des membres. Grille de cartes cliquables pointant vers la
 * carte de membre officielle (/member/<uuid>). Page statiquement générable
 * (aucune lecture de cookie) : le contenu est rafraîchi via revalidatePath à
 * chaque création de fiche côté admin.
 */
export default async function MembersPage() {
  const members = await getAllMembers();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-gold-light"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <header className="mb-10">
        <h1 className="flex items-center gap-3 text-3xl font-black text-white sm:text-4xl">
          <Users className="h-8 w-8 text-gold-light" />
          Effectif Waraba Basket
        </h1>
        <p className="mt-2 text-slate-400">
          {members.length} membre{members.length > 1 ? "s" : ""} du club —
          cliquez sur une carte pour voir la fiche officielle.
        </p>
      </header>

      {members.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-midnight-light px-4 py-12 text-center text-slate-400">
          L&apos;effectif sera publié prochainement.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/member/${m.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-midnight-light transition hover:-translate-y-1 hover:border-gold/50"
            >
              <div className="flex items-center gap-4 p-5">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-gold/40 bg-royal-dark text-lg font-bold text-gold-light">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo_url}
                      alt={fullName(m)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(m)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">
                    {fullName(m)}
                  </p>
                  <p className="truncate text-sm text-gold-light">
                    {m.role} · {m.category}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {m.position ?? "—"}
                    {m.shirt_number != null ? ` · №${m.shirt_number}` : ""}
                    {m.height_cm != null ? ` · ${(m.height_cm / 100).toFixed(2).replace(".", ",")} m` : ""}
                  </p>
                </div>
              </div>
              <div
                className={`border-t border-white/10 px-5 py-2 text-xs font-semibold ${
                  m.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {m.status === "active" ? "✓ Licence valide" : "✗ Licence inactive"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}