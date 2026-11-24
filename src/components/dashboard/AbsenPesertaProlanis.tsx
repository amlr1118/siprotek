import { useEffect, useState } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// Pastikan Anda memanggil widget yang sudah kita edit di atas
import WidgetStatistikJadwal from "../widget/KaderWidget"; 

interface JadwalKegiatan {
  id: number;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  tanggal: string;
  lokasi: string;
  status: string;
  is_active: boolean; 
}

export default function AbsenPesertaProlanis() {
  const [jadwal, setJadwal] = useState<JadwalKegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getJadwal();
  }, []);

  const getJadwal = async () => {
    try {
      const response = await api.get("/jadwal-kegiatan-aktif");
      setJadwal(response.data.data);
    } catch (error) {
      console.error("Gagal memuat jadwal", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (item: JadwalKegiatan) => {
    if (item.status === "1") {
      const stringId = item.id.toString();
      const encryptedId = btoa(stringId); 
      navigate(`/absen/${encryptedId}`);
      return;
    }

    Swal.fire({
      title: "Mulai Kegiatan?",
      html: `Anda akan mengaktifkan absensi dan membuka antrean pemeriksaan untuk <br/><b>${item.nama_kegiatan}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb", // brand-600
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Ya, Mulai Sekarang!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/update-status-kegiatan/${item.id}`, {
            status: "1",
            is_active: true, 
          });

          Swal.fire({
            icon: "success",
            title: "Kegiatan Aktif!",
            text: "Silakan lanjutkan ke tahap absensi peserta.",
            timer: 2000,
            showConfirmButton: false,
          });

          getJadwal();
        } catch (error) {
          console.error(error);
          Swal.fire("Gagal!", "Terjadi kesalahan saat memulai kegiatan.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* WIDGET STATISTIK */}
      <WidgetStatistikJadwal />

      {/* HEADER & PENCARIAN (Opsional, untuk konsistensi desain) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Jadwal Kegiatan Prolanis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manajemen agenda senam, edukasi, dan pemeriksaan
          </p>
        </div>
      </div>

      {/* TABEL JADWAL */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama & Jenis Kegiatan</th>
                <th className="px-6 py-4 font-semibold">Tanggal & Waktu</th>
                <th className="px-6 py-4 font-semibold">Lokasi Pelaksanaan</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-brand-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <p className="text-gray-500 font-medium">Memuat jadwal kegiatan...</p>
                    </div>
                  </td>
                </tr>
              ) : jadwal.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">📅</span>
                      <p className="text-gray-600 font-medium">Belum ada agenda</p>
                      <p className="text-gray-400 text-sm mt-1">Tidak ada jadwal kegiatan yang direncanakan dalam waktu dekat.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                jadwal.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Kolom 1: Nama & Jenis */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-base">{item.nama_kegiatan}</p>
                      <span className="inline-flex mt-1 items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {item.jenis_kegiatan}
                      </span>
                    </td>

                    {/* Kolom 2: Tanggal */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-500 bg-brand-50 p-1.5 rounded-md dark:bg-brand-500/10">📅</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.tanggal}</span>
                      </div>
                    </td>

                    {/* Kolom 3: Lokasi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-500 bg-red-50 p-1.5 rounded-md dark:bg-red-500/10">📍</span>
                        <span className="font-medium text-gray-600 dark:text-gray-400">{item.lokasi}</span>
                      </div>
                    </td>

                    {/* Kolom 4: Status Badges */}
                    <td className="px-6 py-4 text-center">
                      {item.status === "0" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                          Menunggu
                        </span>
                      ) : item.status === "1" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Sedang Berlangsung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Selesai
                        </span>
                      )}
                    </td>

                    {/* Kolom 5: Aksi (Absen/Mulai) */}
                    <td className="px-6 py-4 text-right">
                      {item.status === "2" ? (
                        <span className="text-sm text-gray-400 italic font-medium px-4">Tutup</span>
                      ) : (
                        <button
                          onClick={() => handleAction(item)}
                          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-95
                            ${item.is_active || item.status === "1"
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/20"
                              : "bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/20"
                            }
                          `}
                        >
                          {item.status === "1" ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Buka Absensi
                            </>
                          ) : (
                            "Mulai Kegiatan"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}