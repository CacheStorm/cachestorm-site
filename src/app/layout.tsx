import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { SiteBackground } from "@/components/site-background";
import "./globals.css";
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL("https://cachestorm.com"),
  alternates: { canonical: "/" },
  title: {
    default: "CacheStorm — Built for the fast path.",
    template: "%s · CacheStorm",
  },
  description:
    "A Redis-compatible in-memory data store, written in Go. 256 shards, rich data structures, built-in HTTP API and observability. One binary. Open source.",
  openGraph: {
    type: "website",
    siteName: "CacheStorm",
    title: "CacheStorm — Built for the fast path.",
    description:
      "Your data. At the speed of thought. A Redis-compatible data store written in Go.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: { icon: "/logo-mark.svg", apple: "/apple-touch-icon.png" },
  authors: [{ name: "OXOGNET OÜ", url: "https://oxog.net" }],
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a101c" },
  ],
};
const themeScript = `try{var t=localStorage.getItem('cachestorm-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:'system'}catch{}`;
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrains.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SiteBackground />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
