//import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";

// --- INTERFACES ---
interface Peserta {
  id: number;
  nama: string;
  no_bpjs: string;
}

interface Jadwal {
  id: number;
  tanggal: string;
  nama_kegiatan: string;
}

interface Obat {
  id: number;
  nama_obat: string;
  dosis: string;
  jumlah: number;
  keterangan: string;
}

// Interface Baru Sesuai Model Laravel Anda
interface RekomendasiDiet {
  total_kalori_harian: string;
}

interface DetailPangan {
  nama_pangan: string;
  kategori: string;
  waktu_makan: string; // Pagi, Siang, Malam, Selingan
  jumlah_porsi: string; // Misal: "1 Piring"
}

interface RiwayatPemeriksaan {
  id: number;
  jadwal: Jadwal | null;
  berat_badan: number;
  tinggi_badan: number;
  imt: number;
  tensi_sistolik: number;
  tensi_diastolik: number;
  gula_darah_puasa: number;
  status_gula_darah: string;
  catatan_dokter: string;
  daftar_obat: Obat[];
  rekomendasi_diet: RekomendasiDiet | null;
  detail_pangan: DetailPangan[];
  created_at: string;
}

interface GroupedArsip {
  peserta: Peserta;
  riwayat: RiwayatPemeriksaan[];
}

// --- FUNGSI BANTUAN UI ---
const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "P";
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-emerald-100 text-emerald-600",
    "bg-teal-100 text-teal-600",
    "bg-indigo-100 text-indigo-600",
  ];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
};
const getStatusGulaColor = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("normal") || s.includes("terkontrol"))
    return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400";
  if (s.includes("tinggi"))
    return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400";
  return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400";
};
const formatTanggal = (dateString?: string) => {
  if (!dateString) return "Tanggal Tidak Tersedia";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "Tanggal Tidak Tersedia";
  }
};

// Pewarnaan Badge Waktu Makan (Pagi/Siang/Malam)
const getWaktuMakanColor = (waktu: string) => {
  const w = waktu?.toLowerCase() || "";
  if (w.includes("pagi"))
    return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
  if (w.includes("siang"))
    return "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
  if (w.includes("malam"))
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400";
  return "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400"; // Selingan / Snack
};

