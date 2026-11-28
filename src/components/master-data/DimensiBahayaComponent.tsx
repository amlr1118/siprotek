import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import api from "../../services/api";

// --- INTERFACES ---
interface DimensiBahayaInput {
  id: number;
  kode_dimensi: string;
  nama_dimensi: string;
  deskripsi_indikator: string;
  relasi_dimensi_bahaya_ke_aturan_k3_count?: number;
}

// --- FUNGSI BANTUAN UI BADGE DIMENSI BAHAYA ---
const getDimensiBadgeColor = (kode: string) => {
  switch (kode.toUpperCase()) {
    case "BIO":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400";
    case "KIM":
      return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400";
    case "FIS":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400";
    case "ERG":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400";
    case "PSI":
      return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400";
    default:
      return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400";
  }
};

export default function DimensiBahayaComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  // --- STATES UTAMA ---
  const [dataList, setDataList] = useState<DimensiBahayaInput[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States (Client-Side)
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE FORM & VALIDASI ---
  const [formData, setFormData] = useState({
    kode_dimensi: "",
    nama_dimensi: "",
    deskripsi_indikator: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dimensi-bahaya");
      setDataList(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Tidak dapat memuat data dimensi bahaya.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- LOGIKA PENCARIAN & PAGINATION (CLIENT-SIDE) ---
  const filteredData = dataList.filter((item) => {
    const keyword = searchQuery.toLowerCase();
    return (
      item.nama_dimensi.toLowerCase().includes(keyword) ||
      item.kode_dimensi.toLowerCase().includes(keyword) ||
      item.deskripsi_indikator.toLowerCase().includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- FUNGSI HANDLE INPUT FORM ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "kode_dimensi" ? value.toUpperCase() : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  // --- HANDLER MODAL AKSI ---
  const handleAdd = () => {
    setEditId(null);
    setFormData({
      kode_dimensi: "",
      nama_dimensi: "",
      deskripsi_indikator: "",
    });
    setErrors({});
    openModal();
  };

  const handleEdit = (item: DimensiBahayaInput) => {
    setEditId(item.id);
    setFormData({
      kode_dimensi: item.kode_dimensi,
      nama_dimensi: item.nama_dimensi,
      deskripsi_indikator: item.deskripsi_indikator,
    });
    setErrors({});
    openModal();
  };

  const handleCloseModal = () => {
    setEditId(null);
    setFormData({
      kode_dimensi: "",
      nama_dimensi: "",
      deskripsi_indikator: "",
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
        await api.put(`/update-dimensi-bahaya/${editId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data dimensi bahaya berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/simpan-dimensi-bahaya", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Dimensi bahaya baru telah ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
        if (error.response.data.message) {
          Swal.fire("Validasi Gagal", error.response.data.message, "warning");
        }
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, namaDimensi: string) => {
    Swal.fire({
      title: "Hapus Dimensi Bahaya?",
      html: `Anda yakin ingin menghapus dimensi <b>${namaDimensi}</b>?`,
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
          await api.delete(`/hapus-dimensi-bahaya/${id}`);
          Swal.fire({
            title: "Terhapus!",
            text: "Dimensi bahaya berhasil dihapus.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchData();
        } catch (error: any) {
          const msg =
            error.response?.data?.message ||
            "Terjadi kesalahan saat menghapus data.";
          Swal.fire("Gagal!", msg, "error");
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
            Manajemen Dimensi Bahaya
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola 5 dimensi faktor risiko kecelakaan kerja (Biologis, Kimia, Fisik, Ergonomi, Psikososial).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-72 group">
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
              placeholder="Cari kode, nama, atau indikator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg transition-all active:scale-95"
          >
            <span>+</span> Tambah Dimensi
          </button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Kode Dimensi</th>
                <th className="px-6 py-4 font-semibold">Nama Dimensi Bahaya</th>
                <th className="px-6 py-4 font-semibold">Deskripsi Indikator</th>
                <th className="px-6 py-4 font-semibold">Jumlah Aturan</th>
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
                        Memuat data dimensi bahaya...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">⚠️</span>
                      <p className="text-gray-600 font-medium">
                        Dimensi Bahaya Kosong
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Tidak ada data dimensi bahaya yang sesuai dengan pencarian Anda.
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
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider border ${getDimensiBadgeColor(item.kode_dimensi)}`}
                      >
                        {item.kode_dimensi}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-base">
                        {item.nama_dimensi}
                      </p>
                    </td>

                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.deskripsi_indikator}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {item.relasi_dimensi_bahaya_ke_aturan_k3_count ?? 0} Aturan K3
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Edit Dimensi Bahaya"
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
                          onClick={() => handleDelete(item.id, item.nama_dimensi)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Hapus Dimensi Bahaya"
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
              dimensi bahaya
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

      {/* --- MODAL FORM DENGAN SPLIT LAYOUT --- */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-4xl p-0 bg-transparent shadow-none border-none"
      >
        <div className="w-full rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col md:flex-row h-auto md:max-h-[90vh] overflow-hidden">
          {/* Panel Kiri: Info/Guide */}
          <div className="hidden md:block w-1/3 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white relative shrink-0">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-2">
                  {editId ? "Ubah Data" : "Tambah"} Dimensi Bahaya
                </h3>
                <p className="text-brand-100 text-sm leading-relaxed">
                  Dimensi bahaya mengelompokkan indikator risiko kerja ke dalam
                  5 tab input pada formulir penilaian K3RS SIPROTEK.
                </p>
              </div>

              <div className="space-y-4 text-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 mt-8">
                <h4 className="font-bold text-white mb-2">
                  Standar Kode Dimensi:
                </h4>
                <div className="space-y-1.5 text-brand-50 text-xs">
                  <p>
                    • <strong>BIO:</strong> Biologis (APD, benda tajam, limbah)
                  </p>
                  <p>
                    • <strong>KIM:</strong> Kimia (MSDS, disinfektan, gas)
                  </p>
                  <p>
                    • <strong>FIS:</strong> Fisik (APAR, listrik, kebisingan)
                  </p>
                  <p>
                    • <strong>ERG:</strong> Ergonomi (postur, angkat manual)
                  </p>
                  <p>
                    • <strong>PSI:</strong> Psikososial (beban kerja, kekerasan)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Form */}
          <div className="w-full md:w-2/3 flex flex-col h-full bg-gray-50/30 dark:bg-transparent max-h-[90vh]">
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 md:hidden">
                {editId ? "Edit Dimensi Bahaya" : "Tambah Dimensi Bahaya"}
              </h3>
              <h3 className="hidden md:block text-lg font-bold text-gray-400 uppercase tracking-widest">
                Klasifikasi &amp; Indikator Dimensi
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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form
                id="dimensiBahayaForm"
                onSubmit={handleSave}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Kode Dimensi <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="kode_dimensi"
                      type="text"
                      value={formData.kode_dimensi}
                      onChange={handleInputChange}
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.kode_dimensi ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      placeholder="Contoh: BIO, KIM, FIS"
                    />
                    {errors.kode_dimensi && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.kode_dimensi[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Nama Dimensi Bahaya{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="nama_dimensi"
                      type="text"
                      value={formData.nama_dimensi}
                      onChange={handleInputChange}
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.nama_dimensi ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      placeholder="Contoh: Biologis"
                    />
                    {errors.nama_dimensi && (
                      <p className="mt-1.5 text-xs font-semibold text-red-500">
                        {errors.nama_dimensi[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Deskripsi Indikator <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="deskripsi_indikator"
                    rows={3}
                    maxLength={255}
                    value={formData.deskripsi_indikator}
                    onChange={handleInputChange}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.deskripsi_indikator ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                    placeholder="Contoh: Ketersediaan APD, fasilitas cuci tangan, safety box, spill kit, limbah infeksius, dan kewaspadaan standar."
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>
                      {errors.deskripsi_indikator ? (
                        <span className="font-semibold text-red-500">
                          {errors.deskripsi_indikator[0]}
                        </span>
                      ) : (
                        "Maksimal 255 karakter sesuai struktur kolom database."
                      )}
                    </span>
                    <span>{formData.deskripsi_indikator.length}/255</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 mt-auto">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="submit"
                form="dimensiBahayaForm"
                disabled={isSaving}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSaving
                  ? "Menyimpan..."
                  : editId
                    ? "Simpan Perubahan"
                    : "Simpan Dimensi"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}