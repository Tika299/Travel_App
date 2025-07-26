<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GooglePlacesController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');
        $apiKey = env('GOOGLE_MAPS_API_KEY');
        $url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" . urlencode($query) . "&key=" . $apiKey;
        $response = Http::get($url);
        return $response->json();
    }
} 