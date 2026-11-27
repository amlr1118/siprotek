<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriResikoModel extends Model
{
    use HasFactory;


    protected $fillable = [
        'level_reisko',
        'bobot_prioritas',
        'makna_resiko',
        'prioritas_respon',
        'kode_warna',
    ];


    public function relasiKategoriResikoKeAturanK3()
    {
        return $this->hasMany(AturanK3Model::class, 'id_kategori_resiko', 'id');
    }

    public function relasiKategoriResikoKePenilaianResiko()
    {
        return $this->hasMany(PenilaianResikoModel::class,'id_resiko_tertinggi','id');
    }


}
