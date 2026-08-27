import Image from "next/image";
import {
  Trophy,
  Users,
  Flame,
  Star,
  ArrowRight,
  ChevronDown,
  Mail,
  Send,
  MapPin,
  Calendar,
  Newspaper,
} from "lucide-react";
import {
  LionMark,
  LionWatermark,
  SectionHeader,
  WhatsAppIcon,
  FacebookIcon,
} from "@/components/brand";
import ContactForm from "@/components/ContactForm";
import {
  WHATSAPP_URL,
  WHATSAPP_DISPLAY,
  CONTACT_EMAIL,
  FACEBOOK_URL,
} from "@/lib/contact";
import { getAllMembers } from "@/lib/members-data";
import { getPublishedPosts } from "@/lib/posts-data";
import { getSiteImageOverrides } from "@/lib/site-images-data";
import { resolveSiteImage, type SiteImageKey } from "@/lib/site-images";
import { categoryLabel, formatPostDate } from "@/types/post";

/* ============================================================
   Matam Waraba — Page d'accueil (Académie de Basketball)
   Palette : Bleu Royal (#1E3A8A) · Or (#F59E0B) · Blanc
   Mobile-first, Tailwind CSS, icônes Lucide-react.
   ============================================================ */

// --- Les catégories de l'académie (images remplaçables depuis /admin/images) ---
const teams: { key: SiteImageKey; name: string; desc: string }[] = [
  { key: "u10", name: "U10", desc: "Détection & initiation aux fondamentaux." },
  {
    key: "u11",
    name: "U11",
    desc: "Apprentissage technique & esprit d'équipe.",
  },
  { key: "u14", name: "U14", desc: "Compétition régionale & progression." },
  {
    key: "u15",
    name: "U15",
    desc: "Excellence & performance sur le parquet.",
  },
  {
    key: "feminine",
    name: "Équipe féminine",
    desc: "La fierté de l'académie, basket au féminin.",
  },
];

// --- L'encadrement technique ---
const staff: { key: SiteImageKey; name: string; role: string }[] = [
  { key: "coach", name: "Le Coach", role: "Entraîneur principal" },
  { key: "staff", name: "Le Staff", role: "Coach & adjoint" },
];

// Régénère la page au plus toutes les 10 min en filet de sécurité ; les
// actions admin (create/update/delete) forcent une régénération immédiate
// via revalidatePath("/").
export const revalidate = 600;

