<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        return response()->json(Restaurant::all());
    }

    public function show($id)
    {
        return response()->json(Restaurant::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'rating' => 'nullable|numeric',
            'price_range' => 'required|string',
        ]);

        $restaurant = Restaurant::create($validated);
        return response()->json($restaurant, 201);
    }

    public function update(Request $request, $id)
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->update($request->all());

        return response()->json($restaurant);
    }

    public function destroy($id)
    {
        Restaurant::destroy($id);
        return response()->json(null, 204);
    }
}
