<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenilaianResikoModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_penilaian',
        'id_pengguna',
        'id_unit',
        'waktu_penilaian',
        'jumlah_aturan_menyala',
        'id_resiko_tertinggi',
        'ringkasan_dimensi',
        'status_peringatan_dini',
        'catatan_lapangan',

    ];


    public function relasiPenilaianResikoKeUser()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id');
    }

    public function relasiPenilaianResikoKeUnitKerja()
    {
        return $this->belongsTo(UnitKerjaModel::class,'id_unit','id');
    }

    public function relasiPenilaianResikoKeKategoriResiko()
    {
        return $this->belongsTo(KategoriResikoModel::class,'id_resiko_tertinggi','id');
    }

    public function relasiPenilaianResikoKeDetailInputFakta()
    {
        return $this->hasMany(DetailInputFaktaModel::class, 'id_penilaian', 'id');
    }


}
