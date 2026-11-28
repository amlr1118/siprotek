<?php

namespace App\Http\Controllers;

use App\Models\DimensiBahayaModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DimensiBahayaController extends Controller
{
    public function index()
    {
        // Mengambil seluruh data dimensi bahaya beserta jumlah aturan K3 yang berelasi
        $dimensiBahaya = DimensiBahayaModel::withCount('relasiDimensiBahayaKeAturanK3')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'data' => $dimensiBahaya
        ], 200);
    }

    public function simpanDataDimensiBahaya(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode_dimensi' => 'required|string|max:20|unique:dimensi_bahaya_models,kode_dimensi',
            'nama_dimensi' => 'required|string|max:100',
            'deskripsi_indikator' => 'required|string|max:255',
        ], [
            'kode_dimensi.required' => 'Kode dimensi tidak boleh kosong.',
            'kode_dimensi.max' => 'Kode dimensi maksimal 20 karakter.',
            'kode_dimensi.unique' => 'Kode dimensi sudah terdaftar.',
            'nama_dimensi.required' => 'Nama dimensi bahaya tidak boleh kosong.',
            'nama_dimensi.max' => 'Nama dimensi maksimal 100 karakter.',
            'deskripsi_indikator.required' => 'Deskripsi indikator tidak boleh kosong.',
            'deskripsi_indikator.max' => 'Deskripsi indikator maksimal 255 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $dimensiBahaya = DimensiBahayaModel::create([
            'kode_dimensi' => strtoupper(trim($request->kode_dimensi)),
            'nama_dimensi' => trim($request->nama_dimensi),
            'deskripsi_indikator' => trim($request->deskripsi_indikator),
        ]);

        return response()->json([
            'message' => 'Data Dimensi Bahaya berhasil disimpan!',
            'data' => $dimensiBahaya
        ], 201);
    }

    public function updateDataDimensiBahaya(Request $request, $id)
    {
        $dimensiBahaya = DimensiBahayaModel::find($id);

        if (!$dimensiBahaya) {
            return response()->json(['message' => 'Data dimensi bahaya tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_dimensi' => 'required|string|max:20|unique:dimensi_bahaya_models,kode_dimensi,' . $id,
            'nama_dimensi' => 'required|string|max:100',
            'deskripsi_indikator' => 'required|string|max:255',
        ], [
            'kode_dimensi.required' => 'Kode dimensi tidak boleh kosong.',
            'kode_dimensi.max' => 'Kode dimensi maksimal 20 karakter.',
            'kode_dimensi.unique' => 'Kode dimensi sudah digunakan dimensi lain.',
            'nama_dimensi.required' => 'Nama dimensi bahaya tidak boleh kosong.',
            'nama_dimensi.max' => 'Nama dimensi maksimal 100 karakter.',
            'deskripsi_indikator.required' => 'Deskripsi indikator tidak boleh kosong.',
            'deskripsi_indikator.max' => 'Deskripsi indikator maksimal 255 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $dimensiBahaya->update([
            'kode_dimensi' => strtoupper(trim($request->kode_dimensi)),
            'nama_dimensi' => trim($request->nama_dimensi),
            'deskripsi_indikator' => trim($request->deskripsi_indikator),
        ]);

        return response()->json([
            'message' => 'Data Dimensi Bahaya berhasil diupdate!',
            'data' => $dimensiBahaya
        ], 200);
    }

    public function hapusDataDimensiBahaya($id)
    {
        $dimensiBahaya = DimensiBahayaModel::withCount('relasiDimensiBahayaKeAturanK3')->find($id);

        if (!$dimensiBahaya) {
            return response()->json(['message' => 'Data dimensi bahaya tidak ditemukan.'], 404);
        }

        if ($dimensiBahaya->relasi_dimensi_bahaya_ke_aturan_k3_count > 0) {
            return response()->json([
                'message' => 'Dimensi bahaya tidak dapat dihapus karena masih memiliki ' . $dimensiBahaya->relasi_dimensi_bahaya_ke_aturan_k3_count . ' aturan K3 yang terhubung.'
            ], 422);
        }

        $dimensiBahaya->delete();

        return response()->json([
            'message' => 'Data dimensi bahaya berhasil dihapus!'
        ], 200);
    }
}
