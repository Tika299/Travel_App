<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;

class RestaurantController extends Controller
{
   
    public function getSuggested(): JsonResponse
    {
     $restaurants = Restaurant::limit(6)->get();

        return response()->json(['success' => true, 'data' => $restaurants]);
    }
}
