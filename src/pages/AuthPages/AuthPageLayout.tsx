import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom"; // Perbaikan import dari react-router-dom
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

// --- KOMPONEN LOGO SMART-PROLANIS ---
const SmartProlanisLogo = () => (
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
      {/* Icon Kesehatan (Heartbeat / Cross) */}
      <svg 
        className="w-8 h-8 text-white drop-shadow-md" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12l-2 3h4l-2 3" />
      </svg>
    </div>
    <div className="flex flex-col text-left">
      <span className="text-3xl font-black leading-none text-white tracking-tight drop-shadow-md">
        Smart
      </span>
      <span className="text-sm font-bold tracking-[0.3em] text-brand-200">
        PROLANIS
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
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 dark:from-gray-800 dark:to-gray-950 lg:grid shadow-inner">
          <div className="relative flex items-center justify-center z-1 w-full">
            {/* Background Pattern */}
            <GridShape />
            
            <div className="flex flex-col items-center max-w-md px-8 text-center z-10">
              <Link to="/" className="block mb-8 transform transition hover:scale-105 duration-300">
                <SmartProlanisLogo />
              </Link>
              
              <div className="w-16 h-1 bg-brand-400/50 rounded-full mb-6"></div>
              
              <h2 className="text-xl font-semibold text-white mb-3 drop-shadow-sm">
                Sistem Informasi Manajemen Terintegrasi
              </h2>
              <p className="text-base text-brand-100/80 dark:text-white/60 leading-relaxed">
                Platform digital untuk mengelola, memantau, dan memberikan pelayanan terbaik bagi peserta Program Pengelolaan Penyakit Kronis.
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