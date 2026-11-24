// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";

// --- INTERFACE STATISTIK ---
interface GiziStats {
  total_pasien: number;
  selesai_edukasi: number;
  sisa_antrean: number;
}

interface WidgetProps {
  refreshTrigger: number; // Trigger dari komponen induk untuk re-fetch data
}

export default function WidgetStatistikGizi({ refreshTrigger }: WidgetProps) {
  const [stats, setStats] = useState<GiziStats>({
    total_pasien: 0,
    selesai_edukasi: 0,
    sisa_antrean: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Pastikan endpoint ini sudah Anda buat di Laravel Backend Anda
      const res = await api.get("/edukasi-gizi/statistik");
      
      // Asumsi response Laravel: response()->json(['total_pasien' => X, 'selesai_edukasi' => Y, 'sisa_antrean' => Z]);
      setStats(res.data);
    } catch (error) {
      console.error("Gagal memuat statistik edukasi gizi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  // Kalkulasi persentase selesai untuk Progress Bar
  const progressPercentage = stats.total_pasien > 0
    ? Math.round((stats.selesai_edukasi / stats.total_pasien) * 100)
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-6">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 mb-6">
      
      {/* KARTU 1: TOTAL PESERTA */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform dark:bg-blue-500/5"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Peserta Gizi</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats.total_pasien}
              </h3>
              <span className="text-sm font-medium text-gray-500">Orang</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* KARTU 2: SELESAI EDUKASI (Dengan Progress Bar) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-110 transition-transform dark:bg-emerald-500/5"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="w-full">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selesai Edukasi</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats.selesai_edukasi}
              </h3>
              <span className="text-sm font-medium text-gray-500">Orang</span>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{progressPercentage}% Selesai</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-800">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* KARTU 3: SISA ANTREAN */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-110 transition-transform dark:bg-amber-500/5"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sisa Antrean</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white/90">
                {stats.sisa_antrean}
              </h3>
              <span className="text-sm font-medium text-gray-500">Orang</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 relative">
             {/* Animasi Ping jika ada antrean tersisa */}
             {stats.sisa_antrean > 0 && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}