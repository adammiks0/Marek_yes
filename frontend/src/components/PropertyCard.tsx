// ============= 7. PROPERTY CARD (components/PropertyCard.tsx) =============
"use client";

import Link from "next/link";
import { MapPin, Square, Heart } from "lucide-react";
import { Estate } from "@/types";
import { useState } from "react";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { useFavourites } from "@/contexts/FavouritesContext";
import toast from "react-hot-toast";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010/api";

export default function PropertyCard({ estate }: { estate: Estate }) {
  const [imageError, setImageError] = useState(false);
  const { isFavourite, refreshFavourites } = useFavourites();
  const isLiked = isFavourite(estate.id);

  // Normalize image URL
  const getImageUrl = (image: string): string => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    // If it starts with /uploads, use API URL
    if (image.startsWith("/uploads")) {
      return `${API_URL.replace("/api", "")}${image}`;
    }
    // Otherwise assume it's a relative path
    return `${API_URL.replace("/api", "")}/${image}`;
  };

  const firstImage =
    Array.isArray(estate.images) && estate.images.length > 0
      ? getImageUrl(estate.images[0])
      : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop";
  console.log("Image URL:", firstImage);
  console.log("Raw image from API:", estate.images[0]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!AuthService.isAuthenticated()) {
      toast.error("Zaloguj się, aby dodać do ulubionych");
      return;
    }

    try {
      if (isLiked) {
        await ApiClient.removeFromFavourites(estate.id);
        toast.success("Usunięto z ulubionych");
      } else {
        await ApiClient.addToFavourites(estate.id);
        toast.success("Dodano do ulubionych");
      }
      // Refresh favourites from context
      await refreshFavourites();
    } catch (error) {
      toast.error("Błąd podczas aktualizacji ulubionych");
      console.error("Error toggling favourite:", error);
    }
  };

  return (
    <Link href={`/nieruchomosci/${estate.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
        <div className="relative h-64 overflow-hidden group bg-gray-200 dark:bg-gray-700">
          {!imageError && firstImage ? (
            <Image
              src={firstImage}
              alt={estate.opis || "Nieruchomość"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <Square className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}

          <button
            onClick={handleLike}
            className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
          >
            <Heart
              className={`w-5 h-5 ${isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 dark:text-gray-400"
                }`}
            />
          </button>

          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            {estate.price.toLocaleString("pl-PL")} zł
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between  text-black dark:text-white text-sm mb-3">
            {/* Lewa strona: lokalizacja */}
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-blue-600" />
              {estate.localization}
            </div>

            {/* Prawa strona: status */}
            <span
              className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${estate.status
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                }`}
            >
              {estate.status ? "Sprzedane" : "Dostępne"}
            </span>
          </div>
          <p className="text-black dark:text-white mb-4 line-clamp-1 break-words">
            {estate.opis}
          </p>

          <div className="flex items-center gap-4 text-black dark:text-white mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{estate.surface} m² </span>
            </div>
            <div className="text-sm">
              {Array.isArray(estate.type)
                ? estate.type.join(", ")
                : estate.type}
            </div>
          </div>

          <div className="text-blue-600 font-semibold">Zobacz szczegóły →</div>
        </div>
      </div>
    </Link>
  );
}
