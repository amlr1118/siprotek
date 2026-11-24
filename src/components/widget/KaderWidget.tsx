// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api"; 
import { CalenderIcon, CheckCircleIcon, TimeIcon } from "../../icons"; 

interface WidgetStats {
  total_jadwal: number;
  selesai: number;
  mendatang: number;
}

export default function WidgetStatistikJadwal() {
  const [stats, setStats] = useState<WidgetStats>({
    total_jadwal: 0,
    selesai: 0,
    mendatang: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchWidgetStats();
  }, []);

  const fetchWidgetStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/statistik-jadwal");
      setStats(response.data);
    } catch (error) {
      console.error("Gagal memuat data statistik jadwal:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-8 mt-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-3 w-full">
                <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 dark:bg-gray-700"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full shrink-0 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-8 mt-4">
      {/* 1. Total Jadwal (Warna Brand/Indigo) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-50 rounded-full opacity-50 group-hover:scale-110 transition-transform dark:bg-brand-500/5"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jadwal (Bulan Ini)</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats.total_jadwal}
              </h3>
              <span className="text-sm font-medium text-gray-500">Sesi</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <CalenderIcon className="size-6" />
          </div>
        </div>
      </div>

      {/* 2. Kegiatan Selesai (Warna Hijau) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform dark:bg-emerald-500/5"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kegiatan Selesai</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats.selesai}
              </h3>
              <span className="text-sm font-medium text-gray-500">Sesi</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircleIcon className="size-6" />
          </div>
        </div>
      </div>

      {/* 3. Jadwal Mendatang (Warna Kuning/Amber) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform dark:bg-amber-500/5"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jadwal Mendatang</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats.mendatang}
              </h3>
              <span className="text-sm font-medium text-gray-500">Sesi</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <TimeIcon className="size-6" />
          </div>
        </div>
      </div>
    </div>
  );
}