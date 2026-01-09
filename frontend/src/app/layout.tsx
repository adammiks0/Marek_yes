// ============= 4. ROOT LAYOUT (app/layout.tsx) =============
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { FavouritesProvider } from "@/contexts/FavouritesContext";
import { Toaster } from "react-hot-toast";
import CookieBanner from "@/components/Cookies";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Nieruchomości Istebna - Domy, Działki, Mieszkania",
  description:
    "Najlepsza oferta nieruchomości w Istebnej, Koniakowie i okolicach Beskidów",
  keywords:
    "nieruchomości Istebna, działki Koniaków, domy Beskidy, działki budowlane",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <DarkModeProvider>
          <FavouritesProvider>
            <Navbar />
            <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
              {children}
              <CookieBanner />
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--toast-bg)",
                  color: "var(--toast-color)",
                },
              }}
            />
          </FavouritesProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
