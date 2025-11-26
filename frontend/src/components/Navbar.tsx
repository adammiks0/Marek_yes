// ============= 5. NAVBAR COMPONENT (components/Navbar.tsx) =============
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Menu, X, User, Heart, LogOut, Moon, Sun } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    setIsAuthenticated(AuthService.isAuthenticated());
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    AuthService.removeToken();
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-gray-900 shadow-lg py-4"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-black dark:text-white">
              Nieruchomości <span className="text-blue-600">Istebna</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/nieruchomosci"
              className="text-black dark:text-white hover:text-blue-600 transition-colors font-medium"
            >
              Oferty
            </Link>
            <Link
              href="/o-nas"
              className="text-black dark:text-white hover:text-blue-600 transition-colors font-medium"
            >
              O nas
            </Link>
            <Link
              href="/kontakt"
              className="text-black dark:text-white hover:text-blue-600 transition-colors font-medium"
            >
              Kontakt
            </Link>

            <button
              onClick={toggleDarkMode}
              className="text-black dark:text-white hover:text-blue-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/ulubione"
                  className="text-black dark:text-white hover:text-blue-600 transition-colors"
                >
                  <Heart className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-black dark:text-white hover:text-blue-600 transition-colors"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all"
              >
                Zaloguj się
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/nieruchomosci"
              className="block py-2 text-black dark:text-white"
            >
              Oferty
            </Link>
            <Link
              href="/o-nas"
              className="block py-2 text-black dark:text-white"
            >
              O nas
            </Link>
            <Link
              href="/kontakt"
              className="block py-2 text-black dark:text-white"
            >
              Kontakt
            </Link>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 py-2 text-black dark:text-white w-full text-left"
            >
              {darkMode ? (
                <>
                  <Sun className="w-5 h-5" />
                  Tryb jasny
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  Tryb ciemny
                </>
              )}
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  href="/ulubione"
                  className="block py-2 text-black dark:text-white"
                >
                  Ulubione
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-black dark:text-white w-full text-left"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block mt-4 text-center bg-blue-600 text-white px-6 py-2 rounded-full"
              >
                Zaloguj się
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
