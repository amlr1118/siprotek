import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import api from "../../services/api";

// --- INTERFACES ---
interface DimensiOption {
  id: number;
  kode_dimensi: string;
  nama_dimensi: string;
}

interface UnitOption {
  id: number;
  kode_unit: string;
  nama_unit: string;
}

interface KategoriResikoOption {
  id: number;
  level_reisko: string;
  bobot_prioritas: number;
  kode_warna: string;
}

interface HierarkiOption {
  id: number;
  urutan_efektivitas: number;
  nama_hierarki: string;
}

interface AturanK3Input {
  id: number;
  kode_rule: string;
  kelompok_aturan: string;
  id_dimensi: number;
  id_unit: number;
  kondisi_if: string;
  operator_logika: string;
  kondisi_and: string;
  tindakan_then: string;
  tingkat_keparahan: string;
  tingkat_kemungkinan: string;
  id_kategori_resiko: number;
  id_hierarki: number;
  rekomendasi_mitigasi: string;
  basis_temuan_tahap1: string;
  status_aturan: boolean;
  relasi_aturan_k3_ke_dimensi_bahaya?: DimensiOption | null;
  relasi_aturan_k3_ke_unit_kerja?: UnitOption | null;
  relasi_aturan_k3_ke_kategori_resiko?: KategoriResikoOption | null;
  relasi_aturan_k3_ke_hierarki_niosh?: HierarkiOption | null;
}

// --- FUNGSI BANTUAN BADGE ---
const getRiskBadgeStyle = (level?: string) => {
  switch ((level || "").toLowerCase()) {
    case "kritis":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400";
    case "tinggi":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400";
    case "sedang":
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400";
    case "rendah":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
  }
};

