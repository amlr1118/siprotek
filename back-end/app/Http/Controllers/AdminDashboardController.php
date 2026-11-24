<?php

namespace App\Http\Controllers;

use App\Models\AbsenModel;
use App\Models\JadwalKegiatanModel;
use App\Models\PesertaProlanisModel;
use App\Models\User;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function getDashboardStats()
    {
        // 1. Hitung seluruh peserta terdaftar
        $totalPeserta = \App\Models\PesertaProlanisModel::count();

        // 2. Hitung jumlah kegiatan/jadwal khusus di bulan & tahun saat ini
        $totalJadwalBulanIni = JadwalKegiatanModel::whereMonth('tanggal', date('m'))
            ->whereYear('tanggal', date('Y'))
            ->count();

        // 3. Hitung jumlah akun staf yang aktif
        $totalPengguna = User::count();

        return response()->json([
            'total_peserta' => $totalPeserta,
            'total_jadwal_bulan_ini' => $totalJadwalBulanIni,
            'total_pengguna' => $totalPengguna,
        ]);
    }

    public function getHomeVisit()
    {
        // 1. Ambil semua peserta beserta seluruh riwayat absensinya
        // (Pastikan nama relasi 'relasike_absen' sesuai dengan yang ada di Model PesertaProlanisModel Anda)
        $peserta = PesertaProlanisModel::with('relasikeAbsen')->get();

        $butuhHomeVisit = 0;
        $daftarPasien = [];

        foreach ($peserta as $p) {
            // 2. Gunakan Collection Laravel untuk mengurutkan dan mengambil 3 absensi TERAKHIR milik pasien ini saja
            $riwayat = $p->relasikeAbsen->sortByDesc('created_at')->take(3);

            // 3. Pasien baru dipantau JIKA mereka sudah mengikuti minimal 3 kegiatan
            if ($riwayat->count() >= 3) {

                // 4. Cek apakah KETIGA riwayat terakhir tersebut statusnya 0 (Alpa)
                $tigaKaliAlpa = $riwayat->every(function($absen) {
                    // Karena di DB tipenya TINYINT, kita cek nilai 0 atau false
                    return $absen->status_kehadiran == 0 || $absen->status_kehadiran === false;
                });

                if ($tigaKaliAlpa) {
                    $butuhHomeVisit++;

                    // Simpan data pasien untuk ditampilkan di tabel pop-up Home Visit
                    $daftarPasien[] = [
                        'id'      => $p->id,
                        'nama'    => $p->nama,
                        'no_bpjs' => $p->no_bpjs,
                        'no_hp'   => $p->no_hp
                    ];
                }
            }
        }

        return response()->json([
            'total_home_visit' => $butuhHomeVisit,
            'daftar_pasien'    => array_values($daftarPasien) // array_values memastikan format JSON frontend rapi (tidak menjadi object)
        ]);
    }

    public function getDashboardCharts()
    {
        // 1. DATA GRAFIK RASIO DIAGNOSA (PIE CHART)
        // Menghitung jumlah pasien berdasarkan penyakitnya
        $diagnosaData = PesertaProlanisModel::select('diagnosa', \DB::raw('count(*) as total'))
            ->groupBy('diagnosa')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->diagnosa ? $item->diagnosa : 'Lainnya',
                    'value' => $item->total
                ];
            });

        // 2. DATA GRAFIK TREN KEHADIRAN 6 BULAN TERAKHIR (LINE CHART)
        $trenKehadiran = [];

        // Looping mundur dari 5 bulan lalu sampai bulan ini (Total 6 bulan)
        for ($i = 5; $i >= 0; $i--) {
            $bulan = \Carbon\Carbon::now()->subMonths($i);

            // Cari jadwal yang terjadi di bulan tersebut
            $jadwalIds = JadwalKegiatanModel::whereMonth('tanggal', $bulan->month)
                ->whereYear('tanggal', $bulan->year)
                ->pluck('id');

            // Hitung total peserta yang hadir (status = 1) pada jadwal-jadwal tersebut
            $hadir = AbsenModel::whereIn('kegiatanid', $jadwalIds)
                ->where('status_kehadiran', 1)
                ->count();

            $trenKehadiran[] = [
                'name' => $bulan->translatedFormat('M Y'), // Contoh: "Aug 2026"
                'Hadir' => $hadir
            ];
        }

        return response()->json([
            'diagnosa' => $diagnosaData,
            'tren_kehadiran' => $trenKehadiran
        ]);
    }
}
