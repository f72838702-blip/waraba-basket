import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "./globals.css";

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
  title: "Waraba Basket — Club de Basketball",
  description:
    "Site officiel du club Waraba Basket : actualités, effectif, calendrier et billetterie.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-midnight text-foreground">
        {children}
      </body>
    </html>
  );
}
