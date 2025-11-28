"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { Estate } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Square,
  Phone,
  Mail,
  Heart,
  Share2,
  ArrowLeft,
  Bath,
  BedDouble,
} from "lucide-react";
import toast from "react-hot-toast";
import PropertyCard from "@/components/PropertyCard";
import { useFavourites } from "@/contexts/FavouritesContext";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010/api";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [estate, setEstate] = useState<Estate | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Estate[]>([]);
  const { isFavourite, refreshFavourites } = useFavourites();
  const isLiked = estate ? isFavourite(estate.id) : false;

  useEffect(() => {
    loadEstate();
  }, [params.id]);

  const loadEstate = async () => {
    try {
      const data = await ApiClient.getEstateById(params.id as string);
      setEstate(data);

      // Load recommendations
      try {
        const recs = await ApiClient.getRecommendations(params.id as string);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      }
    } catch (error) {
      console.error("Error loading estate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!AuthService.isAuthenticated()) {
      toast.error("Zaloguj się, aby dodać do ulubionych");
      return;
    }

    try {
      if (isLiked) {
        await ApiClient.removeFromFavourites(estate!.id);
        toast.success("Usunięto z ulubionych");
      } else {
        await ApiClient.addToFavourites(estate!.id);
        toast.success("Dodano do ulubionych");
      }
      await refreshFavourites();
    } catch (error) {
      toast.error("Błąd podczas aktualizacji ulubionych");
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-2xl text-black dark:text-white">Ładowanie...</div>
      </div>
    );
  }

  if (!estate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-2xl text-black dark:text-white">
          Nie znaleziono nieruchomości
        </div>
      </div>
    );
  }

  // Normalize image URLs
  const getImageUrl = (image: string): string => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    if (image.startsWith("/uploads")) {
      return `${API_URL.replace("/api", "")}${image}`;
    }
    return `${API_URL.replace("/api", "")}/${image}`;
  };

  const images =
    Array.isArray(estate.images) && estate.images.length > 0
      ? estate.images.map(getImageUrl)
      : [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop",
      ];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky  top-20 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 ">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-black dark:text-white hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Powrót</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigator.share?.({ title: estate.opis })}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="w-5 h-5 text-black dark:text-white" />
              </button>
              <button
                onClick={handleLike}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Heart
                  className={`w-5 h-5 ${isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-black dark:text-white"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative bg-gray-100 dark:bg-gray-900 ">
        <div className="max-w-7xl mx-auto">
          <div className="relative  mt-20 h-[500px] md:h-[600px] rounded-b-lg rounded-bl-lg bg-gray-200 dark:bg-gray-800">
            {images.length > 0 && images[currentImageIndex] ? (
              <Image
                src={images[currentImageIndex]}
                alt={estate.opis}
                fill
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop";
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-full object-contain"
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                <Square className="w-20 h-20 text-gray-400 dark:text-gray-600" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 p-3 rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-950"
                >
                  <ChevronLeft className="w-6 h-6 text-black dark:text-white" />
                </button>

                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 p-3 rounded-full shadow-lg hover:bg-gray-200  dark:hover:bg-gray-950"
                >
                  <ChevronRight className="w-6 h-6 text-black dark:text-white" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 dark:bg-white/70 text-white dark:text-black px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4   sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8 ">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 w-[90vw] sm:w-full ">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${estate.status
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }`}
                  >
                    {estate.status ? "Sprzedane" : "Dostępne"}
                  </span>

                  <h1 className="text-4xl font-bold text-blue-200 dark:text-blue-600 mb-4">
                    {estate.price.toLocaleString("pl-PL")} zł
                  </h1>
                  <h5 className="text-2xl font-bold text-black dark:text-white mb-4">
                    {" "}
                    {Math.round(estate.price / estate.surface)} zl/m²
                  </h5>

                  <div className="flex items-center justify-between text-black dark:text-white text-lg mb-6">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      {estate.localization}
                    </div>
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{estate.rooms}</span>
                    </div>
                  </div>
                  <div className="flex items- justify-between text-black dark:text-white text-lg">
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{estate.surface} m²</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{estate.baths}</span>
                    </div>
                  </div>
                </div>
                {/*
                <div className="sm:text-right">
                  <div className="sm:text-4xl text-xs font-bold text-blue-600">
                    {estate.price.toLocaleString("pl-PL")} zł
                  </div>
                  <div className="text-black dark:text-white mt-2">
                    {Math.round(estate.price / estate.surface)} zl/m²
                  </div>
                </div>
              */}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                Opis
              </h2>
              <p className="text-black dark:text-white leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                {estate.opis}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                Szczegóły
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">
                    Powierzchnia
                  </span>
                  <span className="font-semibold text-black dark:text-white">
                    {estate.surface} m²
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">Cena</span>
                  <span className="font-semibold text-black dark:text-white">
                    {estate.price.toLocaleString("pl-PL")} zł
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">
                    Lokalizacja
                  </span>
                  <span className="font-semibold text-black dark:text-white underline">
                    {estate.localization}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">
                    Ilosc pokoji
                  </span>
                  <span className="font-semibold text-black dark:text-white ">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{estate.rooms}</span>
                    </div>
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">
                    Ilosc lazienek
                  </span>
                  <span className="font-semibold text-black dark:text-white ">
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{estate.baths}</span>
                    </div>
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">
                    Rok wybudowania
                  </span>
                  <span className="font-semibold text-black  underline dark:text-white ">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{estate.year}</span>
                    </div>
                  </span>
                </div>

                <div className="flex justify-between  py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white">Typ </span>
                  <span className="font-semibold text-black dark:text-white">
                    :
                    {Array.isArray(estate.type)
                      ? estate.type.join(" , ")
                      : estate.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Contact Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
                <h3 className="font-bold text-black dark:text-white mb-6">
                  Skontaktuj się z nami
                </h3>

                <div className="space-y-3">
                  <a
                    href="tel:+48505597504"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    +48 505 597 504
                  </a>

                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Mail className="w-5 h-5" />
                    Wyślij wiadomość
                  </button>
                </div>

                {showContactForm && (
                  <form
                    action="mailto:marek@nieruchomosciistebna.pl"
                    method="POST"
                    encType="text/plain"
                    className="space-y-3 mt-4"
                  >
                    <input
                      type="text"
                      name="Imię i nazwisko"
                      placeholder="Imię i nazwisko"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white"
                    />

                    <input
                      type="email"
                      name="Email"
                      placeholder="Email"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white"
                    />

                    <textarea
                      rows={3}
                      name="Wiadomość"
                      placeholder="Wiadomość"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-black dark:text-white"
                    />

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
                    >
                      Wyślij zapytanie
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-8">
              Podobne <span className="text-blue-600">nieruchomości</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((rec) => (
                <PropertyCard key={rec.id} estate={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
