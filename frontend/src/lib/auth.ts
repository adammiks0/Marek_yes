// ============= 3. AUTH UTILITIES (lib/auth.ts) =============
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
    }
  },

  isAuthenticated: (): boolean => {
    return !!AuthService.getToken();
  },
};
