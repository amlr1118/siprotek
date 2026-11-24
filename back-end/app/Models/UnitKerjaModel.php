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
}
