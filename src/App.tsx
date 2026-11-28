import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Pastikan import dari react-router-dom
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import PesertaProlanisComponent from "./components/master-data/PesertaProlanisComponent";
import PenggunaComponent from "./components/master-data/PenggunaComponent";
import UnitKerjaComponent from "./components/master-data/DataUnitKerja";
import DimensiBahayaComponent from "./components/master-data/DimensiBahayaComponent";
import KategoriResikoComponent from "./components/master-data/KategoriResikoComponent";
import HierarkiNioshComponent from "./components/master-data/HierarkiNioshComponent";
import AturanK3Component from "./components/master-data/AturanK3Component";
import JadwalKegiatanComponent from "./components/master-data/JadwalKegiatanComponent";
import DetailAbsen from "./components/dashboard/DetailAbsen";
import ArsipKegiatan from "./components/arsip/ArsipKegiatanComponent";
import ArsipPemeriksaanComponent from "./components/arsip/ArsipPemeriksaanComponent";
import DataPanganLokalComponent from "./components/master-data/DataPanganLokalComponent";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

import PrivateRoute from "./components/route/PrivateRoutes";
import PublicRoute from "./components/route/PublicRoutes";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Rute Global (Semua yang login bisa akses) */}
            <Route
              index
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            {/* RUTE TERBATAS: Hanya Administrasi (5) dan PIC (6) yang bisa Kelola Pengguna */}
            <Route
              path="/data-pengguna"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <PenggunaComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/unit-kerja"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <UnitKerjaComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/dimensi-bahaya"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <DimensiBahayaComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/kategori-resiko"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <KategoriResikoComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/hierarki-niosh"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <HierarkiNioshComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/aturan-k3"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <AturanK3Component />
                </PrivateRoute>
              }
            />

            <Route
              path="/peserta-prolanis"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <PesertaProlanisComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/jadwal-kegiatan"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <JadwalKegiatanComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/pangan-lokal"
              element={
                <PrivateRoute allowedRoles={[3, 6]}>
                  <DataPanganLokalComponent />
                </PrivateRoute>
              }
            />

            <Route
              path="/absen/:kegiatanId"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <DetailAbsen />
                </PrivateRoute>
              }
            />

            <Route
              path="/arsip-kegiatan"
              element={
                <PrivateRoute allowedRoles={[5, 6]}>
                  <ArsipKegiatan />
                </PrivateRoute>
              }
            />

            <Route
              path="/arsip-pemeriksaan"
              element={
                <PrivateRoute allowedRoles={[1, 2, 3, 6]}>
                  <ArsipPemeriksaanComponent />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Login Route (Public) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
