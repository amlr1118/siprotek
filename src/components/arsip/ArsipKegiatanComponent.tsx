import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ArsipKegiatan() {
  const [arsip, setArsip] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk Search dan Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const navigate = useNavigate();

  // Efek ini akan berjalan setiap kali `currentPage` atau `search` berubah
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArsip(currentPage, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); 
  };

  const fetchArsip = async (page: number, searchQuery: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/arsip-kegiatan?page=${page}&search=${searchQuery}`);
      
      setArsip(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotalData(response.data.total);
    } catch (error) {
      console.error("Gagal mengambil data arsip", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      
      {/* HEADER & PENCARIAN */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Arsip Kegiatan Prolanis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Total <span className="font-bold text-brand-600 dark:text-brand-400">{totalData}</span> riwayat kegiatan telah selesai dan dikunci.
          </p>
        </div>

        <div className="relative w-full sm:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari kegiatan, tanggal, lokasi..."
            value={search}
            onChange={handleSearchChange}
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3 pl-12 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* TABEL DATA ARSIP */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Agenda Kegiatan</th>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 font-semibold text-center">Tingkat Kehadiran</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-brand-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p className="text-gray-500 font-medium">Mencari tumpukan arsip...</p>
                    </div>
                  </td>
                </tr>
              ) : arsip.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">📁</span>
                      <p className="text-gray-600 font-medium">
                        {search ? "Pencarian tidak ditemukan" : "Belum ada arsip kegiatan"}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">Data akan muncul di sini setelah jadwal kegiatan selesai ditutup.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                arsip.map((item) => {
                  const persentase = item.total_peserta_count > 0 
                    ? Math.round((item.hadir_count / item.total_peserta_count) * 100) 
                    : 0;

                  return (
                    <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white text-base">{item.nama_kegiatan}</p>
                        <span className="inline-flex mt-1 items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {item.jenis_kegiatan || 'Program Rutin'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <span className="font-semibold">{item.tanggal}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <span className="font-medium">{item.lokasi}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col w-32 mx-auto">
                          <div className="flex justify-between items-end mb-1">
                            <span className="font-bold text-gray-800 dark:text-white text-sm">
                              {item.hadir_count} / {item.total_peserta_count}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                              {persentase}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden dark:bg-gray-700 shadow-inner">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-500
                                ${persentase >= 80 ? 'bg-emerald-500' : persentase >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${persentase}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/absen/${btoa(item.id.toString())}`)}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-brand-600 bg-white border border-brand-200 shadow-sm hover:bg-brand-50 hover:border-brand-300 active:scale-95 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-brand-400 dark:hover:bg-gray-700"
                        >
                          Lihat Rekap
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- KONTROL PAGINASI --- */}
        {!loading && totalData > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500 font-medium">
              Menampilkan Halaman <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> dari <span className="font-bold text-gray-900 dark:text-white">{lastPage}</span>
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                disabled={currentPage === lastPage}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-600 disabled:opacity-50 disabled:hover:text-gray-700 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}