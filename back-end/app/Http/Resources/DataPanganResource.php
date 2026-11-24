<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataPanganResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'nama_pangan'     => $this->nama_pangan,
            'kategori'        => $this->kategori,
            'kalori_per_100g' => $this->kalori_per_100g,
            'karbo_per_100g'  => $this->karbo_per_100g,
            'satuan_porsi'    => $this->satuan_porsi,
            'berat_per_porsi' => $this->berat_per_porsi,
            'index_glikemik'  => $this->index_glikemik,
        ];
    }
}
