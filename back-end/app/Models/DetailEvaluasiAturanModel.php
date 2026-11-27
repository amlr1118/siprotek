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
}
