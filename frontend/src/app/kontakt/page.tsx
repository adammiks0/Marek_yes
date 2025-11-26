// ============= 11. KONTAKT (app/kontakt/page.tsx) =============
"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, Clock } from "lucide-react";

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Wiadomość wysłana! Skontaktujemy się z Tobą wkrótce.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Kontakt</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Masz pytania? Chcesz umówić się na oględziny? Skontaktuj się z nami!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informacje kontaktowe
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Telefon
                    </h3>
                    <p className="text-gray-600">+48 123 456 789</p>
                    <p className="text-gray-600">+48 987 654 321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">
                      kontakt@nieruchomosciistebna.pl
                    </p>
                    <p className="text-gray-600">
                      biuro@nieruchomosciistebna.pl
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Adres</h3>
                    <p className="text-gray-600">ul. Główna 123</p>
                    <p className="text-gray-600">43-470 Istebna</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Godziny otwarcia
                    </h3>
                    <p className="text-gray-600">Pon - Pt: 9:00 - 17:00</p>
                    <p className="text-gray-600">Sob: 10:00 - 14:00</p>
                    <p className="text-gray-600">Ndz: Zamknięte</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-bold text-gray-900 mb-4">
                Nasza lokalizacja
              </h3>
              <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Znajdujemy się w centrum Istebnej, łatwy dojazd i parking dla
                klientów.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Wyślij wiadomość
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-black focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Jan Kowalski"
                />
              </div>

              <div>
                <label className="block text-black font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-black focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-black focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="+48 123 456 789"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Wiadomość *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-black focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Opisz czego szukasz lub zadaj pytanie..."
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Wyślij wiadomość
              </button>

              <p className="text-sm text-gray-500 text-center">
                * Pola wymagane
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
