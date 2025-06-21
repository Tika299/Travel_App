<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Itinerary;
use App\Models\Dish;

class ItinerariesController extends Controller
{
    // GET /api/itineraries
    public function index()
    {
        $itineraries = Itinerary::with('user')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $itineraries
        ]);
    }

    // POST /api/itineraries
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'people_count' => 'nullable|integer|min:1',
            'status' => 'in:draft,published'
        ]);

        $itinerary = Itinerary::create($validated);

        return response()->json([
            'success' => true,
            'data' => $itinerary
        ]);
    }

    // GET /api/itineraries/{id}
    public function show($id)
    {
        $itinerary = Itinerary::with('user')->find($id);

        if (!$itinerary) {
            return response()->json(['success' => false, 'message' => 'Itinerary not found'], 404);
        }

        return response()->json(['success' => true, 'data' => $itinerary]);
    }

    // PUT /api/itineraries/{id}
    public function update(Request $request, $id)
    {
        $itinerary = Itinerary::find($id);

        if (!$itinerary) {
            return response()->json(['success' => false, 'message' => 'Itinerary not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'people_count' => 'nullable|integer|min:1',
            'status' => 'in:draft,published'
        ]);

        $itinerary->update($validated);

        return response()->json(['success' => true, 'data' => $itinerary]);
    }

    // DELETE /api/itineraries/{id}
    public function destroy($id)
    {
        $itinerary = Itinerary::find($id);

        if (!$itinerary) {
            return response()->json(['success' => false, 'message' => 'Itinerary not found'], 404);
        }

        $itinerary->delete();

        return response()->json(['success' => true, 'message' => 'Itinerary deleted']);
    }

    // GET /api/itineraries/{id}/dishes
    public function getDishes($id)
    {
        $itinerary = Itinerary::with('dishes')->find($id);

        if (!$itinerary) {
            return response()->json(['success' => false, 'message' => 'Itinerary not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $itinerary->dishes
        ]);
    }
}
