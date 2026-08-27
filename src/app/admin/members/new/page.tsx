import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import CreateMemberForm from "@/components/admin/CreateMemberForm";

export const metadata = {
  title: "Nouvelle fiche membre — Admin Matam Waraba",
};

/**
 * Formulaire de création d'une fiche membre depuis le site.
 * Accès réservé : redirige vers /admin/login si non authentifié.
 */
export default async function NewMemberPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
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
        <h1 className="text-2xl font-black text-white">Nouvelle fiche membre</h1>
        <p className="mt-1 text-sm text-slate-400">
          Renseignez les informations du joueur ou membre. Seuls le prénom et le
          nom sont obligatoires.
        </p>
      </div>

      <CreateMemberForm />
    </div>
  );
}