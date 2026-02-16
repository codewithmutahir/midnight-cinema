import type { Metadata } from "next";
import { Syne, Outfit, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PWARegister } from "@/components/PWARegister";
import { TopLoadingBar } from "@/components/TopLoadingBar";
import "./globals.css";

// Syne: bold editorial display (headings, logo). Outfit: clean readable body. JetBrains Mono: code/room codes.
const syne = Syne({
  variable: "--font-syne",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Midnight Cinema | Movie Discovery & Recommendations",
    template: "%s | Midnight Cinema",
  },
  description:
    "Discover movies, explore genres, and find your next watch. Data-driven movie information powered by TMDb.",
  keywords: ["movies", "film", "discovery", "TMDb", "ratings", "genres"],
  authors: [{ name: "Midnight Cinema" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Midnight Cinema",
    title: "Midnight Cinema | Movie Discovery & Recommendations",
    description: "Discover movies, explore genres, and find your next watch. Data-driven movie information powered by TMDb.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Midnight Cinema | Movie Discovery",
    description: "Discover movies, explore genres, and find your next watch.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // Bump ?v= when you update favicon/logo so browsers fetch the new assets
  icons: {
    icon: [{ url: "/favicon.ico?v=2", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${syne.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <TopLoadingBar />
          <PWARegister />
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
