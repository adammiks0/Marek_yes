// ============= 10. O NAS (app/o-nas/page.tsx) =============
import { Users, Award, TrendingUp, MapPin, Phone, Mail } from "lucide-react";

export default function ONasPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-gray-300 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 dark:text-blue-300 mb-6">
            O <span className="text-blue-600">nas</span>
          </h1>
          <p className="text-xl text-black dark:text-white max-w-3xl mx-auto">
            Jesteśmy lokalną agencją nieruchomości działającą w Beskidach od
            ponad 15 lat. Specjalizujemy się w sprzedaży działek, domów i
            mieszkań w Istebnej, Koniakowie i okolicach.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center transition-colors">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl text-black dark:text-white font-bold mb-2">
              Doświadczenie
            </h3>
            <p className="text-black dark:text-white">
              Ponad 15 lat na rynku nieruchomości w Beskidach
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center transition-colors">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl text-black dark:text-white font-bold mb-2">
              Zaufanie
            </h3>
            <p className="text-black dark:text-white">
              Ponad 500 zadowolonych klientów
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center transition-colors">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-black dark:text-white">
              Sukces
            </h3>
            <p className="text-black dark:text-white">
              95% transakcji zakończonych sukcesem
            </p>
          </div>
        </div>

        {/* Mission */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-black dark:text-white mb-6">
                  Nasza <span className="text-blue-600">misja</span>
                </h2>
                <p className="text-lg text-black dark:text-white mb-4">
                  Pomagamy ludziom znaleźć ich wymarzone miejsce w Beskidach.
                  Każda nieruchomość to dla nas unikalna historia i możliwość
                  spełnienia marzeń naszych klientów.
                </p>
                <p className="text-lg text-black dark:text-white mb-4">
                  Oferujemy profesjonalne doradztwo, kompleksową obsługę i
                  wsparcie na każdym etapie transakcji. Znamy lokalny rynek jak
                  nikt inny.
                </p>
              </div>
              <div className="bg-blue-600 dark:bg-blue-700 rounded-2xl p-8 text-white transition-colors">
                <h3 className="text-2xl font-bold mb-6">Dlaczego my?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full mt-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Lokalna wiedza i doświadczenie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full mt-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Indywidualne podejście do klienta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full mt-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Kompleksowa obsługa prawna</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-white/20 p-1 rounded-full mt-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span>Najlepsza oferta w regionie</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
