import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
// import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import api from "../../services/api";
import DatePicker from "../form/date-picker";

// --- INTERFACES ---
interface PesertaProlanis {
  id: number;
  no_bpjs: string;
  nama: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  no_hp: string;
  diagnosa: string;
}

// --- FUNGSI BANTUAN UI AVATAR ---
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-emerald-100 text-emerald-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function PesertaProlanisComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  // --- STATES ---
  const [dataList, setDataList] = useState<PesertaProlanis[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States (Logika Client-Side)
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const optionsDiagnosa = [
    { value: "Hipertensi", label: "Hipertensi" },
    { value: "Diabetes", label: "Diabetes" },
  ];

  const optionJenisKelamin = [
    { value: "Pria", label: "Pria" },
    { value: "Wanita", label: "Wanita" },
  ];

  // Form States
  const [formData, setFormData] = useState({
    no_bpjs: "",
    nama: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    alamat: "",
    no_hp: "",
    diagnosa: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Mengambil seluruh data peserta sekaligus
      const response = await api.get("/peserta-prolanis");
      setDataList(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Tidak dapat memuat data peserta.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- RESET PAGE KETIKA PENCARIAN BERUBAH ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- LOGIKA PENCARIAN & PAGINATION (CLIENT-SIDE) ---
  const filteredData = dataList.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.no_bpjs.includes(searchQuery),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // --- HANDLER FORM INPUT ---
  const handleSelectChangeJenisKelamin = (value: string) => {
    setFormData((prev) => ({ ...prev, jenis_kelamin: value }));
    if (errors.jenis_kelamin)
      setErrors((prev) => ({ ...prev, jenis_kelamin: [] }));
  };

  const handleSelectChangeDiagnosa = (value: string) => {
    setFormData((prev) => ({ ...prev, diagnosa: value }));
    if (errors.diagnosa) setErrors((prev) => ({ ...prev, diagnosa: [] }));
  };

  const handleTanggalLahirChange = (date: string) => {
    setFormData((prev) => ({ ...prev, tanggal_lahir: date }));
    if (errors.tanggal_lahir)
      setErrors((prev) => ({ ...prev, tanggal_lahir: [] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  // --- HANDLER MODAL AKSI ---
  const handleAdd = () => {
    setEditId(null);
    setFormData({
      no_bpjs: "",
      nama: "",
      jenis_kelamin: "",
      tanggal_lahir: "",
      alamat: "",
      no_hp: "",
      diagnosa: "",
    });
    setErrors({});
    openModal();
  };

  const handleEdit = (item: PesertaProlanis) => {
    setEditId(item.id);
    setFormData({
      no_bpjs: item.no_bpjs,
      nama: item.nama,
      jenis_kelamin: item.jenis_kelamin,
      tanggal_lahir: item.tanggal_lahir,
      alamat: item.alamat,
      no_hp: item.no_hp,
      diagnosa: item.diagnosa,
    });
    setErrors({});
    openModal();
  };

  const handleCloseModal = () => {
    setEditId(null);
    setFormData({
      no_bpjs: "",
      nama: "",
      jenis_kelamin: "",
      tanggal_lahir: "",
      alamat: "",
      no_hp: "",
      diagnosa: "",
    });
    setErrors({});
    closeModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editId) {
        await api.put(`/update-peserta-prolanis/${editId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data peserta berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/tambah-peserta-prolanis", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Peserta baru telah ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: number, nama: string) => {
    Swal.fire({
      title: "Hapus Data?",
      html: `Anda yakin ingin menghapus <b>${nama}</b> dari daftar peserta?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/hapus-peserta-prolanis/${id}`);
          Swal.fire("Terhapus!", "Data peserta berhasil dihapus.", "success");
          fetchData();
        } catch (error) {
          Swal.fire("Gagal", "Terjadi kesalahan saat menghapus data.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6 mt-8">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Daftar Peserta Prolanis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data peserta Hipertensi & Diabetes Mellitus
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama / No BPJS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg transition-all active:scale-95"
          >
            <span>+</span> Tambah Peserta
          </button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Profil Peserta</th>
                <th className="px-6 py-4 font-semibold">Demografi</th>
                <th className="px-6 py-4 font-semibold">Kontak & Alamat</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Diagnosa
                </th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-8 h-8 text-brand-500 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-gray-500 font-medium">
                        Memuat data peserta...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🔍</span>
                      <p className="text-gray-600 font-medium">
                        Peserta tidak ditemukan
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Coba gunakan kata kunci pencarian yang lain.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Profil Pasien */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${getAvatarColor(item.nama)}`}
                        >
                          {getInitials(item.nama)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-base">
                            {item.nama}
                          </p>
                          <p className="text-xs font-mono text-gray-500 mt-0.5">
                            {item.no_bpjs}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Demografi */}
                    <td className="px-6 py-4">
                      <span className="block text-sm text-gray-800 dark:text-gray-200">
                        {item.jenis_kelamin === "Pria" ? "Pria" : "Wanita"}
                      </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Lahir: {item.tanggal_lahir}
                      </span>
                    </td>

                    {/* Kontak & Alamat */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-1 text-gray-700 dark:text-gray-300">
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          ></path>
                        </svg>
                        <span className="text-sm font-medium">
                          {item.no_hp}
                        </span>
                      </div>
                      <span
                        className="block text-xs text-gray-500 max-w-[200px] truncate"
                        title={item.alamat}
                      >
                        {item.alamat}
                      </span>
                    </td>

                    {/* Diagnosa Badges */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider
                        ${
                          item.diagnosa === "Hipertensi"
                            ? "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-transparent"
                            : "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-transparent"
                        }`}
                      >
                        {item.diagnosa === "Hipertensi" ? "❤️ " : "🩸 "}
                        {item.diagnosa}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Edit Data"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Hapus Data"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLS PAGINATION */}
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500 font-medium">
              Menampilkan{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {startIndex + 1}
              </span>{" "}
              -{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.min(startIndex + itemsPerPage, filteredData.length)}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {filteredData.length}
              </span>{" "}
              peserta
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-600 disabled:opacity-50 disabled:hover:text-gray-700 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                &larr; Prev
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-600 disabled:opacity-50 disabled:hover:text-gray-700 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT DENGAN SPLIT LAYOUT */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-4xl p-0 bg-transparent shadow-none border-none"
      >
        <div className="w-full rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
          {/* Panel Kiri: Info/Guide */}
          <div className="hidden md:block w-1/3 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white relative">
            <div className="absolute top-0 right-0 opacity-10">
              <svg
                width="150"
                height="150"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-2">
                  {editId ? "Perbarui" : "Registrasi"} Peserta
                </h3>
                <p className="text-brand-100 text-sm leading-relaxed">
                  Kelengkapan data sangat penting untuk rekam medis elektronik
                  dan pemantauan keberlanjutan program Prolanis.
                </p>
              </div>

              <div className="space-y-4 text-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <h4 className="font-bold text-white mb-2">
                  Panduan Pengisian:
                </h4>
                <div className="flex gap-2 items-start text-brand-50">
                  <span className="mt-0.5">💳</span>
                  <p>
                    <strong>No. BPJS:</strong> Pastikan berisi 13 digit angka
                    valid tanpa spasi.
                  </p>
                </div>
                <div className="flex gap-2 items-start text-brand-50">
                  <span className="mt-0.5">🩺</span>
                  <p>
                    <strong>Diagnosa:</strong> Tentukan sesuai dengan surat
                    rujukan (Hipertensi/Diabetes).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Form */}
          <div className="w-full md:w-2/3 flex flex-col h-full bg-gray-50/30 dark:bg-transparent">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 md:hidden">
                {editId ? "Edit Data" : "Tambah Peserta"}
              </h3>
              <h3 className="hidden md:block text-lg font-bold text-gray-400 uppercase tracking-widest">
                Formulir Pasien
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors dark:hover:bg-gray-700"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form
                id="pesertaForm"
                onSubmit={handleSave}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>
                      Nomor Kartu BPJS <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="no_bpjs"
                      type="number"
                      value={formData.no_bpjs}
                      onChange={handleInputChange}
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.no_bpjs ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      placeholder="13 Digit Angka"
                    />
                    {errors.no_bpjs && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.no_bpjs[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="nama"
                      type="text"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.nama ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      placeholder="Sesuai KTP"
                    />
                    {errors.nama && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.nama[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <Select
                        options={optionJenisKelamin}
                        placeholder="Pilih Kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleSelectChangeJenisKelamin}
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.jenis_kelamin ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      />
                    </div>
                    {errors.jenis_kelamin && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.jenis_kelamin[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <DatePicker
                        id="tanggal_lahir"
                        name="tanggal_lahir"
                        label=""
                        placeholder="Pilih tanggal"
                        value={formData.tanggal_lahir}
                        onChange={handleTanggalLahirChange}
                      />
                    </div>
                    {errors.tanggal_lahir && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.tanggal_lahir[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Nomor WhatsApp / HP</Label>
                    <Input
                      name="no_hp"
                      type="number"
                      value={formData.no_hp}
                      onChange={handleInputChange}
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.no_hp ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      placeholder="08123xxxx"
                    />
                    {errors.no_hp && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.no_hp[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Diagnosa Utama <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-1.5">
                      <Select
                        options={optionsDiagnosa}
                        placeholder="Pilih Diagnosa"
                        value={formData.diagnosa}
                        onChange={handleSelectChangeDiagnosa}
                        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.diagnosa ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      />
                    </div>
                    {errors.diagnosa && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.diagnosa[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Alamat Tempat Tinggal</Label>
                  <Input
                    name="alamat"
                    type="text"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.alamat ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                    placeholder="Nama jalan, RT/RW, Kelurahan..."
                  />
                  {errors.alamat && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">
                      {errors.alamat[0]}
                    </p>
                  )}
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 mt-auto">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="submit"
                form="pesertaForm"
                disabled={isSaving}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
