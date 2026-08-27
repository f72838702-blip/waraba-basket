import { redirect } from "next/navigation";
import { Mail, MailOpen, Inbox } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getContactMessages } from "@/lib/contact-data";
import MarkReadButton from "@/components/admin/MarkReadButton";

export const metadata = {
  title: "Messages — Admin Matam Waraba",
};

/**
 * Boîte de réception des messages du formulaire de contact public.
 * Accès réservé : redirige vers /admin/login si non authentifié.
 * Les messages non lus sont mis en avant ; un bouton permet de les marquer
 * comme lus (sans les supprimer — historique conservé).
 */
export default async function AdminMessagesPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const messages = await getContactMessages();
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-black text-white">
          <Mail className="h-6 w-6 text-gold-light" />
          Messages reçus
          {unread > 0 && (
            <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-sm font-bold text-midnight">
              {unread} nouveau{unread > 1 ? "x" : ""}
            </span>
          )}
        </h1>
      </div>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-midnight-light px-4 py-12 text-center text-slate-400">
          <Inbox className="mx-auto mb-3 h-10 w-10 text-slate-600" />
          Aucun message pour le moment. Les messages envoyés via le formulaire
          de contact du site apparaîtront ici.
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={`rounded-2xl border px-5 py-4 ${
                m.is_read
                  ? "border-white/10 bg-midnight-light"
                  : "border-amber-500/50 bg-amber-500/5"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {m.is_read ? (
                    <MailOpen className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Mail className="h-4 w-4 text-amber-400" />
                  )}
                  <span className="font-bold text-white">{m.name}</span>
                  {!m.is_read && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                      Nouveau
                    </span>
                  )}
                </div>
                <time
                  dateTime={m.created_at}
                  className="text-xs text-slate-500"
                >
                  {new Date(m.created_at).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>

              <p className="mt-1 text-sm text-gold-light">{m.email}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-200">
                {m.message}
              </p>

              {!m.is_read && (
                <div className="mt-3">
                  <MarkReadButton id={m.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}