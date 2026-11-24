<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\DataPanganLokalModel; // WAJIB TAMBAHKAN INI

class DetailDietResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // CARA KASAR: Tarik paksa data langsung dari database menggunakan ID yang ada,
        // bypass (lewatkan) sistem relasi Eloquent yang sedang error.
        $pangan = DataPanganLokalModel::find($this->panganid);

        return [
            'id'           => $this->id,
            'waktu_makan'  => $this->waktu_makan,
            'jumlah_porsi' => (float) $this->jumlah_porsi,
            'data_pangan'  => $pangan,
        ];
    }
}
