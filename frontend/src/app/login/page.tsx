// ============= 12. LOGIN (app/login/page.tsx) =============
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ApiClient.login(
        loginData.email,
        loginData.password,
      );

      if (response.token) {
        AuthService.setToken(response.token);
        alert("Zalogowano pomyślnie!");
        router.push("/");
        window.location.reload(); // Refresh to update navbar
      } else {
        alert("Błąd logowania. Sprawdź dane.");
      }
    } catch (error) {
      alert("Błąd logowania. Sprawdź email i hasło.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      alert("Hasła nie są takie same!");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiClient.register({
        name: registerData.name,
        lastname: registerData.lastname,
        email: registerData.email,
        password: registerData.password,
      });

      alert("Rejestracja zakończona! Możesz się teraz zalogować.");
      setIsLogin(true);
      setRegisterData({
        name: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      alert("Błąd rejestracji. Użytkownik może już istnieć.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 p-2 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-600"
              }`}
            >
              Logowanie
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-600"
              }`}
            >
              Rejestracja
            </button>
          </div>

          {isLogin ? (
            // LOGIN FORM
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Witaj ponownie!
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-black"
                      placeholder="twoj@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="text-black w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="text-black w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </button>
              </div>
            </div>
          ) : (
            // REGISTER FORM
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Utwórz konto
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="Jan"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={registerData.lastname}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          lastname: e.target.value,
                        })
                      }
                      className="text-black w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="Kowalski"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-black"
                      placeholder="twoj@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-12 py-3 text-black border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Potwierdź hasło
                  </label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2  text-black border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? "Rejestracja..." : "Zarejestruj się"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              ← Powrót do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
