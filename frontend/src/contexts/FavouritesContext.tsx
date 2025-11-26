"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { Estate } from "@/types";

type FavouritesContextType = {
  favourites: Estate[];
  isLoading: boolean;
  refreshFavourites: () => Promise<void>;
  isFavourite: (estateId: number) => boolean;
};

const FavouritesContext = createContext<FavouritesContextType | undefined>(
  undefined
);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favourites, setFavourites] = useState<Estate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadFavourites = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      setFavourites([]);
      setInitialized(true);
      return;
    }

    try {
      setIsLoading(true);
      const data = await ApiClient.getFavourites();
      setFavourites(data);
    } catch (error) {
      console.error("Error loading favourites:", error);
      setFavourites([]);
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!initialized) {
      const isAuth = AuthService.isAuthenticated();
      if (isAuth) {
        loadFavourites();
      } else {
        setInitialized(true);
      }
    }
  }, [initialized, loadFavourites]);

  const isFavourite = useCallback(
    (estateId: number) => {
      return favourites.some((fav) => fav.id === estateId);
    },
    [favourites]
  );

  return (
    <FavouritesContext.Provider
      value={{
        favourites,
        isLoading,
        refreshFavourites: loadFavourites,
        isFavourite,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error("useFavourites must be used within FavouritesProvider");
  }
  return context;
}

