<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TransportCompany;

class TransportCompanyController extends Controller
{
    // Lấy danh sách hãng xe
    public function index()
    {
        return response()->json(TransportCompany::all());
    }

    // Thêm hãng xe
    public function store(Request $request)
    {
        $validated = $request->validate([
            'transportation_id' => 'required|exists:transportations,id',
            'name' => 'required|string|max:255',
            'contact_info' => 'nullable|string',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'operating_hours' => 'nullable|json',
            'rating' => 'nullable|numeric|min:0|max:5'
        ]);

        $company = TransportCompany::create($validated);

        return response()->json($company, 201);
    }

    // Lấy chi tiết hãng xe
    public function show($id)
    {
        $company = TransportCompany::findOrFail($id);
        return response()->json($company);
    }

    // Sửa hãng xe
    public function update(Request $request, $id)
    {
        $company = TransportCompany::findOrFail($id);

        $validated = $request->validate([
            'transportation_id' => 'sometimes|exists:transportations,id',
            'name' => 'sometimes|string|max:255',
            'contact_info' => 'nullable|string',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'operating_hours' => 'nullable|json',
            'rating' => 'nullable|numeric|min:0|max:5'
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    // Xóa hãng xe
    public function destroy($id)
    {
        $company = TransportCompany::findOrFail($id);
        $company->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
