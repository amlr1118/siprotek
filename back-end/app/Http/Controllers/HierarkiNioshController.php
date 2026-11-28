<?php

namespace App\Http\Controllers;

use App\Models\HierarkiNioshModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HierarkiNioshController extends Controller
{
    public function index()
    {
        // Mengurutkan dari tingkat efektivitas tertinggi (1) ke terendah (5)
        $hierarkiNiosh = HierarkiNioshModel::withCount('relasiHierarkiNioshKeAturanK3')
            ->orderBy('urutan_efektivitas', 'asc')
            ->get();

        return response()->json([
            'data' => $hierarkiNiosh
        ], 200);
    }

    public function simpanDataHierarkiNiosh(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'urutan_efektivitas' => 'required|integer|min:1|max:10|unique:hierarki_niosh_models,urutan_efektivitas',
            'nama_hierarki' => 'required|string|max:100|unique:hierarki_niosh_models,nama_hierarki',
            'deskripsi_kendali' => 'required|string|max:255',
        ], [
            'urutan_efektivitas.required' => 'Urutan efektivitas tidak boleh kosong.',
            'urutan_efektivitas.integer' => 'Urutan efektivitas harus berupa angka.',
            'urutan_efektivitas.unique' => 'Nomor urutan efektivitas sudah digunakan.',
            'nama_hierarki.required' => 'Nama hierarki pengendalian tidak boleh kosong.',
            'nama_hierarki.max' => 'Nama hierarki maksimal 100 karakter.',
            'nama_hierarki.unique' => 'Nama hierarki sudah terdaftar.',
            'deskripsi_kendali.required' => 'Deskripsi kendali tidak boleh kosong.',
            'deskripsi_kendali.max' => 'Deskripsi kendali maksimal 255 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $hierarkiNiosh = HierarkiNioshModel::create([
            'urutan_efektivitas' => (int) $request->urutan_efektivitas,
            'nama_hierarki' => trim($request->nama_hierarki),
            'deskripsi_kendali' => trim($request->deskripsi_kendali),
        ]);

        return response()->json([
            'message' => 'Data Hierarki NIOSH berhasil disimpan!',
            'data' => $hierarkiNiosh
        ], 201);
    }

    public function updateDataHierarkiNiosh(Request $request, $id)
    {
        $hierarkiNiosh = HierarkiNioshModel::find($id);

        if (!$hierarkiNiosh) {
            return response()->json(['message' => 'Data hierarki NIOSH tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'urutan_efektivitas' => 'required|integer|min:1|max:10|unique:hierarki_niosh_models,urutan_efektivitas,' . $id,
            'nama_hierarki' => 'required|string|max:100|unique:hierarki_niosh_models,nama_hierarki,' . $id,
            'deskripsi_kendali' => 'required|string|max:255',
        ], [
            'urutan_efektivitas.required' => 'Urutan efektivitas tidak boleh kosong.',
            'urutan_efektivitas.integer' => 'Urutan efektivitas harus berupa angka.',
            'urutan_efektivitas.unique' => 'Nomor urutan efektivitas sudah digunakan.',
            'nama_hierarki.required' => 'Nama hierarki pengendalian tidak boleh kosong.',
            'nama_hierarki.max' => 'Nama hierarki maksimal 100 karakter.',
            'nama_hierarki.unique' => 'Nama hierarki sudah digunakan data lain.',
            'deskripsi_kendali.required' => 'Deskripsi kendali tidak boleh kosong.',
            'deskripsi_kendali.max' => 'Deskripsi kendali maksimal 255 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $hierarkiNiosh->update([
            'urutan_efektivitas' => (int) $request->urutan_efektivitas,
            'nama_hierarki' => trim($request->nama_hierarki),
            'deskripsi_kendali' => trim($request->deskripsi_kendali),
        ]);

        return response()->json([
            'message' => 'Data Hierarki NIOSH berhasil diupdate!',
            'data' => $hierarkiNiosh
        ], 200);
    }

    public function hapusDataHierarkiNiosh($id)
    {
        $hierarkiNiosh = HierarkiNioshModel::withCount('relasiHierarkiNioshKeAturanK3')->find($id);

        if (!$hierarkiNiosh) {
            return response()->json(['message' => 'Data hierarki NIOSH tidak ditemukan.'], 404);
        }

        if ($hierarkiNiosh->relasi_hierarki_niosh_ke_aturan_k3_count > 0) {
            return response()->json([
                'message' => 'Hierarki NIOSH tidak dapat dihapus karena masih memiliki ' . $hierarkiNiosh->relasi_hierarki_niosh_ke_aturan_k3_count . ' aturan K3 yang terhubung.'
            ], 422);
        }

        $hierarkiNiosh->delete();

        return response()->json([
            'message' => 'Data hierarki NIOSH berhasil dihapus!'
        ], 200);
    }
}
