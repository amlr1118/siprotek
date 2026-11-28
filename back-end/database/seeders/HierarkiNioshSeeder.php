<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HierarkiNioshSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $hierarkiList = [
            [
                'urutan_efektivitas' => 1,
                'nama_hierarki' => 'Eliminasi',
                'deskripsi_kendali' => 'Menghilangkan sumber bahaya secara fisik dari tempat kerja sehingga risiko pajanan tidak lagi ada (tingkat efektivitas paling tinggi).',
            ],
            [
                'urutan_efektivitas' => 2,
                'nama_hierarki' => 'Substitusi',
                'deskripsi_kendali' => 'Mengganti bahan kimia, peralatan medis, atau prosedur kerja berbahaya dengan alternatif yang lebih aman dan rendah toksisitas.',
            ],
            [
                'urutan_efektivitas' => 3,
                'nama_hierarki' => 'Rekayasa Teknik',
                'deskripsi_kendali' => 'Mengisolasi pekerja dari sumber bahaya melalui modifikasi fisik, ventilasi tekanan negatif, safety box, pembatas radiasi, atau interlock mesin.',
            ],
            [
                'urutan_efektivitas' => 4,
                'nama_hierarki' => 'Pengendalian Administratif',
                'deskripsi_kendali' => 'Mengubah cara kerja melalui penerapan SOP, pengaturan jadwal rotasi shift, pelatihan K3 berkala, rambu keselamatan, dan pengawasan.',
            ],
            [
                'urutan_efektivitas' => 5,
                'nama_hierarki' => 'Alat Pelindung Diri (APD)',
                'deskripsi_kendali' => 'Melindungi pekerja secara langsung menggunakan masker N95, sarung tangan, gown, pelindung wajah, atau apron sebagai lapisan perlindungan terakhir.',
            ],
        ];

        foreach ($hierarkiList as $hierarki) {
            DB::table('hierarki_niosh_models')->updateOrInsert(
                ['urutan_efektivitas' => $hierarki['urutan_efektivitas']],
                [
                    'nama_hierarki' => $hierarki['nama_hierarki'],
                    'deskripsi_kendali' => $hierarki['deskripsi_kendali'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
