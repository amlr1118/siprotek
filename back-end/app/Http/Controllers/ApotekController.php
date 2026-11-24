<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JadwalKegiatanModel;
use App\Models\PemeriksaanModel;
use App\Models\ResepObatModel;

class ApotekController extends Controller
{
    /**
     * 1. GET STATISTIK WIDGET APOTEK
     */
    public function getStatistik()
    {
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)->where('status', '1')->first();

        if (!$jadwalAktif) {
            return response()->json(['total_antrean' => 0, 'selesai' => 0, 'menunggu' => 0]);
        }

        // Ambil ID pemeriksaan di jadwal aktif
        $pemeriksaanIds = PemeriksaanModel::where('jadwal_kegiatan_id', $jadwalAktif->id)->pluck('id');

        // Hitung total pasien yang memiliki resep (menggunakan distinct agar 1 pasien dihitung 1 antrean)
        $totalAntrean = ResepObatModel::whereIn('pemeriksaan_id', $pemeriksaanIds)
                        ->distinct('pemeriksaan_id')
                        ->count('pemeriksaan_id');

        // Selesai (Menghitung pemeriksaan yang obatnya sudah ditebus)
        $selesai = ResepObatModel::whereIn('pemeriksaan_id', $pemeriksaanIds)
                        ->where('status_tebus', 1)
                        ->distinct('pemeriksaan_id')
                        ->count('pemeriksaan_id');

        $menunggu = $totalAntrean - $selesai;

        return response()->json([
            'total_antrean' => $totalAntrean,
            'selesai' => $selesai,
            'menunggu' => $menunggu
        ]);
    }

    /**
     * 2. GET DAFTAR ANTREAN APOTEK
     */
    public function getAntrean()
    {
        $jadwalAktif = JadwalKegiatanModel::where('is_active', true)->where('status', '1')->first();

        if (!$jadwalAktif) {
            return response()->json(['data' => []]);
        }

        // Ambil hanya ID pemeriksaan yang sudah dibuatkan resepnya oleh dokter
        $pemeriksaanIdsResep = ResepObatModel::pluck('pemeriksaan_id')->unique();

        $antrean = PemeriksaanModel::with('peserta')
            ->where('jadwal_kegiatan_id', $jadwalAktif->id)
            ->whereIn('id', $pemeriksaanIdsResep)
            ->get();

        // Tempelkan daftar obat dari ResepObatModel ke masing-masing pemeriksaan
        foreach ($antrean as $item) {
            $daftarObat = ResepObatModel::where('pemeriksaan_id', $item->id)->get();
            $item->daftar_obat = $daftarObat;

            // Status apotek dianggap selesai JIKA SEMUA obat berstatus_tebus = 1
            $item->status_apotek_selesai = $daftarObat->every(fn($obat) => $obat->status_tebus == 1);
        }

        return response()->json(['data' => $antrean]);
    }

    /**
     * 3. TANDAI OBAT TELAH DIBERIKAN (TEBUS)
     */
    public function tandaiSelesai($pemeriksaanId, Request $request)
    {
        // Update semua obat milik pemeriksaan ini menjadi ditebus (1)
        ResepObatModel::where('pemeriksaan_id', $pemeriksaanId)
            ->update([
                'status_tebus' => 1,
                // 'apotekerid' => auth()->id() // Opsional: Buka komentar ini jika sistem menggunakan login
            ]);

        return response()->json(['message' => 'Seluruh obat berhasil ditandai telah diserahkan.']);
    }
}
