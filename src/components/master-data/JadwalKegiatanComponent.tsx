import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import api from "../../services/api";
import DatePicker from "../form/date-picker";

interface PesertaProlanis {
  id: number;
  nama_kegiatan: string;
  jenis_kegiatan: string;
  tanggal: string;
  lokasi: string;
  status: string;
  is_active: boolean;
}

export default function JadwalKegiatanComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  // --- STATES UTAMA ---
  const [dataList, setDataList] = useState<PesertaProlanis[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search States (Logika Client-Side)
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE UNTUK FORM & VALIDASI ---
  const [formData, setFormData] = useState({
    nama_kegiatan: "",
    jenis_kegiatan: "",
    tanggal: "",
    lokasi: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // --- FETCH DATA (Sekali Panggil untuk Client-Side) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Panggil endpoint tanpa parameter page/search untuk menarik semua data
      const response = await api.get("/jadwal-kegiatan");
      setDataList(response.data.data || response.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Tidak dapat memuat jadwal kegiatan.", "error");
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

  // --- LOGIKA PENCARIAN & PAGINATION (CLIENT-SIDE) ---
  const filteredData = dataList.filter(
    (item) =>
      item.nama_kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jenis_kegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- FUNGSI HANDLE INPUT FORM ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleTanggalChange = (date: string) => {
    setFormData((prev) => ({ ...prev, tanggal: date }));
    if (errors.tanggal) setErrors((prev) => ({ ...prev, tanggal: [] }));
  };

  // --- HANDLER MODAL AKSI ---
  const handleAdd = () => {
    setEditId(null);
    setFormData({
      nama_kegiatan: "",
      jenis_kegiatan: "",
      tanggal: "",
      lokasi: "",
    });
    setErrors({});
    openModal();
  };

  const handleEdit = (item: PesertaProlanis) => {
    setEditId(item.id);
    setFormData({
      nama_kegiatan: item.nama_kegiatan,
      jenis_kegiatan: item.jenis_kegiatan,
      tanggal: item.tanggal,
      lokasi: item.lokasi,
    });
    setErrors({});
    openModal();
  };

  const handleCloseModal = () => {
    setEditId(null);
    setFormData({
      nama_kegiatan: "",
      jenis_kegiatan: "",
      tanggal: "",
      lokasi: "",
    });
    setErrors({});
    closeModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editId) {
        await api.put(`/update-jadwal-kegiatan/${editId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data jadwal berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/simpan-jadwal-kegiatan", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal kegiatan baru telah ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchData(); // Refresh tabel
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    Swal.fire({
      title: "Hapus Kegiatan?",
      html: `Anda yakin ingin menghapus jadwal <b>${nama}</b> secara permanen?`,
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
          await api.delete(`/hapus-jadwal-kegiatan/${id}`);
          Swal.fire({
            title: "Terhapus!",
            text: "Jadwal kegiatan berhasil dihapus.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchData();
        } catch (error) {
          Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6 mt-8">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Daftar Jadwal Kegiatan
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manajemen agenda senam, pemeriksaan, dan edukasi Prolanis
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Cari jadwal kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg transition-all active:scale-95"
          >
            <span>+</span> Buat Jadwal Baru
          </button>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama & Jenis Kegiatan</th>
                <th className="px-6 py-4 font-semibold">Tanggal Kegiatan</th>
                <th className="px-6 py-4 font-semibold">Lokasi</th>
                <th className="px-6 py-4 font-semibold text-center">Status Kegiatan</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
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
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">📅</span>
                      <p className="text-gray-600 font-medium">Jadwal Kosong</p>
                      <p className="text-gray-400 text-sm mt-1">Tidak ada jadwal yang sesuai dengan pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white text-base">{item.nama_kegiatan}</p>
                      <span className="inline-flex mt-1 items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {item.jenis_kegiatan}
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

                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider
                          ${item.status === "0" ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-transparent" 
                          : item.status === "1" ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-transparent" 
                          : "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-transparent"}`}
                      >
                        {item.status === "0" ? "⏳ Menunggu" 
                         : item.status === "1" ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span> Aktif</> 
                         : "🔒 Selesai"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                          title="Edit Jadwal"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.nama_kegiatan)}
                          disabled={item.is_active || item.status !== "0"}
                          className={`p-2 rounded-lg transition-colors ${item.is_active || item.status !== "0" ? "text-gray-300 cursor-not-allowed dark:text-gray-600" : "text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"}`}
                          title={item.is_active || item.status !== "0" ? "Jadwal sudah aktif/selesai" : "Hapus Jadwal"}
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

        {/* CONTROLS PAGINATION */}
        {!loading && filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> - <span className="font-bold text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> dari <span className="font-bold text-gray-900 dark:text-white">{filteredData.length}</span> kegiatan
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

      {/* --- PERBAIKAN MODAL LAYOUT AGAR TIDAK TERPOTONG --- */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-4xl p-0 bg-transparent shadow-none border-none"
      >
        <div className="w-full rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col md:flex-row h-auto md:max-h-[90vh] overflow-hidden">
          
          {/* Panel Kiri: Info/Guide */}
          <div className="hidden md:block w-1/3 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white relative shrink-0">
            <div className="absolute top-0 right-0 opacity-10">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-2">{editId ? "Ubah" : "Buat"} Jadwal</h3>
                <p className="text-brand-100 text-sm leading-relaxed">
                  Jadwal yang dibuat akan masuk ke halaman Administrasi dan dapat dibuka kapan saja untuk absensi.
                </p>
              </div>
              
              <div className="space-y-4 text-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 mt-8">
                <h4 className="font-bold text-white mb-2">Panduan Pengisian:</h4>
                <div className="flex gap-2 items-start text-brand-50">
                  <span className="mt-0.5">📅</span>
                  <p>Pastikan tanggal kegiatan diisi dengan benar agar tidak terjadi bentrok.</p>
                </div>
                <div className="flex gap-2 items-start text-brand-50">
                  <span className="mt-0.5">📍</span>
                  <p>Cantumkan lokasi yang spesifik (Cth: Aula Puskesmas X).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Form (Dengan Strict Flex & Overflow) */}
          <div className="w-full md:w-2/3 flex flex-col h-full bg-gray-50/30 dark:bg-transparent max-h-[90vh]">
            
            {/* Modal Header Terkunci */}
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 md:hidden">
                {editId ? "Edit Jadwal" : "Tambah Jadwal"}
              </h3>
              <h3 className="hidden md:block text-lg font-bold text-gray-400 uppercase tracking-widest">
                Formulir Agenda
              </h3>
              <button onClick={handleCloseModal} className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors dark:hover:bg-gray-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Modal Body Bisa di-Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form id="jadwalForm" onSubmit={handleSave} className="space-y-5">
                
                <div>
                  <Label>Nama Kegiatan <span className="text-red-500">*</span></Label>
                  <Input
                    name="nama_kegiatan"
                    type="text"
                    value={formData.nama_kegiatan}
                    onChange={handleInputChange}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.nama_kegiatan ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                    placeholder="Cth: Senam Sehat & Edukasi Prolanis"
                  />
                  {errors.nama_kegiatan && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.nama_kegiatan[0]}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Jenis Kegiatan <span className="text-red-500">*</span></Label>
                    <Input
                      name="jenis_kegiatan"
                      type="text"
                      value={formData.jenis_kegiatan}
                      onChange={handleInputChange}
                      className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.jenis_kegiatan ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                      placeholder="Cth: Senam, Konseling, dll"
                    />
                    {errors.jenis_kegiatan && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.jenis_kegiatan[0]}</p>}
                  </div>
                  <div>
                    <Label>Tanggal Pelaksanaan <span className="text-red-500">*</span></Label>
                    <div className="mt-1.5">
                      <DatePicker
                        id="tanggal"
                        name="tanggal"
                        label=""
                        placeholder="Pilih tanggal"
                        value={formData.tanggal}
                        onChange={handleTanggalChange}
                      />
                    </div>
                    {errors.tanggal && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.tanggal[0]}</p>}
                  </div>
                </div>

                <div>
                  <Label>Lokasi Kegiatan <span className="text-red-500">*</span></Label>
                  <Input
                    name="lokasi"
                    type="text"
                    value={formData.lokasi}
                    onChange={handleInputChange}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 transition-all dark:bg-gray-800 dark:text-white ${errors.lokasi ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/10 dark:border-gray-700"}`}
                    placeholder="Nama gedung atau alamat spesifik"
                  />
                  {errors.lokasi && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.lokasi[0]}</p>}
                </div>

              </form>
            </div>

            {/* Modal Footer Terkunci */}
            <div className="shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
              <button type="button" onClick={handleCloseModal} className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Batal
              </button>
              <button type="submit" form="jadwalForm" disabled={isSaving} className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50">
                {isSaving ? "Menyimpan..." : "Simpan Jadwal"}
              </button>
            </div>

          </div>
        </div>
      </Modal>
    </div>
  );
}