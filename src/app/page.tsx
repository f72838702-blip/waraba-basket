import { Trophy, CalendarDays, Users, Ticket } from "lucide-react";

const sections = [
  {
    icon: CalendarDays,
    title: "Calendrier",
    text: "Retrouvez tous les matchs de la saison, à domicile et à l'extérieur.",
  },
  {
    icon: Users,
    title: "Effectif",
    text: "Découvrez les joueurs et le staff technique du Waraba Basket.",
  },
  {
    icon: Trophy,
    title: "Palmarès",
    text: "Titres, coupes et performances du club au fil des saisons.",
  },
  {
    icon: Ticket,
    title: "Billetterie",
    text: "Réservez vos places et soutenez le club en tribune.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-midnight">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(217,119,6,0.18),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-28 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-royal/20 px-4 py-1.5 text-sm font-medium text-gold-light">
            🏀 Club de Basketball
          </span>
          <h1 className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            Waraba Basket
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            La fierté sur le parquet. Actualités, effectif, calendrier et
            billetterie — tout le club au même endroit.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#sections"
              className="rounded-full bg-gold px-7 py-3 font-semibold text-midnight transition hover:bg-gold-light"
            >
              Découvrir le club
            </a>
            <a
              href="#billetterie"
              className="rounded-full border border-royal-light/50 px-7 py-3 font-semibold text-white transition hover:bg-royal"
            >
              Billetterie
            </a>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section
        id="sections"
        className="mx-auto w-full max-w-5xl px-6 py-20"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/10 bg-midnight-light p-6 transition hover:border-gold/50"
            >
              <div className="mb-4 inline-flex rounded-xl bg-royal p-3 text-gold-light">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bandeau couleurs du club */}
      <section
        id="billetterie"
        className="bg-royal"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">
            Rejoignez la famille Waraba
          </h2>
          <p className="max-w-xl text-royal-light/80">
            Réservez vos places pour le prochain match et vivez le basket en
            tribune.
          </p>
          <a
            href="#"
            className="rounded-full bg-gold px-7 py-3 font-semibold text-midnight transition hover:bg-gold-light"
          >
            Réserver ma place
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-midnight">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-slate-500">
          <span className="font-semibold text-gold">Waraba Basket</span>
          <p>© {new Date().getFullYear()} Waraba Basket. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}