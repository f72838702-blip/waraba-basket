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

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
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
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/80 via-midnight/70 to-midnight" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_70%_30%,rgba(217,119,6,0.25),transparent_70%)]" />

        {/* Basket animé flottant */}
        <span className="animate-float absolute right-[12%] top-[22%] hidden text-7xl opacity-80 drop-shadow-2xl md:block">
          🏀
        </span>
        <span className="animate-float-slow absolute left-[10%] top-[60%] hidden text-5xl opacity-60 md:block">
          🏀
        </span>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
          <span className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-midnight/40 px-4 py-1.5 text-sm font-medium text-gold-light backdrop-blur">
            <Star className="h-4 w-4 fill-gold-light" />
            Club de Basketball • Saison 2026-2027
          </span>
          <h1 className="animate-fade-up bg-gradient-to-r from-white via-gold-light to-white bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-2xl sm:text-8xl">
            Waraba Basket
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            La fierté sur le parquet. Vivez le basket intensément — matchs,
            effectif, actualités et billetterie au même endroit.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#prochain-match"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 font-bold text-midnight shadow-lg shadow-gold/30 transition hover:scale-105 hover:bg-gold-light"
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
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 transition hover:text-gold-light"
          aria-label="Faire défiler"
        >
          <ChevronDown className="animate-bounce-ball h-7 w-7" />
        </a>
      </section>

      {/* ===== STATS ===== */}
      <section
        id="stats"
        className="border-y border-white/10 bg-midnight-light"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden px-6 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 py-10 text-center"
            >
              <Icon className="h-8 w-8 text-gold-light" />
              <span className="text-4xl font-black text-white">{value}</span>
              <span className="text-sm text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PROCHAIN MATCH ===== */}
      <section
        id="prochain-match"
        className="mx-auto w-full max-w-5xl px-6 py-20"
      >
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-midnight-light shadow-2xl">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[260px]">
              <Image
                src="/images/action-1.jpg"
                alt="Prochain match Waraba Basket"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="flex flex-col justify-center gap-5 p-8 sm:p-10">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-royal px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-light">
                <Flame className="h-3.5 w-3.5" />
                Prochain match
              </span>
              <div>
                <h2 className="text-3xl font-bold text-white">
                  Waraba Basket <span className="text-gold-light">vs</span>{" "}
                  BC Eagles
                </h2>
                <p className="mt-3 flex items-center gap-2 text-slate-300">
                  <CalendarDays className="h-5 w-5 text-gold-light" />
                  Samedi 30 août 2026 — 18h00
                </p>
                <p className="mt-2 flex items-center gap-2 text-slate-300">
                  <MapPin className="h-5 w-5 text-gold-light" />
                  Salle omnisports Waraba
                </p>
              </div>
              <a
                href="#"
                className="group inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-midnight transition hover:scale-105 hover:bg-gold-light"
              >
                <Ticket className="h-5 w-5" />
                Acheter un billet
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACTUALITÉS ===== */}
      <section
        id="actualites"
        className="mx-auto w-full max-w-5xl px-6 py-12"
      >
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
              <Newspaper className="h-7 w-7 text-gold-light" />
              Actualités
            </h2>
            <p className="mt-2 text-slate-400">
              Dernières nouvelles du club et des compétitions.
            </p>
          </div>
          <a
            href="#"
            className="hidden items-center gap-1 text-sm font-medium text-gold-light hover:underline sm:inline-flex"
          >
            Tout voir <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-midnight-light transition hover:-translate-y-1 hover:border-gold/50"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
                <span className="absolute left-3 top-3 rounded-full bg-midnight/80 px-3 py-1 text-xs font-semibold text-gold-light backdrop-blur">
                  {item.tag}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500">{item.date}</p>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== GALERIE ===== */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <h2 className="mb-10 flex items-center gap-3 text-3xl font-bold text-white">
          <Images className="h-7 w-7 text-gold-light" />
          Galerie
        </h2>
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 lg:grid-cols-4">
          {gallery.map((img) => (
            <div
              key={img.src}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 ${img.span ?? ""}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-midnight/30 opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== ÉQUIPE / CTA ===== */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/team.jpg"
          alt="L'équipe Waraba Basket"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/40" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-5 px-6 py-24">
          <h2 className="max-w-xl text-4xl font-black text-white sm:text-5xl">
            Rejoignez la famille Waraba
          </h2>
          <p className="max-w-lg text-lg text-slate-300">
            Que vous soyez joueur, bénévole ou supporter, il y a une place pour
            vous dans le club. Inscrivez-vous pour la nouvelle saison.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-bold text-midnight transition hover:scale-105 hover:bg-gold-light"
            >
              <Users className="h-5 w-5" />
              S&apos;inscrire au club
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a
              href="/members"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Découvrir l&apos;effectif
            </a>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/10 bg-midnight">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-slate-500">
          <span className="text-lg font-black text-gold">🏀 Waraba Basket</span>
          <p>
            © {new Date().getFullYear()} Waraba Basket. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}