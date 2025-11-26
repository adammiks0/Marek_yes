// ============= 6. STRONA GŁÓWNA (app/page.tsx) =============
import Link from "next/link";
import { ApiClient } from "@/lib/api";
import { Search, MapPin, TrendingUp, Users, Award } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";

export default async function HomePage() {
  const estates = await ApiClient.getAllEstates();
  const featuredEstates = estates.filter((e) => !e.status).slice(0, 6);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Znajdź swój <span className="text-blue-600">wymarzony dom</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Najlepsza oferta nieruchomości w Beskidach. Działki, domy i
            mieszkania w Istebnej, Koniakowie i okolicach.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/nieruchomosci"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all text-lg font-semibold shadow-lg"
            >
              Przeglądaj oferty
            </Link>
            <Link
              href="/kontakt"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all text-lg font-semibold shadow-lg border-2"
            >
              Skontaktuj się
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {estates.length}+
              </div>
              <div className="text-gray-600">Nieruchomości</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600">Lat doświadczenia</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Zadowolonych klientów</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Polecane <span className="text-blue-600">oferty</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEstates.map((estate) => (
              <PropertyCard key={estate.id} estate={estate} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/nieruchomosci"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold"
            >
              Zobacz wszystkie oferty
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
