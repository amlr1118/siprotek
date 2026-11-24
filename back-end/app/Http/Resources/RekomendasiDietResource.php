<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RekomendasiDietResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'total_kalori_harian'     => $this->total_kalori_harian,
            // Secara eksplisit memanggil resource DetailDiet sebagai collection array
            'rekomendasi_diet_detail' => DetailDietResource::collection($this->whenLoaded('rekomendasiDietDetail')),
        ];
    }
}
