import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "FleetMan - Gestion de Flotte Intelligente",
  description: "FleetMan est la solution complete pour optimiser la gestion de votre flotte de vehicules. Suivez vos vehicules en temps reel, gerez vos chauffeurs, et prenez des decisions eclairees.",
  keywords: "fleet management, gestion de flotte, vehicules, tracking, GPS, chauffeurs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
