import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebWatch — Web Monitoring",
  description: "Surveillance intelligente de sites web avec détection de changements par IA",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔍</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-[#09090b] antialiased">{children}</body>
    </html>
  );
}
