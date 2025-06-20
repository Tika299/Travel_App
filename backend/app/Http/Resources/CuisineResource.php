<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CategoryResource;

class CuisineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'image' => $this->image,
            'short_description' => $this->short_description,
            'region' => $this->region,
            'price' => $this->price,
            'price_formatted' => number_format($this->price) . ' VNĐ',
            'address' => $this->address,
            'serving_time' => $this->serving_time,
            'delivery' => $this->delivery,
            'status' => $this->status,
            'created_at' => $this->created_at->toDateTimeString(),
            
            // Tải relationship nếu đã được load
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}