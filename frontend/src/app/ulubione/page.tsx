"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth";
import PropertyCard from "@/components/PropertyCard";
import { useFavourites } from "@/contexts/FavouritesContext";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function UlubionePage() {
  const router = useRouter();
  const { favourites, isLoading } = useFavourites();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }
  }, [router]);

  if (!AuthService.isAuthenticated()) {
    return null;
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-5xl font-bold text-black dark:text-white">
            Ulubione <span className="text-blue-600">nieruchomości</span>
          </h1>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-xl text-black dark:text-white">Ładowanie...</p>
          </div>
        ) : favourites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <Heart className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              Brak ulubionych nieruchomości
            </h2>
            <p className="text-black dark:text-white mb-8">
              Dodaj nieruchomości do ulubionych, klikając ikonę serca
            </p>
            <Link
              href="/nieruchomosci"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold"
            >
              Przeglądaj oferty
            </Link>
          </div>
        ) : (
          <>
            <p className="text-black dark:text-white mb-8">
              Znaleziono {favourites.length}{" "}
              {favourites.length === 1
                ? "nieruchomość"
                : favourites.length < 5
                  ? "nieruchomości"
                  : "nieruchomości"}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favourites.map((estate) => (
                <PropertyCard key={estate.id} estate={estate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

