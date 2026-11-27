<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AturanK3Model extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_rule',
        'kelompok_aturan',
        'id_dimensi',
        'id_unit',
        'kondisi_if',
        'operator_logika',
        'kondisi_and',
        'tindakan_then',
        'tingkat_keparahan',
        'tingkat_kemungkinan',
        'id_kategori_resiko',
        'id_hierarki',
        'rekomendasi_mitigasi',
        'basis_temuan_tahap1',
    ];


    public function relasiAturanK3KeDimensiBahaya()
    {
        return $this->belongsTo(DimensiBahayaModel::class, 'id_dimensi', 'id');
    }

    public function relasiAturanK3KeUnitKerja()
    {
        return $this->belongsTo(UnitKerjaModel::class, 'id_unit', 'id');
    }

    public function relasiAturanK3KeKategoriResiko()
    {
        return $this->belongsTo(KategoriResikoModel::class, 'id_kategori_resiko', 'id');
    }

    public function relasiAturanK3KeHierarkiNiosh()
    {
        return $this->belongsTo(HierarkiNioshModel::class, 'id_hierarki', 'id');
    }

    public function relasiAturanK3KeDetailInputFakta()
    {
        return $this->hasMany(DetailInputFaktaModel::class, 'id_aturan', 'id');
    }

    public function relasiAturanK3KeDetailEvaluasiAturan()
    {
        return $this->hasMany(DetailEvaluasiAturanModel::class, 'id_aturan', 'id');
    }
}
