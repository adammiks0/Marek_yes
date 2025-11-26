// ============= 2. API CLIENT (lib/api.ts) =============
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

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

  static async searchEstates(params: {
    price_min?: number;
    price_max?: number;
    surface_min?: number;
    surface_max?: number;
    localization?: string;
    type?: string;
    status?: "available" | "sold";
  }): Promise<Estate[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const res = await fetch(`${API_URL}/estates/search?${queryParams}`, {
      cache: "no-store",
    });
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
}