export default async function Home() {
  // Compteur membres dynamique = effectif réel en base (admin add/remove).
  const members = await getAllMembers();

  // Articles publiés (admin → section « À la une », masquée si aucun).
  const posts = await getPublishedPosts(6);

  // Images de l'accueil : remplacements admin (Supabase) > défauts locaux.
  const siteImages = await getSiteImageOverrides();
  const imgFor = (key: SiteImageKey) => resolveSiteImage(siteImages, key);
  // Le prochain match (catégorie match, date future la plus proche) reçoit
  // le badge spécial « Prochain match ».
  const today = new Date().toISOString().slice(0, 10);
  const nextMatch = posts
    .filter((p) => p.category === "match" && p.event_date && p.event_date >= today)
    .sort((a, b) => (a.event_date! < b.event_date! ? -1 : 1))[0];

  const stats = [
    { icon: Trophy, value: "5", label: "Catégories" },
    { icon: Users, value: String(members.length), label: "Membres" },
    { icon: Star, value: "1", label: "Équipe féminine" },
    { icon: Flame, value: "15", label: "Ans d'expérience" },
  ];

  return (
    <main className="flex flex-1 flex-col bg-blue-950 text-slate-100">
      {/* ===== NAVBAR FIXE (glass) ===== */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-amber-500/20 bg-blue-950/70 backdrop-blur-md no-print">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          {/* Logo + nom */}
          <a href="#" className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Logo Matam Waraba"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-amber-500/60 object-cover"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-base font-black tracking-tight text-white">
                Matam Waraba
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400">
                Basketball Academy
              </span>
            </span>
          </a>

          {/* Liens (desktop) */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-200 md:flex">
            <a href="#equipes" className="transition hover:text-amber-400">
              Équipes
            </a>
            <a href="#encadrement" className="transition hover:text-amber-400">
              Encadrement
            </a>
            <a href="/members" className="transition hover:text-amber-400">
              Effectif
            </a>
            <a href="#contact" className="transition hover:text-amber-400">
              Contact
            </a>
          </nav>

          {/* CTA */}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-blue-950 transition hover:bg-amber-400"
          >
            <Users className="h-4 w-4" />
            Nous rejoindre
          </a>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
        <Image
          src={imgFor("hero")}
          alt="Équipe féminine de la Matam Waraba Basketball Academy"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        {/* Voiles Bleu Royal (remplace le midnight d'origine) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-blue-950/70 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_30%,rgba(245,158,11,0.22),transparent_70%)]" />
        {/* Filigrane lion + terrain, très discret */}
        <LionWatermark tone="gold" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
          <span className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-blue-950/50 px-4 py-1.5 text-sm font-medium text-amber-400 backdrop-blur">
            <Trophy className="h-4 w-4" />
            Basketball Academy • Conakry • Saison 2026-2027
          </span>
          <h1 className="animate-fade-up bg-gradient-to-r from-white via-amber-300 to-white bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-2xl sm:text-8xl">
            Matam Waraba
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            L&apos;académie de basketball qui forme les talents de demain —
            de l&apos;initiation aux jeunes catégories jusqu&apos;à
            l&apos;excellence sur le parquet.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#equipes"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 font-bold text-blue-950 shadow-lg shadow-amber-500/30 transition hover:scale-105 hover:bg-amber-400"
            >
              <Users className="h-5 w-5" />
              Découvrir nos équipes
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/30 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Nous contacter
            </a>
          </div>
        </div>

        {/* Indicateur de scroll */}
        <a
          href="#stats"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 transition hover:text-amber-400"
          aria-label="Faire défiler"
        >
          <ChevronDown className="animate-bounce-ball h-7 w-7" />
        </a>
      </section>

      {/* ===== STATS — bande premium ===== */}
      <section
        id="stats"
        className="border-y border-amber-500/20 bg-blue-900/40"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 py-12 lg:grid-cols-4 md:gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-blue-900 px-4 py-6 text-center shadow-lg"
            >
              {/* Filigrane lion + terrain sur chaque tuile */}
              <LionWatermark tone="gold" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Icon className="h-8 w-8 text-amber-400" />
                <span className="text-3xl font-black text-white sm:text-4xl">
                  {value}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== NOS ÉQUIPES ===== */}
      <section
        id="equipes"
        className="mx-auto w-full max-w-5xl px-6 py-20"
      >
        <SectionHeader
          icon={Users}
          title="Nos équipes"
          subtitle="Les catégories de l'académie, des plus jeunes aux féminines."
          className="mb-10"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team.name}
              className="group relative overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 transition hover:-translate-y-1 hover:border-amber-500"
            >
              <LionWatermark tone="gold" />

              <div className="relative h-56 overflow-hidden">
                <Image
                  src={imgFor(team.key) as string}
                  alt={`Équipe ${team.name} — Matam Waraba`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-amber-500/60 bg-blue-950/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur">
                  {team.name}
                </span>
              </div>
              <div className="relative z-10 p-5">
                <h3 className="text-lg font-bold text-white">{team.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {team.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== ENCADREMENT ===== */}
      <section
        id="encadrement"
        className="border-t border-amber-500/20 bg-blue-900/30"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <SectionHeader
            icon={Star}
            title="Encadrement"
            subtitle="Le staff technique qui encadre et forme les joueurs de l'académie."
            className="mb-10"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            {staff.map((person) => (
              <article
                key={person.name}
                className="group relative overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 transition hover:-translate-y-1 hover:border-amber-500"
              >
                <LionWatermark tone="gold" />

                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={imgFor(person.key) as string}
                    alt={`${person.name} — Matam Waraba`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/20 to-transparent" />
                </div>
                <div className="relative z-10 px-6 pb-6 pt-4 text-center">
                  <h3 className="text-2xl font-black text-white">
                    {person.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.15em] text-amber-400">
                    {person.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== À LA UNE — articles publiés depuis l'admin ===== */}
      {posts.length > 0 && (
        <section
          id="actualites"
          className="mx-auto w-full max-w-5xl px-6 py-20"
        >
          <SectionHeader
            icon={Newspaper}
            title="À la une"
            subtitle="Matchs à venir, actualités et partenariats de l'académie."
            className="mb-10"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 transition hover:-translate-y-1 hover:border-amber-500"
              >
                <LionWatermark tone="gold" />

                {/* Image ou fallback emblème */}
                {post.image_url && (
                  <div className="relative h-44 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/30 to-transparent" />
                  </div>
                )}

                {/* Badges catégorie + prochain match */}
                <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                  <span className="rounded-full border border-amber-500/60 bg-blue-950/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur">
                    {categoryLabel(post.category)}
                  </span>
                  {nextMatch?.id === post.id && (
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-950">
                      Prochain match
                    </span>
                  )}
                </div>

                <div className="relative z-10 flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold leading-snug text-white">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.event_date
                      ? formatPostDate(post.event_date)
                      : formatPostDate(post.created_at)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA — Rejoignez l'académie ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/90 to-blue-950/60" />
        <LionWatermark tone="gold" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start gap-5 px-6 py-24">
          <h2 className="max-w-xl text-4xl font-black text-white sm:text-5xl">
            Rejoignez l&apos;académie Matam Waraba
          </h2>
          <p className="max-w-lg text-lg text-slate-200">
            Que vous soyez joueur, parent ou bénévole, il y a une place pour
            vous dans la famille. Inscrivez-vous pour la nouvelle saison.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 font-bold text-blue-950 transition hover:scale-105 hover:bg-amber-400"
            >
              <Users className="h-5 w-5" />
              S&apos;inscrire à l&apos;académie
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="/members"
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Découvrir l&apos;effectif
            </a>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section
        id="contact"
        className="mx-auto w-full max-w-5xl px-6 py-20"
      >
        <SectionHeader
          icon={Mail}
          title="Contact"
          subtitle="Une question, une envie de rejoindre l'académie ou un message à passer ? Écrivez-nous ou contactez-nous directement sur WhatsApp."
          className="mb-8"
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Colonne gauche : WhatsApp + infos */}
          <div className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 p-7">
            <LionWatermark tone="gold" />
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white">
                Discutons en direct
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Le moyen le plus rapide de nous joindre : un message WhatsApp
                et nous vous répondons.
              </p>
            </div>

            {/* Bouton WhatsApp (vert marque) */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative z-10 inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 font-bold text-[#06281e] shadow-lg shadow-[#25D366]/30 transition hover:bg-[#1ebe5d]"
            >
              <WhatsAppIcon className="h-7 w-7" />
              Écrire sur WhatsApp
            </a>

            <div className="relative z-10 space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                {WHATSAPP_DISPLAY}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition hover:text-amber-400"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <FacebookIcon className="h-4 w-4 shrink-0 text-[#1877F2]" />
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-amber-400"
                >
                  Suivez-nous sur Facebook
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                Bluezone de Dixinn, Conakry
              </p>
            </div>
          </div>

          {/* Colonne droite : formulaire */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 p-7">
            <LionWatermark tone="gold" />
            <div className="relative z-10">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                <Send className="h-5 w-5 text-amber-400" />
                Envoyez un message
              </h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-amber-500/30 bg-blue-950">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 sm:grid-cols-3">
          {/* Colonne 1 : identité */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.jpg"
                alt="Logo Matam Waraba"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border border-amber-500/60 object-cover"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-black text-amber-400">Matam Waraba</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Basketball Academy
                </span>
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              L&apos;académie qui forme les talents du basketball guinéen, de
              l&apos;initiation jusqu&apos;à l&apos;excellence sur le parquet.
            </p>
          </div>

          {/* Colonne 2 : navigation */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a href="#equipes" className="transition hover:text-amber-400">
                  Nos équipes
                </a>
              </li>
              <li>
                <a
                  href="#encadrement"
                  className="transition hover:text-amber-400"
                >
                  Encadrement
                </a>
              </li>
              <li>
                <a href="/members" className="transition hover:text-amber-400">
                  Effectif officiel
                </a>
              </li>
              <li>
                <a href="#contact" className="transition hover:text-amber-400">
                  Contact & inscriptions
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : contact */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Nous trouver
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-400" />
                Bluezone de Dixinn, Conakry — Guinée
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-amber-400"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition hover:text-amber-400"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FacebookIcon className="h-4 w-4 shrink-0 text-[#1877F2]" />
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-amber-400"
                >
                  Facebook — Matam Waraba
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre de copyright */}
        <div className="border-t border-amber-500/20">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Matam Waraba Basketball Academy.
              Tous droits réservés.
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <LionMark className="h-4 w-4 text-amber-400" faceColor="#172554" />
              Waraba — le lion ne recule jamais
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}