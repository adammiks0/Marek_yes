// ============= 8. LISTA NIERUCHOMOŚCI (app/nieruchomosci/page.tsx) =============
//     unoptimized: true, // Zezwala na wszystkie zdalne obrazy

"use client";

import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";
import { Search, Filter, X } from "lucide-react";
import { Estate } from "@/types";
import toast from "react-hot-toast";

const LOCALIZATIONS = [
  "Koniaków",
  "Istebna",
  "Jaworzynka",
  "Laliki",
  "Sól",
  "Zwardoń",
];

const TYPES = [
  "budowlano-usługowa",
  "dom",
  "dzialka",
  "dzialka rolnicza",
  "działka budowlana",
  "działka budowlano-rolna",
  "przemysłowa",
];

export default function NieruchomosciPage() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [filteredEstates, setFilteredEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtry
  const [localization, setLocalization] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [surfaceMin, setSurfaceMin] = useState("");
  const [surfaceMax, setSurfaceMax] = useState("");
  const [type, setType] = useState("");

  // Get min/max values for sliders
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [surfaceRange, setSurfaceRange] = useState({ min: 0, max: 10000 });

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Calculate pagination
  const totalPages = Math.ceil(filteredEstates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEstates = filteredEstates.slice(startIndex, endIndex);

  useEffect(() => {
    loadEstates();
  }, []);

  const loadEstates = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getAllEstates();
      setEstates(data);
      setFilteredEstates(data);

      // Calculate ranges
      if (data.length > 0) {
        const prices = data.map((e) => e.price);
        const surfaces = data.map((e) => e.surface);
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices),
        });
        setSurfaceRange({
          min: Math.min(...surfaces),
          max: Math.max(...surfaces),
        });
      }
    } catch (error) {
      toast.error("Błąd ładowania nieruchomości");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (localization) params.localization = localization;
      if (priceMin) params.price_min = parseInt(priceMin);
      if (priceMax) params.price_max = parseInt(priceMax);
      if (surfaceMin) params.surface_min = parseInt(surfaceMin);
      if (surfaceMax) params.surface_max = parseInt(surfaceMax);
      if (type) params.type = type;

      const results = await ApiClient.searchEstates(params);

      // Filter by search query if provided
      let filtered = results;
      if (searchQuery.trim()) {
        filtered = results.filter(
          (estate) =>
            estate.localization
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            estate.opis.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      setEstates(filtered);
      setFilteredEstates(filtered);
      setCurrentPage(1); // Reset to first page

      if (filtered.length === 0) {
        toast("Nie znaleziono nieruchomości spełniających kryteria", {
          icon: "ℹ️",
        });
      }
    } catch (error) {
      toast.error("Błąd wyszukiwania");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setLocalization("");
    setPriceMin("");
    setPriceMax("");
    setSurfaceMin("");
    setSurfaceMax("");
    setType("");
    setSearchQuery("");
    setCurrentPage(1);
    loadEstates();
  };

  const hasActiveFilters =
    localization || priceMin || priceMax || surfaceMin || surfaceMax || type;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold text-black dark:text-white mb-8">
          Wszystkie <span className="text-blue-600">nieruchomości</span>
        </h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Szukaj po lokalizacji lub opisie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl transition-all font-semibold flex items-center gap-2 ${showFilters || hasActiveFilters
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                  }`}
              >
                <Filter className="w-5 h-5" />
                Filtry
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Lokalizacja */}
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2">
                      Lokalizacja
                    </label>
                    <select
                      value={localization}
                      onChange={(e) => setLocalization(e.target.value)}
                      className="w-full px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Wszystkie</option>
                      {LOCALIZATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Typ */}
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2">
                      Typ nieruchomości
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Wszystkie</option>
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cena Min */}
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2">
                      Cena minimalna
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={priceRange.min}
                        max={priceRange.max}
                        step="10000"
                        value={priceMin || priceRange.min}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseInt(e.target.value)
                            : "";
                          setPriceMin(val.toString());
                        }}
                        className="flex-1 px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="Min"
                      />
                      <span className="text-black dark:text-white">zł</span>
                    </div>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step="10000"
                      value={priceMin || priceRange.min}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{priceRange.min.toLocaleString("pl-PL")} zł</span>
                      <span>{priceRange.max.toLocaleString("pl-PL")} zł</span>
                    </div>
                  </div>

                  {/* Cena Max */}
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2">
                      Cena maksymalna
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={priceRange.min}
                        max={priceRange.max}
                        step="10000"
                        value={priceMax || priceRange.max}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseInt(e.target.value)
                            : "";
                          setPriceMax(val.toString());
                        }}
                        className="flex-1 px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="Max"
                      />
                      <span className="text-black dark:text-white">zł</span>
                    </div>
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      step="10000"
                      value={priceMax || priceRange.max}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{priceRange.min.toLocaleString("pl-PL")} zł</span>
                      <span>{priceRange.max.toLocaleString("pl-PL")} zł</span>
                    </div>
                  </div>

                  {/* Powierzchnia Min */}
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2">
                      Powierzchnia minimalna
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={surfaceRange.min}
                        max={surfaceRange.max}
                        step="5"
                        value={surfaceMin || surfaceRange.min}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseInt(e.target.value)
                            : "";
                          setSurfaceMin(val.toString());
                        }}
                        className="flex-1 px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="Min"
                      />
                      <span className="text-black dark:text-white">m²</span>
                    </div>
                    <input
                      type="range"
                      min={surfaceRange.min}
                      max={surfaceRange.max}
                      step="5"
                      value={surfaceMin || surfaceRange.min}
                      onChange={(e) => setSurfaceMin(e.target.value)}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{surfaceRange.min} m²</span>
                      <span>{surfaceRange.max} m²</span>
                    </div>
                  </div>

                  {/* Powierzchnia Max */}
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2">
                      Powierzchnia maksymalna
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min={surfaceRange.min}
                        max={surfaceRange.max}
                        step="5"
                        value={surfaceMax || surfaceRange.max}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseInt(e.target.value)
                            : "";
                          setSurfaceMax(val.toString());
                        }}
                        className="flex-1 px-4 py-3 border-2 text-black dark:text-white bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="Max"
                      />
                      <span className="text-black dark:text-white">m²</span>
                    </div>
                    <input
                      type="range"
                      min={surfaceRange.min}
                      max={surfaceRange.max}
                      step="5"
                      value={surfaceMax || surfaceRange.max}
                      onChange={(e) => setSurfaceMax(e.target.value)}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{surfaceRange.min} m²</span>
                      <span>{surfaceRange.max} m²</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSearch}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold"
                  >
                    Zastosuj filtry
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Wyczyść
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-black dark:text-white">Ładowanie...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-black dark:text-white">
                Znaleziono {filteredEstates.length}{" "}
                {filteredEstates.length === 1
                  ? "nieruchomość"
                  : filteredEstates.length < 5
                    ? "nieruchomości"
                    : "nieruchomości"}
                {filteredEstates.length > itemsPerPage &&
                  ` (strona ${currentPage} z ${totalPages})`}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentEstates.map((estate) => (
                <PropertyCard key={estate.id} estate={estate} />
              ))}
            </div>

            {filteredEstates.length === 0 && (
              <div className="text-center py-20">
                <p className="text-xl text-black dark:text-white">
                  Brak dostępnych nieruchomości
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Poprzednia
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-xl transition-all ${currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-black dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    goToPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Następna
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
