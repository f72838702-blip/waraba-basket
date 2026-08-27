import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";
import { WhatsAppIcon } from "@/components/brand";
import { WHATSAPP_URL } from "@/lib/contact";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police script (style manuscrit) utilisée pour le « vs » du Prochain Match.
const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://waraba-basket.vercel.app"),
  title: {
    default: "Matam Waraba — Basketball Academy",
    template: "%s — Matam Waraba",
  },
  description:
    "Site officiel de la Matam Waraba Basketball Academy à Conakry : équipes U10 à U15, équipe féminine, effectif, encadrement et inscriptions.",
  keywords: [
    "Matam Waraba",
    "basketball",
    "académie",
    "Conakry",
    "Guinée",
    "Bluezone de Dixinn",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Matam Waraba Basketball Academy",
    title: "Matam Waraba — Basketball Academy",
    description:
      "L'académie de basketball qui forme les talents de demain à Conakry — de l'initiation jusqu'à l'excellence sur le parquet.",
    images: [{ url: "/images/logo.jpg", width: 1440, height: 960 }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-midnight text-foreground">
        {children}
        {/* Bouton WhatsApp flottant — visible sur toutes les pages */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter Matam Waraba sur WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#06281e] shadow-lg shadow-[#25D366]/40 transition hover:scale-110 hover:bg-[#1ebe5d] print:hidden"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </a>
      </body>
    </html>
  );
}
