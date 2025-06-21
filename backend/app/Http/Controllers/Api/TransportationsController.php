<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transportation;
use Illuminate\Http\JsonResponse;

class TransportationsController extends Controller
{
   
    public function getSuggested(): JsonResponse
    {
     $transportations = Transportation::limit(6)->get();

        return response()->json(['success' => true, 'data' => $transportations]);
    }
}