const getDimensiBadgeStyle = (kode?: string) => {
  switch ((kode || "").toUpperCase()) {
    case "BIO":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "KIM":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "FIS":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ERG":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PSI":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export default function AturanK3Component() {
  const { isOpen, openModal, closeModal } = useModal();
  const detailModal = useModal();

  // --- STATES UTAMA ---
  const [dataList, setDataList] = useState<AturanK3Input[]>([]);
  const [dimensiList, setDimensiList] = useState<DimensiOption[]>([]);
  const [unitList, setUnitList] = useState<UnitOption[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriResikoOption[]>([]);
  const [hierarkiList, setHierarkiList] = useState<HierarkiOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter, Search & Pagination States (Client-Side)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDimensi, setFilterDimensi] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterResiko, setFilterResiko] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Preview State
  const [selectedDetail, setSelectedDetail] = useState<AturanK3Input | null>(
    null
  );

  // --- STATE FORM & VALIDASI ---
  const initialFormState = {
    kode_rule: "",
    kelompok_aturan: "",
    id_dimensi: "",
    id_unit: "",
    kondisi_if: "",
    operator_logika: "AND",
    kondisi_and: "",
    tindakan_then: "",
    tingkat_keparahan: "",
    tingkat_kemungkinan: "",
    id_kategori_resiko: "",
    id_hierarki: "",
    rekomendasi_mitigasi: "",
    basis_temuan_tahap1: "",
    status_aturan: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // --- FETCH DATA UTAMA & MASTER RELASI ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resAturan, resDimensi, resUnit, resKategori, resHierarki] =
        await Promise.all([
          api.get("/aturan-k3"),
          api.get("/dimensi-bahaya"),
          api.get("/unit-kerja"),
          api.get("/kategori-resiko"),
          api.get("/hierarki-niosh"),
        ]);

      setDataList(resAturan.data.data || resAturan.data);
      setDimensiList(resDimensi.data.data || resDimensi.data);
      setUnitList(resUnit.data.data || resUnit.data);
      setKategoriList(resKategori.data.data || resKategori.data);
      setHierarkiList(resHierarki.data.data || resHierarki.data);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Tidak dapat memuat data basis aturan K3.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAturanOnly = async () => {
    try {
      const resAturan = await api.get("/aturan-k3");
      setDataList(resAturan.data.data || resAturan.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDimensi, filterUnit, filterResiko]);

  // --- LOGIKA FILTER, PENCARIAN & PAGINATION ---
  const filteredData = dataList.filter((item) => {
    const keyword = searchQuery.toLowerCase();
    const matchSearch =
      item.kode_rule.toLowerCase().includes(keyword) ||
      item.kelompok_aturan.toLowerCase().includes(keyword) ||
      item.kondisi_if.toLowerCase().includes(keyword) ||
      item.kondisi_and.toLowerCase().includes(keyword) ||
      item.tindakan_then.toLowerCase().includes(keyword) ||
      item.rekomendasi_mitigasi.toLowerCase().includes(keyword);

    const matchDimensi =
      filterDimensi === "" || String(item.id_dimensi) === filterDimensi;
    const matchUnit = filterUnit === "" || String(item.id_unit) === filterUnit;
    const matchResiko =
      filterResiko === "" || String(item.id_kategori_resiko) === filterResiko;

    return matchSearch && matchDimensi && matchUnit && matchResiko;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // --- FUNGSI HANDLE INPUT FORM ---
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "kode_rule" || name === "operator_logika"
            ? value.toUpperCase()
            : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  // --- HANDLER MODAL AKSI ---
  const handleAdd = () => {
    setEditId(null);
    setFormData(initialFormState);
    setErrors({});
    openModal();
  };

  const handleEdit = (item: AturanK3Input) => {
    setEditId(item.id);
    setFormData({
      kode_rule: item.kode_rule,
      kelompok_aturan: item.kelompok_aturan,
      id_dimensi: String(item.id_dimensi),
      id_unit: String(item.id_unit),
      kondisi_if: item.kondisi_if,
      operator_logika: item.operator_logika,
      kondisi_and: item.kondisi_and,
      tindakan_then: item.tindakan_then,
      tingkat_keparahan: item.tingkat_keparahan,
      tingkat_kemungkinan: item.tingkat_kemungkinan,
      id_kategori_resiko: String(item.id_kategori_resiko),
      id_hierarki: String(item.id_hierarki),
      rekomendasi_mitigasi: item.rekomendasi_mitigasi,
      basis_temuan_tahap1: item.basis_temuan_tahap1,
      status_aturan: Boolean(item.status_aturan),
    });
    setErrors({});
    openModal();
  };

  const handleViewDetail = (item: AturanK3Input) => {
    setSelectedDetail(item);
    detailModal.openModal();
  };

  const handleCloseModal = () => {
    setEditId(null);
    setFormData(initialFormState);
    setErrors({});
    closeModal();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editId) {
        await api.put(`/update-aturan-k3/${editId}`, formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Basis aturan K3 berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post("/simpan-aturan-k3", formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Basis aturan K3 baru telah ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      closeModal();
      fetchAturanOnly();
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
        if (error.response.data.message) {
          Swal.fire("Validasi Gagal", error.response.data.message, "warning");
        }
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan data.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (item: AturanK3Input) => {
    try {
      await api.patch(`/toggle-status-aturan-k3/${item.id}`);
      fetchAturanOnly();
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Status ${item.kode_rule} diperbarui`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire("Gagal", "Tidak dapat mengubah status aturan.", "error");
    }
  };

  const handleDelete = async (id: number, kodeRule: string) => {
    Swal.fire({
      title: "Hapus Basis Aturan?",
      html: `Anda yakin ingin menghapus kaidah produksi <b>${kodeRule}</b>?`,
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
          await api.delete(`/hapus-aturan-k3/${id}`);
          Swal.fire({
            title: "Terhapus!",
            text: "Basis aturan K3 berhasil dihapus.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchAturanOnly();
        } catch (error: any) {
          const msg =
            error.response?.data?.message ||
            "Terjadi kesalahan saat menghapus data.";
          Swal.fire("Gagal!", msg, "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6 mt-8">
      {/* HEADER & CONTROLS */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Basis Pengetahuan &amp; Aturan K3 (Rule Base)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Kelola kaidah produksi IF–AND–THEN, matriks keparahan-kemungkinan,
              dan rekomendasi pengendalian NIOSH.
            </p>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 hover:shadow-lg transition-all active:scale-95 shrink-0"
          >
            <span>+</span> Tambah Aturan K3
          </button>
        </div>

        {/* BARIS PENCARIAN & FILTER MULTI-KRITERIA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="relative group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <svg
                width="16"
                height="16"
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
              placeholder="Cari kode rule, kondisi IF, atau mitigasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-3 text-sm font-medium text-gray-700 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <select
            value={filterDimensi}
            onChange={(e) => setFilterDimensi(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm font-medium text-gray-700 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Semua Dimensi Bahaya</option>
            {dimensiList.map((d) => (
              <option key={d.id} value={d.id}>
                [{d.kode_dimensi}] {d.nama_dimensi}
              </option>
            ))}
          </select>

          <select
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm font-medium text-gray-700 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Semua Unit Kerja</option>
            {unitList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama_unit} ({u.kode_unit})
              </option>
            ))}
          </select>

          <select
            value={filterResiko}
            onChange={(e) => setFilterResiko(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-sm font-medium text-gray-700 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Semua Tingkat Risiko</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>
                Risiko {k.level_reisko}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-5 py-4 font-semibold">Kode &amp; Dimensi</th>
                <th className="px-5 py-4 font-semibold">Unit Kerja</th>
                <th className="px-5 py-4 font-semibold">
                  Kaidah Produksi (IF – AND – THEN)
                </th>
                <th className="px-5 py-4 font-semibold">Risiko &amp; NIOSH</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
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
                        Memuat basis aturan K3...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">📋</span>
                      <p className="text-gray-600 font-medium">
                        Basis Aturan Tidak Ditemukan
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Ubah kata kunci pencarian atau filter untuk menampilkan
                        aturan K3.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const dimensi = item.relasi_aturan_k3_ke_dimensi_bahaya;
                  const unit = item.relasi_aturan_k3_ke_unit_kerja;
                  const risiko = item.relasi_aturan_k3_ke_kategori_resiko;
                  const hierarki = item.relasi_aturan_k3_ke_hierarki_niosh;

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-4 align-top">
                        <p className="font-mono font-bold text-gray-900 dark:text-white">
                          {item.kode_rule}
                        </p>
                        {dimensi && (
                          <span
                            className={`mt-1.5 inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${getDimensiBadgeStyle(dimensi.kode_dimensi)}`}
                          >
                            {dimensi.kode_dimensi} • {dimensi.nama_dimensi}
                          </span>
                        )}
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {item.kelompok_aturan}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {unit ? unit.nama_unit : `ID: ${item.id_unit}`}
                        </p>
                        {unit && (
                          <p className="text-xs font-mono text-gray-400">
                            {unit.kode_unit}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 max-w-md align-top">
                        <div className="space-y-1 text-xs leading-relaxed">
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-bold text-brand-600">
                              IF{" "}
                            </span>
                            {item.kondisi_if}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-bold text-amber-600">
                              {item.operator_logika}{" "}
                            </span>
                            {item.kondisi_and}
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            <span className="font-bold text-emerald-600">
                              THEN{" "}
                            </span>
                            {item.tindakan_then}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border ${getRiskBadgeStyle(risiko?.level_reisko)}`}
                        >
                          {risiko ? risiko.level_reisko : "-"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1.5">
                          {hierarki
                            ? `${hierarki.urutan_efektivitas}. ${hierarki.nama_hierarki}`
                            : "-"}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                            item.status_aturan
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                          title="Klik untuk mengubah status aktif aturan"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${item.status_aturan ? "bg-emerald-500" : "bg-gray-400"}`}
                          />
                          {item.status_aturan ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>

                      <td className="px-5 py-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                            title="Detail & Mitigasi Rule"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                            title="Edit Aturan K3"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.kode_rule)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-gray-800"
                            title="Hapus Aturan K3"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
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
              aturan K3
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

      {/* --- MODAL DETAIL RULE --- */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.closeModal}
        className="max-w-2xl p-0 bg-transparent shadow-none border-none"
      >
        {selectedDetail && (
          <div className="w-full rounded-3xl bg-white p-6 md:p-8 shadow-2xl dark:bg-gray-900 space-y-5">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-600">
                  {selectedDetail.kode_rule}
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedDetail.kelompok_aturan}
                </h3>
              </div>
              <button
                onClick={detailModal.closeModal}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 space-y-2 text-sm dark:bg-gray-800/70">
              <p>
                <span className="font-bold text-brand-600">IF: </span>
                {selectedDetail.kondisi_if}
              </p>
              <p>
                <span className="font-bold text-amber-600">
                  {selectedDetail.operator_logika}:{" "}
                </span>
                {selectedDetail.kondisi_and}
              </p>
              <p>
                <span className="font-bold text-emerald-600">THEN: </span>
                {selectedDetail.tindakan_then}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs text-gray-400">Tingkat Keparahan</p>
                <p className="font-bold text-gray-800 dark:text-white mt-0.5">
                  {selectedDetail.tingkat_keparahan}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                <p className="text-xs text-gray-400">Tingkat Kemungkinan</p>
                <p className="font-bold text-gray-800 dark:text-white mt-0.5">
                  {selectedDetail.tingkat_kemungkinan}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Rekomendasi Mitigasi (
                  {
                    selectedDetail.relasi_aturan_k3_ke_hierarki_niosh
                      ?.nama_hierarki
                  }
                  )
                </p>
                <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedDetail.rekomendasi_mitigasi}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Basis Temuan Tahap 1 (RSUD Buton Selatan)
                </p>
                <p className="mt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedDetail.basis_temuan_tahap1}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL FORM TAMBAH / EDIT ATURAN K3 --- */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        className="max-w-5xl p-0 bg-transparent shadow-none border-none"
      >
        <div className="w-full rounded-3xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col md:flex-row h-auto md:max-h-[90vh] overflow-hidden">
          {/* Panel Kiri: Info/Guide */}
          <div className="hidden md:block w-1/3 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white relative shrink-0">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-2">
                  {editId ? "Ubah Kaidah" : "Tambah"} Aturan K3
                </h3>
                <p className="text-brand-100 text-sm leading-relaxed">
                  Setiap aturan merepresentasikan relasi kondisi bahaya di
                  lapangan (IF–AND) dengan evaluasi risiko dan rekomendasi
                  mitigasi berbasis Hierarki NIOSH.
                </p>
              </div>

              <div className="space-y-3 text-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 mt-8">
                <h4 className="font-bold text-white mb-1">
                  Format Kode Rule:
                </h4>
                <div className="space-y-1.5 text-brand-50 text-xs">
                  <p>
                    • <strong>BIO-IGD-01:</strong> Dimensi - Unit - Nomor
                  </p>
                  <p>
                    • <strong>FIS-ALL-01:</strong> Aturan umum lintas unit
                  </p>
                  <p>
                    • <strong>Operator Logika:</strong> Gunakan <code>AND</code>{" "}
                    untuk gabungan dua premis fakta.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Kanan: Form */}
          <div className="w-full md:w-2/3 flex flex-col h-full bg-gray-50/30 dark:bg-transparent max-h-[90vh]">
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 md:hidden">
                {editId ? "Edit Aturan K3" : "Tambah Aturan K3"}
              </h3>
              <h3 className="hidden md:block text-lg font-bold text-gray-400 uppercase tracking-widest">
                Struktur Kaidah Produksi &amp; Matriks Risiko
              </h3>
              <button
                onClick={handleCloseModal}
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

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <form
                id="aturanK3Form"
                onSubmit={handleSave}
                className="space-y-5"
              >
                {/* Bagian 1: Identitas Rule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Kode Rule <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="kode_rule"
                      type="text"
                      value={formData.kode_rule}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.kode_rule ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                      placeholder="Contoh: BIO-IGD-01"
                    />
                    {errors.kode_rule && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.kode_rule[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Kelompok Aturan <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="kelompok_aturan"
                      type="text"
                      value={formData.kelompok_aturan}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.kelompok_aturan ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                      placeholder="Contoh: Penanganan Benda Tajam & Limbah Infeksius"
                    />
                    {errors.kelompok_aturan && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.kelompok_aturan[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Dimensi Bahaya <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_dimensi"
                      value={formData.id_dimensi}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.id_dimensi ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    >
                      <option value="">Pilih Dimensi Bahaya...</option>
                      {dimensiList.map((d) => (
                        <option key={d.id} value={d.id}>
                          [{d.kode_dimensi}] {d.nama_dimensi}
                        </option>
                      ))}
                    </select>
                    {errors.id_dimensi && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.id_dimensi[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Unit Kerja Sasaran <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_unit"
                      value={formData.id_unit}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.id_unit ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    >
                      <option value="">Pilih Unit Kerja...</option>
                      {unitList.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nama_unit} ({u.kode_unit})
                        </option>
                      ))}
                    </select>
                    {errors.id_unit && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.id_unit[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bagian 2: Premis & Konklusi Logika */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Kondisi IF (Premis 1){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="kondisi_if"
                      type="text"
                      value={formData.kondisi_if}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.kondisi_if ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                      placeholder="Contoh: Petugas melakukan tindakan injeksi atau pemasangan infus"
                    />
                    {errors.kondisi_if && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.kondisi_if[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Operator Logika <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="operator_logika"
                      value={formData.operator_logika}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-mono font-bold focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Kondisi AND (Premis 2){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="kondisi_and"
                      type="text"
                      value={formData.kondisi_and}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.kondisi_and ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                      placeholder="Contoh: Safety box tidak tersedia atau penuh > 3/4"
                    />
                    {errors.kondisi_and && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.kondisi_and[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Tindakan THEN (Konklusi Bahaya){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="tindakan_then"
                      type="text"
                      value={formData.tindakan_then}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.tindakan_then ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                      placeholder="Contoh: Risiko tinggi tertusuk jarum suntik (NSI)"
                    />
                    {errors.tindakan_then && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.tindakan_then[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bagian 3: Matriks Risiko & NIOSH */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Tingkat Keparahan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tingkat_keparahan"
                      value={formData.tingkat_keparahan}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.tingkat_keparahan ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    >
                      <option value="">Pilih Keparahan...</option>
                      <option value="Tidak Signifikan">Tidak Signifikan</option>
                      <option value="Ringan">Ringan</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Berat">Berat</option>
                      <option value="Katastropik / Fatal">
                        Katastropik / Fatal
                      </option>
                    </select>
                    {errors.tingkat_keparahan && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.tingkat_keparahan[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Tingkat Kemungkinan{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tingkat_kemungkinan"
                      value={formData.tingkat_kemungkinan}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.tingkat_kemungkinan ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    >
                      <option value="">Pilih Kemungkinan...</option>
                      <option value="Jarang Terjadi">Jarang Terjadi</option>
                      <option value="Kadang-kadang">Kadang-kadang</option>
                      <option value="Mungkin Terjadi">Mungkin Terjadi</option>
                      <option value="Sering Terjadi">Sering Terjadi</option>
                      <option value="Hampir Pasti">Hampir Pasti</option>
                    </select>
                    {errors.tingkat_kemungkinan && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.tingkat_kemungkinan[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Kategori Risiko <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_kategori_resiko"
                      value={formData.id_kategori_resiko}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.id_kategori_resiko ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    >
                      <option value="">Pilih Kategori Risiko...</option>
                      {kategoriList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.level_reisko} (Bobot: {k.bobot_prioritas})
                        </option>
                      ))}
                    </select>
                    {errors.id_kategori_resiko && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.id_kategori_resiko[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Hierarki Pengendalian NIOSH{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="id_hierarki"
                      value={formData.id_hierarki}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.id_hierarki ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    >
                      <option value="">Pilih Hierarki NIOSH...</option>
                      {hierarkiList.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.urutan_efektivitas}. {h.nama_hierarki}
                        </option>
                      ))}
                    </select>
                    {errors.id_hierarki && (
                      <p className="mt-1 text-xs font-semibold text-red-500">
                        {errors.id_hierarki[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Rekomendasi Mitigasi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="rekomendasi_mitigasi"
                    rows={2}
                    maxLength={255}
                    value={formData.rekomendasi_mitigasi}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.rekomendasi_mitigasi ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    placeholder="Tindakan pengendalian teknis/administratif/APD yang wajib dijalankan unit"
                  />
                  {errors.rekomendasi_mitigasi && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.rekomendasi_mitigasi[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Basis Temuan Tahap 1{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="basis_temuan_tahap1"
                    type="text"
                    maxLength={255}
                    value={formData.basis_temuan_tahap1}
                    onChange={handleInputChange}
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 dark:bg-gray-800 dark:text-white ${errors.basis_temuan_tahap1 ? "border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"}`}
                    placeholder="Contoh: Observasi lapangan IGD & regulasi Permenkes No. 66 Tahun 2016"
                  />
                  {errors.basis_temuan_tahap1 && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      {errors.basis_temuan_tahap1[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    id="status_aturan"
                    name="status_aturan"
                    type="checkbox"
                    checked={formData.status_aturan}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label
                    htmlFor="status_aturan"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Aktifkan aturan ini dalam mesin inferensi Forward Chaining
                  </label>
                </div>
              </form>
            </div>

            <div className="shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 mt-auto">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="submit"
                form="aturanK3Form"
                disabled={isSaving}
                className="rounded-xl bg-brand-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50"
              >
                {isSaving
                  ? "Menyimpan..."
                  : editId
                    ? "Simpan Perubahan"
                    : "Simpan Aturan K3"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}