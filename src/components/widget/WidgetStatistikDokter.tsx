// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import api from "../../services/api";

interface WidgetProps {
  refreshTrigger?: number;
}

export default function WidgetStatistikDokter({
  refreshTrigger = 0,
}: WidgetProps) {
  const [statistik, setStatistik] = useState({
    totalAntrean: 0,
    selesaiDiperiksa: 0,
    sisaAntrean: 0,
  });

  const fetchStatistik = async () => {
    try {
      const res = await api.get("/widget/statistik-dokter");
      if (res.data && res.data.data) {
        setStatistik(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data statistik dokter:", error);
    }
  };

  // Fetch ulang data jika refreshTrigger dari komponen induk berubah
  useEffect(() => {
    fetchStatistik();
  }, [refreshTrigger]);

  const { totalAntrean, selesaiDiperiksa, sisaAntrean } = statistik;
  const progressPercent =
    totalAntrean === 0
      ? 0
      : Math.round((selesaiDiperiksa / totalAntrean) * 100);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
      {/* WIDGET 1: TOTAL PASIEN MASUK */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Antrean Masuk
            </p>
            <h4 className="mt-1 text-title-md font-bold text-gray-800 dark:text-white/90">
              {totalAntrean}{" "}
              <span className="text-sm font-medium text-gray-500">Pasien</span>
            </h4>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* WIDGET 2: SELESAI DIDIAGNOSIS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Selesai Ditangani
            </p>
            <h4 className="mt-1 text-title-md font-bold text-emerald-600 dark:text-emerald-500">
              {selesaiDiperiksa}{" "}
              <span className="text-sm font-medium text-gray-500">Pasien</span>
            </h4>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Progress: {progressPercent}%
        </p>
      </div>

      {/* WIDGET 3: MENUNGGU DOKTER */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Menunggu Dokter
            </p>
            <h4 className="mt-1 text-title-md font-bold text-amber-500 dark:text-amber-400">
              {sisaAntrean}{" "}
              <span className="text-sm font-medium text-gray-500">Pasien</span>
            </h4>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/20">
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
