// ============= 3. AUTH UTILITIES (lib/auth.ts) =============
import { ApiClient } from "./api";

// Helper functions for cookies
const CookieHelper = {
  set: (name: string, value: string, days: number = 7): void => {
    if (typeof window === "undefined") return;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  get: (name: string): string | null => {
    if (typeof window === "undefined") return null;

    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }

    return null;
  },

  remove: (name: string): void => {
    if (typeof window === "undefined") return;

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },
};

// Check if user has accepted cookies
const hasCookieConsent = (): boolean => {
  if (typeof window === "undefined") return false;

  const consent = localStorage.getItem("cookieConsent");
  if (!consent) return false;

  try {
    const parsed = JSON.parse(consent);
    // Check if functional cookies are accepted
    return parsed.preferences?.functional === true;
  } catch {
    // If it's old format (just "accepted")
    return consent === "accepted" || consent === '"accepted"';
  }
};

export const AuthService = {
  // Token management with cookies
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;

    // Always check localStorage first (it's always available)
    const tokenFromStorage = localStorage.getItem("token");
    if (tokenFromStorage) return tokenFromStorage;

    // If user accepted cookies, check cookies too
    if (hasCookieConsent()) {
      const tokenFromCookie = CookieHelper.get("token");
      if (tokenFromCookie) {
        // Sync to localStorage
        localStorage.setItem("token", tokenFromCookie);
        return tokenFromCookie;
      }
    }

    return null;
  },

  setToken: (token: string): void => {
    if (typeof window === "undefined") return;

    // Always store in localStorage (necessary for functionality)
    localStorage.setItem("token", token);

    // Only store in cookies if user accepted
    if (hasCookieConsent()) {
      CookieHelper.set("token", token, 7);
    }
  },

  removeToken: (): void => {
    if (typeof window === "undefined") return;

    // Remove from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Remove from cookies (if they exist)
    CookieHelper.remove("token");
    CookieHelper.remove("user");
  },

  // User data management
  getUser: (): any | null => {
    if (typeof window === "undefined") return null;

    // Always check localStorage first
    const userFromStorage = localStorage.getItem("user");
    if (userFromStorage) {
      try {
        return JSON.parse(userFromStorage);
      } catch {
        return null;
      }
    }

    // If user accepted cookies, check cookies too
    if (hasCookieConsent()) {
      const userFromCookie = CookieHelper.get("user");
      if (userFromCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userFromCookie));
          // Sync to localStorage
          localStorage.setItem("user", JSON.stringify(user));
          return user;
        } catch {
          return null;
        }
      }
    }

    return null;
  },

  setUser: (user: any): void => {
    if (typeof window === "undefined") return;

    // Always store in localStorage (necessary for functionality)
    localStorage.setItem("user", JSON.stringify(user));

    // Only store in cookies if user accepted
    if (hasCookieConsent()) {
      CookieHelper.set("user", encodeURIComponent(JSON.stringify(user)), 7);
    }
  },

  isAuthenticated: (): boolean => {
    return !!AuthService.getToken();
  },

  async isAdmin(): Promise<boolean> {
    if (!this.isAuthenticated()) return false;

    try {
      const user = await ApiClient.getUser();
      return user.email === "admin@admin.com";
    } catch {
      return false;
    }
  },

  // Clear all auth data
  logout: (): void => {
    AuthService.removeToken();
  },
};

export default AuthService;
