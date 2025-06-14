<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CheckInPlace;

class CheckinPlaceController extends Controller
{
    public function index()
    {
        $checkinPlaces = CheckInPlace::all();
        return view('admin.checkin_places.index', compact('checkinPlaces'));
    }

    public function create()
    {
        return view('admin.checkin_places.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'nullable|string',
            'rating' => 'nullable|numeric',
        ]);

        CheckInPlace::create($validated);

        return redirect()->route('admin.checkin_places.index')->with('success', 'Thêm thành công!');
    }

public function edit($id)
{
    $checkinPlace = CheckInPlace::findOrFail($id);
    return view('admin.checkin_places.edit', compact('checkinPlace'));
}


    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'nullable|string',
            'rating' => 'nullable|numeric',
        ]);

        $place = CheckInPlace::findOrFail($id);
        $place->update($validated);

        return redirect()->route('admin.checkin_places.index')->with('success', 'Cập nhật thành công!');
    }

    public function destroy($id)
    {
        $place = CheckInPlace::findOrFail($id);
        $place->delete();

        return redirect()->route('admin.checkin_places.index')->with('success', 'Xoá thành công!');
    }
}
