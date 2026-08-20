import Image from "next/image";
import {
  Trophy,
  CalendarDays,
  Users,
  Ticket,
  Flame,
  Newspaper,
  ArrowRight,
  MapPin,
  ChevronDown,
  Images,
  Star,
} from "lucide-react";
import { LionMark, LionWatermark, SectionHeader } from "@/components/brand";

/* ============================================================
   Waraba Basket — Page d'accueil (Premium Sports / VIP)
   Palette : Bleu Royal (#1E3A8A) · Or (#F59E0B) · Blanc
   Mobile-first, Tailwind CSS, icônes Lucide-react.
   ============================================================ */

// --- Données factices (à remplacer par du contenu réel plus tard) ---
const stats = [
  { icon: Trophy, value: "12", label: "Titres remportés" },
  { icon: Users, value: "48", label: "Membres actifs" },
  { icon: CalendarDays, value: "26", label: "Matchs cette saison" },
  { icon: Flame, value: "15", label: "Ans d'existence" },
];

const news = [
  {
    img: "/images/action-2.jpg",
    tag: "Match",
    title: "Victoire serrée contre les Eagles",
    excerpt:
      "Waraba s'impose 78-75 après prolongation grâce à un panier au buzzer.",
    date: "12 août 2026",
  },
  {
    img: "/images/action-3.jpg",
    tag: "Jeunes",
    title: "Les U17 brillent en tournoi régional",
    excerpt:
      "Notre équipe jeunesse décroche la deuxième place du tournoi inter-clubs.",
    date: "05 août 2026",
  },
  {
    img: "/images/team.jpg",
    tag: "Club",
    title: "Rentrée sportive : inscriptions ouvertes",
    excerpt:
      "Rejoignez le club pour la nouvelle saison. Catégories U13 à Veteran.",
    date: "29 juillet 2026",
  },
];

const gallery = [
  { src: "/images/hero.jpg", alt: "Action de match", span: "lg:col-span-2 lg:row-span-2" },
  { src: "/images/action-1.jpg", alt: "Duel au panier" },
  { src: "/images/action-2.jpg", alt: "Tir extérieur" },
  { src: "/images/action-3.jpg", alt: "Défense intense" },
  { src: "/images/team.jpg", alt: "Esprit d'équipe", span: "lg:col-span-2" },
];

