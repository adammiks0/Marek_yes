// ============= 11. KONTAKT (app/kontakt/page.tsx) =============
"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, Clock } from "lucide-react";
import toast from "react-hot-toast";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const newErrors = { name: "", email: "", message: "" };
    let hasErrors = false;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Imię i nazwisko jest wymagane";
      hasErrors = true;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email jest wymagany";
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
      hasErrors = true;
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Wiadomość jest wymagana";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Popraw błędy w formularzu");
      return;
    }

    toast.success("Wiadomość wysłana! Skontaktujemy się z Tobą wkrótce.");
    setFormData({ name: "", email: "", phone: "", message: "" });
    setErrors({ name: "", email: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-6">
            <span className="text-blue-600">Kontakt</span>
          </h1>
          <p className="text-xl text-black dark:text-white max-w-2xl mx-auto">
            Masz pytania? Chcesz umówić się na oględziny? Skontaktuj się z nami!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                Informacje kontaktowe
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white mb-1">
                      Telefon
                    </h3>
                    <p className="text-black dark:text-white">
                      +48 505 597 504
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white mb-1">
                      Email
                    </h3>
                    <p className="text-black dark:text-white">
                      <a
                        href="mailto:marek@nieruchomosciistebna.pl"
                        className="underline"
                      >
                        marek@nieruchomosciistebna.pl
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white mb-1">
                      Adres
                    </h3>
                    <p className="text-black dark:text-white">
                      Jaworzynka 1010
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white mb-1">
                      Godziny otwarcia
                    </h3>
                    <p className="text-black dark:text-white">
                      Skontaktuj się z nami a umówimy się na spotkanie w
                      najdogodniejszym dla Ciebie terminie
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
              <h3 className="font-bold text-black dark:text-white mb-4">
                Nasza lokalizacja
              </h3>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d41429.63336870333!2d18.853996299649037!3d49.5345065863734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47143e09cc17ce4d%3A0xa6763b30f3ab7e3f!2sJaworzynka!5e0!3m2!1spl!2spl!4v1764192233746!5m2!1spl!2spl"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full rounded-xl"
                ></iframe>
              </div>
              <p className="text-sm text-black dark:text-white mt-4">
                Znajdujemy się w centrum Istebnej, łatwy dojazd i parking dla
                klientów.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Wyślij wiadomość
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${errors.name
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none transition-colors`}
                  placeholder="Jan Kowalski"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${errors.email
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none transition-colors`}
                  placeholder="jan@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="+48 123 456 789"
                />
              </div>

              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Wiadomość *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 border-2 ${errors.message
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                    } bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none transition-colors resize-none`}
                  placeholder="Opisz czego szukasz lub zadaj pytanie..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Wyślij wiadomość
              </button>

              <p className="text-sm text-black dark:text-white text-center">
                * Pola wymagane
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
