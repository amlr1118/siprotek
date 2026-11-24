// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useModal } from "../../hooks/useModal"; // Pastikan path ini sesuai dengan project Anda
import { Modal } from "../ui/modal";

interface PasienHomeVisit {
  id: number;
  nama: string;
  no_bpjs: string;
  no_hp: string;
}

interface HomeVisitStats {
  total_home_visit: number;
  daftar_pasien: PasienHomeVisit[];
}

const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

export default function WidgetHomeVisit() {
  const [stats, setStats] = useState<HomeVisitStats>({ total_home_visit: 0, daftar_pasien: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");

  // Menggunakan custom hook Modal Anda
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/admin/home-visit");
      setStats(response.data);
    } catch (error) {
      console.error("Gagal memuat data home visit", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter pencarian di dalam Modal
  const filteredPasien = stats.daftar_pasien.filter(
    (p) => p.nama.toLowerCase().includes(search.toLowerCase()) || p.no_bpjs.includes(search)
  );

  if (loading) {
    return <div className="h-32 w-full rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>;
  }

  return (
    <>
      {/* --- TAMPILAN WIDGET AMAN (HIJAU) --- */}
      {stats.total_home_visit === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group flex flex-col justify-between h-full">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 dark:bg-emerald-500/10"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Home Visit</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">Aman</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 text-xl">
              🛡️
            </div>
          </div>
          <div className="relative z-10 mt-auto pt-4">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg block text-center dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
              Tidak ada pasien drop-out
            </span>
          </div>
        </div>
      ) : (
        /* --- TAMPILAN WIDGET PERINGATAN (MERAH) --- */
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm dark:border-rose-900/50 dark:bg-rose-900/10 relative overflow-hidden group flex flex-col justify-between h-full">
          <span className="absolute top-5 right-5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
          </span>

          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-100 rounded-full opacity-50 dark:bg-rose-500/10"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider pr-4">Perlu Kunjungan</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <h3 className="text-3xl font-black text-rose-700 dark:text-rose-500">
                  {stats.total_home_visit}
                </h3>
                <span className="text-sm font-bold text-rose-600">Pasien</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-4">
            <button 
              onClick={openModal} // Buka Modal Elegan
              className="w-full flex items-center justify-center gap-2 bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-500/20"
            >
              Lihat Data Lengkap
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL TABEL HOME VISIT --- */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-5xl p-0 bg-transparent shadow-none border-none"
      >
        <div className="w-full rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col h-[85vh] overflow-hidden border dark:border-gray-800">
          
          {/* Header Modal */}
          <div className="shrink-0 bg-gradient-to-r from-rose-600 to-red-700 p-6 flex items-center justify-between text-white">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="bg-white/20 p-2 rounded-xl">🚑</span> 
                Daftar Kunjungan Rumah (Home Visit)
              </h2>
              <p className="text-rose-100 text-sm mt-1">Daftar peserta Prolanis yang mangkir 3 bulan berturut-turut.</p>
            </div>
            <button onClick={closeModal} className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Body: Search & Table */}
          <div className="flex-1 flex flex-col p-6 bg-gray-50/50 dark:bg-gray-900 overflow-hidden">
            
            {/* Search Bar & Action */}
            <div className="flex justify-between items-center gap-4 mb-4 shrink-0">
              <div className="relative w-full md:w-96 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input
                  type="text"
                  placeholder="Cari pasien atau No BPJS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              {/* Tombol Cetak Dummy (Sangat bagus untuk UX, bisa dikembangkan nanti) */}
              {/* <button className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Cetak Surat Tugas
              </button> */}
            </div>

            {/* Container Tabel (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10 dark:bg-gray-800 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Identitas Pasien</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Kontak</th>
                    <th className="px-6 py-4 font-semibold text-center text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredPasien.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-16 text-center text-gray-500">Data pasien tidak ditemukan.</td>
                    </tr>
                  ) : (
                    filteredPasien.map((item) => (
                      <tr key={item.id} className="hover:bg-rose-50/30 transition-colors dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold shadow-sm">
                              {getInitials(item.nama)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-base">{item.nama}</p>
                              <p className="text-xs font-mono text-gray-500 mt-0.5">BPJS: {item.no_bpjs}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span className="font-medium">{item.no_hp || "Tidak ada nomor"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wider dark:bg-rose-500/20 dark:text-rose-400 dark:border-transparent">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                            Wajib Dikunjungi
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </Modal>
    </>
  );
}