<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dish;
use App\Models\Restaurant;


class DishController extends Controller
{
    public function index()
    {
        $dishes = Dish::all();
        return view('dishes.index', compact('dishes'));
    }

    public function create()
    {
        $restaurants = Restaurant::all();
        return view('dishes.create', compact('restaurants'));
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

        Dish::create($validated);

        return redirect()->route('admin.dishes.index')->with('success', 'Thêm món ăn thành công!');
    }

    public function edit($id)
    {
        $dish = Dish::findOrFail($id);
        $restaurants = Restaurant::all();
        return view('dishes.edit', compact('dish','restaurants'));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'image' => 'nullable|string',
        ]);

        $dish = Dish::findOrFail($id);
        $dish->update($validated);

        return redirect()->route('admin.dishes.index')->with('success', 'Cập nhật món ăn thành công!');
    }

    public function destroy($id)
    {
        $dish = Dish::findOrFail($id);
        $dish->delete();

        return redirect()->route('admin.dishes.index')->with('success', 'Xoá món ăn thành công!');
    }
}
