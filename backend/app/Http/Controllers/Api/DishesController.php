<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;

class DishesController extends Controller
{
    public function index()
    {
        return response()->json(Dish::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
        'restaurant_id' => 'required|exists:restaurants,id',
        'name' => 'required|string',
        'description' => 'nullable|string',
        'price' => 'required|numeric',
        'image' => 'nullable|string',
        ]);


        $dish = Dish::create($validated);

        return response()->json($dish, 201);
    }

    public function show($id)
    {
        return Dish::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $dish = Dish::findOrFail($id);
        $dish->update($request->all());

        return response()->json($dish, 200);
    }

    public function destroy($id)
    {
        Dish::destroy($id);
        return response()->json(null, 204);
    }
}