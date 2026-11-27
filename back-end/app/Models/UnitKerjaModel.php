<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitKerjaModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_unit',
        'nama_unit',
        'kategori_area',
        'status_resiko_akhir',
        ''
    ];


    public function relasiKeUser()
    {
        return $this->hasMany(User::class, 'id_unit','id');
    }

    public function relasiUnitKerjaKeAturanK3()
    {
        return $this->hasMany(AturanK3Model::class, 'id_unit', 'id');
    }

    public function relasiUnitKerjaKePenilaianResiko()
    {
        return $this->hasMany(PenilaianResikoModel::class,'id_unit','id');
    }
}
