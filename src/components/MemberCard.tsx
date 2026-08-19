"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Printer,
  Download,
  IdCard,
  Loader2,
} from "lucide-react";
import type { Member } from "@/types/member";
import { getInitials } from "@/lib/members";
import { generateQrCodeDataUrl } from "@/lib/qrcode";

interface MemberCardProps {
  member: Member;
}

/**
 * Carte de membre officielle — badge responsive.
 * - Photo (ou initiales si absente), nom, poste, catégorie.
 * - QR code généré côté client pointant vers l'URL absolue du membre.
 * - Boutons d'impression et d'export du QR (masqués à l'impression).
 */
export default function MemberCard({ member }: MemberCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [memberUrl, setMemberUrl] = useState<string>("");
  const [loadingQr, setLoadingQr] = useState(true);

  useEffect(() => {
    const absoluteUrl = `${window.location.origin}/member/${member.id}`;
    setMemberUrl(absoluteUrl);
    generateQrCodeDataUrl(absoluteUrl, {
      width: 176,
      margin: 1,
      color: { dark: "#0F172A", light: "#FFFFFF" },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("[Waraba Basket] QR error:", err))
      .finally(() => setLoadingQr(false));
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
      {/* Bandeau supérieur */}
      <header className="flex items-center justify-between bg-royal px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <IdCard className="h-5 w-5 text-gold-light" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Carte de Membre
          </span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-gold-light">
          Waraba Basket
        </span>
      </header>

      {/* Corps : identité + QR */}
      <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        {/* Identité */}
        <div className="flex flex-col items-center md:flex-row md:items-center md:gap-6">
          <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-gold/40 bg-royal-dark">
            {member.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo_url}
                alt={member.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-gold-light">
                {getInitials(member.full_name)}
              </span>
            )}
          </div>

          <div className="mt-4 text-center md:mt-0 md:text-left">
            <h2 className="text-2xl font-bold text-white">{member.full_name}</h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-wide text-gold-light">
              {member.role}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <dt className="text-slate-400">Catégorie :</dt>
                <dd className="font-medium text-white">{member.category}</dd>
              </div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <dt className="text-slate-400">Licence :</dt>
                <dd className="font-mono font-medium text-gold-light">
                  WB-{member.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-white p-2">
            {loadingQr ? (
              <div className="flex h-[176px] w-[176px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code de la licence ${member.id}`}
                width={176}
                height={176}
                className="h-[176px] w-[176px]"
              />
            )}
          </div>
          <p className="max-w-[176px] text-center text-[11px] leading-tight text-slate-500">
            Scannez pour vérifier la licence en ligne
          </p>
        </div>
      </div>

      {/* Badge de statut */}
      <div className="px-6 pb-6">
        {isActive ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-center">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-400" />
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              ✓ Licence valide / Cotisation à jour
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-3 text-center">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-400" />
            <span className="text-sm font-semibold uppercase tracking-wide text-red-400">
              ✗ Licence inactive / Cotisation à régulariser
            </span>
          </div>
        )}
      </div>

      {/* Actions : impression / export — masquées à l'impression */}
      <div className="no-print flex flex-col gap-3 border-t border-white/10 px-6 py-4 sm:flex-row">
        <button
          onClick={handlePrint}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-royal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-royal-light"
        >
          <Printer className="h-4 w-4" />
          Imprimer
        </button>
        <button
          onClick={handleDownloadQr}
          disabled={!qrDataUrl}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold/40 px-4 py-2.5 text-sm font-semibold text-gold-light transition hover:bg-gold hover:text-midnight disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Exporter le QR
        </button>
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