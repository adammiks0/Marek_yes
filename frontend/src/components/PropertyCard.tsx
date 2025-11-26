// ============= 7. PROPERTY CARD (components/PropertyCard.tsx) =============
"use client";

import Link from "next/link";
import { MapPin, Square, Heart } from "lucide-react";
import { Estate } from "@/types";
import { useState } from "react";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";

export default function PropertyCard({ estate }: { estate: Estate }) {
  const [isLiked, setIsLiked] = useState(false);
  const firstImage =
    Array.isArray(estate.images) && estate.images.length > 0
      ? estate.images[0]
      : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop";

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!AuthService.isAuthenticated()) {
      alert("Zaloguj się, aby dodać do ulubionych");
      return;
    }

    try {
      if (isLiked) {
        await ApiClient.removeFromFavourites(estate.id);
      } else {
        await ApiClient.addToFavourites(estate.id);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling favourite:", error);
    }
  };

  return (
    <Link href={`/nieruchomosci/${estate.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
        <div className="relative h-64 overflow-hidden group">
          <img
            src={firstImage}
            alt={estate.opis}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          <button
            onClick={handleLike}
            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>

          <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
            {estate.price.toLocaleString("pl-PL")} zł
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {estate.localization}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2">{estate.opis}</p>

          <div className="flex items-center gap-4 text-gray-600 mb-4 pb-4 border-b">
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span className="text-sm">{estate.surface} m²</span>
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
