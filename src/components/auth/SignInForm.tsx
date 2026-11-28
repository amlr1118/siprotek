import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import PageMeta from "../../components/common/PageMeta";
import Swal from "sweetalert2";

// --- LOGO UNTUK MOBILE VIEW ---
const MobileLogo = () => (
  <div className="flex items-center gap-2 mb-8 lg:hidden">
    <div className="flex items-center justify-center w-10 h-10 bg-brand-500 rounded-lg shadow-md">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </div>
    <div className="flex flex-col text-left">
      <span className="text-xl font-black leading-none text-gray-800 dark:text-white tracking-tight">Smart</span>
      <span className="text-[10px] font-bold tracking-[0.2em] text-brand-500 dark:text-brand-400">PROLANIS</span>
    </div>
  </div>
);

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    id_pengguna: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await api.post("/login", formData);
      const { token, user } = res.data;

      login(token, user);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang kembali, ${user.name || 'Petugas'}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/");
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 422) {
          // Error validasi form
          setErrors(error.response.data.errors);
        } else if (error.response.status === 401) {
          // Error kredensial salah
          Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: error.response.data.message || "ID Pengguna atau kata sandi yang Anda masukkan salah!",
            confirmButtonColor: "#ef4444",
            customClass: {
              popup: 'rounded-2xl'
            }
          });
        } else {
          // Error server lainnya (500, dll)
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
            confirmButtonColor: "#ef4444",
          });
        }
      } else {
        // Error tidak ada respon dari server (koneksi terputus)
        Swal.fire({
          icon: "warning",
          title: "Koneksi Terputus",
          text: "Tidak dapat terhubung ke server. Periksa jaringan internet Anda.",
          confirmButtonColor: "#f59e0b",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Login | SIPROTEK"
        description="Halaman masuk ke sistem SIPROTEK"
      />

      <div className="flex flex-col flex-1 w-full lg:w-1/2 p-6 sm:p-12">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          
          {/* Logo khusus layar Mobile */}
          <MobileLogo />

          <div className="mb-8 sm:mb-10">
            <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
              Selamat Datang Kembali 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Silakan masukkan kredensial Anda untuk mengakses sistem.
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full">
            <div className="space-y-6">
              <div>
                <Label>
                  ID Pengguna <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="id_pengguna"
                  name="id_pengguna"
                  value={formData.id_pengguna}
                  onChange={(e) =>
                    setFormData({ ...formData, id_pengguna: e.target.value })
                  }
                  placeholder="admin@prolanis.com"
                  className={`w-full ${errors.id_pengguna ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
                />
                {errors.id_pengguna && (
                  <span className="block mt-1.5 text-xs font-medium text-error-500">
                    {errors.id_pengguna[0]}
                  </span>
                )}
              </div>

              <div>
                <Label>
                  Kata Sandi <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pr-11 ${errors.password ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''}`}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 flex items-center justify-center p-1 -translate-y-1/2 rounded-md cursor-pointer right-3 top-1/2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {showPassword ? (
                      <EyeIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <span className="block mt-1.5 text-xs font-medium text-error-500">
                    {errors.password[0]}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                  <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    Ingat saya
                  </label>
                </div>
                <Link
                  to="/"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
                >
                  Lupa Sandi?
                </Link>
              </div>

              <div className="pt-2">
                <Button 
                  className="w-full py-3 text-base font-semibold transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50" 
                  size="sm" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    "Masuk ke Sistem"
                  )}
                </Button>
              </div>
            </div>
          </form>
          
        </div>
      </div>
    </>
  );
}