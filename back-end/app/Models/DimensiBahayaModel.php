<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DimensiBahayaModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_dimensi',
        'nama_dimensi',
        'deskripsi_indikator'
    ];

    public function relasiDimensiBahayaKeAturanK3()
    {
        return $this->hasMany(AturanK3Model::class, 'id_dimensi', 'id');
    }
}
