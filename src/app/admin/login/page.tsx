import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = {
  title: "Connexion admin — Waraba Basket",
};

/**
 * Écran de connexion admin. Si l'utilisateur est déjà authentifié, on le
 * redirige directement vers le formulaire de création de fiche.
 */
export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin/members/new");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-black text-white">
          🏀 Waraba Basket
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-slate-600">
          Accès réservé à l&apos;administration du club.
        </p>
      </div>
    </div>
  );
}