<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Schedule::with(['user', 'checkinPlace'])->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'checkin_place_id' => 'required|exists:checkin_places,id',
            'participants' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'required|in:upcoming,completed,planning',
            'progress' => 'required|integer|min:0|max:100',
            'user_id' => 'required|exists:users,id',
        ]);
        $schedule = Schedule::create($validated);
        return response()->json($schedule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $schedule = Schedule::with(['user', 'checkinPlace'])->findOrFail($id);
        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'checkin_place_id' => 'sometimes|required|exists:checkin_places,id',
            'participants' => 'sometimes|required|integer|min:1',
            'description' => 'nullable|string',
            'budget' => 'nullable|numeric',
            'status' => 'sometimes|required|in:upcoming,completed,planning',
            'progress' => 'sometimes|required|integer|min:0|max:100',
            'user_id' => 'sometimes|required|exists:users,id',
        ]);
        $schedule->update($validated);
        return response()->json($schedule);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();
        return response()->json(null, 204);
    }
}
