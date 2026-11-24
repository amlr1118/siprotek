//import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

// Import Widget (Sesuaikan path-nya)
import WidgetStatistikApotek from "../widget/WidgetStatistikApotek"

// --- INTERFACES ---
interface Peserta {
  id: number;
  no_bpjs: string;
  nama: string;
}

interface Obat {
  id: number;
  nama_obat: string;
  dosis: string;
  jumlah: number;
  keterangan: string;
  status_tebus: number;
}

interface AntreanApotek {
  id: number; 
  status_apotek_selesai: boolean; 
  peserta: Peserta; 
  daftar_obat: Obat[]; // Relasi baru sesuai model
}

// --- FUNGSI BANTUAN UI ---
const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
const getAvatarColor = (name: string) => {
  const colors = ["bg-purple-100 text-purple-600", "bg-fuchsia-100 text-fuchsia-600", "bg-violet-100 text-violet-600", "bg-indigo-100 text-indigo-600"];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function ApotekComponent() {
  const [antreanList, setAntreanList] = useState<AntreanApotek[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [refreshWidget, setRefreshWidget] = useState(0);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPasien, setSelectedPasien] = useState<AntreanApotek | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  const fetchAntrean = async () => {
    try {
      const response = await api.get("/apotek/antrean");
      setAntreanList(response.data.data || []);
      setRefreshWidget((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAntrean();
    const interval = setInterval(fetchAntrean, 15000); // Real-time 15 detik
    return () => clearInterval(interval);
  }, []);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  // --- LOKIGA SEARCH & PAGINATION ---
  const filteredData = antreanList.filter((item) => {
    const nama = item.peserta?.nama?.toLowerCase() || "";
    const bpjs = item.peserta?.no_bpjs || "";
    return nama.includes(searchQuery.toLowerCase()) || bpjs.includes(searchQuery);
  });

  //const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // --- HANDLER MODAL ---
  const openModal = (item: AntreanApotek) => {
    setSelectedPasien(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPasien(null);
    setIsModalOpen(false);
  };

  const handleTandaiSelesai = async () => {
    if (!selectedPasien) return;
    setIsSubmitting(true);
    try {
      await api.post(`/apotek/selesai/${selectedPasien.id}`);
      Swal.fire({
        icon: "success",
        title: "Obat Diserahkan!",
        text: "Seluruh item obat telah ditandai selesai.",
        timer: 1500,
        showConfirmButton: false,
      });
      closeModal();
      fetchAntrean();
    } catch (error) {
      Swal.fire("Gagal", "Terjadi kesalahan sistem.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      
      {/* WIDGET APOTEK */}
      <WidgetStatistikApotek refreshTrigger={refreshWidget} />

      {/* HEADER & PENCARIAN */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-10 -mt-10 dark:bg-purple-500/10"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Apotek / Farmasi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Penyiapan dan penyerahan obat berdasarkan instruksi Dokter.
          </p>
        </div>

        <div className="relative w-full sm:w-80 group z-10">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            type="text"
            placeholder="Cari pasien atau No BPJS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* TABEL ANTREAN APOTEK */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-purple-50/50 border-b border-gray-100 text-gray-700 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Identitas Pasien</th>
                <th className="px-6 py-4 font-semibold">Item Resep</th>
                <th className="px-6 py-4 font-semibold text-center">Status Transaksi</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-purple-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p className="text-gray-500 font-medium">Mengecek keranjang resep...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">💊</span>
                      <p className="text-gray-600 font-medium">Antrean Apotek Kosong</p>
                      <p className="text-gray-400 text-sm mt-1">Belum ada resep masuk dari dokter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isSelesai = item.status_apotek_selesai;

                  return (
                    <tr key={item.id} className="group hover:bg-purple-50/30 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${getAvatarColor(item.peserta?.nama || "A")}`}>
                            {getInitials(item.peserta?.nama || "A")}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-base">{item.peserta?.nama}</p>
                            <p className="text-xs font-mono text-gray-500 mt-0.5">BPJS: {item.peserta?.no_bpjs}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          <span className="text-purple-600 dark:text-purple-400">{item.daftar_obat?.length || 0}</span> Macam Obat
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm
                          ${isSelesai ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}
                        >
                          {!isSelesai && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>}
                          {isSelesai ? "Selesai Diberikan" : "Menunggu Disiapkan"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(item)}
                          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-95
                            ${isSelesai
                              ? "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                              : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-purple-500/30"
                            }`}
                        >
                          {isSelesai ? "Lihat Resep" : "Buka Resep Obat"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL SPLIT LAYOUT APOTEKER --- */}
      {isModalOpen && selectedPasien && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-gray-800 flex flex-col md:flex-row h-auto md:max-h-[90vh] overflow-hidden">
            
            {/* Panel Kiri: Panduan */}
            <div className="hidden md:block w-1/3 bg-gradient-to-br from-purple-600 to-indigo-800 p-8 text-white relative shrink-0">
              <div className="absolute top-0 right-0 opacity-10">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M21 5h-2.58a2.001 2.001 0 00-1.52-.7A2.001 2.001 0 0015.38 5H3v2h2v12h14V7h2V5zm-8 12v-3h-2v3H8v-2h3v-3h2v3h3v2h-3z" /></svg>
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black mb-2">Penyiapan Obat</h3>
                  <p className="text-purple-100 text-sm leading-relaxed">Pastikan membaca instruksi resep dokter dengan teliti sebelum menyerahkan obat.</p>
                </div>
                
                <div className="space-y-4 text-sm bg-black/20 p-5 rounded-2xl backdrop-blur-sm border border-white/10 mt-8">
                  <h4 className="font-bold text-white mb-3">5 Benar Obat:</h4>
                  <ul className="space-y-2 text-purple-50 font-medium">
                    <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Benar Pasien</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Benar Obat</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Benar Dosis</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Benar Cara</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-300">✓</span> Benar Waktu</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Panel Kanan: Rincian Resep */}
            <div className="w-full md:w-2/3 flex flex-col h-full bg-gray-50/30 dark:bg-transparent max-h-[90vh]">
              <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 md:hidden">Rincian Resep</h3>
                <h3 className="hidden md:block text-lg font-bold text-gray-400 uppercase tracking-widest">Lembar Resep Elektronik</h3>
                <button onClick={closeModal} className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                {/* Identitas Pasien */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-lg shadow-sm ${getAvatarColor(selectedPasien.peserta?.nama || "A")}`}>
                    {getInitials(selectedPasien.peserta?.nama || "A")}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">{selectedPasien.peserta?.nama}</h4>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold dark:bg-gray-700 dark:text-gray-300">BPJS: {selectedPasien.peserta?.no_bpjs}</span>
                  </div>
                </div>

                {/* List Daftar Obat yang Diresepkan */}
                <div>
                  <h4 className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"><span>💊</span> Daftar Obat Diresepkan</h4>
                  <div className="space-y-3">
                    {selectedPasien.daftar_obat?.length > 0 ? (
                      selectedPasien.daftar_obat.map((obat, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-purple-900 text-base dark:text-purple-300">{obat.nama_obat}</h5>
                            <span className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs font-bold dark:bg-purple-800 dark:text-purple-200">
                              {obat.jumlah} item
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Dosis / Aturan Pakai</p>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{obat.dosis}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Catatan Tambahan</p>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{obat.keterangan || "-"}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 dark:bg-gray-800/50 dark:border-gray-700">
                        <p className="text-gray-500 font-medium">Tidak ada rincian obat ditemukan.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 mt-auto">
                <button type="button" onClick={closeModal} className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">Tutup</button>
                {!selectedPasien.status_apotek_selesai && (
                  <button onClick={handleTandaiSelesai} disabled={isSubmitting || selectedPasien.daftar_obat?.length === 0} className="rounded-xl bg-purple-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-purple-700 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting ? "Memproses..." : "Tandai Obat Diserahkan"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}