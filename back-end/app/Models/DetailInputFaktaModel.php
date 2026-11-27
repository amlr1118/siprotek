<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailInputFaktaModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_penilaian',
        'id_aturan',
        'kondisi_if_terpilih',
        'kondisi_and_terpilih',
        'status_kecocokan',
    ];

    public function relasiDetailInputFaktaKePenilaianResiko()
    {
        return $this->belongsTo(PenilaianResikoModel::class, 'id_penilaian', 'id');
    }

    public function relasiDetailInputFaktaKeAturanK3()
    {
        return $this->belongsTo(AturanK3Model::class, 'id_aturan', 'id');
    }
}
