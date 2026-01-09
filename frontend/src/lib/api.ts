// ============= 2. API CLIENT (lib/api.ts) =============
import { Estate, User, AuthResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010/api";

export class ApiClient {
  private static getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Estates
  static async getAllEstates(): Promise<Estate[]> {
    const res = await fetch(`${API_URL}/estates`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.estates || [];
  }

  static async getEstateById(id: string): Promise<Estate> {
    const res = await fetch(`${API_URL}/estates/${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.estate;
  }

  static async getRecommendations(id: string): Promise<Estate[]> {
    const res = await fetch(`${API_URL}/estates/${id}/recommendations`, {
      cache: "no-store",
    });
    const data = await res.json();
    return data.recommendations || [];
  }

  // search

  static async searchEstates(params: {
    price_min?: number;
    price_max?: number;
    surface_min?: number;
    surface_max?: number;
    localization?: string;
    type?: string | string[];
    rooms_min?: number;
    rooms_max?: number;
    year?: number;
    baths_min?: number;
    baths_max?: number;
    status?: "available" | "sold";
  }): Promise<Estate[]> {
    // Budujemy URL query string ręcznie
    const queryParts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // Specjalna obsługa dla type (może być tablicą)
      if (key === "type") {
        if (Array.isArray(value)) {
          // Dla każdego typu dodajemy osobny parametr: type=dom&type=dzialka
          value.forEach((v) => {
            queryParts.push(`type=${encodeURIComponent(v)}`);
          });
        } else {
          queryParts.push(`type=${encodeURIComponent(value)}`);
        }
        return;
      }

      // Pozostałe parametry
      queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
    });

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

    const res = await fetch(`${API_URL}/estates/search${queryString}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Search failed: ${res.status}`);
    }

    const data = await res.json();
    return data.estates || [];
  }

  // Auth
  static async register(userData: {
    name: string;
    lastname: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return res.json();
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }

  // Favourites (Protected)
  static async getFavourites(): Promise<Estate[]> {
    const res = await fetch(`${API_URL}/favourites`, {
      headers: this.getHeaders(true),
    });
    const data = await res.json();
    return data.favourites || [];
  }

  static async addToFavourites(estateId: number): Promise<void> {
    await fetch(`${API_URL}/favourites/${estateId}`, {
      method: "POST",
      headers: this.getHeaders(true),
    });
  }

  static async removeFromFavourites(estateId: number): Promise<void> {
    await fetch(`${API_URL}/favourites/${estateId}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
  }

  static async getUser(): Promise<User> {
    const res = await fetch(`${API_URL}/user`, {
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  // Admin (Protected - Admin only)
  static async createEstate(formData: FormData): Promise<Estate> {
    const res = await fetch(`${API_URL}/admin/estates`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to create estate");
    const data = await res.json();
    return data.estate;
  }

  static async updateEstate(id: number, formData: FormData): Promise<Estate> {
    const res = await fetch(`${API_URL}/admin/estates/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to update estate");
    const data = await res.json();
    return data.estate;
  }

  static async deleteEstate(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/admin/estates/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    if (!res.ok) throw new Error("Failed to delete estate");
  }
}
