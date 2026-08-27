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
  title: "Matam Waraba — Basketball Academy",
  description:
    "Site officiel de la Matam Waraba Basketball Academy : actualités, effectif, calendrier et billetterie.",
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
