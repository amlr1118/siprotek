import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Sesuaikan path dengan proyek Anda
import WidgetStatistikDokter from "../widget/WidgetStatistikDokter";
import Swal from "sweetalert2";

// --- INTERFACES ---
interface Riwayat {
  tanggal: string;
  berat_badan: number;
  tensi: string;
  gula_darah: number;
  status_gula: string;
}

interface Obat {
  nama_obat: string;
  dosis: string;
  jumlah: number | string;
  keterangan: string;
}

interface PesertaDokter {
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
    tensi: string;
    gula_darah: number;
    status_gula: string;
  };
  status_diperiksa_dokter: boolean;
  catatan_dokter: string | null;
  resep_obat?: Obat[];
  riwayat_terakhir: Riwayat[];
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
    "bg-blue-100 text-blue-600",
    "bg-emerald-100 text-emerald-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

export default function PemeriksaanDokterComponent() {
  // --- STATES ---
  const [antreanList, setAntreanList] = useState<PesertaDokter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNoActiveSchedule, setIsNoActiveSchedule] = useState(false);
  // const [jadwalInfo, setJadwalInfo] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaDokter | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    catatan_dokter: "",
    resep_obat: [] as Obat[],
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshWidget, setRefreshWidget] = useState(0);

  // --- FETCH DATA ---
  const fetchAntrean = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setIsNoActiveSchedule(false);

    try {
      const res = await api.get("/pemeriksaan-dokter/antrean");
      setAntreanList(res.data.data);
      // if (res.data.detail_jadwal) {
      //   setJadwalInfo(res.data.detail_jadwal);
      // }
      setRefreshWidget((prev) => prev + 1);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setIsNoActiveSchedule(true);
        setAntreanList([]);
      } else if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        Swal.fire({
          icon: "warning",
          title: "Data Tidak Lengkap",
          text: "Pastikan Catatan Dokter dan kolom resep obat (jika ada) terisi dengan benar.",
        });
      } else if (!isBackground) {
        Swal.fire(
          "Gagal",
          "Terjadi kesalahan koneksi saat mengambil/menyimpan data.",
          "error",
        );
      }
    } finally {
      if (!isBackground) setLoading(false);
      setIsSubmitting(false);
    }
  };

  // --- FUNGSI DINAMIS OBAT ---
  const tambahObat = () => {
    setFormData({
      ...formData,
      resep_obat: [
        ...(formData.resep_obat || []),
        { nama_obat: "", dosis: "", jumlah: "", keterangan: "" },
      ],
    });
  };

  const hapusObat = (index: number) => {
    const resepBaru = [...(formData.resep_obat || [])];
    resepBaru.splice(index, 1);
    setFormData({ ...formData, resep_obat: resepBaru });
  };

  const handleObatChange = (
    index: number,
    field: keyof Obat,
    value: string,
  ) => {
    const resepBaru = [...(formData.resep_obat || [])];
    resepBaru[index] = { ...resepBaru[index], [field]: value };
    setFormData({ ...formData, resep_obat: resepBaru });
  };

  useEffect(() => {
    fetchAntrean(false);
    const interval = setInterval(() => {
      fetchAntrean(true);
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HANDLERS MODAL ---
  const openModal = (peserta: PesertaDokter) => {
    setSelectedPeserta(peserta);
    setFormData({
      catatan_dokter: peserta.catatan_dokter || "",
      resep_obat: peserta.resep_obat || [],
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPeserta) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post(
        `/pemeriksaan-dokter/simpan/${selectedPeserta.pemeriksaan_id}`,
        formData,
      );

      Swal.fire({
        icon: "success",
        title: "Tersimpan!",
        text: `Catatan medis untuk ${selectedPeserta.nama} berhasil disimpan.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setAntreanList((prev) =>
        prev.map((p) =>
          p.id === selectedPeserta.id
            ? {
                ...p,
                status_diperiksa_dokter: true,
                catatan_dokter: formData.catatan_dokter,
                resep_obat: formData.resep_obat,
              }
            : p,
        ),
      );

      setRefreshWidget((prev) => prev + 1);
      closeModal();
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

  const filteredAntrean = antreanList.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.no_bpjs.includes(searchQuery),
  );

  return (
    <>
      <div className="space-y-6 mt-8">
        {/* STATUS JADWAL AKTIF / TIDAK */}
        {isNoActiveSchedule && !loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-white rounded-3xl shadow-sm border border-gray-100 p-10 dark:bg-gray-900 dark:border-gray-800">
            <div className="rounded-full bg-brand-50 p-6 mb-6 dark:bg-brand-500/10">
              <svg
                className="w-16 h-16 text-brand-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Poli Kosong
            </h2>
            <p className="text-gray-500 mt-3 max-w-md">
              Belum ada kegiatan Prolanis yang aktif hari ini. Daftar antrean
              akan muncul secara otomatis setelah kegiatan dimulai.
            </p>
          </div>
        ) : (
          <>
            {/* WIDGET STATISTIK DOKTER */}
            {!loading && (
              <WidgetStatistikDokter refreshTrigger={refreshWidget} />
            )}

            {/* HEADER TABEL & PENCARIAN */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  Antrean Konsultasi
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Daftar pasien yang sudah melalui skrining perawat
                </p>
              </div>
              <div className="relative w-full sm:w-80 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
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
                  className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3 pl-12 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* TABEL PASIEN */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                  <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Pasien</th>
                      <th className="px-6 py-4 font-semibold">No. BPJS</th>
                      <th className="px-6 py-4 font-semibold">Tensi / GDP</th>
                      <th className="px-6 py-4 font-semibold text-center">
                        Status Konsultasi
                      </th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Tindakan
                      </th>
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
                              Memuat antrean...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAntrean.length > 0 ? (
                      filteredAntrean.map((peserta) => (
                        <tr
                          key={peserta.id}
                          className="group hover:bg-brand-50/30 dark:hover:bg-gray-800/50 transition-all duration-200"
                        >
                          {/* Kolom Nama & Avatar */}
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

                          {/* Kolom BPJS */}
                          <td className="px-6 py-4 font-mono text-gray-500">
                            {peserta.no_bpjs}
                          </td>

                          {/* Kolom Tensi / GDP */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                <span className="mr-1">❤️</span>{" "}
                                {peserta.ttv_hari_ini.tensi} mmHg
                              </span>
                              <span
                                className={`text-xs font-bold flex items-center gap-1 ${
                                  peserta.ttv_hari_ini.status_gula.includes(
                                    "Tinggi",
                                  )
                                    ? "text-red-500 bg-red-50 px-2 py-0.5 rounded w-max"
                                    : "text-green-600 bg-green-50 px-2 py-0.5 rounded w-max"
                                }`}
                              >
                                <span>🩸</span>{" "}
                                {peserta.ttv_hari_ini.gula_darah} mg/dL
                              </span>
                            </div>
                          </td>

                          {/* Kolom Status Badges */}
                          <td className="px-6 py-4 text-center">
                            {peserta.status_diperiksa_dokter ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Selesai
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Menunggu
                              </span>
                            )}
                          </td>

                          {/* Kolom Aksi */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => openModal(peserta)}
                              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500/50
                                ${
                                  peserta.status_diperiksa_dokter
                                    ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                    : "bg-brand-600 text-white border border-transparent hover:bg-brand-700 hover:shadow-md"
                                }`}
                            >
                              {peserta.status_diperiksa_dokter
                                ? "Lihat/Edit"
                                : "Panggil"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl mb-3">📭</span>
                            <p className="text-gray-600 font-medium">
                              Antrean Kosong
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              Belum ada pasien yang dialihkan dari stasiun
                              perawat.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL PEMERIKSAAN DOKTER */}
      {isModalOpen && selectedPeserta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-gray-800 flex flex-col max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-800 text-lg dark:text-white flex items-center gap-2">
                <span>🩺</span> Lembar Konsultasi Medis
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
              {/* PANEL KIRI: INFO PASIEN & RIWAYAT (Scrollable Independen) */}
              <div className="w-full lg:w-5/12 bg-gray-50 p-6 border-r border-gray-100 dark:bg-gray-800/20 dark:border-gray-800 overflow-y-auto custom-scrollbar">
                {/* Banner Pasien */}
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-brand-700 p-5 shadow-lg relative overflow-hidden">
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
                    <p className="text-brand-100 text-xs font-medium mb-1">
                      Identitas Pasien
                    </p>
                    <h4 className="text-xl font-bold">
                      {selectedPeserta.nama}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-brand-50">
                      <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                        🆔 {selectedPeserta.no_bpjs}
                      </span>
                      <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                        👤{" "}
                        {selectedPeserta.jenis_kelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                        , {selectedPeserta.usia} thn
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skrining Hari Ini */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 dark:text-gray-400">
                  Hasil Skrining (Hari Ini)
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-[10px] uppercase font-semibold text-gray-400">
                      Tekanan Darah
                    </p>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {selectedPeserta.ttv_hari_ini.tensi}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        mmHg
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-[10px] uppercase font-semibold text-gray-400">
                      Gula Darah
                    </p>
                    <p
                      className={`text-base font-bold ${selectedPeserta.ttv_hari_ini.status_gula.includes("Tinggi") ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {selectedPeserta.ttv_hari_ini.gula_darah}{" "}
                      <span className="text-xs font-normal">mg/dL</span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-[10px] uppercase font-semibold text-gray-400">
                      Berat Badan
                    </p>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {selectedPeserta.ttv_hari_ini.berat_badan}{" "}
                      <span className="text-xs font-normal text-gray-500">
                        kg
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-[10px] uppercase font-semibold text-gray-400">
                      IMT
                    </p>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {selectedPeserta.ttv_hari_ini.imt}
                    </p>
                  </div>
                </div>

                {/* Riwayat Terdahulu */}
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 dark:text-gray-400">
                  Riwayat 3 Kunjungan
                </h4>
                {selectedPeserta.riwayat_terakhir?.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent dark:before:via-gray-700">
                    {selectedPeserta.riwayat_terakhir.map((riwayat, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-brand-500 text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 dark:border-gray-800"></div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 text-xs">
                          <div className="font-bold text-brand-600 dark:text-brand-400 mb-1.5">
                            {riwayat.tanggal}
                          </div>
                          <div className="space-y-1 text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between">
                              <span>Tensi:</span>{" "}
                              <strong>{riwayat.tensi}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>GDP:</span>{" "}
                              <strong
                                className={
                                  riwayat.status_gula.includes("Tinggi")
                                    ? "text-red-500"
                                    : "text-green-500"
                                }
                              >
                                {riwayat.gula_darah}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>BB:</span>{" "}
                              <strong>{riwayat.berat_badan} kg</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 py-6 text-center text-sm text-gray-500 dark:border-gray-700">
                    Pasien Baru (Tidak ada riwayat)
                  </div>
                )}
              </div>

              {/* PANEL KANAN: FORM INPUT (Scrollable Independen) */}
              <div className="w-full lg:w-7/12 p-6 overflow-y-auto custom-scrollbar flex flex-col">
                <form id="dokterForm" className="flex flex-col gap-6 flex-1">
                  {/* Diagnosis */}
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800 dark:text-white/90">
                      Diagnosis & Catatan Medis{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      placeholder="Tuliskan keluhan, diagnosis klinis, atau rencana tindak lanjut..."
                      value={formData.catatan_dokter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          catatan_dokter: e.target.value,
                        })
                      }
                    ></textarea>
                    {errors.catatan_dokter && (
                      <p className="mt-1.5 text-xs font-medium text-red-500">
                        {errors.catatan_dokter[0]}
                      </p>
                    )}
                  </div>

                  {/* Resep Obat */}
                  <div className="flex flex-col flex-1 border-t border-gray-100 pt-6 dark:border-gray-800">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <label className="text-sm font-bold text-gray-800 dark:text-white/90">
                          Resep Obat
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Diteruskan otomatis ke stasiun farmasi/apotek
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={tambahObat}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 transition-colors shadow-sm"
                      >
                        <span>+</span> Tambah Obat
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.resep_obat?.map((obat, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row gap-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-900/10"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Nama Obat (Cth: Amlodipin 5mg)"
                              value={obat.nama_obat}
                              onChange={(e) =>
                                handleObatChange(
                                  index,
                                  "nama_obat",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                              required
                            />
                          </div>
                          <div className="w-full sm:w-28 shrink-0">
                            <input
                              type="text"
                              placeholder="Dosis (3x1)"
                              value={obat.dosis}
                              onChange={(e) =>
                                handleObatChange(index, "dosis", e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                              required
                            />
                          </div>
                          <div className="w-full sm:w-24 shrink-0">
                            <input
                              type="number"
                              placeholder="Jml (30)"
                              value={obat.jumlah}
                              onChange={(e) =>
                                handleObatChange(
                                  index,
                                  "jumlah",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Ket (Sesudah makan)"
                              value={obat.keterangan}
                              onChange={(e) =>
                                handleObatChange(
                                  index,
                                  "keterangan",
                                  e.target.value,
                                )
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => hapusObat(index)}
                            className="flex shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 px-3 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors dark:border-gray-700 dark:bg-gray-800"
                            title="Hapus Obat"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                      {(!formData.resep_obat ||
                        formData.resep_obat.length === 0) && (
                        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-700">
                          <span className="block text-2xl mb-2">💊</span>
                          Pasien tidak diberikan resep obat pada kunjungan ini.
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/80">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
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
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Rekam Medis"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
