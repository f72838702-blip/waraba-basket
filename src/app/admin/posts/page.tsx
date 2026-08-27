import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getAllPosts } from "@/lib/posts-data";
import {
  categoryLabel,
  formatPostDate,
} from "@/types/post";
import DeletePostButton from "@/components/admin/DeletePostButton";

/** Liste des articles du back-office (créer / éditer / supprimer). */
export default async function AdminPostsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const posts = await getAllPosts();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="mt-1 text-sm text-slate-400">
            Matchs, actualités, partenariats et événements publiés sur la page
            d&apos;accueil.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-midnight transition hover:bg-gold-light"
        >
          <PlusCircle className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-xl border border-white/10 bg-midnight-light p-6 text-sm text-slate-400">
          Aucun article pour le moment. Cliquez sur « Nouvel article » pour
          publier votre première actualité — elle apparaîtra sur la page
          d&apos;accueil.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-midnight-light px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-bold text-white">
                    {p.title}
                  </span>
                  <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold-light">
                    {categoryLabel(p.category)}
                  </span>
                  {!p.published && (
                    <span className="rounded-full border border-slate-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                      Masqué
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {p.event_date
                    ? `Événement le ${formatPostDate(p.event_date)}`
                    : `Publié le ${formatPostDate(p.created_at)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/posts/${p.id}/edit`}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-gold/50 hover:text-gold-light"
                >
                  Modifier
                </Link>
                <DeletePostButton id={p.id} title={p.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
