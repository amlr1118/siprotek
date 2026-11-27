<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailEvaluasiAturanModel extends Model
{
    use HasFactory;

    protected  $fillable = [
        'id_penilaian',
        'id_aturan',
        'id_kategori_resiko',
        'status_mitigasi',
        'catatan_tindak_lanjut',

    ];


    public function relasiDetailEvaluasiAturanKePenilaianResiko()
    {
        return $this->belongsTo(PenilaianResikoModel::class, 'id_penilaian', 'id');
    }

    public function relasiDetailEvaluasiAturanKeAturanK3()
    {
        return $this->belongsTo(AturanK3Model::class, 'id_aturan', 'id');
    }

    public function relasiDetailEvaluasiAturanKeKategoriResiko()
    {
        return $this->belongsTo(KategoriResikoModel::class, 'id_kategori_resiko', 'id');
    }
}
