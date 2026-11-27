<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class UnitKerjaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $units = [
            // 1. Lintas Unit (53 Aturan Umum)
            [
                'kode_unit' => 'ALL',
                'nama_unit' => 'Semua Unit',
                'kategori_area' => 'Lintas Unit',
                'status_resiko_akhir' => 'Rendah',
            ],

            // 2. Klinis Risiko Tinggi (Pelayanan Pasien Langsung)
            [
                'kode_unit' => 'IGD',
                'nama_unit' => 'IGD',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'ICU',
                'nama_unit' => 'ICU',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'NICU',
                'nama_unit' => 'NICU',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'IBS',
                'nama_unit' => 'IBS/OK',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'VK',
                'nama_unit' => 'Ruang Bersalin',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'RANAP',
                'nama_unit' => 'Rawat Inap',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'ISOLASI',
                'nama_unit' => 'Ruang Isolasi',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'HD',
                'nama_unit' => 'Dialisis',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'GIGI',
                'nama_unit' => 'Poli Gigi',
                'kategori_area' => 'Klinis Risiko Tinggi',
                'status_resiko_akhir' => 'Rendah',
            ],

            // 3. Penunjang Medis
            [
                'kode_unit' => 'FARM',
                'nama_unit' => 'Farmasi',
                'kategori_area' => 'Penunjang Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'LAB',
                'nama_unit' => 'Laboratorium',
                'kategori_area' => 'Penunjang Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'RAD',
                'nama_unit' => 'Radiologi',
                'kategori_area' => 'Penunjang Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'CSSD',
                'nama_unit' => 'CSSD',
                'kategori_area' => 'Penunjang Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'BDRS',
                'nama_unit' => 'Bank Darah',
                'kategori_area' => 'Penunjang Medis',
                'status_resiko_akhir' => 'Rendah',
            ],

            // 4. Penunjang Non-Medis & Fasilitas Umum
            [
                'kode_unit' => 'GIZI',
                'nama_unit' => 'Dapur/Gizi',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'LNDR',
                'nama_unit' => 'Laundry',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'HK',
                'nama_unit' => 'Housekeeping',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'IPSRS',
                'nama_unit' => 'IPSRS',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'IPAL',
                'nama_unit' => 'IPAL',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'PENG',
                'nama_unit' => 'Pengadaan',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'SEC',
                'nama_unit' => 'Keamanan',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'PRK',
                'nama_unit' => 'Parkir',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
            [
                'kode_unit' => 'RENV',
                'nama_unit' => 'Area Renovasi',
                'kategori_area' => 'Penunjang Non-Medis',
                'status_resiko_akhir' => 'Rendah',
            ],
        ];

        foreach ($units as $unit) {
            DB::table('unit_kerja_models')->updateOrInsert(
                ['kode_unit' => $unit['kode_unit']],
                [
                    'nama_unit' => $unit['nama_unit'],
                    'kategori_area' => $unit['kategori_area'],
                    'status_resiko_akhir' => $unit['status_resiko_akhir'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
