import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { createPostAction } from "@/app/admin/actions";
import PostForm from "@/components/admin/PostForm";

/** Création d'un article (match, actualité, partenariat, événement). */
export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Nouvel article</h1>
      <p className="mt-1 text-sm text-slate-400">
        Publié sur la page d&apos;accueil (section « À la une »). Décochez
        « Publier immédiatement » pour garder un brouillon.
      </p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-midnight-light p-6">
        <PostForm action={createPostAction} />
      </div>
    </div>
  );
}
