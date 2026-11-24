// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";

interface WidgetStats {
  total_antrean: number;
  selesai: number;
  menunggu: number;
}

export default function WidgetStatistikApotek({ refreshTrigger }: { refreshTrigger?: number }) {
  const [stats, setStats] = useState<WidgetStats>({ total_antrean: 0, selesai: 0, menunggu: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWidgetStats();
  }, [refreshTrigger]); // Refresh otomatis jika ada aksi tebus obat

  const fetchWidgetStats = async () => {
    try {
      const response = await api.get("/apotek/statistik");
      setStats(response.data);
    } catch (error) {
      console.error("Gagal memuat statistik apotek", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-2 mt-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-2 mt-4">
      {/* 1. Total Resep */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full opacity-50 dark:bg-purple-500/10"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Antrean Resep</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">{stats.total_antrean}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 text-xl">
            💊
          </div>
        </div>
      </div>

      {/* 2. Selesai */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 dark:bg-emerald-500/10"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Obat Diserahkan</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">{stats.selesai}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xl">
            ✅
          </div>
        </div>
      </div>

      {/* 3. Menunggu */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 dark:bg-amber-500/10"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Menunggu Disiapkan</p>
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90 mt-1">{stats.menunggu}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-xl">
            ⏳
          </div>
        </div>
      </div>
    </div>
  );
}