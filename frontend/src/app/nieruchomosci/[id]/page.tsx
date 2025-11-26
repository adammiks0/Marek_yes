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
  Calendar,
  Mountain,
  Trees,
  Car,
  Zap,
  Droplets,
  Wind,
  CheckCircle,
} from "lucide-react";

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [estate, setEstate] = useState<Estate | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEstate();
  }, [params.id]);

  const loadEstate = async () => {
    try {
      const data = await ApiClient.getEstateById(params.id as string);
      setEstate(data);
    } catch (error) {
      console.error("Error loading estate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!AuthService.isAuthenticated()) {
      alert("Zaloguj się, aby dodać do ulubionych");
      return;
    }

    try {
      if (isLiked) {
        await ApiClient.removeFromFavourites(estate!.id);
      } else {
        await ApiClient.addToFavourites(estate!.id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Ładowanie...</div>
      </div>
    );
  }

  if (!estate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">
          Nie znaleziono nieruchomości
        </div>
      </div>
    );
  }

  const images =
    Array.isArray(estate.images) && estate.images.length > 0
      ? estate.images
      : [
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop",
        ];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Powrót</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigator.share?.({ title: estate.opis })}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleLike}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[500px] md:h-[600px]">
            <img
              src={images[currentImageIndex]}
              alt={estate.opis}
              className="w-full h-full object-cover"
            />

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-3 ${
                      estate.status
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {estate.status ? "Sprzedane" : "Dostępne"}
                  </span>

                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {Array.isArray(estate.type)
                      ? estate.type.join(", ")
                      : estate.type}
                  </h1>

                  <div className="flex items-center text-gray-600 text-lg mb-6">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    {estate.localization}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-black">
                        {estate.surface} m²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">
                    {estate.price.toLocaleString("pl-PL")} zł
                  </div>
                  <div className="text-gray-500 mt-2">
                    {Math.round(estate.price / estate.surface)} zł/m²
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Opis</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {estate.opis}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Szczegóły
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Powierzchnia</span>
                  <span className="font-semibold text-black">
                    {estate.surface} m²
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Cena</span>
                  <span className="font-semibold text-black">
                    {estate.price.toLocaleString("pl-PL")} zł
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Lokalizacja</span>
                  <span className="font-semibold text-black underline">
                    {estate.localization}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Typ</span>
                  <span className="font-semibold text-black">
                    {Array.isArray(estate.type)
                      ? estate.type.join(", ")
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
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-6">
                  Skontaktuj się z nami
                </h3>

                <div className="space-y-3">
                  <a
                    href="tel:+48123456789"
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    +48 123 456 789
                  </a>

                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Mail className="w-5 h-5" />
                    Wyślij wiadomość
                  </button>
                </div>

                {showContactForm && (
                  <div className="mt-6 pt-6 border-t space-y-4">
                    <input
                      type="text"
                      placeholder="Imię i nazwisko"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    />
                    <textarea
                      rows={3}
                      placeholder="Wiadomość"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                    />
                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold">
                      Wyślij zapytanie
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
