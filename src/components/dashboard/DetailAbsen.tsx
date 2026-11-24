import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Swal from "sweetalert2";

interface JadwalInfo {
  id: number;
  nama_kegiatan: string;
  tanggal: string;
  lokasi: string;
  status: string; 
}

interface Peserta {
  id: number;
  nama: string;
  no_bpjs: string;
  diagnosa: string;
  relasike_absen: { status_kehadiran: boolean | number }[];
}

// --- FUNGSI BANTUAN UI AVATAR ---
const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
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

export default function DetailAbsen() {
  const { kegiatanId } = useParams();
  const navigate = useNavigate();

  const [jadwal, setJadwal] = useState<JadwalInfo | null>(null);
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (kegiatanId) {
      fetchData();
    }
  }, [kegiatanId]);

  const fetchData = async () => {
    try {
      const realId = atob(kegiatanId as string);
      const response = await api.get(`/get-peserta-absensi/${realId}`);
      setJadwal(response.data.jadwal);
      setPeserta(response.data.data_peserta);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat data absensi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelesaiKegiatan = () => {
    Swal.fire({
      title: "Peringatan Kritis!",
      html: `
        <div class="text-left text-sm space-y-3">
          <p>Apakah Anda yakin ingin menutup dan <b>mengunci</b> kegiatan ini?</p>
          <div class="bg-red-50 p-3 rounded-lg border border-red-100">
            <p class="text-red-700 font-semibold flex items-center gap-2">
              <span>⚠️</span> Masih ada ${jumlahAlpa} peserta yang Alpa.
            </p>
            <p class="text-red-600 mt-1 text-xs">Jika ditutup, rekap absensi akan permanen dan tidak bisa diubah lagi.</p>
          </div>
          <p class="pt-2">Ketik kata <strong>TUTUP</strong> untuk mengonfirmasi:</p>
        </div>
      `,
      icon: "warning",
      input: "text",
      inputPlaceholder: "Ketik TUTUP di sini...",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", 
      cancelButtonColor: "#6b7280", 
      confirmButtonText: "Kunci & Selesaikan",
      cancelButtonText: "Batal",
      preConfirm: (inputValue) => {
        if (inputValue !== "TUTUP") {
          Swal.showValidationMessage(
            "Anda harus mengetik kata TUTUP (huruf besar) dengan benar!",
          );
          return false; 
        }
        return true;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const realId = atob(kegiatanId as string);
          await api.put(`/update-status-kegiatan/${realId}`, {
            status: "2",
            is_active: false,
          });

          Swal.fire({
            icon: "success",
            title: "Terkunci!",
            text: "Kegiatan selesai. Rekap absensi telah dikunci.",
            timer: 2000,
            showConfirmButton: false
          });

          navigate("/jadwal-kegiatan");
        } catch (error) {
          console.error("Gagal menutup kegiatan", error);
          Swal.fire("Gagal", "Terjadi kesalahan saat menutup kegiatan.", "error");
        }
      }
    });
  };

  const handleToggleKehadiran = async (pesertaId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic UI Update (Ubah UI duluan agar terasa cepat)
    setPeserta((prevPeserta) =>
      prevPeserta.map((p) => {
        if (p.id === pesertaId) {
          return { ...p, relasike_absen: [{ status_kehadiran: newStatus }] };
        }
        return p;
      })
    );

    try {
      const realId = atob(kegiatanId as string);
      await api.post("/upsert-absensi", {
        kegiatanid: parseInt(realId),
        pesertaid: pesertaId,
        status_kehadiran: newStatus ? 1 : 0,
      });
    } catch (error) {
      console.error("Gagal update absensi", error);
      Swal.fire("Gagal", "Koneksi terputus, data gagal tersimpan.", "error");
      
      // Rollback UI jika gagal
      setPeserta((prevPeserta) =>
        prevPeserta.map((p) => {
          if (p.id === pesertaId) {
            return { ...p, relasike_absen: [{ status_kehadiran: currentStatus }] };
          }
          return p;
        })
      );
    }
  };

  const filteredPeserta = peserta.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.no_bpjs.includes(search),
  );

  // --- LOGIKA HITUNG STATISTIK ---
  const totalPeserta = peserta.length;
  const jumlahHadir = peserta.filter((p) => {
    const dataAbsensi = p.relasike_absen || [];
    return (
      dataAbsensi.length > 0 &&
      (dataAbsensi[0].status_kehadiran === true ||
        Number(dataAbsensi[0].status_kehadiran) === 1)
    );
  }).length;
  const jumlahAlpa = totalPeserta - jumlahHadir;
  const isArsip = jadwal?.status === "2";

  return (
    <div className="space-y-6 mt-6">
      
      {/* HEADER CARD & MINI STATS */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-50 rounded-full opacity-50 dark:bg-brand-500/10"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="flex-1">
            <button
              onClick={() => navigate("/jadwal-kegiatan")}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 mb-3 transition-colors dark:text-gray-400 dark:hover:text-brand-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Kembali ke Jadwal
            </button>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white/90">
              {jadwal?.nama_kegiatan || "Memuat Kegiatan..."}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                📅 {jadwal?.tanggal}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                📍 {jadwal?.lokasi}
              </span>
              {isArsip && (
                <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md font-bold text-gray-500 border border-gray-200">
                  🔒 Selesai & Terkunci
                </span>
              )}
            </div>
          </div>

          {!isArsip && (
            <div className="shrink-0">
              <button
                onClick={handleSelesaiKegiatan}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Tutup & Selesaikan Kegiatan
              </button>
            </div>
          )}
        </div>

        {/* Mini Widget Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 relative z-10">
          <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600/70 uppercase tracking-wider dark:text-blue-400/70">Total Peserta</p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{totalPeserta}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/50">👥</div>
          </div>
          <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider dark:text-emerald-400/70">Hadir</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{jumlahHadir}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-900/50">✅</div>
          </div>
          <div className="rounded-xl bg-rose-50/50 p-4 border border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600/70 uppercase tracking-wider dark:text-rose-400/70">Belum Hadir / Alpa</p>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{jumlahAlpa}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 dark:bg-rose-900/50">⏳</div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full group">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input
          type="text"
          placeholder="Cari nama peserta atau No. BPJS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-14 pr-6 text-sm font-medium text-gray-700 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* TABEL PASIEN */}
      <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900 ${isArsip ? 'opacity-90' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Profil Pasien</th>
                <th className="px-6 py-4 font-semibold">Diagnosa</th>
                <th className="px-6 py-4 font-semibold text-center w-48">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-brand-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p className="text-gray-500 font-medium">Memuat data peserta...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPeserta.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🔍</span>
                      <p className="text-gray-600 font-medium">Peserta tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPeserta.map((p) => {
                  const dataAbsensi = p.relasike_absen || [];
                  const isHadir =
                    dataAbsensi.length > 0
                      ? dataAbsensi[0].status_kehadiran === true ||
                        Number(dataAbsensi[0].status_kehadiran) === 1
                      : false;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Kolom Profil */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${getAvatarColor(p.nama)}`}>
                            {getInitials(p.nama)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-base">{p.nama}</p>
                            <p className="text-xs font-mono text-gray-500 mt-0.5">{p.no_bpjs}</p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Diagnosa */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {p.diagnosa}
                        </span>
                      </td>

                      {/* Kolom Tombol Toggle */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleKehadiran(p.id, isHadir)}
                          disabled={isArsip}
                          className={`relative inline-flex w-32 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 
                            ${isArsip
                              ? isHadir
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed dark:bg-emerald-900/10 dark:border-emerald-800" 
                                : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700" 
                              : isHadir
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95" 
                                : "bg-white text-gray-500 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 dark:bg-transparent dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600" 
                            }`}
                        >
                          {isHadir ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                              HADIR
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                              ALPA
                            </>
                          )}
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
    </div>
  );
}