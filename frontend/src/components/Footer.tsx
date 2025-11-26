// ============= 13. FOOTER (components/Footer.tsx) =============
import Link from "next/link";
import {
  Home,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">Nieruchomości Istebna</span>
            </div>
            <p className="text-gray-400 mb-4">
              Twój partner w poszukiwaniu idealnej nieruchomości w Beskidach.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/people/Nieruchomo%C5%9Bci-Istebna/100054207595006/#"
                className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Szybkie linki</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/nieruchomosci"
                  className="hover:text-white transition-colors"
                >
                  Oferty
                </Link>
              </li>
              <li>
                <Link
                  href="/o-nas"
                  className="hover:text-white transition-colors"
                >
                  O nas
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="hover:text-white transition-colors"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors"
                >
                  Logowanie
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Kategorie</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/nieruchomosci?type=dom"
                  className="hover:text-white transition-colors"
                >
                  Domy
                </Link>
              </li>
              <li>
                <Link
                  href="/nieruchomosci?type=mieszkanie"
                  className="hover:text-white transition-colors"
                >
                  Mieszkania
                </Link>
              </li>
              <li>
                <Link
                  href="/nieruchomosci?type=dzialka"
                  className="hover:text-white transition-colors"
                >
                  Działki
                </Link>
              </li>
              <li>
                <Link
                  href="/nieruchomosci?status=available"
                  className="hover:text-white transition-colors"
                >
                  Dostępne
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Kontakt</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <p className="text-black dark:text-white">
                  <a href="tel:+48505597504" className="underline">
                    +48 505 597 504
                  </a>
                </p>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:marek@nieruchomosciistebna.pl"
                  className="underline dark:text-white text-black"
                >
                  marek@nieruchomosciistebna.pl
                </a>
              </li>
              <li className="flex items-center gap-2 ">
                <MapPin className="w-4 h-4" />
                <p className="dark:text-white text-black">Jaworzynka 1010</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>
            &copy; Copyright 2018 All rights reserved by Nieruchomości Istebna
          </p>
        </div>
      </div>
    </footer>
  );
}
