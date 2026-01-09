// ============= 10. O NAS (app/o-nas/page.tsx) =============
import {
  Users,
  Award,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Clock,
  FileText,
  Building,
} from "lucide-react";

export default function ONasPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-gradient-to-br from-gray-300 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 dark:text-blue-300 mb-6">
            O <span className="text-blue-600">nas</span>
          </h1>
          <p className="text-xl text-black dark:text-white max-w-3xl mx-auto">
            Chcesz kupić dom lub działkę? Dobrze trafiłeś! Planujesz sprzedać
            nieruchomość? Zajmiemy się kompleksową obsługą, aby transakcja
            przebiegła szybko i bez przeszkód.
          </p>
        </div>

        {/* Czym się zajmujemy */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-black dark:text-white mb-12">
            Czym się <span className="text-blue-600">zajmujemy</span>?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl text-black dark:text-white font-bold mb-4">
                Kupno nieruchomości
              </h3>
              <p className="text-black dark:text-white">
                Pomożemy Ci znaleźć Twoje wymarzone miejsce. Pokażemy Ci
                nieruchomości, które spełnią wskazane przez Ciebie kryteria
                spośród dostępnych ofert.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl text-black dark:text-white font-bold mb-4">
                Sprzedaż nieruchomości
              </h3>
              <p className="text-black dark:text-white">
                Zajmiemy się skompletowaniem potrzebnej dokumentacji, aby
                transakcja przebiegła szybko i bez przeszkód. Wszystkie
                formalności po naszej stronie.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl text-black dark:text-white font-bold mb-4">
                Inwestor zastępczy
              </h3>
              <p className="text-black dark:text-white">
                Planujesz budowę, ale nie dysponujesz odpowiednią ilością czasu?
                Nie mieszkasz na miejscu? Zajmę się całym procesem inwestycyjnym
                w Twoim imieniu.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl text-black dark:text-white font-bold mb-4">
                Współpraca z ekspertami
              </h3>
              <p className="text-black dark:text-white">
                Współpracujemy ze sprawdzonymi firmami z branży geodezyjnej,
                budownictwa oraz architektury. Kompleksowa obsługa w jednym
                miejscu.
              </p>
            </div>
          </div>
        </section>

        {/* Jak to robimy */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-black dark:text-white mb-6">
                  Jak to <span className="text-blue-600">robimy</span>?
                </h2>
                <p className="text-lg text-black dark:text-white mb-4">
                  Skontaktuj się z nami, a spośród dostępnych ofert pokażemy Ci
                  nieruchomości, które spełnią wskazane przez Ciebie kryteria.
                </p>
                <p className="text-lg text-black dark:text-white mb-4">
                  Jesteśmy z Tobą podczas całego procesu zakupu lub sprzedaży
                  nieruchomości. Zrobimy wszystko, abyś nie musiał martwić się o
                  formalności.
                </p>
                <p className="text-lg text-black dark:text-white mb-6">
                  Wychodząc Wam naprzeciw pracujemy również w weekendy oraz w
                  późnych godzinach popołudniowych.
                </p>
                <p className="text-lg text-black dark:text-white font-semibold">
                  Współpracując z nami oszczędzasz czas i pieniądze.
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
                    <span>Kompleksowa obsługa od A do Z</span>
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
                    <span>Indywidualne podejście do każdego klienta</span>
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
                    <span>Praca w weekendy i późne godziny</span>
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
                    <span>Współpraca ze sprawdzonymi ekspertami</span>
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
                    <span>Oszczędność Twojego czasu i pieniędzy</span>
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
