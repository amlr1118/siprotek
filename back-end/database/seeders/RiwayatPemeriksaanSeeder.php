<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\PesertaProlanisModel;
use App\Models\JadwalKegiatanModel;
use App\Models\AbsenModel;
use App\Models\PemeriksaanModel;
use App\Models\ResepObatModel; // Tambahkan import Model Resep

class RiwayatPemeriksaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil seluruh data peserta yang sudah ada
        $pesertaList = PesertaProlanisModel::all();

        if ($pesertaList->count() === 0) {
            $this->command->info('Data Peserta kosong! Silakan jalankan seeder peserta terlebih dahulu.');
            return;
        }

        $this->command->info('Mulai membuat data dummy untuk 6 bulan terakhir...');

        // =========================================================================
        // SKENARIO 1: HOME VISIT
        // Ambil 2 peserta pertama untuk dijadikan target drop-out (Alpa 3 bulan berturut-turut)
        // =========================================================================
        $targetHomeVisitIds = $pesertaList->take(2)->pluck('id')->toArray();

        // Tentukan tinggi badan TETAP untuk masing-masing peserta
        $tinggiPeserta = [];
        foreach ($pesertaList as $peserta) {
            $tinggiPeserta[$peserta->id] = rand(145, 175);
        }

        // Daftar referensi obat-obatan Prolanis
        $daftarObatReferensi = [
            'Amlodipine 5mg', 'Amlodipine 10mg', 'Captopril 25mg',
            'Metformin 500mg', 'Glimepiride 2mg', 'Simvastatin 20mg'
        ];

        // Loop mundur dari 6 bulan yang lalu hingga bulan lalu
        for ($i = 6; $i >= 1; $i--) {
            // Tentukan tanggal acak di bulan tersebut
            $tanggalKegiatan = Carbon::now()->subMonths($i)->startOfMonth()->addDays(rand(4, 19));

            // 1. BUAT JADWAL KEGIATAN
            $jadwal = JadwalKegiatanModel::create([
                'nama_kegiatan'  => 'Senam & Edukasi Prolanis ' . $tanggalKegiatan->translatedFormat('F Y'),
                'petugasid'      => 5,
                'jenis_kegiatan' => 'Senam dan Pemeriksaan',
                'tanggal'        => $tanggalKegiatan->format('Y-m-d'),
                'lokasi'         => 'Aula Puskesmas',
                'status'         => '2', // Asumsi 2 = Selesai
                'is_active'      => false, // Sudah berlalu
                'created_at'     => $tanggalKegiatan,
                'updated_at'     => $tanggalKegiatan,
            ]);

            // 2. BUAT ABSEN & PEMERIKSAAN UNTUK SETIAP PESERTA
            foreach ($pesertaList as $peserta) {

                // SKENARIO HOME VISIT: Jika ini 3 bulan terakhir ($i <= 3) dan pasien ini adalah target, paksa Alpa.
                if (in_array($peserta->id, $targetHomeVisitIds) && $i <= 3) {
                    $isHadir = false;
                } else {
                    // Jika bukan target, beri probabilitas kehadiran 85%
                    $isHadir = rand(1, 100) <= 85;
                }

                // Buat Data Absensi
                AbsenModel::create([
                    'kegiatanid'       => $jadwal->id,
                    'pesertaid'        => $peserta->id,
                    'status_kehadiran' => $isHadir ? 1 : 0, // Format TINYINT
                    'stasiun'          => '2',
                    'created_at'       => $tanggalKegiatan,
                    'updated_at'       => $tanggalKegiatan,
                ]);

                // 3. JIKA HADIR, BUAT DATA PEMERIKSAAN & RESEP OBAT
                if ($isHadir) {

                    $tinggiCm = $tinggiPeserta[$peserta->id];
                    $beratKg  = rand(50, 85) + (rand(0, 9) / 10);

                    $tinggiM = $tinggiCm / 100;
                    $imt     = round($beratKg / ($tinggiM * $tinggiM), 2);

                    $tensiSistolik  = rand(110, 165);
                    $tensiDiastolik = rand(70, 100);

                    $gulaDarah = rand(65, 210);
                    $statusGula = 'Normal / Terkontrol';
                    if ($gulaDarah < 70) {
                        $statusGula = 'Rendah (Hipoglikemia)';
                    } elseif ($gulaDarah > 125) {
                        $statusGula = 'Tinggi (Tidak Terkontrol)';
                    }

                    $opsiAktivitas = ['Jarang', 'Sedang', 'Aktif'];
                    $aktivitas = $opsiAktivitas[array_rand($opsiAktivitas)];

                    $waktuPeriksa = $tanggalKegiatan->copy()->addHours(rand(1, 3))->addMinutes(rand(1, 59));

                    // Simpan data pemeriksaan ke dalam variabel agar bisa diambil ID-nya
                    $pemeriksaan = PemeriksaanModel::create([
                        'jadwal_kegiatan_id' => $jadwal->id,
                        'pesertaid'          => $peserta->id,
                        'berat_badan'        => $beratKg,
                        'tinggi_badan'       => $tinggiCm,
                        'imt'                => $imt,
                        'tensi_sistolik'     => $tensiSistolik,
                        'tensi_diastolik'    => $tensiDiastolik,
                        'gula_darah_puasa'   => $gulaDarah,
                        'status_gula_darah'  => $statusGula,
                        'aktivitas'          => $aktivitas,
                        'perawatid'          => 2,
                        'dokterid'           => 1,
                        'catatan_dokter'     => 'Pasien dalam kondisi stabil. Lanjutkan pengobatan rutin.',
                        // 'catatan_resep'      => 'Harap diminum secara rutin setelah makan.', // Catatan Apotek
                        // 'status_apotek_selesai' => 1, // Sudah diserahkan (karena riwayat)
                        'created_at'         => $waktuPeriksa,
                        'updated_at'         => $waktuPeriksa,
                    ]);

                    // =========================================================================
                    // SKENARIO 2: GENERATE RESEP OBAT
                    // =========================================================================
                    $jumlahObat = rand(1, 2); // Tiap pasien dapat 1-2 macam obat
                    $obatTerpilih = array_rand(array_flip($daftarObatReferensi), $jumlahObat);

                    // Pastikan menjadi array meskipun hanya 1 obat yang terpilih
                    if (!is_array($obatTerpilih)) {
                        $obatTerpilih = [$obatTerpilih];
                    }

                    foreach ($obatTerpilih as $namaObat) {
                        ResepObatModel::create([
                            'pemeriksaan_id' => $pemeriksaan->id,
                            'nama_obat'      => $namaObat,
                            'dosis'          => '1 x 1 Hari',
                            'jumlah'         => 30, // Standar obat Prolanis sebulan
                            'keterangan'     => 'Diminum setelah makan',
                            'status_tebus'   => 1, // Status 1 = Selesai/Ditebus (karena riwayat lama)
                            'apotekerid'     => 4, // ID Apoteker (asumsi ada user id 4)
                            'created_at'     => $waktuPeriksa,
                            'updated_at'     => $waktuPeriksa,
                        ]);
                    }
                }
            }
        }

        $this->command->info('Berhasil! Data Jadwal, Absen, Pemeriksaan, dan Resep Obat 6 bulan terakhir telah di-generate.');
        $this->command->info('Skenario Home Visit berhasil dibuat untuk 2 pasien pertama.');
    }
}
