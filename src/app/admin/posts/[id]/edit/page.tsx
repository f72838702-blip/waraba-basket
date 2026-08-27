import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/posts-data";
import { updatePostAction } from "@/app/admin/actions";
import PostForm from "@/components/admin/PostForm";

/** Édition d'un article existant. */
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-white">
        Modifier « {post.title} »
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Les changements sont visibles immédiatement sur la page d&apos;accueil.
      </p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-midnight-light p-6">
        <PostForm post={post} action={updatePostAction} />
      </div>
    </div>
  );
}
