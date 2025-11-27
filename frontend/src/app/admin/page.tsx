/* eslint-disable */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { AuthService } from "@/lib/auth";
import { Estate } from "@/types";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from "lucide-react";

const LOCALIZATIONS = [
  "Koniaków",
  "Istebna",
  "Jaworzynka",
  "Laliki",
  "Sól",
  "Zwardoń",
];

const TYPES = [
  "budowlano-usługowa",
  "dom",
  "dzialka",
  "dzialka rolnicza",
  "działka budowlana",
  "działka budowlano-rolna",
  "przemysłowa",
];

export default function AdminPage() {
  const router = useRouter();
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEstate, setEditingEstate] = useState<Estate | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    type: [] as string[],
    status: false,
    localization: "",
    surface: "",
    price: "",
    opis: "",
    images: [] as File[],
  });

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login");
      return;
    }
    const admin = await AuthService.isAdmin();
    if (!admin) {
      toast.error("Brak uprawnień administratora");
      router.push("/");
      return;
    }
    setIsAdmin(true);
    loadEstates();
  };

  const loadEstates = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getAllEstates();
      setEstates(data);
    } catch (error) {
      toast.error("Błąd ładowania nieruchomości");
    } finally {
      setLoading(false);
    }
  };

  const cleanForm = () => {
    // Zwolnij pamięć podglądów
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setFormData({
      type: [],
      status: false,
      localization: "",
      surface: "",
      price: "",
      opis: "",
      images: [],
    });
    setEditingEstate(null);
  };

  const openAddForm = () => {
    cleanForm();
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("admin-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const closeForm = () => {
    cleanForm();
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 10) {
      toast.error("Maksymalnie 10 zdjęć na raz");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Plik ${file.name} jest za duży (max 10MB)`);
        return false;
      }
      return true;
    });

    setFormData({ ...formData, images: validFiles });
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type.length === 0) {
      toast.error("Wybierz przynajmniej jeden typ nieruchomości");
      return;
    }
    if (!editingEstate && formData.images.length === 0) {
      toast.error("Dodaj przynajmniej jedno zdjęcie");
      return;
    }

    const form = new FormData();
    formData.type.forEach((t) => form.append("type", t));
    form.append("status", formData.status.toString());
    form.append("localization", formData.localization);
    form.append("surface", formData.surface);
    form.append("price", formData.price);
    form.append("opis", formData.opis);
    formData.images.forEach((img) => form.append("images", img));

    try {
      if (editingEstate) {
        await ApiClient.updateEstate(editingEstate.id, form);
        toast.success("Nieruchomość zaktualizowana");
      } else {
        await ApiClient.createEstate(form);
        toast.success("Nieruchomość dodana");
      }
      closeForm();
      loadEstates();
    } catch (error: any) {
      toast.error(error?.message || "Błąd podczas zapisywania nieruchomości");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę nieruchomość?")) return;
    try {
      await ApiClient.deleteEstate(id);
      toast.success("Nieruchomość usunięta");
      loadEstates();
    } catch (error) {
      toast.error("Błąd podczas usuwania nieruchomości");
    }
  };

  const handleEdit = (estate: Estate) => {
    let types: string[] = [];

    if (Array.isArray(estate.type)) {
      types = estate.type;
    } else if (typeof estate.type === "string" && estate.type) {
      types = (estate.type as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // Zwolnij ewentualne stare podglądy
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setEditingEstate(estate);
    setFormData({
      type: types,
      status: estate.status,
      localization: estate.localization,
      surface: estate.surface.toString(),
      price: estate.price.toString(),
      opis: estate.opis,
      images: [],
    });
    setImagePreviews([]);
    setShowForm(true);

    setTimeout(() => {
      document.getElementById("admin-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleTypeToggle = (t: string) => {
    setFormData((prev) => ({
      ...prev,
      type: prev.type.includes(t)
        ? prev.type.filter((ty) => ty !== t)
        : [...prev.type, t],
    }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-black dark:text-white">Sprawdzanie uprawnień...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-black dark:text-white">
            Panel <span className="text-blue-600">Administratora</span>
          </h1>

          <div className="flex items-center gap-4">
            {/* ZAWSZE widoczny przycisk do dodania nowej (czysty formularz) */}
            <button
              onClick={openAddForm}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Dodaj nieruchomość
            </button>

            {/* Przycisk Anuluj tylko gdy formularz jest otwarty */}
            {showForm && (
              <button
                onClick={closeForm}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-semibold flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Anuluj
              </button>
            )}
          </div>
        </div>

        {/* Formularz – taki sam do dodawania i edycji */}
        {showForm && (
          <div
            id="admin-form"
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 transition-colors"
          >
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              {editingEstate ? "Edytuj" : "Dodaj"} nieruchomość
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2">
                    Lokalizacja *
                  </label>
                  <select
                    value={formData.localization}
                    onChange={(e) =>
                      setFormData({ ...formData, localization: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Wybierz lokalizację</option>
                    {LOCALIZATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2">
                    Typ nieruchomości * (można wybrać wiele)
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl max-h-48 overflow-y-auto">
                    {TYPES.map((t) => (
                      <label
                        key={t}
                        className="flex items-center gap-2 cursor-pointer text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.type.includes(t)}
                          onChange={() => handleTypeToggle(t)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">{t}</span>
                      </label>
                    ))}
                  </div>
                  {formData.type.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                        Wybrano {formData.type.length}:{" "}
                        {formData.type.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2">
                    Powierzchnia (m²) *
                  </label>
                  <input
                    type="number"
                    value={formData.surface}
                    onChange={(e) =>
                      setFormData({ ...formData, surface: e.target.value })
                    }
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="np. 1500"
                  />
                </div>

                <div>
                  <label className="block text-black dark:text-white font-semibold mb-2">
                    Cena (zł) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none"
                    placeholder="np. 150000"
                  />
                  {formData.price && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {parseInt(formData.price).toLocaleString("pl-PL")} zł
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Status
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked })
                    }
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <span className="text-black dark:text-white font-semibold">
                      Zaznacz jeśli sprzedane
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.status
                        ? "Status: Sprzedane"
                        : "Status: Dostępne"}
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Opis *
                </label>
                <textarea
                  value={formData.opis}
                  onChange={(e) =>
                    setFormData({ ...formData, opis: e.target.value })
                  }
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Szczegółowy opis nieruchomości..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Znaków: {formData.opis.length}
                </p>
              </div>

              <div>
                <label className="block text-black dark:text-white font-semibold mb-2">
                  Zdjęcia {!editingEstate && "*"} (max 10 plików, każdy do 10MB)
                  {editingEstate && " (dodaj nowe jeśli chcesz je zmienić)"}
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-black dark:text-white focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-green-700 dark:text-green-300 font-semibold mb-3">
                      ✓ Wybrano {imagePreviews.length} zdjęć:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {formData.images[index].name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {editingEstate ? "Zapisz zmiany" : "Dodaj nieruchomość"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista nieruchomości – bez zmian */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-black dark:text-white mt-4">Ładowanie...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
              Wszystkie nieruchomości ({estates.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      ID
                    </th>
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      Zdjęcia
                    </th>
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      Lokalizacja
                    </th>
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      Typ
                    </th>
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      Powierzchnia
                    </th>
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      Cena
                    </th>
                    <th className="text-left py-4 px-4 text-black dark:text-white font-semibold">
                      Status
                    </th>
                    <th className="text-right py-4 px-4 text-black dark:text-white font-semibold">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estates.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-12 text-gray-500 dark:text-gray-400"
                      >
                        Brak nieruchomości. Dodaj pierwszą!
                      </td>
                    </tr>
                  ) : (
                    estates.map((estate) => (
                      <tr
                        key={estate.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-black dark:text-white font-semibold">
                          #{estate.id}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-black dark:text-white">
                              {Array.isArray(estate.images)
                                ? estate.images.length
                                : 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-black dark:text-white">
                          {estate.localization}
                        </td>
                        <td className="py-4 px-4 text-black dark:text-white">
                          <div className="max-w-xs">
                            {Array.isArray(estate.type)
                              ? estate.type.join(", ")
                              : estate.type}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-black dark:text-white">
                          {estate.surface} m²
                        </td>
                        <td className="py-4 px-4 text-black dark:text-white font-semibold">
                          {estate.price.toLocaleString("pl-PL")} zł
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${estate.status
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              }`}
                          >
                            {estate.status ? "Sprzedane" : "Dostępne"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(estate)}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                              title="Edytuj"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(estate.id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
