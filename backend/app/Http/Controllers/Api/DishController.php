<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\JsonResponse;

class DishController extends Controller
{
public function getSuggested()
{
    $dishes = Dish::with('restaurant')
                ->where('is_best_seller', true)
                ->limit(6)
                ->get();

    return response()->json(['success' => true, 'data' => $dishes]);
}
}
