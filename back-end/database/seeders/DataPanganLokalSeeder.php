<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DataPanganLokalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Data disusun berdasarkan Tabel Komposisi Pangan Indonesia (TKPI)
        // dan jurnal gizi untuk estimasi Indeks Glikemik.
        $panganLokal = [
            // ==========================================
            // 1. PANGAN LOKAL KHAS BUTON / SULTRA
            // ==========================================
            [
                'nama_pangan'     => 'Kasuami (Singkong Kukus Buton)',
                'kategori'        => 'Karbohidrat',
                'kalori_per_100g' => 160.0,
                'karbo_per_100g'  => 38.0,
                'satuan_porsi'    => 'potong',
                'berat_per_porsi' => 100,
                'index_glikemik'  => 'Sedang', // Singkong kukus memiliki IG sedang
            ],
            [
                'nama_pangan'     => 'Kabuto (Singkong Kering/Gaplek)',
                'kategori'        => 'Karbohidrat',
                'kalori_per_100g' => 155.0,
                'karbo_per_100g'  => 36.5,
                'satuan_porsi'    => 'piring kecil',
                'berat_per_porsi' => 150,
                'index_glikemik'  => 'Sedang',
            ],
            [
                'nama_pangan'     => 'Parende (Sup Ikan Kuah Kuning)',
                'kategori'        => 'Protein Hewani',
                'kalori_per_100g' => 95.0,
                'karbo_per_100g'  => 1.5,
                'satuan_porsi'    => 'mangkuk',
                'berat_per_porsi' => 200,
                'index_glikemik'  => 'Rendah', // Ikan hampir nol karbohidrat, sangat aman untuk diabetes
            ],
            [
                'nama_pangan'     => 'Sinonggi / Kapurung (Sagu)',
                'kategori'        => 'Karbohidrat',
                'kalori_per_100g' => 125.0,
                'karbo_per_100g'  => 28.0,
                'satuan_porsi'    => 'mangkuk',
                'berat_per_porsi' => 150,
                'index_glikemik'  => 'Tinggi', // Sagu matang memiliki IG yang cukup tinggi
            ],
            [
                'nama_pangan'     => 'Kambewe (Jagung Manis Kelapa)',
                'kategori'        => 'Camilan',
                'kalori_per_100g' => 190.0,
                'karbo_per_100g'  => 32.0,
                'satuan_porsi'    => 'bungkus',
                'berat_per_porsi' => 100,
                'index_glikemik'  => 'Sedang',
            ],
            [
                'nama_pangan'     => 'Tuli-Tuli (Camilan Singkong Goreng)',
                'kategori'        => 'Camilan',
                'kalori_per_100g' => 280.0, // Digoreng sehingga kalori naik tajam
                'karbo_per_100g'  => 45.0,
                'satuan_porsi'    => 'potong',
                'berat_per_porsi' => 50,
                'index_glikemik'  => 'Tinggi',
            ],
            [
                'nama_pangan'     => 'Sayur Bening Daun Kelor',
                'kategori'        => 'Sayuran',
                'kalori_per_100g' => 60.0,
                'karbo_per_100g'  => 8.5,
                'satuan_porsi'    => 'mangkuk',
                'berat_per_porsi' => 150,
                'index_glikemik'  => 'Rendah', // Kelor sangat bagus untuk mengontrol gula darah
            ],

            // ==========================================
            // 2. PANGAN NUSANTARA UMUM (SEBAGAI PEMBANDING)
            // ==========================================
            [
                'nama_pangan'     => 'Nasi Putih',
                'kategori'        => 'Karbohidrat',
                'kalori_per_100g' => 130.0,
                'karbo_per_100g'  => 28.0,
                'satuan_porsi'    => 'centong',
                'berat_per_porsi' => 100,
                'index_glikemik'  => 'Tinggi',
            ],
            [
                'nama_pangan'     => 'Nasi Merah',
                'kategori'        => 'Karbohidrat',
                'kalori_per_100g' => 111.0,
                'karbo_per_100g'  => 23.0,
                'satuan_porsi'    => 'centong',
                'berat_per_porsi' => 100,
                'index_glikemik'  => 'Sedang',
            ],
            [
                'nama_pangan'     => 'Ubi Jalar Rebus',
                'kategori'        => 'Karbohidrat',
                'kalori_per_100g' => 86.0,
                'karbo_per_100g'  => 20.1,
                'satuan_porsi'    => 'buah sedang',
                'berat_per_porsi' => 120,
                'index_glikemik'  => 'Rendah', // Sangat direkomendasikan untuk diabetesi
            ],
            [
                'nama_pangan'     => 'Tempe Kukus / Bacem',
                'kategori'        => 'Protein Nabati',
                'kalori_per_100g' => 195.0,
                'karbo_per_100g'  => 7.6,
                'satuan_porsi'    => 'potong',
                'berat_per_porsi' => 50,
                'index_glikemik'  => 'Rendah',
            ],
            [
                'nama_pangan'     => 'Tahu Rebus / Tahu Putih',
                'kategori'        => 'Protein Nabati',
                'kalori_per_100g' => 76.0,
                'karbo_per_100g'  => 1.9,
                'satuan_porsi'    => 'potong',
                'berat_per_porsi' => 50,
                'index_glikemik'  => 'Rendah',
            ],
            [
                'nama_pangan'     => 'Pisang Kepok Rebus',
                'kategori'        => 'Camilan',
                'kalori_per_100g' => 115.0,
                'karbo_per_100g'  => 25.0,
                'satuan_porsi'    => 'buah',
                'berat_per_porsi' => 80,
                'index_glikemik'  => 'Sedang',
            ],
            [
                'nama_pangan'     => 'Ikan Teri Kering (Kadonoi)',
                'kategori'        => 'Protein Hewani',
                'kalori_per_100g' => 250.0,
                'karbo_per_100g'  => 0.0,
                'satuan_porsi'    => 'sendok makan',
                'berat_per_porsi' => 15,
                'index_glikemik'  => 'Rendah',
            ],
            [
                'nama_pangan'     => 'Pepaya',
                'kategori'        => 'Buah-buahan',
                'kalori_per_100g' => 43.0,
                'karbo_per_100g'  => 11.0,
                'satuan_porsi'    => 'potong',
                'berat_per_porsi' => 100,
                'index_glikemik'  => 'Sedang',
            ],
            [
                'nama_pangan'     => 'Sayur Bening Bayam Labu Siam',
                'kategori'        => 'Sayuran',
                'kalori_per_100g' => 18.0,
                'karbo_per_100g'  => 3.0,
                'satuan_porsi'    => 'mangkuk',
                'berat_per_porsi' => 150,
                'index_glikemik'  => 'Rendah',
            ],
        ];

        // Tambahkan timestamp dan insert ke database
        foreach ($panganLokal as &$pangan) {
            $pangan['created_at'] = $now;
            $pangan['updated_at'] = $now;
        }

        DB::table('data_pangan_lokal_models')->insert($panganLokal);

        $this->command->info('Seeder Pangan Lokal (termasuk khas Buton) berhasil ditambahkan!');
    }
}
