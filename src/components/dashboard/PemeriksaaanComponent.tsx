import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import PageMeta from "../common/PageMeta";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
// import { useAuth } from "../../context/AuthContext";
import PemeriksaanWidget from "../widget/PemeriksaanWidget";

interface Peserta {
  id: number;
  nama: string;
  no_bpjs: string;
  jenis_kelamin: string;
  usia: number;
  status_diperiksa: boolean;
  data_ttv?: any;
}

// interface JadwalInfo {
//   nama_kegiatan: string;
//   tanggal: string;
//   lokasi: string;
// }

// Fungsi bantuan untuk membuat inisial nama (Misal: Budi Santoso -> BS)
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Fungsi bantuan untuk menentukan warna avatar berdasarkan huruf awal
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

export default function PemeriksaanFisikComponent() {
  // const { user } = useAuth();

  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeKegiatanId, setActiveKegiatanId] = useState<number | null>(null);
  const [isNoActiveSchedule, setIsNoActiveSchedule] = useState(false);
  // const [jadwalInfo, setJadwalInfo] = useState<JadwalInfo | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshWidget, setRefreshWidget] = useState(0);

  const [formData, setFormData] = useState({
    berat_badan: "",
    tinggi_badan: "",
    tensi_sistolik: "",
    tensi_diastolik: "",
    gula_darah_puasa: "",
    aktivitas: "",
  });

  const [errors, setErrors] = useState<any>({});

  const fetchPesertaAktif = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setIsNoActiveSchedule(false);

    try {
      const res = await api.get(`/pemeriksaan-fisik/peserta-hadir`);
      setPesertaList(res.data.data);
      setActiveKegiatanId(res.data.kegiatan_id);

      // if (res.data.detail_jadwal) {
      //   setJadwalInfo(res.data.detail_jadwal);
      // }

      if (isBackground) setRefreshWidget((prev) => prev + 1);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setIsNoActiveSchedule(true);
        setPesertaList([]);
      } else if (!isBackground) {
        Swal.fire("Error", "Gagal memuat daftar peserta.", "error");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPesertaAktif();
    const interval = setInterval(() => {
      fetchPesertaAktif(true);
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPeserta = pesertaList.filter((peserta) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      peserta.nama.toLowerCase().includes(searchLower) ||
      peserta.no_bpjs.includes(searchLower)
    );
  });

  const openModal = (peserta: Peserta) => {
    setSelectedPeserta(peserta);
    setErrors({});
    if (peserta.status_diperiksa && peserta.data_ttv) {
      setFormData({
        berat_badan: peserta.data_ttv.berat_badan || "",
        tinggi_badan: peserta.data_ttv.tinggi_badan || "",
        tensi_sistolik: peserta.data_ttv.tensi_sistolik || "",
        tensi_diastolik: peserta.data_ttv.tensi_diastolik || "",
        gula_darah_puasa: peserta.data_ttv.gula_darah_puasa || "",
        aktivitas: peserta.data_ttv.aktivitas || "",
      });
    } else {
      setFormData({
        berat_badan: "",
        tinggi_badan: "",
        tensi_sistolik: "",
        tensi_diastolik: "",
        gula_darah_puasa: "",
        aktivitas: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await api.post("/upsert-pemeriksaan", {
        jadwal_kegiatan_id: activeKegiatanId,
        pesertaid: selectedPeserta?.id,
        ...formData,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Data TTV ${selectedPeserta?.nama} berhasil disimpan.`,
        timer: 2000,
        showConfirmButton: false,
      });

      setPesertaList((prev) =>
        prev.map((p) =>
          p.id === selectedPeserta?.id
            ? { ...p, status_diperiksa: true, data_ttv: formData }
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

  if (isNoActiveSchedule && !loading) {
    return (
      <>
        <PageMeta
          title="Pemeriksaan Fisik"
          description="Input Pemeriksaan Peserta"
        />
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Poli Sedang Kosong
          </h2>
          <p className="text-gray-500 mt-3 max-w-md">
            Belum ada jadwal kegiatan Prolanis yang berstatus aktif saat ini.
            Silakan hubungi administrasi untuk membuka sesi kegiatan.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {!loading && <PemeriksaanWidget refreshTrigger={refreshWidget} />}

      <div className="space-y-6 mt-8">
        {/* AREA HEADER & SEARCH */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Daftar Peserta Hadir
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Kelola data TTV pasien pada kegiatan hari ini
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
              placeholder="Cari nama atau No. BPJS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3 pl-12 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* AREA TABEL */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Pasien</th>
                  <th className="px-6 py-4 font-semibold">No. BPJS</th>
                  <th className="px-6 py-4 font-semibold">Demografi</th>
                  <th className="px-6 py-4 font-semibold text-center">
                    Status TTV
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
                          Sinkronisasi data pasien...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredPeserta.length > 0 ? (
                  filteredPeserta.map((peserta) => (
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
                          </div>
                        </div>
                      </td>

                      {/* Kolom BPJS */}
                      <td className="px-6 py-4 font-mono text-gray-500">
                        {peserta.no_bpjs}
                      </td>

                      {/* Kolom Demografi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {peserta.jenis_kelamin}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {peserta.usia} Thn
                          </span>
                        </div>
                      </td>

                      {/* Kolom Status Badges */}
                      <td className="px-6 py-4 text-center">
                        {peserta.status_diperiksa ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Selesai Diperiksa
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
                        <Button
                          size="sm"
                          variant={
                            peserta.status_diperiksa ? "outline" : "primary"
                          }
                          className={`shadow-sm transition-transform active:scale-95 ${!peserta.status_diperiksa ? "bg-brand-600 hover:bg-brand-700 hover:shadow-md" : ""}`}
                          onClick={() => openModal(peserta)}
                        >
                          {peserta.status_diperiksa
                            ? "Ubah Data"
                            : "Mulai Periksa"}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-4xl mb-3">🔍</span>
                        <p className="text-gray-600 font-medium">
                          Pasien tidak ditemukan
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Coba gunakan kata kunci atau nomor BPJS lain.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL MODERNISASI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-800 text-xl dark:text-white flex items-center gap-2">
                <span>🩺</span> Rekam Pemeriksaan TTV
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

            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Patient Banner */}
              <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-700 p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="relative z-10 text-white">
                  <p className="text-brand-100 text-sm font-medium mb-1">
                    Identitas Pasien
                  </p>
                  <h4 className="text-2xl font-bold">
                    {selectedPeserta?.nama}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-sm text-brand-50">
                    <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                      🆔 {selectedPeserta?.no_bpjs}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                      👤 {selectedPeserta?.jenis_kelamin},{" "}
                      {selectedPeserta?.usia} Thn
                    </span>
                  </div>
                </div>
              </div>

              <form id="ttvForm" className="space-y-6">
                {/* Antropometri Section */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 dark:text-gray-400">
                    Antropometri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label>Berat Badan (kg)</Label>
                      <Input
                        type="number"
                        name="berat_badan"
                        value={formData.berat_badan}
                        onChange={handleInputChange}
                        placeholder="Contoh: 65.5"
                      />
                      {errors.berat_badan && (
                        <p className="mt-1.5 text-xs font-medium text-error-500">
                          {errors.berat_badan[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Tinggi Badan (cm)</Label>
                      <Input
                        type="number"
                        name="tinggi_badan"
                        value={formData.tinggi_badan}
                        onChange={handleInputChange}
                        placeholder="Contoh: 165"
                      />
                      {errors.tinggi_badan && (
                        <p className="mt-1.5 text-xs font-medium text-error-500">
                          {errors.tinggi_badan[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tanda Vital Section */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 dark:text-gray-400">
                    Tanda Vital & Lab
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <Label>Tekanan Sistolik</Label>
                      <Input
                        type="number"
                        name="tensi_sistolik"
                        value={formData.tensi_sistolik}
                        onChange={handleInputChange}
                        placeholder="Contoh: 120"
                      />
                      {errors.tensi_sistolik && (
                        <p className="mt-1.5 text-xs font-medium text-error-500">
                          {errors.tensi_sistolik[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Tekanan Diastolik</Label>
                      <Input
                        type="number"
                        name="tensi_diastolik"
                        value={formData.tensi_diastolik}
                        onChange={handleInputChange}
                        placeholder="Contoh: 80"
                      />
                      {errors.tensi_diastolik && (
                        <p className="mt-1.5 text-xs font-medium text-error-500">
                          {errors.tensi_diastolik[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label>Gula Darah Puasa</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          name="gula_darah_puasa"
                          value={formData.gula_darah_puasa}
                          onChange={handleInputChange}
                          placeholder="Nilai GDP"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          mg/dL
                        </span>
                      </div>
                      {errors.gula_darah_puasa && (
                        <p className="mt-1.5 text-xs font-medium text-error-500">
                          {errors.gula_darah_puasa[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Aktivitas Fisik</Label>
                      <select
                        name="aktivitas"
                        value={formData.aktivitas}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Pilih intensitas...</option>
                        <option value="Jarang">Jarang Olahraga</option>
                        <option value="Sedang">Sedang (1-2x Seminggu)</option>
                        <option value="Aktif">Aktif (Rutin)</option>
                      </select>
                      {errors.aktivitas && (
                        <p className="mt-1.5 text-xs font-medium text-error-500">
                          {errors.aktivitas[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
              <Button variant="outline" onClick={closeModal} className="px-6">
                Batal
              </Button>
              <Button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="px-6 bg-brand-600 hover:bg-brand-700 shadow-md"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
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
                  </span>
                ) : (
                  "Simpan Rekam Medis"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
