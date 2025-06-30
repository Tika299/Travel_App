<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckinPlace;
use Illuminate\Http\Request;

class CheckinPlaceController extends Controller
{
    public function index()
    {
        return CheckinPlace::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'image' => 'nullable|string',
            'rating' => 'nullable|numeric',
            'location_id' => 'nullable|exists:locations,id',
        ]);

        $checkinPlace = CheckinPlace::create($validated);

        return response()->json($checkinPlace, 201);
    }

    public function show($id)
    {
        return CheckinPlace::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $checkinPlace = CheckinPlace::findOrFail($id);
        $checkinPlace->update($request->all());

        return response()->json($checkinPlace, 200);
    }

    public function destroy($id)
    {
        CheckinPlace::destroy($id);
        return response()->json(null, 204);
    }
}
