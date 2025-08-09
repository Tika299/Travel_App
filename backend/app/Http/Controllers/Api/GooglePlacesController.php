<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GooglePlacesController extends Controller
{
    public function search(Request $request)
    {
        try {
            $query = $request->input('query');
            
            if (empty($query)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Query parameter is required'
                ], 400);
            }

            $apiKey = env('GOOGLE_MAPS_API_KEY');
            
            if (empty($apiKey)) {
                Log::error('Google Maps API key not configured');
                return response()->json([
                    'success' => false,
                    'message' => 'Google Maps API key not configured'
                ], 500);
            }

            $url = "https://maps.googleapis.com/maps/api/place/textsearch/json";
            $params = [
                'query' => $query,
                'key' => $apiKey,
                'language' => 'vi',
                'region' => 'vn'
            ];

            Log::info('Calling Google Places API', [
                'query' => $query,
                'url' => $url
            ]);

            $response = Http::timeout(10)->get($url, $params);
            
            if (!$response->successful()) {
                Log::error('Google Places API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch places from Google API',
                    'error' => $response->status()
                ], 500);
            }

            $data = $response->json();
            
            Log::info('Google Places API response', [
                'status' => $data['status'] ?? 'unknown',
                'results_count' => count($data['results'] ?? [])
            ]);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('GooglePlacesController error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 