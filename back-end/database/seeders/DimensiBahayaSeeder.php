<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DimensiBahayaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $dimensiList = [
            [
                'kode_dimensi' => 'BIO',
                'nama_dimensi' => 'Biologis',
                'deskripsi_indikator' => 'Ketersediaan dan kepatuhan APD, fasilitas cuci tangan, penanganan benda tajam dan safety box, spill kit cairan tubuh, pemisahan limbah infeksius, ruang isolasi, kewaspadaan standar, dan paparan pasien infeksius.',
            ],
            [
                'kode_dimensi' => 'KIM',
                'nama_dimensi' => 'Kimia',
                'deskripsi_indikator' => 'Pelabelan dan ketersediaan dokumen MSDS/SDS, penyimpanan bahan kimia dan obat berbahaya, APD kimia, eye wash station, spill kit kimia, ventilasi ruangan, dan pembuangan limbah kimia.',
            ],
            [
                'kode_dimensi' => 'FIS',
                'nama_dimensi' => 'Fisik',
                'deskripsi_indikator' => 'Pencahayaan, kebisingan, suhu dan kelembaban, kondisi lantai, instalasi listrik, jalur evakuasi, APAR, alarm dan smoke detector, kalibrasi alat medis, rambu K3, serta paparan radiasi.',
            ],
            [
                'kode_dimensi' => 'ERG',
                'nama_dimensi' => 'Ergonomi',
                'deskripsi_indikator' => 'Postur kerja, ketersediaan alat bantu mobilisasi pasien (patient lift atau paralel bar), teknik angkat manual, desain meja dan kursi, tata letak stasiun kerja, gerakan berulang, dan kelelahan fisik.',
            ],
            [
                'kode_dimensi' => 'PSI',
                'nama_dimensi' => 'Psikososial',
                'deskripsi_indikator' => 'Suasana kerja atau konflik internal, beban kerja dan jadwal rotasi shift, ketersediaan ruang istirahat, tanda kelelahan mental, serta kekerasan verbal atau fisik dari pasien maupun pengunjung.',
            ],
        ];

        foreach ($dimensiList as $dimensi) {
            DB::table('dimensi_bahaya_models')->updateOrInsert(
                ['kode_dimensi' => $dimensi['kode_dimensi']],
                [
                    'nama_dimensi' => $dimensi['nama_dimensi'],
                    'deskripsi_indikator' => $dimensi['deskripsi_indikator'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
