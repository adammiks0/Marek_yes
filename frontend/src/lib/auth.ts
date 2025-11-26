// ============= 3. AUTH UTILITIES (lib/auth.ts) =============
import { ApiClient } from "./api";

export const AuthService = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
};
