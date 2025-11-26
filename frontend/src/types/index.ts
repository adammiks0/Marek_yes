export interface Estate {
  id: number;
  type: string[];
  status: boolean;
  localization: string;
  surface: number;
  price: number;
  opis: string;
  images: string[];
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  favourite: Estate[];
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    lastname: string;
    email: string;
  };
}
