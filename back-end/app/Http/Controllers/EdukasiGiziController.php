<?php

namespace App\Http\Controllers;

use App\Models\JadwalKegiatanModel;
use App\Models\RekomendasiDietModel;
use App\Models\DetailRekomendasiDietModel;
use App\Models\PemeriksaanModel;
use App\Models\DataPanganLokalModel;
use App\Http\Resources\RekomendasiDietResource; // IMPORT RESOURCE DI SINI
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class EdukasiGiziController extends Controller
{
    public function getAntreanGizi(Request $request)
    {
        $jadwalAktif = \App\Models\JadwalKegiatanModel::where('is_active', true)->where('status', 1)->first();

        if (!$jadwalAktif) {
            return response()->json(['message' => 'Tidak ada jadwal aktif.', 'data' => []], 404);
        }

        $pemeriksaanHariIni = PemeriksaanModel::with(['peserta', 'rekomendasiDiet'])
            ->where('jadwal_kegiatan_id', $jadwalAktif->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        $dataAntrean = $pemeriksaanHariIni->map(function ($periksa) {
            $peserta = $periksa->peserta;
            $usia = $peserta->tanggal_lahir ? Carbon::parse($peserta->tanggal_lahir)->age : 0;

            return [
                'id' => $peserta->id,
                'pemeriksaan_id' => $periksa->id,
                'no_bpjs' => $peserta->no_bpjs,
                'nama' => $peserta->nama,
                'jenis_kelamin' => $peserta->jenis_kelamin,
                'usia' => $usia,
                'ttv_hari_ini' => [
                    'berat_badan' => $periksa->berat_badan,
                    'tinggi_badan' => $periksa->tinggi_badan,
                    'imt' => $periksa->imt,
                    'gula_darah' => $periksa->gula_darah_puasa,
                ],
                'status_gizi_selesai' => $periksa->rekomendasiDiet ? true : false,
            ];
        });

        return response()->json(['data' => $dataAntrean], 200);
    }

    public function generateRekomendasiOtomatis(Request $request, $pemeriksaan_id)
    {
        $pemeriksaan = PemeriksaanModel::with('peserta')->find($pemeriksaan_id);

        if (!$pemeriksaan) {
            return response()->json(['message' => 'Data pemeriksaan tidak ditemukan.'], 404);
        }

        $rekomendasiEksis = RekomendasiDietModel::with('rekomendasiDietDetail.dataPangan')
                                ->where('pemeriksaanid', $pemeriksaan_id)
                                ->first();

        if ($rekomendasiEksis && !$request->has('force_regenerate')) {
            return response()->json([
                'message' => 'Rekomendasi sudah ada.',
                // GUNAKAN RESOURCE DI SINI
                'data' => new RekomendasiDietResource($rekomendasiEksis)
            ], 200);
        }

        $peserta = $pemeriksaan->peserta;
        $usia = $peserta->tanggal_lahir ? Carbon::parse($peserta->tanggal_lahir)->age : 40;
        $beratKg = $pemeriksaan->berat_badan ?: 60;
        $tinggiCm = $pemeriksaan->tinggi_badan ?: 160;
        $jenisKelamin = $peserta->jenis_kelamin;
        $gulaDarah = $pemeriksaan->gula_darah_puasa ?: 100;

        if ($jenisKelamin == 'Pria') {
            $bmr = (10 * $beratKg) + (6.25 * $tinggiCm) - (5 * $usia) + 5;
        } else {
            $bmr = (10 * $beratKg) + (6.25 * $tinggiCm) - (5 * $usia) - 161;
        }

        $totalKalori = round($bmr * 1.2);

        if ($gulaDarah > 200 || $pemeriksaan->imt > 27) {
            $totalKalori -= 300;
        }

        $queryPangan = DataPanganLokalModel::query();
        if ($gulaDarah > 126) {
            $queryPangan->where('index_glikemik', '!=', 'Tinggi');
        }

        $semuaPangan = $queryPangan->get();
        if ($semuaPangan->isEmpty()) {
            return response()->json(['message' => 'Database Pangan Lokal kosong.'], 400);
        }

        $karbo = $semuaPangan->where('kategori', 'Karbohidrat');
        $protein = $semuaPangan->whereIn('kategori', ['Protein Hewani', 'Protein Nabati']);
        $sayur = $semuaPangan->where('kategori', 'Sayuran');
        $camilan = $semuaPangan->whereIn('kategori', ['Camilan', 'Buah-buahan']);

        if ($karbo->isEmpty()) $karbo = DataPanganLokalModel::where('kategori', 'Karbohidrat')->get();
        if ($protein->isEmpty()) $protein = DataPanganLokalModel::whereIn('kategori', ['Protein Hewani', 'Protein Nabati'])->get();
        if ($sayur->isEmpty()) $sayur = DataPanganLokalModel::where('kategori', 'Sayuran')->get();
        if ($camilan->isEmpty()) $camilan = DataPanganLokalModel::whereIn('kategori', ['Camilan', 'Buah-buahan'])->get();

        $kaloriPagi = $totalKalori * 0.25;
        $kaloriSiang = $totalKalori * 0.30;
        $kaloriMalam = $totalKalori * 0.25;
        $kaloriSelingan = $totalKalori * 0.20;

        $ramuanMenu = [];

        $alokasiMenu = function($waktu, $targetKalori, $isUtama = true) use ($karbo, $protein, $sayur, $camilan, &$ramuanMenu) {
            if ($isUtama) {
                $k = $karbo->random();
                $p = $protein->random();
                $s = $sayur->random();

                $baseKalori = $k->kalori_per_100g + $p->kalori_per_100g + $s->kalori_per_100g;
                $faktorPorsi = ($baseKalori > 0) ? ($targetKalori / $baseKalori) : 1;
                $faktorPorsi = round($faktorPorsi, 1);

                if ($faktorPorsi < 0.5) $faktorPorsi = 0.5;
                if ($faktorPorsi > 3) $faktorPorsi = 2.5;

                $ramuanMenu[] = ['panganid' => $k->id, 'waktu_makan' => $waktu, 'jumlah_porsi' => $faktorPorsi];
                $ramuanMenu[] = ['panganid' => $p->id, 'waktu_makan' => $waktu, 'jumlah_porsi' => $faktorPorsi];
                $ramuanMenu[] = ['panganid' => $s->id, 'waktu_makan' => $waktu, 'jumlah_porsi' => round($faktorPorsi * 1.5, 1)];
            } else {
                $c = $camilan->random();
                $baseKalori = $c->kalori_per_100g;
                $faktorPorsi = ($baseKalori > 0) ? ($targetKalori / $baseKalori) : 1;
                $faktorPorsi = round($faktorPorsi, 1);

                if ($faktorPorsi > 2) $faktorPorsi = 2;
                $ramuanMenu[] = ['panganid' => $c->id, 'waktu_makan' => $waktu, 'jumlah_porsi' => $faktorPorsi];
            }
        };

        $alokasiMenu('Sarapan Pagi', $kaloriPagi, true);
        $alokasiMenu('Camilan Pagi', $kaloriSelingan * 0.5, false);
        $alokasiMenu('Makan Siang', $kaloriSiang, true);
        $alokasiMenu('Camilan Sore', $kaloriSelingan * 0.5, false);
        $alokasiMenu('Makan Malam', $kaloriMalam, true);

        DB::beginTransaction();
        try {
            $rekomendasi = RekomendasiDietModel::updateOrCreate(
                ['pemeriksaanid' => $pemeriksaan_id],
                [
                    'giziid' => auth()->user()->id,
                    'total_kalori_harian' => $totalKalori
                ]
            );

            DetailRekomendasiDietModel::where('rekomendasiid', $rekomendasi->id)->delete();

            foreach ($ramuanMenu as $menu) {
                DetailRekomendasiDietModel::create([
                    'rekomendasiid' => $rekomendasi->id,
                    'panganid'      => $menu['panganid'],
                    'waktu_makan'   => $menu['waktu_makan'],
                    'jumlah_porsi'  => $menu['jumlah_porsi'],
                ]);
            }

            DB::commit();

            $dataLengkap = RekomendasiDietModel::with('rekomendasiDietDetail.dataPangan')->find($rekomendasi->id);

            return response()->json([
                'message' => 'Rekomendasi gizi berhasil dibuat oleh sistem.',
                // GUNAKAN RESOURCE DI SINI
                'data' => new RekomendasiDietResource($dataLengkap)
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal Generate Diet: ' . $e->getMessage());

            return response()->json([
                'message' => 'Gagal menyimpan rekomendasi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mengambil data statistik untuk Widget Edukasi Gizi
     */
    public function getStatistikGizi()
    {
        // 1. Cari jadwal kegiatan Prolanis yang sedang aktif
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)
            ->where('status', 1)
            ->first();

        // Jika tidak ada jadwal aktif, kembalikan angka 0
        if (!$jadwalAktif) {
            return response()->json([
                'total_pasien' => 0,
                'selesai_edukasi' => 0,
                'sisa_antrean' => 0
            ]);
        }

        // 2. Ambil base query pemeriksaan untuk jadwal aktif tersebut
        $baseQuery = PemeriksaanModel::where('jadwal_kegiatan_id', $jadwalAktif->id);

        // 3. Kalkulasi Total Pasien
        $totalPasien = (clone $baseQuery)->count();

        // 4. LOGIKA GAYA DOKTER/PERAWAT (Cek Relasi Tabel)
        // Ambil semua ID pemeriksaan hari ini
        $pemeriksaanIds = (clone $baseQuery)->pluck('id');

        // Hitung berapa banyak ID pemeriksaan tersebut yang SUDAH ADA di tabel Rekomendasi Diet.
        // PENTING: Ganti "RekomendasiDietModel" dengan nama Model tabel gizi Anda yang sebenarnya!
        // (Misalnya: RekomendasiDiet::class, DietModel::class, dll)
        $selesaiEdukasi = RekomendasiDietModel::whereIn('pemeriksaanid', $pemeriksaanIds)->count();

        // 5. Kalkulasi Sisa Antrean
        $sisaAntrean = $totalPasien - $selesaiEdukasi;

        // 6. Kirimkan JSON ke frontend React
        return response()->json([
            'total_pasien' => $totalPasien,
            'selesai_edukasi' => $selesaiEdukasi,
            'sisa_antrean' => $sisaAntrean
        ]);
    }
}
