import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

// --- KOMPONEN LOGO SIPROTEK (SESUAI GAMBAR REFERENSI) ---
const SiprotekLogo = () => (
  <div className="flex flex-col items-center gap-4">
    {/* Wadah ikon dengan latar putih bersih agar warna hijau perisai & teks kontras */}
    <div className="flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl p-3.5 ring-4 ring-white/15">
      <svg
        viewBox="0 0 200 220"
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ClipPath agar roda gigi bagian bawah terpotong rapi mengikuti lengkungan perisai */}
          <clipPath id="siprotek-shield-clip">
            <path d="M100 10 L176 34 V104 C176 156 142 192 100 210 C58 192 24 156 24 104 V34 L100 10 Z" />
          </clipPath>
        </defs>

        {/* Bentuk Perisai Hijau K3 */}
        <path
          d="M100 10 L176 34 V104 C176 156 142 192 100 210 C58 192 24 156 24 104 V34 L100 10 Z"
          fill="#378E43"
        />

        {/* Palang Medis Putih (Atas) */}
        <path
          d="M86 42 H114 V68 H140 V96 H114 V122 H86 V96 H60 V68 H86 V42 Z"
          fill="#FFFFFF"
        />

        {/* Roda Gigi Putih (Bawah - terpotong rapi di dalam perisai) */}
        <g clipPath="url(#siprotek-shield-clip)">
          {/* Gigi-gigi roda */}
          <g fill="#FFFFFF">
            <rect x="91" y="132" width="18" height="22" rx="3" />
            <rect
              x="91"
              y="132"
              width="18"
              height="22"
              rx="3"
              transform="rotate(36 100 182)"
            />
            <rect
              x="91"
              y="132"
              width="18"
              height="22"
              rx="3"
              transform="rotate(72 100 182)"
            />
            <rect
              x="91"
              y="132"
              width="18"
              height="22"
              rx="3"
              transform="rotate(-36 100 182)"
            />
            <rect
              x="91"
              y="132"
              width="18"
              height="22"
              rx="3"
              transform="rotate(-72 100 182)"
            />
          </g>
          {/* Lingkaran luar roda gigi */}
          <circle cx="100" cy="182" r="40" fill="#FFFFFF" />
          {/* Lubang tengah roda gigi (warna hijau perisai) */}
          <circle cx="100" cy="182" r="21" fill="#378E43" />
        </g>
      </svg>
    </div>

    {/* Tipografi SIPROTEK */}
    <div className="flex flex-col items-center text-center">
      <span className="text-4xl font-black leading-none text-white tracking-[0.14em] drop-shadow-md">
        SIPROTEK
      </span>
      <span className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">
        Sistem Proteksi &amp; K3RS
      </span>
    </div>
  </div>
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {/* Kiri: Form Login */}
        {children}

        {/* Kanan: Banner Branding (Hidden on Mobile) */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-gradient-to-br from-emerald-800 via-brand-800 to-gray-950 dark:from-gray-800 dark:to-gray-950 lg:grid shadow-inner">
          <div className="relative flex items-center justify-center z-1 w-full">
            {/* Background Pattern */}
            <GridShape />

            <div className="flex flex-col items-center max-w-md px-8 text-center z-10">
              <Link
                to="/"
                className="block mb-7 transform transition hover:scale-105 duration-300"
              >
                <SiprotekLogo />
              </Link>

              <div className="w-16 h-1 bg-emerald-400/60 rounded-full mb-6"></div>

              <h2 className="text-xl font-bold text-white mb-3 drop-shadow-sm">
                Sistem Prediksi Risiko &amp; Keselamatan Kerja Rumah Sakit
              </h2>
              <p className="text-sm text-brand-100/85 dark:text-white/70 leading-relaxed">
                Platform cerdas berbasis <em>Forward Chaining</em> dan Hierarki
                Pengendalian NIOSH untuk identifikasi bahaya, evaluasi tingkat
                risiko, serta rekomendasi mitigasi K3RS di RSUD Buton Selatan.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggler Floating */}
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block shadow-lg rounded-full">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
