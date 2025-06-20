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
            'name' => 'required|string|max:255',
    'description' => 'nullable|string|max:1000',
    'address' => 'required|string|max:500',
    'latitude' => 'required|numeric|between:-90,90',
    'longitude' => 'required|numeric|between:-180,180',
    'rating' => 'nullable|numeric|between:0,5',
    'price_range' => 'required|in:$,$$,$$$,$$$$',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);
        if ($request->hasFile('image')) {
    $path = $request->file('image')->store('uploads/restaurants', 'public');
    $validated['image'] = $path;
}
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