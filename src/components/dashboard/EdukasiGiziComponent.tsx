//import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

// --- IMPORT WIDGET ---
// Pastikan path ini sesuai dengan letak file WidgetStatistikGizi.tsx yang baru Anda buat
import WidgetStatistikGizi from "../widget/WidgetStatistikGizi";

// --- INTERFACES ---
interface PanganLokal {
  nama_pangan: string;
  kategori: string;
  kalori_per_100g: number;
  karbo_per_100g: number;
  satuan_porsi: string;
  berat_per_porsi: number;
  index_glikemik: string;
}

interface DetailMenu {
  id: number;
  waktu_makan: string;
  jumlah_porsi: number;
  data_pangan?: PanganLokal;
  dataPangan?: PanganLokal;
  pangan?: PanganLokal;
}

interface RekomendasiDiet {
  id: number;
  total_kalori_harian: number;
  rekomendasi_diet_detail: DetailMenu[];
}

interface PesertaGizi {
  id: number;
  pemeriksaan_id: number;
  no_bpjs: string;
  nama: string;
  jenis_kelamin: string;
  usia: number;
  ttv_hari_ini: {
    berat_badan: number;
    tinggi_badan: number;
    imt: number;
    gula_darah: number;
  };
  status_gizi_selesai: boolean;
}

