"use client";
import { useState, useEffect } from "react";
import { X, Cookie, Settings, Check } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Zawsze włączone
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Załaduj zapisane preferencje
      try {
        const saved = JSON.parse(consent);
        if (saved.preferences) {
          setPreferences(saved.preferences);
        }
      } catch (e) {
        console.error("Error loading cookie preferences", e);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const consent = {
      timestamp: new Date().toISOString(),
      preferences: prefs,
    };
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
    setShowBanner(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    // Reload to apply cookie settings
    window.location.reload();
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
    // Reload if functional cookies were enabled/disabled
    if (preferences.functional) {
      window.location.reload();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={acceptNecessary}
      />

      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl pointer-events-auto transform transition-all duration-300 ease-out animate-slide-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={acceptNecessary}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Zamknij"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        {showSettings ? (
          /* Settings View */
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ustawienia plików cookie
              </h3>
            </div>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {/* Necessary Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      Niezbędne pliki cookie
                      <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                        Zawsze aktywne
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Te pliki cookie są wymagane do prawidłowego działania
                      strony i nie mogą być wyłączone.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Funkcjonalne pliki cookie
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Umożliwiają zapamiętywanie preferencji użytkownika, takich
                      jak język czy motyw.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          functional: !preferences.functional,
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.functional
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      } flex items-center ${preferences.functional ? "justify-end" : "justify-start"} px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Analityczne pliki cookie
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Pomagają nam zrozumieć, jak odwiedzający korzystają ze
                      strony poprzez zbieranie anonimowych danych.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          analytics: !preferences.analytics,
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.analytics
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      } flex items-center ${preferences.analytics ? "justify-end" : "justify-start"} px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Marketingowe pliki cookie
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Służą do personalizacji reklam i mierzenia efektywności
                      kampanii reklamowych.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() =>
                        setPreferences({
                          ...preferences,
                          marketing: !preferences.marketing,
                        })
                      }
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.marketing
                          ? "bg-blue-600"
                          : "bg-gray-300 dark:bg-gray-600"
                      } flex items-center ${preferences.marketing ? "justify-end" : "justify-start"} px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all"
              >
                Wstecz
              </button>
              <button
                onClick={saveCustomPreferences}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Zapisz preferencje
              </button>
            </div>
          </div>
        ) : (
          /* Main View */
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  🍪 Używamy plików cookie
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Nasza strona wykorzystuje pliki cookie, aby zapewnić Ci
                  najlepsze doświadczenia podczas przeglądania. Pliki cookie
                  pomagają nam zapamiętać Twoje preferencje oraz dostosować
                  zawartość do Twoich potrzeb.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptAll}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    Akceptuję wszystkie
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    Zarządzaj
                  </button>
                  <button
                    onClick={acceptNecessary}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-all"
                  >
                    Tylko niezbędne
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
