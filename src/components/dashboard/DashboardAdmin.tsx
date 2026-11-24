//import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";

// --- IMPORT SEMUA WIDGET YANG TELAH DIPISAH ---
import WidgetTotalPeserta from "../widget/WidgetTotalPeserta";
import WidgetJadwalBulanIni from "../widget/WidgetJadwalBulanIni";
import WidgetTotalPengguna from "../widget/WidgetTotalPengguna";
import WidgetHomeVisit from "../widget/WidgetHomeVisit"; 
import WidgetCharts from "../widget/WidgetCharts";

interface DashboardStats {
  total_peserta: number;
  total_jadwal_bulan_ini: number;
  total_pengguna: number;
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<DashboardStats>({
    total_peserta: 0,
    total_jadwal_bulan_ini: 0,
    total_pengguna: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Mengambil data real dari backend Laravel
        const response = await api.get("/admin/dashboard-stats"); 
        setStats(response.data);
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 mt-6">
      
      {/* HEADER DASHBOARD */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12h3v8h14v-8h3L12 2z" /></svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Selamat Datang, Administrator! 👋</h1>
          <p className="text-brand-100 text-sm md:text-base max-w-2xl leading-relaxed">
            Pantau seluruh aktivitas program Prolanis, mulai dari kepesertaan, kelancaran operasional jadwal, hingga peringatan pasien drop-out yang memerlukan Home Visit.
          </p>
        </div>
      </div>

      {/* 
        GRID WIDGET STATISTIK (SANGAT BERSIH DAN RAPI KARENA SUDAH DIPISAH)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <WidgetTotalPeserta total={stats.total_peserta} loading={loading} />
        <WidgetJadwalBulanIni total={stats.total_jadwal_bulan_ini} loading={loading} />
        <WidgetTotalPengguna total={stats.total_pengguna} loading={loading} />
        <WidgetHomeVisit /> 
      </div>

      <div className="mt-6">
        <WidgetCharts />
      </div>

      {/* LANJUTAN KODE SEKSI BAWAH (Jadwal Mendatang & Akses Cepat seperti sebelumnya) */}
      {/* ... (Masukkan kode seksi bawah dari chat sebelumnya ke sini) ... */}

    </div>
  );
}