// --- FUNGSI BANTUAN UI ---
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
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-cyan-100 text-cyan-600",
    "bg-green-100 text-green-600",
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function EdukasiGiziComponent() {
  // --- TOP-LEVEL HOOKS ---
  const [antreanList, setAntreanList] = useState<PesertaGizi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaGizi | null>(
    null,
  );

  const [rekomendasi, setRekomendasi] = useState<RekomendasiDiet | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State untuk memicu re-render Widget Statistik
  const [refreshWidget, setRefreshWidget] = useState(0);

  // --- FETCH ANTREAN ---
  const fetchAntrean = async () => {
    try {
      const res = await api.get("/edukasi-gizi/antrean");
      setAntreanList(res.data.data);
      setRefreshWidget((prev) => prev + 1);
    } catch (error) {
      console.error("Gagal memuat antrean gizi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAntrean();
    const interval = setInterval(fetchAntrean, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HANDLERS ---
  const openModal = (peserta: PesertaGizi) => {
    setSelectedPeserta(peserta);
    setRekomendasi(null);
    setIsModalOpen(true);
    generateDiet(peserta.pemeriksaan_id, false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
    setRekomendasi(null);
    fetchAntrean();
  };

  // --- FUNGSI GENERATE CERDAS ---
  const generateDiet = async (
    pemeriksaanId: number,
    forceRegenerate = false,
  ) => {
    setIsGenerating(true);
    try {
      const payload = forceRegenerate ? { force_regenerate: true } : {};
      const res = await api.post(
        `/edukasi-gizi/simpan/${pemeriksaanId}`,
        payload,
      );

      if (res.data.data) {
        setRekomendasi(res.data.data);
        if (forceRegenerate) {
          Swal.fire({
            icon: "success",
            title: "Menu Diperbarui!",
            text: "Algoritma telah meracik ulang komposisi pangan lokal.",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      }
    } catch (error: any) {
      Swal.fire(
        "Gagal",
        error.response?.data?.message || "Gagal memproses rekomendasi gizi.",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // --- FUNGSI CETAK (PRINT) EDUKASI GIZI ---
  const handlePrintDiet = () => {
    if (!selectedPeserta || !rekomendasi) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow)
      return alert(
        "Pop-up diblokir oleh browser. Izinkan pop-up untuk mencetak.",
      );

    // Menyusun baris tabel menu
    const tableRows =
      rekomendasi.rekomendasi_diet_detail
        ?.map((menu) => {
          const panganItem = menu.data_pangan || menu.dataPangan || menu.pangan;
          const gramasi = Math.round(
            menu.jumlah_porsi * (panganItem?.berat_per_porsi || 0),
          );
          return `
        <tr>
          <td class="text-center waktu-badge"><strong>${menu.waktu_makan}</strong></td>
          <td>
            <div class="pangan-title">${panganItem?.nama_pangan || "Data Pangan"}</div>
            <div class="pangan-kategori">${panganItem?.kategori || "-"} ${panganItem?.index_glikemik === "Rendah" ? '<span style="color:#059669; font-size:10px;">(IG Rendah)</span>' : ""}</div>
          </td>
          <td class="text-right porsi">
            <strong>${Number(menu.jumlah_porsi).toFixed(1)} ${panganItem?.satuan_porsi || "Porsi"}</strong>
            <br>
            <small style="color:#6b7280;">(${gramasi} Gram)</small>
          </td>
        </tr>
      `;
        })
        .join("") ||
      '<tr><td colspan="3" class="text-center">Tidak ada data rekomendasi</td></tr>';

    // Kerangka HTML Kertas Cetak
    const htmlLaporan = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekomendasi Diet - ${selectedPeserta.nama}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1f2937; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; color: #047857; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 5px 0 0 0; color: #4b5563; font-size: 14px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #ecfdf5; padding: 15px; border-radius: 8px; border: 1px solid #d1fae5; }
            .info-item p { margin: 0; font-size: 13px; color: #6b7280; }
            .info-item h4 { margin: 2px 0 0 0; font-size: 16px; color: #111827; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background-color: #10b981; color: white; padding: 12px; text-align: left; font-size: 14px; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .waktu-badge { color: #b45309; text-transform: uppercase; font-size: 12px; }
            .pangan-title { font-weight: bold; font-size: 15px; color: #1f2937; }
            .pangan-kategori { font-size: 12px; color: #6b7280; margin-top: 2px; }
            .porsi { font-size: 15px; color: #4338ca; }
            
            .footer { margin-top: 50px; display: flex; justify-content: flex-end; text-align: center; }
            .signature { width: 200px; }
            .signature p { margin: 0; color: #374151; }
            .line { margin-top: 60px; border-bottom: 1px solid #1f2937; }
            
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SMART-PROLANIS PUSKESMAS BANABUNGI</h1>
            <p>Lembar Panduan Intervensi Gizi & Pangan Lokal</p>
          </div>
          
          <div class="info-grid">
            <div class="info-item"><p>Nama Pasien</p><h4>${selectedPeserta.nama}</h4></div>
            <div class="info-item"><p>No. BPJS</p><h4>${selectedPeserta.no_bpjs}</h4></div>
            <div class="info-item"><p>Target Energi Harian</p><h4>${rekomendasi.total_kalori_harian} Kkal</h4></div>
            <div class="info-item"><p>Tanggal Cetak</p><h4>${new Date().toLocaleDateString("id-ID")}</h4></div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" width="20%">WAKTU</th>
                <th width="50%">NAMA PANGAN & KATEGORI</th>
                <th class="text-right" width="30%">TAKARAN PORSI</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="footer">
            <div class="signature">
              <p>Petugas Gizi / Dokter</p>
              <div class="line"></div>
            </div>
          </div>

          <script>
            window.onload = function() { 
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlLaporan);
    printWindow.document.close();
  };

  // --- PENGELOMPOKAN MENU ---
  const groupedMenu =
    rekomendasi?.rekomendasi_diet_detail?.reduce(
      (acc, curr) => {
        if (!acc[curr.waktu_makan]) acc[curr.waktu_makan] = [];
        acc[curr.waktu_makan].push(curr);
        return acc;
      },
      {} as Record<string, DetailMenu[]>,
    ) || {};

  const filteredAntrean = antreanList.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.no_bpjs.includes(searchQuery),
  );

  return (
    <div className="space-y-6 mt-8">
      {/* PENEMPATAN WIDGET STATISTIK GIZI */}
      {!loading && <WidgetStatistikGizi refreshTrigger={refreshWidget} />}

      {/* HEADER & PENCARIAN */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Stasiun Edukasi Gizi
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sistem Rekomendasi Menu Otomatis & Konseling
          </p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <svg
              width="20"
              height="20"
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
            placeholder="Cari Nama / No BPJS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3 pl-12 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* TABEL ANTREAN GIZI */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-emerald-50/50 border-b border-gray-100 text-gray-700 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Pasien</th>
                <th className="px-6 py-4 font-semibold">No. BPJS</th>
                <th className="px-6 py-4 font-semibold">
                  Status Klinis (IMT & Gula)
                </th>
                <th className="px-6 py-4 font-semibold text-center">
                  Status Edukasi
                </th>
                <th className="px-6 py-4 font-semibold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg
                        className="w-8 h-8 text-emerald-500 animate-spin"
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
                        Memuat data antrean gizi...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredAntrean.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🍽️</span>
                      <p className="text-gray-600 font-medium">
                        Antrean Kosong
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Belum ada pasien yang membutuhkan konsultasi gizi.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAntrean.map((peserta) => (
                  <tr
                    key={peserta.id}
                    className="group hover:bg-emerald-50/30 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${getAvatarColor(peserta.nama)}`}
                        >
                          {getInitials(peserta.nama)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {peserta.nama}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {peserta.jenis_kelamin === "Pria"
                              ? "Pria"
                              : "Wanita"}
                            , {peserta.usia} Thn
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                      {peserta.no_bpjs}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                          <span className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
                            ⚖️
                          </span>
                          IMT:{" "}
                          <strong className="text-gray-800 dark:text-gray-200">
                            {peserta.ttv_hari_ini.imt}
                          </strong>
                        </span>
                        <span
                          className={`text-xs font-bold flex items-center gap-1.5 ${peserta.ttv_hari_ini.gula_darah > 126 ? "text-red-600" : "text-emerald-600"}`}
                        >
                          <span
                            className={`${peserta.ttv_hari_ini.gula_darah > 126 ? "bg-red-50" : "bg-emerald-50"} p-1 rounded`}
                          >
                            🩸
                          </span>
                          GDP: {peserta.ttv_hari_ini.gula_darah} mg/dL
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {peserta.status_gizi_selesai ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Selesai Edukasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Menunggu Diet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(peserta)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                          ${
                            peserta.status_gizi_selesai
                              ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              : "bg-emerald-600 text-white border border-transparent hover:bg-emerald-700 hover:shadow-md"
                          }`}
                      >
                        {peserta.status_gizi_selesai
                          ? "Lihat Menu"
                          : "Atur Diet"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL GENERATE & EDUKASI */}
      {isModalOpen && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-gray-800 flex flex-col max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-800 text-lg dark:text-white flex items-center gap-2">
                <span className="text-xl">🥗</span> Konseling & Rekomendasi Menu
              </h3>
              <button
                onClick={closeModal}
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

            <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
              {/* KOLOM KIRI: INFO KLINIS PASIEN */}
              <div className="w-full lg:w-4/12 bg-gray-50 p-6 border-r border-gray-100 dark:bg-gray-800/20 dark:border-gray-800 overflow-y-auto custom-scrollbar">
                {/* Banner Pasien */}
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div className="relative z-10 text-white">
                    <p className="text-emerald-100 text-xs font-medium mb-1">
                      Identitas Pasien
                    </p>
                    <h4 className="text-xl font-bold">
                      {selectedPeserta.nama}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-emerald-50">
                      <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                        🆔 {selectedPeserta.no_bpjs}
                      </span>
                      <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                        👤{" "}
                        {selectedPeserta.jenis_kelamin === "Pria"
                          ? "Pria"
                          : "Wanita"}
                        , {selectedPeserta.usia} Thn
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Klinis Terkini */}
                <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 dark:text-gray-400">
                    Parameter Gizi
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="text-lg">⚖️</span>{" "}
                        <span className="text-sm font-medium">Berat Badan</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedPeserta.ttv_hari_ini.berat_badan} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="text-lg">📊</span>{" "}
                        <span className="text-sm font-medium">
                          Indeks Massa Tubuh
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {selectedPeserta.ttv_hari_ini.imt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <span className="text-lg">🩸</span>{" "}
                        <span className="text-sm font-medium">Gula Darah</span>
                      </div>
                      <span
                        className={`font-bold px-2 py-1 rounded text-xs ${selectedPeserta.ttv_hari_ini.gula_darah > 126 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {selectedPeserta.ttv_hari_ini.gula_darah} mg/dL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Algoritma Alert */}
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 dark:bg-blue-900/10 dark:border-blue-900/30">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h5 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">
                        Cara Kerja Sistem
                      </h5>
                      <p className="text-xs text-blue-600/80 dark:text-blue-300 leading-relaxed">
                        Sistem menghitung Kebutuhan Kalori Basal (BMR)
                        berdasarkan rumus paten gizi. Pemilihan menu
                        memprioritaskan Pangan Lokal Buton ber-Indeks Glikemik
                        aman.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN: HASIL ALGORITMA MENU */}
              <div className="w-full lg:w-8/12 p-6 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-transparent">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-5">
                    <div className="relative">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xl">
                        🍽️
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800 dark:text-white">
                        Menyusun Menu Terbaik...
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Mengukur kalori dan menyesuaikan Indeks Glikemik pasien.
                      </p>
                    </div>
                  </div>
                ) : rekomendasi ? (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header Target Kalori & Tombol Aksi */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 z-0 dark:bg-emerald-500/5"></div>
                      <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 dark:text-gray-400">
                          Target Kalori Harian
                        </p>
                        <div className="flex items-baseline gap-1">
                          <h2 className="text-4xl font-black text-emerald-600 tracking-tight">
                            {rekomendasi.total_kalori_harian}
                          </h2>
                          <span className="text-base font-semibold text-emerald-600/70">
                            Kkal
                          </span>
                        </div>
                      </div>

                      {/* BUNGKUSAN KEDUA TOMBOL (CETAK & ACAK ULANG) */}
                      <div className="relative z-10 flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={handlePrintDiet}
                          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 hover:shadow transition-all active:scale-95"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                          </svg>
                          Cetak Menu
                        </button>

                        <button
                          onClick={() =>
                            generateDiet(selectedPeserta.pemeriksaan_id, true)
                          }
                          className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm border border-emerald-100 hover:bg-emerald-100 hover:shadow transition-all active:scale-95 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Acak Ulang Menu
                        </button>
                      </div>
                    </div>

                    {/* Render Daftar Menu per Waktu Makan */}
                    <div className="space-y-5">
                      {Object.keys(groupedMenu).map((waktu) => (
                        <div
                          key={waktu}
                          className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:bg-gray-800 dark:border-gray-700"
                        >
                          <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-200 dark:bg-gray-900/50 dark:border-gray-700 flex items-center gap-2">
                            <span className="text-base">
                              {waktu.includes("Pagi")
                                ? "🌅"
                                : waktu.includes("Siang")
                                  ? "☀️"
                                  : waktu.includes("Malam")
                                    ? "🌙"
                                    : "☕"}
                            </span>
                            <h4 className="font-bold text-gray-800 dark:text-white uppercase tracking-wide text-sm">
                              {waktu}
                            </h4>
                          </div>
                          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {groupedMenu[waktu].map((menu) => {
                              const panganItem =
                                menu.data_pangan ||
                                menu.dataPangan ||
                                menu.pangan;

                              return (
                                <div
                                  key={menu.id}
                                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/80 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                                      <h5 className="font-bold text-gray-900 dark:text-white text-base">
                                        {panganItem?.nama_pangan ||
                                          "Memuat menu..."}
                                      </h5>
                                      {panganItem?.index_glikemik ===
                                        "Rendah" && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-transparent">
                                          IG Rendah
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                      <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                        {panganItem?.kategori}
                                      </span>
                                      <span>
                                        {panganItem?.kalori_per_100g} kcal/100g
                                      </span>
                                    </p>
                                  </div>

                                  <div className="sm:text-right flex items-center justify-between sm:flex-col sm:items-end bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-gray-100 sm:border-transparent dark:bg-gray-900/50 dark:border-gray-800 sm:dark:bg-transparent">
                                    <div className="flex items-baseline gap-1.5">
                                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                        {Math.round(
                                          menu.jumlah_porsi *
                                            (panganItem?.berat_per_porsi || 0),
                                        )}
                                      </span>
                                      <span className="text-sm font-bold text-indigo-400 dark:text-indigo-500">
                                        Gram
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-semibold text-gray-500 bg-white sm:bg-gray-50 px-2.5 py-1 rounded-md shadow-sm sm:shadow-none border border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                      Setara{" "}
                                      <span className="text-gray-800 dark:text-gray-200">
                                        {Number(menu.jumlah_porsi).toFixed(1)}{" "}
                                        {panganItem?.satuan_porsi}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="text-gray-500 mb-4">
                      Gagal memuat rekomendasi.
                    </p>
                    <button
                      onClick={() =>
                        generateDiet(selectedPeserta.pemeriksaan_id, true)
                      }
                      className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      Coba Buat Ulang
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/80">
              <button
                onClick={closeModal}
                className="rounded-xl bg-emerald-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                Selesai Edukasi
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
