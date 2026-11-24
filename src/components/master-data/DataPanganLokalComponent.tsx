import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Sesuaikan path dengan konfigurasi Anda
import Swal from "sweetalert2";

// --- INTERFACES ---
interface PanganLokal {
  id: number;
  nama_pangan: string;
  kategori: string;
  kalori_per_100g: number;
  karbo_per_100g: number;
  satuan_porsi: string;
  berat_per_porsi: number;
  index_glikemik: string;
}

export default function DataPanganLokalComponent() {
  // --- STATES ---
  const [dataList, setDataList] = useState<PanganLokal[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    nama_pangan: "",
    kategori: "",
    kalori_per_100g: "",
    karbo_per_100g: "",
    satuan_porsi: "",
    berat_per_porsi: "",
    index_glikemik: "",
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pangan-lokal");
      setDataList(res.data.data);
    } catch (error) {
      Swal.fire("Gagal", "Tidak dapat memuat data pangan lokal.", "error");
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

  // --- LOGIKA PENCARIAN & PAGINATION ---
  const filteredData = dataList.filter(
    (item) =>
      item.nama_pangan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // --- HANDLERS MODAL & FORM ---
  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      nama_pangan: "",
      kategori: "",
      kalori_per_100g: "",
      karbo_per_100g: "",
      satuan_porsi: "",
      berat_per_porsi: "",
      index_glikemik: "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: PanganLokal) => {
    setIsEditMode(true);
    setSelectedId(item.id);
    setFormData({
      nama_pangan: item.nama_pangan,
      kategori: item.kategori,
      kalori_per_100g: item.kalori_per_100g.toString(),
      karbo_per_100g: item.karbo_per_100g.toString(),
      satuan_porsi: item.satuan_porsi,
      berat_per_porsi: item.berat_per_porsi.toString(),
      index_glikemik: item.index_glikemik,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (isEditMode && selectedId) {
        await api.put(`/pangan-lokal/${selectedId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data pangan berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/pangan-lokal", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data pangan baru telah ditambahkan.",
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
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number, nama: string) => {
    Swal.fire({
      title: "Hapus Data?",
      html: `Anda yakin ingin menghapus <b>${nama}</b> dari daftar katalog?`,
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
          await api.delete(`/pangan-lokal/${id}`);
          Swal.fire("Terhapus!", "Data berhasil dihapus dari sistem.", "success");
          fetchData();
        } catch (error) {
          Swal.fire("Gagal", "Tidak dapat menghapus data.", "error");
        }
      }
    });
  };

  // --- HELPER UNTUK BADGE KATEGORI ---
  const getCategoryBadge = (kategori: string) => {
    switch (kategori) {
      case "Karbohidrat": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Protein Hewani": return "bg-red-100 text-red-700 border-red-200";
      case "Protein Nabati": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Sayuran": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Buah-buahan": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-6 mt-8">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Katalog Pangan Lokal
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Database nilai gizi dan kalori makanan daerah
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Cari makanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg transition-all active:scale-95"
          >
            <span>+</span> Tambah Pangan
          </button>
        </div>
      </div>

      {/* TABEL DATA PANGAN */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Bahan Pangan</th>
                <th className="px-6 py-4 font-semibold">Kategori</th>
                <th className="px-6 py-4 font-semibold">Kandungan Gizi (per 100g)</th>
                <th className="px-6 py-4 font-semibold">Porsi Standar</th>
                <th className="px-6 py-4 font-semibold text-center">Status IG</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-brand-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p className="text-gray-500 font-medium">Memuat katalog gizi...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🥬</span>
                      <p className="text-gray-600 font-medium">Katalog Kosong</p>
                      <p className="text-gray-400 text-sm mt-1">Tidak ada data pangan yang sesuai dengan pencarian.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-base">{item.nama_pangan}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getCategoryBadge(item.kategori)}`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-max dark:bg-orange-500/10 dark:text-orange-400">🔥 {item.kalori_per_100g} Kcal</span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-max dark:bg-blue-500/10 dark:text-blue-400">🌾 {item.karbo_per_100g}g Karbo</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200">1</span>
                        <span className="text-sm font-medium text-gray-500">{item.satuan_porsi}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Setara {item.berat_per_porsi} gram</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm
                        ${item.index_glikemik === "Rendah" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : item.index_glikemik === "Sedang" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}
                      >
                        {item.index_glikemik === "Rendah" ? "🍃" : item.index_glikemik === "Sedang" ? "⚠️" : "🚨"} {item.index_glikemik}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Edit Data"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_pangan)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Hapus Data"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-gray-900 dark:text-white">{filteredData.length}</span> bahan pangan
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-gray-800 flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
            
            {/* Panel Kiri: Info/Guide */}
            <div className="hidden md:block w-1/3 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white relative">
              <div className="absolute top-0 right-0 opacity-10">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black mb-2">{isEditMode ? "Perbarui" : "Tambah"} Pangan</h3>
                  <p className="text-brand-100 text-sm leading-relaxed">
                    Pastikan data kalori dan Indeks Glikemik akurat, karena data ini akan digunakan oleh <strong className="text-white">Algoritma AI</strong> untuk menyusun diet pasien Prolanis.
                  </p>
                </div>
                
                <div className="space-y-4 text-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <h4 className="font-bold text-white mb-2">Panduan Pengisian:</h4>
                  <div className="flex gap-2 items-start text-brand-50">
                    <span className="mt-0.5">🔥</span>
                    <p><strong>Kalori:</strong> Diukur dalam satuan 100 gram bahan mentah/matang.</p>
                  </div>
                  <div className="flex gap-2 items-start text-brand-50">
                    <span className="mt-0.5">⚖️</span>
                    <p><strong>Porsi Standar:</strong> Satuan umum saat dikonsumsi (Cth: 1 piring = 150g).</p>
                  </div>
                  <div className="flex gap-2 items-start text-brand-50">
                    <span className="mt-0.5">⚠️</span>
                    <p><strong>Indeks Glikemik:</strong><br/>Rendah (&lt;55), Sedang (55-69), Tinggi (&ge;70).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Kanan: Form */}
            <div className="w-full md:w-2/3 flex flex-col h-full bg-gray-50/30 dark:bg-transparent">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 md:hidden">
                  {isEditMode ? "Edit Data" : "Tambah Pangan"}
                </h3>
                <h3 className="hidden md:block text-lg font-bold text-gray-400 uppercase tracking-widest">
                  Formulir Data
                </h3>
                <button onClick={closeModal} className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors dark:hover:bg-gray-700">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form id="panganForm" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Nama Pangan <span className="text-red-500">*</span></label>
                      <input type="text" name="nama_pangan" value={formData.nama_pangan} onChange={handleInputChange} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Cth: Nasi Putih, Jagung Rebus" />
                      {errors.nama_pangan && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.nama_pangan[0]}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Kategori <span className="text-red-500">*</span></label>
                      <select name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="">Pilih Kategori...</option>
                        <option value="Karbohidrat">Karbohidrat</option>
                        <option value="Protein Hewani">Protein Hewani</option>
                        <option value="Protein Nabati">Protein Nabati</option>
                        <option value="Sayuran">Sayuran</option>
                        <option value="Buah-buahan">Buah-buahan</option>
                        <option value="Camilan">Camilan</option>
                      </select>
                      {errors.kategori && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.kategori[0]}</p>}
                    </div>
                  </div>

                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-500 mb-3">Nilai Gizi per 100 gram</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="relative">
                        <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Kalori</label>
                        <input type="number" step="0.1" name="kalori_per_100g" value={formData.kalori_per_100g} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="0" />
                        <span className="absolute right-3 top-[28px] text-xs font-bold text-gray-400">kcal</span>
                        {errors.kalori_per_100g && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.kalori_per_100g[0]}</p>}
                      </div>
                      <div className="relative">
                        <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">Karbohidrat</label>
                        <input type="number" step="0.1" name="karbo_per_100g" value={formData.karbo_per_100g} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="0" />
                        <span className="absolute right-3 top-[28px] text-xs font-bold text-gray-400">g</span>
                        {errors.karbo_per_100g && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.karbo_per_100g[0]}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Satuan Porsi</label>
                      <input type="text" name="satuan_porsi" value={formData.satuan_porsi} onChange={handleInputChange} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Cth: piring, mangkuk, buah" />
                      {errors.satuan_porsi && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.satuan_porsi[0]}</p>}
                    </div>
                    <div className="relative">
                      <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Berat 1 Porsi Standar</label>
                      <input type="number" name="berat_per_porsi" value={formData.berat_per_porsi} onChange={handleInputChange} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-14 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white" placeholder="Cth: 150" />
                      <span className="absolute right-4 top-[36px] text-sm font-bold text-gray-400">gram</span>
                      {errors.berat_per_porsi && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.berat_per_porsi[0]}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-gray-300">Kategori Indeks Glikemik (IG) <span className="text-red-500">*</span></label>
                    <select name="index_glikemik" value={formData.index_glikemik} onChange={handleInputChange} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      <option value="">Pilih Kategori IG...</option>
                      <option value="Rendah">🍃 Rendah ( &lt; 55 )</option>
                      <option value="Sedang">⚠️ Sedang ( 55 - 69 )</option>
                      <option value="Tinggi">🚨 Tinggi ( &ge; 70 )</option>
                    </select>
                    {errors.index_glikemik && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.index_glikemik[0]}</p>}
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 mt-auto">
                <button type="button" onClick={closeModal} className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Batal
                </button>
                <button type="submit" form="panganForm" disabled={isSubmitting} className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}