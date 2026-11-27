<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HierarkiNioshModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'urutan_efektivitas',
        'nama_hierarki',
        'deskripsi_kendali',

    ];


    public function relasiHierarkiNioshKeAturanK3()
    {
        return $this->hasMany(AturanK3Model::class, 'id_hierarki', 'id');
    }
}
