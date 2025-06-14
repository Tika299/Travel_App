<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    public function index()
    {
        $restaurants = Restaurant::all();
        return view('restaurants.index', compact('restaurants'));
    }

    public function create()
    {
        return view('restaurants.create');
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

        Restaurant::create($validated);
        return redirect()->route('admin.restaurants.index')->with('success', 'Thêm nhà hàng thành công!');
    }

    public function edit($id)
    {
        $restaurant = Restaurant::findOrFail($id);
        return view('restaurants.edit', compact('restaurant'));
    }

    public function update(Request $request, $id)
    {
        $restaurant = Restaurant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'rating' => 'nullable|numeric',
            'price_range' => 'required|string',
        ]);

        $restaurant->update($validated);
        return redirect()->route('admin.restaurants.index')->with('success', 'Cập nhật thành công!');
    }

    public function destroy($id)
    {
        Restaurant::destroy($id);
        return redirect()->route('admin.restaurants.index')->with('success', 'Đã xoá nhà hàng!');
    }
}
