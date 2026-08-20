import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getMemberById } from "@/lib/members-data";
import { fullName } from "@/lib/members";
import EditMemberForm from "@/components/admin/EditMemberForm";

/**
 * Édition d'une fiche membre depuis le site.
 * Accès réservé : redirige vers /admin/login si non authentifié.
 * Route : /admin/members/[id]/edit
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) return { title: "Membre introuvable — Admin Waraba Basket" };
  return {
    title: `Modifier ${fullName(member)} — Admin Waraba Basket`,
  };
}

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/admin/members"
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-gold-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Liste des membres
        </Link>
        <h1 className="text-2xl font-black text-white">
          Modifier la fiche — {fullName(member)}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Modifiez les informations du membre puis enregistrez. Seuls le prénom et
          le nom sont obligatoires.
        </p>
      </div>

      <EditMemberForm member={member} />
    </div>
  );
}