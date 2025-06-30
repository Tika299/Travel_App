<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class LocationController extends Controller
{
    /**
     * Display a listing of locations
     */
    public function index(Request $request)
    {
        $query = Location::with(['reviews' => function($q) {
            $q->where('is_approved', true)->latest()->take(3);
        }]);
        
        // Search functionality
        $search = $request->get('search');
if (!empty($search)) {
    $query->where(function($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%")
          ->orWhere('address', 'like', "%{$search}%");
    });
}
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->get('category'));
        }
        
        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', '>=', $request->get('rating'));
        }
        
        // Filter by has_fee
        if ($request->has('has_fee')) {
            $query->where('has_fee', $request->boolean('has_fee'));
        }
        
        // Sort options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        switch ($sortBy) {
            case 'rating':
                $query->orderBy('rating', $sortOrder);
                break;
            case 'checkin_count':
                $query->orderBy('checkin_count', $sortOrder);
                break;
            case 'name':
                $query->orderBy('name', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', $sortOrder);
        }
        
        $locations = $query->paginate($request->get('per_page', 12));
        
        // Add additional data
        $locations->getCollection()->transform(function ($location) {
            $location->reviews_count = $location->reviews()->where('is_approved', true)->count();
            $location->average_rating = $location->reviews()->where('is_approved', true)->avg('rating') ?? 0;
            return $location;
        });
        
        return response()->json($locations);
    }

    /**
     * Store a newly created location
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'category' => 'required|string|max:255',
            'has_fee' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->all();
        $data['has_fee'] = $request->boolean('has_fee');
        
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('locations', 'public');
        }

        $location = Location::create($data);
        
        return response()->json([
            'message' => 'Location created successfully',
            'location' => $location->load('reviews')
        ], 201);
    }

    /**
     * Display the specified location
     */
    public function show($id)
    {
        $location = Location::with([
            'reviews' => function($q) {
                $q->where('is_approved', true)
                  ->with(['user', 'images', 'interactions'])
                  ->latest();
            }
        ])->findOrFail($id);
        
        // Add statistics
        $location->reviews_count = $location->reviews->count();
        $location->average_rating = $location->reviews->avg('rating') ?? 0;
        $location->rating_breakdown = [
            5 => $location->reviews->where('rating', 5)->count(),
            4 => $location->reviews->where('rating', 4)->count(),
            3 => $location->reviews->where('rating', 3)->count(),
            2 => $location->reviews->where('rating', 2)->count(),
            1 => $location->reviews->where('rating', 1)->count(),
        ];
        
        return response()->json($location);
    }

    /**
     * Update the specified location
     */
    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'address' => 'string',
            'latitude' => 'numeric|between:-90,90',
            'longitude' => 'numeric|between:-180,180',
            'category' => 'string|max:255',
            'has_fee' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->all();
        
        if ($request->has('has_fee')) {
            $data['has_fee'] = $request->boolean('has_fee');
        }
        
        if ($request->hasFile('image')) {
            // Delete old image
            if ($location->image) {
                Storage::disk('public')->delete($location->image);
            }
            $data['image'] = $request->file('image')->store('locations', 'public');
        }

        $location->update($data);
        
        return response()->json([
            'message' => 'Location updated successfully',
            'location' => $location->load('reviews')
        ]);
    }

    /**
     * Remove the specified location
     */
    public function destroy($id)
    {
        $location = Location::findOrFail($id);
        
        // Delete associated image
        if ($location->image) {
            Storage::disk('public')->delete($location->image);
        }
        
        $location->delete();
        
        return response()->json([
            'message' => 'Location deleted successfully'
        ]);
    }

    /**
     * Get featured locations
     */
    public function featured(Request $request)
    {
        $locations = Location::with(['reviews' => function($q) {
            $q->where('is_approved', true)->latest()->take(3);
        }])
        ->where('rating', '>=', 4.0)
        ->orderBy('rating', 'desc')
        ->orderBy('checkin_count', 'desc')
        ->limit($request->get('limit', 8))
        ->get();
        
        // Add additional data
        $locations->transform(function ($location) {
            $location->reviews_count = $location->reviews()->where('is_approved', true)->count();
            return $location;
        });
        
        return response()->json($locations);
    }

    /**
     * Get nearby locations
     */
    public function nearby(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:1|max:100'
        ]);
        
        $lat = $request->get('latitude');
        $lng = $request->get('longitude');
        $radius = $request->get('radius', 10); // Default 10km
        
        $locations = Location::with(['reviews' => function($q) {
            $q->where('is_approved', true)->latest()->take(3);
        }])
        ->selectRaw("*, 
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
            sin(radians(latitude)))) AS distance", [$lat, $lng, $lat])
        ->having('distance', '<', $radius)
        ->orderBy('distance')
        ->limit($request->get('limit', 20))
        ->get();
        
        // Add additional data
        $locations->transform(function ($location) {
            $location->reviews_count = $location->reviews()->where('is_approved', true)->count();
            return $location;
        });
        
        return response()->json($locations);
    }
}