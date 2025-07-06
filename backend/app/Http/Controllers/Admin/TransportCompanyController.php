<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportCompany;
use App\Models\Transportation;
use Illuminate\Http\Request;

class TransportCompanyController extends Controller
{
    public function index()
    {
        $transportCompanies = TransportCompany::with('transportation')->get();
        return view('admin.transport_companies.index', compact('transportCompanies'));
    }

    public function create()
    {
        $transportations = Transportation::all();
        return view('admin.transport_companies.create', compact('transportations'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'contact_info' => 'nullable',
            'address' => 'nullable',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable',
            'logo' => 'nullable',
            'operating_hours' => 'nullable',
            'rating' => 'nullable|numeric',
            'transportation_id' => 'required|exists:transportations,id',
        ]);

        TransportCompany::create($request->all());

        return redirect()->route('admin.transport_companies.index')->with('success', 'Thêm hãng xe thành công!');
    }

    public function edit($id)
    {
        $transportCompany = TransportCompany::findOrFail($id);
        $transportations = Transportation::all();
        return view('admin.transport_companies.edit', compact('transportCompany', 'transportations'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required',
            'contact_info' => 'nullable',
            'address' => 'nullable',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'description' => 'nullable',
            'logo' => 'nullable',
            'operating_hours' => 'nullable',
            'rating' => 'nullable|numeric',
            'transportation_id' => 'required|exists:transportations,id',
        ]);

        $transportCompany = TransportCompany::findOrFail($id);
        $transportCompany->update($request->all());

        return redirect()->route('admin.transport_companies.index')->with('success', 'Cập nhật thành công!');
    }

    public function destroy($id)
    {
        $transportCompany = TransportCompany::findOrFail($id);
        $transportCompany->delete();

        return redirect()->route('admin.transport_companies.index')->with('success', 'Xóa thành công!');
    }
}