// Style manuscrit pour le « vs » du Prochain Match (Dancing Script).
const scriptStyle = { fontFamily: "var(--font-script)" } as const;

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-blue-950 text-slate-100">
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <Image
          src="/images/hero.jpg"
          alt="Joueur de basketball en action"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Voiles Bleu Royal (remplace le midnight d'origine) */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/85 via-blue-950/70 to-blue-950" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_30%,rgba(245,158,11,0.22),transparent_70%)]" />
        {/* Filigrane lion + terrain, très discret */}
        <LionWatermark tone="gold" />

        {/* Basket animé flottant */}
        <span className="animate-float absolute right-[12%] top-[22%] hidden text-7xl opacity-80 drop-shadow-2xl md:block">
          🏀
        </span>
        <span className="animate-float-slow absolute left-[10%] top-[60%] hidden text-5xl opacity-60 md:block">
          🏀
        </span>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
          <span className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-blue-950/50 px-4 py-1.5 text-sm font-medium text-amber-400 backdrop-blur">
            <Star className="h-4 w-4 fill-amber-400" />
            Club de Basketball • Saison 2026-2027
          </span>
          <h1 className="animate-fade-up bg-gradient-to-r from-white via-amber-300 to-white bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-2xl sm:text-8xl">
            Waraba Basket
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            La fierté sur le parquet. Vivez le basket intensément — matchs,
            effectif, actualités et billetterie au même endroit.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#prochain-match"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 font-bold text-blue-950 shadow-lg shadow-amber-500/30 transition hover:scale-105 hover:bg-amber-400"
            >
              <Ticket className="h-5 w-5" />
              Réserver ma place
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="#actualites"
              className="rounded-full border border-white/30 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Voir les actualités
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

      {/* ===== PROCHAIN MATCH — carte verticale (badge / accréditation) ===== */}
      <section
        id="prochain-match"
        className="mx-auto w-full max-w-5xl px-6 py-20"
      >
        <SectionHeader
          icon={Flame}
          title="Prochain Match"
          subtitle="Ne manquez pas le prochain rendez-vous du club."
          className="mb-8"
        />

        {/* Carte verticale type accréditation */}
        <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 shadow-2xl">
          <LionWatermark tone="gold" />

          {/* Haut : photo d'action + badge lion doré */}
          <div className="relative h-72">
            <Image
              src="/images/action-2.jpg"
              alt="Action de match Waraba Basket"
              fill
              sizes="(max-width: 768px) 100vw, 30rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/30 to-transparent" />
            {/* Tag en haut à gauche */}
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/60 bg-blue-950/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur">
              <Flame className="h-3.5 w-3.5" />
              Prochain match
            </span>
            {/* Badge circulaire Bleu Royal + lion doré, en bas à droite */}
            <div className="absolute -bottom-9 right-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-500 bg-blue-950 shadow-xl">
              <LionMark className="h-12 w-12 text-amber-400" faceColor="#172554" />
            </div>
          </div>

          {/* Corps : affiche + infos + billet */}
          <div className="relative z-10 px-6 pt-12 pb-7">
            {/* Affiche : équipe vs équipe, le « vs » en script or */}
            <h3 className="text-center text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
              Waraba Basket{" "}
              <span
                style={scriptStyle}
                className="mx-1 inline-block text-amber-400 [transform:rotate(-6deg)]"
              >
                vs
              </span>{" "}
              BC Eagles
            </h3>

            {/* Infos : icônes dorées + texte blanc clair */}
            <div className="mt-6 space-y-2.5">
              <p className="flex items-center gap-2 text-slate-100">
                <CalendarDays className="h-5 w-5 flex-shrink-0 text-amber-400" />
                Samedi 30 août 2026 — 18h00
              </p>
              <p className="flex items-center gap-2 text-slate-100">
                <MapPin className="h-5 w-5 flex-shrink-0 text-amber-400" />
                Salle omnisports Waraba
              </p>
            </div>

            {/* Bouton billet : grand, fond or, texte bleu foncé + flèche */}
            <a
              href="#"
              className="group mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 font-bold text-blue-950 transition hover:bg-amber-400"
            >
              <Ticket className="h-5 w-5" />
              Acheter un billet
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== ACTUALITÉS — cartes VIP ===== */}
      <section
        id="actualites"
        className="mx-auto w-full max-w-5xl px-6 py-12"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeader
            icon={Newspaper}
            title="Actualités"
            subtitle="Dernières nouvelles du club et des compétitions."
          />
          <a
            href="#"
            className="hidden items-center gap-1 whitespace-nowrap text-sm font-medium text-amber-400 hover:underline sm:inline-flex"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-3xl border border-amber-500/50 bg-blue-900 transition hover:-translate-y-1 hover:border-amber-500"
            >
              {/* Filigrane lion sur la carte */}
              <LionWatermark tone="gold" />

              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                {/* Badge de catégorie : fond bleu royal foncé + bordure or + texte or */}
                <span className="absolute left-3 top-3 rounded-full border border-amber-500/60 bg-blue-950/85 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 backdrop-blur">
                  {item.tag}
                </span>
              </div>
              <div className="relative z-10 p-5">
                <p className="text-xs text-slate-400">{item.date}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== GALERIE ===== */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <SectionHeader
          icon={Images}
          title="Galerie"
          subtitle="Instants de jeu, esprit d'équipe et ferveur du parquet."
          className="mb-8"
        />
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 lg:grid-cols-4">
          {gallery.map((img) => (
            <div
              key={img.src}
              className={`group relative overflow-hidden rounded-2xl border border-amber-500/50 bg-blue-900 ${
                img.span ?? ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-blue-950/30 opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA — Rejoignez la famille Waraba ===== */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/team.jpg"
          alt="L'équipe Waraba Basket"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/85 to-blue-950/40" />
        <LionWatermark tone="gold" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start gap-5 px-6 py-24">
          <h2 className="max-w-xl text-4xl font-black text-white sm:text-5xl">
            Rejoignez la famille Waraba
          </h2>
          <p className="max-w-lg text-lg text-slate-200">
            Que vous soyez joueur, bénévole ou supporter, il y a une place pour
            vous dans le club. Inscrivez-vous pour la nouvelle saison.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 font-bold text-blue-950 transition hover:scale-105 hover:bg-amber-400"
            >
              <Users className="h-5 w-5" />
              S&apos;inscrire au club
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

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-amber-500/30 bg-blue-950">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-center">
          {/* Logo lion doré + nom du club */}
          <div className="flex items-center gap-2">
            <LionMark className="h-8 w-8 text-amber-400" faceColor="#172554" />
            <span className="text-lg font-black text-amber-400">
              Waraba Basket
            </span>
          </div>
          {/* Séparateur doré fin */}
          <div className="h-px w-24 bg-amber-500/40" />
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Waraba Basket. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-500">
            Bluezone de Dixinn, Conakry • Club de Basketball
          </p>
        </div>
      </footer>
    </main>
  );
}