<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriResikoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $kategoriList = [
            [
                'level_reisko' => 'Rendah',
                'bobot_prioritas' => 1,
                'makna_resiko' => 'Risiko dapat diterima dengan pengendalian rutin dan pemantauan berkala tanpa perlu menghentikan aktivitas kerja.',
                'prioritas_respon' => 'Pemantauan Rutin (Berkala)',
                'kode_warna' => '#16A34A',
            ],
            [
                'level_reisko' => 'Sedang',
                'bobot_prioritas' => 2,
                'makna_resiko' => 'Memerlukan tindakan perbaikan terjadwal dan peningkatan pengawasan kepatuhan SOP/APD untuk mencegah eskalasi bahaya.',
                'prioritas_respon' => 'Terjadwal (≤ 1 Minggu)',
                'kode_warna' => '#CA8A04',
            ],
            [
                'level_reisko' => 'Tinggi',
                'bobot_prioritas' => 3,
                'makna_resiko' => 'Berpotensi menimbulkan cedera serius atau penyakit akibat kerja; memerlukan tindakan korektif segera oleh unit dan Komite K3RS.',
                'prioritas_respon' => 'Mendesak (≤ 72 Jam)',
                'kode_warna' => '#EA580C',
            ],
            [
                'level_reisko' => 'Kritis',
                'bobot_prioritas' => 4,
                'makna_resiko' => 'Berpotensi fatal, mengancam jiwa, atau menyebabkan wabah/kerusakan berat; wajib hentikan sementara aktivitas berisiko dan tangani segera.',
                'prioritas_respon' => 'Segera (≤ 24 Jam)',
                'kode_warna' => '#DC2626',
            ],
        ];

        foreach ($kategoriList as $kategori) {
            DB::table('kategori_resiko_models')->updateOrInsert(
                ['level_reisko' => $kategori['level_reisko']],
                [
                    'bobot_prioritas' => $kategori['bobot_prioritas'],
                    'makna_resiko' => $kategori['makna_resiko'],
                    'prioritas_respon' => $kategori['prioritas_respon'],
                    'kode_warna' => $kategori['kode_warna'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
