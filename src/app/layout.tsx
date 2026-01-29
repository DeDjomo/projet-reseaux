import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: {
    template: '%s | FleetMan',
    default: 'FleetMan - Gestion de Flotte Intelligente',
  },
  description: "FleetMan est la solution complete pour optimiser la gestion de votre flotte de vehicules. Suivez vos vehicules en temps reel, gerez vos chauffeurs, et prenez des decisions eclairees.",
  keywords: "fleet management, gestion de flotte, vehicules, tracking, GPS, chauffeurs",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
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
            <Toaster position="top-right" toastOptions={{ style: { zIndex: 99999 } }} />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
