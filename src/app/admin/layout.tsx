import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";
import LogoutButton from "@/components/admin/LogoutButton";

/**
 * Layout du back-office admin. Bandeau sobre « Waraba Basket — Admin » avec
 * déconnexion, affiché uniquement si l'admin est authentifié (masqué sur
 * l'écran de login). La lecture du cookie force le rendu dynamique de /admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-midnight text-white">
      {authed && (
        <header className="border-b border-white/10 bg-midnight-light">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                🏀
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-gold-light">
                Waraba Basket — Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/members"
                className="text-sm text-slate-300 transition hover:text-gold-light"
              >
                Annuaire
              </Link>
              <form action={logoutAction}>
                <LogoutButton />
              </form>
            </div>
          </div>
        </header>
      )}

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}