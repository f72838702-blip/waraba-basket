"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Printer,
  Download,
  IdCard,
  Loader2,
  Hash,
  Ruler,
  Scale,
  Target,
  Pencil,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Member } from "@/types/member";
import {
  fullName,
  getInitials,
  formatHeight,
  formatWeight,
} from "@/lib/members";
import { generateQrCodeDataUrl } from "@/lib/qrcode";
import DeleteMemberButton from "@/components/admin/DeleteMemberButton";

interface MemberCardProps {
  member: Member;
  /** True si le visiteur est l'admin authentifié → affiche les boutons
   * Modifier / Supprimer sur la carte (cachés pour le public, à l'impression). */
  canEdit?: boolean;
}

/**
 * Carte de membre officielle — style « trading card ».
 * Photo + numéro de maillot en badge, identité + stats (Poste / Maillot /
 * Taille / Poids) en grille, QR code de vérification, statut de licence.
 */
export default function MemberCard({ member, canEdit }: MemberCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [memberUrl, setMemberUrl] = useState<string>("");
  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => {
    let active = true;
    const absoluteUrl = `${window.location.origin}/member/${member.id}`;
    generateQrCodeDataUrl(absoluteUrl, {
      width: 176,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then((url) => {
        if (!active) return;
        setQrDataUrl(url);
        setMemberUrl(absoluteUrl);
      })
      .catch((err) => console.error("[Waraba Basket] QR error:", err))
      .finally(() => {
        if (active) setLoadingQr(false);
      });
    return () => {
      active = false;
    };
  }, [member.id]);

  const isActive = member.status === "active";

  const handlePrint = () => window.print();

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `waraba-basket-licence-${member.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <article className="print-card overflow-hidden rounded-3xl border border-white/10 bg-midnight-light shadow-2xl">
      {/* ===== Bandeau supérieur ===== */}
      <header className="flex items-center justify-between bg-royal px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg" aria-hidden>
            🏀
          </span>
          <span className="text-sm font-bold uppercase tracking-wider">
            Waraba Basket
          </span>
        </div>
        <div className="flex items-center gap-2 text-gold-light">
          <IdCard className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Carte Membre
          </span>
        </div>
      </header>

      {/* ===== Barre admin (uniquement si l'admin est connecté) ===== */}
      {canEdit && (
        <div className="no-print flex flex-wrap items-center gap-2 border-b border-gold/20 bg-royal-dark/50 px-6 py-3">
          <span className="mr-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-light">
            <Lock className="h-3.5 w-3.5" />
            Espace admin
          </span>
          <Link
            href={`/admin/members/${member.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-gold/40 hover:text-gold-light"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
          <DeleteMemberButton id={member.id} name={fullName(member)} />
        </div>
      )}

      {/* ===== Corps : photo + identité/stats ===== */}
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[auto_1fr]">
        {/* Colonne gauche : photo + badge maillot */}
        <div className="flex justify-center sm:block">
          <div className="relative h-32 w-32 flex-shrink-0">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-gold/40 bg-royal-dark">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={fullName(member)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gold-light">
                  {getInitials(member)}
                </span>
              )}
            </div>
            {member.shirt_number != null && (
              <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-midnight-light bg-gold font-black text-xl text-midnight shadow-lg">
                {member.shirt_number}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite : identité + stats */}
        <div className="flex flex-col justify-center gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              {fullName(member)}
            </h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-gold-light">
              {member.role} · {member.category}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={Target} label="Poste" value={member.position ?? "—"} />
            <StatTile
              icon={Hash}
              label="Maillot"
              value={
                member.shirt_number != null ? `№ ${member.shirt_number}` : "—"
              }
            />
            <StatTile
              icon={Ruler}
              label="Taille"
              value={formatHeight(member.height_cm)}
            />
            <StatTile
              icon={Scale}
              label="Poids"
              value={formatWeight(member.weight_kg)}
            />
          </div>
        </div>
      </div>

      {/* ===== Bas : QR + statut + actions ===== */}
      <div className="flex flex-col items-center gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-stretch">
        {/* QR code */}
        <div className="flex flex-col items-center gap-1">
          <div className="rounded-xl border border-white/10 bg-white p-2">
            {loadingQr ? (
              <div className="flex h-[88px] w-[88px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code de la licence ${member.id}`}
                width={88}
                height={88}
                className="h-[88px] w-[88px]"
              />
            )}
          </div>
          <p className="max-w-[88px] text-center text-[10px] leading-tight text-slate-500">
            Scanner pour vérifier
          </p>
        </div>

        {/* Statut + licence */}
        <div className="flex flex-1 flex-col items-center justify-center gap-2 sm:items-start">
          {isActive ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                ✓ Licence valide
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2.5">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-400" />
              <span className="text-sm font-semibold uppercase tracking-wide text-red-400">
                ✗ Licence inactive
              </span>
            </div>
          )}
          <p className="font-mono text-xs text-slate-400">
            Licence&nbsp;: <span className="text-gold-light">WB-{member.id}</span>
          </p>
        </div>

        {/* Actions — masquées à l'impression */}
        <div className="no-print flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            onClick={handlePrint}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-royal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-light sm:flex-none"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button
            onClick={handleDownloadQr}
            disabled={!qrDataUrl}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold/40 px-4 py-2.5 text-sm font-semibold text-gold-light transition hover:bg-gold hover:text-midnight disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            QR
          </button>
        </div>
      </div>

      {/* URL absolue encodée dans le QR (info, masquée à l'impression) */}
      {memberUrl && (
        <p className="no-print px-6 pb-4 text-center text-[11px] text-slate-600">
          {memberUrl}
        </p>
      )}
    </article>
  );
}

/** Tuile de stat : icône + label + valeur. */
function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-midnight px-3 py-2.5">
      <Icon className="h-5 w-5 flex-shrink-0 text-gold-light" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}