export default function ArsipPemeriksaanComponent() {
  const [arsipList, setArsipList] = useState<GroupedArsip[]>([]);
  const [loading, setLoading] = useState(true);

  // States Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedPatient, setSelectedPatient] = useState<GroupedArsip | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const fetchArsip = async () => {
      setLoading(true);
      try {
        const response = await api.get("/arsip-pemeriksaan");
        setArsipList(response.data.data || []);
      } catch (error) {
        console.error("Gagal memuat arsip pemeriksaan", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArsip();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredData = arsipList.filter((item) => {
    const nama = item.peserta?.nama?.toLowerCase() || "";
    const bpjs = item.peserta?.no_bpjs || "";
    return (
      nama.includes(searchQuery.toLowerCase()) || bpjs.includes(searchQuery)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleOpenModal = (item: GroupedArsip) => {
    setSelectedPatient(item);
    setActiveTab(0);
    openModal();
  };

  return (
    <div className="space-y-6 mt-8">
      {/* HEADER & PENCARIAN */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Arsip Rekam Medis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Daftar seluruh peserta Prolanis dan riwayat kesehatannya.
          </p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari nama atau No BPJS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* TABEL ARSIP */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-700 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Identitas Pasien</th>
                <th className="px-6 py-4 font-semibold">Total Kunjungan</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Preview Kunjungan Terakhir
                </th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-gray-500 font-medium"
                  >
                    Memuat data rekam medis...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-gray-500 font-medium"
                  >
                    Data Tidak Ditemukan
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const riwayatTerbaru = item.riwayat[0];
                  const hasRiwayat = item.riwayat.length > 0;

                  return (
                    <tr
                      key={item.peserta.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm ${getAvatarColor(item.peserta?.nama)}`}
                          >
                            {getInitials(item.peserta?.nama)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-base">
                              {item.peserta?.nama}
                            </p>
                            <p className="text-xs font-mono text-gray-500 mt-0.5">
                              BPJS: {item.peserta?.no_bpjs}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${hasRiwayat ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
                        >
                          <span>{item.riwayat.length}</span> Kunjungan
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {hasRiwayat ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-xs text-gray-800 font-bold mb-1 dark:text-gray-300">
                              {riwayatTerbaru.jadwal?.tanggal ||
                                formatTanggal(riwayatTerbaru.created_at)}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {riwayatTerbaru.tensi_sistolik}/
                                {riwayatTerbaru.tensi_diastolik}
                              </span>
                              <span className="text-gray-300 dark:text-gray-700">
                                |
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusGulaColor(riwayatTerbaru.status_gula_darah)}`}
                              >
                                Gula: {riwayatTerbaru.gula_darah_puasa}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-medium italic text-gray-400 bg-gray-50 px-3 py-1 rounded-lg dark:bg-gray-800/50">
                            Belum ada riwayat
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenModal(item)}
                          disabled={!hasRiwayat}
                          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all ${hasRiwayat ? "bg-white border-gray-200 text-brand-600 hover:bg-brand-50 dark:bg-gray-800 dark:border-gray-700 dark:text-brand-400 dark:hover:bg-gray-700" : "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-600"}`}
                        >
                          Detail EMR
                        </button>
                      </td>
                    </tr>
                  );
                })
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
              peserta
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

      {/* --- MODAL EMR TIMELINE --- */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-6xl p-0 bg-transparent shadow-none border-none"
      >
        {selectedPatient &&
          selectedPatient.riwayat.length > 0 &&
          selectedPatient.riwayat[activeTab] &&
          (() => {
            const activeRekam = selectedPatient.riwayat[activeTab];
            const activeTanggalTampil =
              activeRekam.jadwal?.tanggal ||
              formatTanggal(activeRekam.created_at);

            return (
              <div className="w-full rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col md:flex-row h-auto md:h-[85vh] overflow-hidden border dark:border-gray-800">
                {/* KIRI: Timeline Riwayat */}
                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 dark:bg-gray-900/50 dark:border-gray-800 flex flex-col shrink-0">
                  <div className="p-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold ${getAvatarColor(selectedPatient.peserta?.nama)}`}
                      >
                        {getInitials(selectedPatient.peserta?.nama)}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                          {selectedPatient.peserta?.nama}
                        </h2>
                        <p className="text-gray-500 font-mono text-sm mt-1">
                          BPJS: {selectedPatient.peserta?.no_bpjs}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                      Riwayat Kunjungan
                    </p>
                    {selectedPatient.riwayat.map((rekam, index) => {
                      const tanggalList =
                        rekam.jadwal?.tanggal ||
                        formatTanggal(rekam.created_at);
                      const namaKegiatanList =
                        rekam.jadwal?.nama_kegiatan || "Pemeriksaan Medis";

                      return (
                        <button
                          key={rekam.id}
                          onClick={() => setActiveTab(index)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${activeTab === index ? "bg-brand-50 border-brand-300 shadow-sm dark:bg-brand-900/20 dark:border-brand-500/50" : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-100 dark:bg-transparent dark:hover:bg-gray-800"}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span
                              className={`font-bold ${activeTab === index ? "text-brand-700 dark:text-brand-400" : "text-gray-700 dark:text-gray-300"}`}
                            >
                              {tanggalList}
                            </span>
                            {index === 0 && (
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full dark:bg-rose-500/20 dark:text-rose-400">
                                Terbaru
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {namaKegiatanList}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* KANAN: Detail Medis */}
                <div className="w-full md:w-2/3 flex flex-col h-full bg-white dark:bg-gray-900 max-h-[85vh]">
                  <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                        Hasil Klinis Kunjungan
                      </h3>
                      <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">
                        {activeTanggalTampil}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-200 transition-colors dark:hover:bg-gray-800"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Antropometri & TTV */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Tinggi Badan
                        </p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                          {activeRekam.tinggi_badan}{" "}
                          <span className="text-sm font-normal">cm</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Berat Badan
                        </p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                          {activeRekam.berat_badan}{" "}
                          <span className="text-sm font-normal">kg</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          IMT
                        </p>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                          {activeRekam.imt}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Tekanan Darah
                          </span>
                          <span className="text-xl">❤️</span>
                        </div>
                        <p className="text-3xl font-black text-gray-800 dark:text-white">
                          {activeRekam.tensi_sistolik}/
                          {activeRekam.tensi_diastolik}{" "}
                          <span className="text-sm font-medium text-gray-500">
                            mmHg
                          </span>
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                            Gula Darah
                          </span>
                          <span className="text-xl">🩸</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-black text-gray-800 dark:text-white">
                            {activeRekam.gula_darah_puasa}{" "}
                            <span className="text-sm font-medium text-gray-500">
                              mg/dL
                            </span>
                          </p>
                        </div>
                        <p
                          className={`text-xs font-bold mt-2 px-2 py-1 rounded inline-block border ${getStatusGulaColor(activeRekam.status_gula_darah)}`}
                        >
                          {activeRekam.status_gula_darah}
                        </p>
                      </div>
                    </div>

                    {/* Catatan Dokter */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <span>🩺</span> Catatan / Diagnosa Dokter
                      </h4>
                      <div className="bg-brand-50/50 border border-brand-100 p-4 rounded-xl text-gray-700 dark:bg-brand-900/10 dark:border-brand-900/30 dark:text-gray-300 min-h-[80px]">
                        {activeRekam.catatan_dokter || "-"}
                      </div>
                    </div>

                    {/* ======================================= */}
                    {/* REKOMENDASI DIET & DETAIL PANGAN (BARU) */}
                    {/* ======================================= */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <span>🥗</span> Rekomendasi Diet & Pangan Lokal
                      </h4>

                      {activeRekam.rekomendasi_diet && (
                        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl mb-4 shadow-sm dark:bg-teal-900/20 dark:border-teal-800/50">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-black text-teal-800 dark:text-teal-400 text-lg">
                              Program Diet Harian
                            </p>
                            <span className="bg-white text-teal-700 px-3 py-1 rounded-lg text-xs font-bold border border-teal-100 shadow-sm dark:bg-teal-900/50 dark:border-teal-700 dark:text-teal-300">
                              Target:{" "}
                              {activeRekam.rekomendasi_diet.total_kalori_harian}{" "}
                              Kkal / Hari
                            </span>
                          </div>
                        </div>
                      )}

                      {activeRekam.detail_pangan?.length > 0 ? (
                        <div className="border border-gray-200 rounded-xl overflow-hidden dark:border-gray-700">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300">
                              <tr>
                                <th className="py-2.5 px-4 font-semibold text-center w-24">
                                  Waktu
                                </th>
                                <th className="py-2.5 px-4 font-semibold">
                                  Nama Pangan & Kategori
                                </th>
                                <th className="py-2.5 px-4 font-semibold text-right">
                                  Porsi
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {activeRekam.detail_pangan.map((pangan, idx) => (
                                <tr
                                  key={idx}
                                  className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                  <td className="py-3 px-4 text-center">
                                    <span
                                      className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${getWaktuMakanColor(pangan.waktu_makan)}`}
                                    >
                                      {pangan.waktu_makan}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <p className="font-bold text-gray-800 dark:text-gray-200">
                                      {pangan.nama_pangan}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {pangan.kategori}
                                    </p>
                                  </td>
                                  <td className="py-3 px-4 text-right font-medium text-gray-700 dark:text-gray-300">
                                    {pangan.jumlah_porsi}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-4 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl dark:bg-gray-800/50 dark:border-gray-700">
                          <p className="text-gray-500 text-sm font-medium">
                            Tidak ada rekomendasi diet terperinci untuk
                            kunjungan ini.
                          </p>
                        </div>
                      )}
                    </div>
                    {/* ======================================= */}

                    {/* Resep Obat */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <span>💊</span> Obat yang Diberikan
                      </h4>
                      {activeRekam.daftar_obat?.length > 0 ? (
                        <div className="space-y-3">
                          {activeRekam.daftar_obat.map((o, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700"
                            >
                              <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">
                                  {o.nama_obat}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                  {o.dosis} • {o.keterangan}
                                </p>
                              </div>
                              <div className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold dark:bg-gray-700 dark:text-gray-300">
                                {o.jumlah} item
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-5 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl dark:bg-gray-800/50 dark:border-gray-700">
                          <p className="text-gray-500 font-medium">
                            Tidak ada resep obat.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
