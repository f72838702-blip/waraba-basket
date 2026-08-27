import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getMemberById } from "@/lib/members-data";
import { fullName } from "@/lib/members";
import { isAdmin } from "@/lib/auth";
import MemberCard from "@/components/MemberCard";

/**
 * Carte de membre officielle — Matam Waraba.
 * Route : /member/[id]
 *
 * La lecture du cookie admin (`isAdmin()`) rend la route dynamique : un
 * visiteur normal voit la carte seule ; l'admin connecté voit en plus la
 * barre « Espace admin » (Modifier / Supprimer) sur la carte.
 */
export async function generateMetadata({
  params,
}: PageProps<"/member/[id]">): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) return { title: "Membre introuvable — Matam Waraba" };
  const name = fullName(member);
  return {
    title: `${name} — Carte de membre`,
    description: `Carte de membre officielle de ${name} (${member.role}, ${member.category}).`,
  };
}

export default async function MemberCardPage({
  params,
}: PageProps<"/member/[id]">) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  // L'admin connecté obtient les boutons Modifier / Supprimer sur la carte.
  const canEdit = await isAdmin();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="no-print mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-gold-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l&apos;accueil
        </Link>

        <MemberCard member={member} canEdit={canEdit} />
      </div>
    </main>
  );
}