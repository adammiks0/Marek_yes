// ============= 12. LOGIN (app/login/page.tsx) =============
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/.test(name);
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loginErrors, setLoginErrors] = useState({
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

  const [registerErrors, setRegisterErrors] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateLogin = (): boolean => {
    const errors = { email: "", password: "" };
    let isValid = true;

    if (!loginData.email.trim()) {
      errors.email = "Email jest wymagany";
      isValid = false;
    } else if (!validateEmail(loginData.email)) {
      errors.email = "Nieprawidłowy format email";
      isValid = false;
    }

    if (!loginData.password) {
      errors.password = "Hasło jest wymagane";
      isValid = false;
    } else if (!validatePassword(loginData.password)) {
      errors.password = "Hasło musi mieć minimum 6 znaków";
      isValid = false;
    }

    setLoginErrors(errors);
    return isValid;
  };

  const validateRegister = (): boolean => {
    const errors = {
      name: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!registerData.name.trim()) {
      errors.name = "Imię jest wymagane";
      isValid = false;
    } else if (!validateName(registerData.name)) {
      errors.name = "Imię musi mieć minimum 2 znaki i zawierać tylko litery";
      isValid = false;
    }

    if (!registerData.lastname.trim()) {
      errors.lastname = "Nazwisko jest wymagane";
      isValid = false;
    } else if (!validateName(registerData.lastname)) {
      errors.lastname =
        "Nazwisko musi mieć minimum 2 znaki i zawierać tylko litery";
      isValid = false;
    }

    if (!registerData.email.trim()) {
      errors.email = "Email jest wymagany";
      isValid = false;
    } else if (!validateEmail(registerData.email)) {
      errors.email = "Nieprawidłowy format email";
      isValid = false;
    }

    if (!registerData.password) {
      errors.password = "Hasło jest wymagane";
      isValid = false;
    } else if (!validatePassword(registerData.password)) {
      errors.password = "Hasło musi mieć minimum 6 znaków";
      isValid = false;
    }

    if (!registerData.confirmPassword) {
      errors.confirmPassword = "Potwierdzenie hasła jest wymagane";
      isValid = false;
    } else if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = "Hasła nie są takie same";
      isValid = false;
    }

    setRegisterErrors(errors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) {
      toast.error("Popraw błędy w formularzu");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiClient.login(
        loginData.email,
        loginData.password
      );

      if (response.token) {
        AuthService.setToken(response.token);
        toast.success("Zalogowano pomyślnie!");
        // Reload to refresh all contexts and navbar
        router.push("/nieruchomosci");
        setTimeout(() => window.location.reload(), 200);
      } else {
        toast.error("Błąd logowania. Sprawdź dane.");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error || "Błąd logowania. Sprawdź email i hasło.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) {
      toast.error("Popraw błędy w formularzu");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiClient.register({
        name: registerData.name.trim(),
        lastname: registerData.lastname.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
      });

      toast.success("Rejestracja zakończona! Możesz się teraz zalogować.");
      setIsLogin(true);
      setRegisterData({
        name: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setRegisterErrors({
        name: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        "Błąd rejestracji. Użytkownik może już istnieć.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-black dark:text-white"
              }`}
            >
              Logowanie
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-black dark:text-white"
              }`}
            >
              Rejestracja
            </button>
          </div>

          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleLogin}>
              <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
                Witaj ponownie!
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        if (loginErrors.email) {
                          setLoginErrors({ ...loginErrors, email: "" });
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${
                        loginErrors.email
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
                      placeholder="twoj@email.com"
                      required
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2">
                    Hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        });
                        if (loginErrors.password) {
                          setLoginErrors({ ...loginErrors, password: "" });
                        }
                      }}
                      className={`w-full pl-12 pr-12 py-3 border-2 ${
                        loginErrors.password
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
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
                  {loginErrors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </button>
              </div>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegister}>
              <h2 className="text-3xl font-bold text-black dark:text-white mb-6">
                Utwórz konto
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2 text-sm">
                      Imię
                    </label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        });
                        if (registerErrors.name) {
                          setRegisterErrors({
                            ...registerErrors,
                            name: "",
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 ${
                        registerErrors.name
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
                      placeholder="Jan"
                      required
                    />
                    {registerErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {registerErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-black dark:text-white font-semibold mb-2 text-sm">
                      Nazwisko
                    </label>
                    <input
                      type="text"
                      value={registerData.lastname}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          lastname: e.target.value,
                        });
                        if (registerErrors.lastname) {
                          setRegisterErrors({
                            ...registerErrors,
                            lastname: "",
                          });
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 ${
                        registerErrors.lastname
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
                      placeholder="Kowalski"
                      required
                    />
                    {registerErrors.lastname && (
                      <p className="text-red-500 text-xs mt-1">
                        {registerErrors.lastname}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2 text-sm">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        });
                        if (registerErrors.email) {
                          setRegisterErrors({
                            ...registerErrors,
                            email: "",
                          });
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-3 border-2 ${
                        registerErrors.email
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
                      placeholder="twoj@email.com"
                      required
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2 text-sm">
                    Hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        });
                        if (registerErrors.password) {
                          setRegisterErrors({
                            ...registerErrors,
                            password: "",
                          });
                        }
                      }}
                      className={`w-full pl-12 pr-12 py-3 border-2 ${
                        registerErrors.password
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
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
                  {registerErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2 text-sm">
                    Potwierdź hasło
                  </label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => {
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      });
                      if (registerErrors.confirmPassword) {
                        setRegisterErrors({
                          ...registerErrors,
                          confirmPassword: "",
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 border-2 ${
                      registerErrors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 rounded-xl focus:border-blue-500 focus:outline-none text-black dark:text-white`}
                    placeholder="••••••••"
                    required
                  />
                  {registerErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? "Rejestracja..." : "Zarejestruj się"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-black dark:text-white hover:text-blue-600 transition-colors"
            >
              ← Powrót do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
