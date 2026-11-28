<?php

namespace App\Http\Controllers;

use App\Models\KategoriResikoModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KategoriResikoController extends Controller
{
    public function index()
    {
        // Mengurutkan berdasarkan bobot_prioritas dari terendah (1) ke tertinggi (4)
        $kategoriResiko = KategoriResikoModel::withCount([
            'relasiKategoriResikoKeAturanK3',
            'relasiKategoriResikoKePenilaianResiko',
        ])
            ->orderBy('bobot_prioritas', 'asc')
            ->get();

        return response()->json([
            'data' => $kategoriResiko
        ], 200);
    }

    public function simpanDataKategoriResiko(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'level_reisko' => 'required|string|max:50|unique:kategori_resiko_models,level_reisko',
            'bobot_prioritas' => 'required|integer|min:1|max:10|unique:kategori_resiko_models,bobot_prioritas',
            'makna_resiko' => 'required|string|max:255',
            'prioritas_respon' => 'required|string|max:100',
            'kode_warna' => 'required|string|max:30',
        ], [
            'level_reisko.required' => 'Level risiko tidak boleh kosong.',
            'level_reisko.unique' => 'Level risiko sudah terdaftar.',
            'bobot_prioritas.required' => 'Bobot prioritas tidak boleh kosong.',
            'bobot_prioritas.integer' => 'Bobot prioritas harus berupa angka.',
            'bobot_prioritas.unique' => 'Bobot prioritas sudah digunakan oleh level risiko lain.',
            'makna_resiko.required' => 'Makna risiko tidak boleh kosong.',
            'prioritas_respon.required' => 'Prioritas respons tidak boleh kosong.',
            'kode_warna.required' => 'Kode warna wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $kategoriResiko = KategoriResikoModel::create([
            'level_reisko' => trim($request->level_reisko),
            'bobot_prioritas' => (int) $request->bobot_prioritas,
            'makna_resiko' => trim($request->makna_resiko),
            'prioritas_respon' => trim($request->prioritas_respon),
            'kode_warna' => trim($request->kode_warna),
        ]);

        return response()->json([
            'message' => 'Data Kategori Risiko berhasil disimpan!',
            'data' => $kategoriResiko
        ], 201);
    }

    public function updateDataKategoriResiko(Request $request,$id)
    {
        $kategoriResiko = KategoriResikoModel::find($id);

        if (!$kategoriResiko) {
            return response()->json(['message' => 'Data kategori risiko tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'level_reisko' => 'required|string|max:50|unique:kategori_resiko_models,level_reisko,' . $id,
            'bobot_prioritas' => 'required|integer|min:1|max:10|unique:kategori_resiko_models,bobot_prioritas,' . $id,
            'makna_resiko' => 'required|string|max:255',
            'prioritas_respon' => 'required|string|max:100',
            'kode_warna' => 'required|string|max:30',
        ], [
            'level_reisko.required' => 'Level risiko tidak boleh kosong.',
            'level_reisko.unique' => 'Level risiko sudah digunakan data lain.',
            'bobot_prioritas.required' => 'Bobot prioritas tidak boleh kosong.',
            'bobot_prioritas.integer' => 'Bobot prioritas harus berupa angka.',
            'bobot_prioritas.unique' => 'Bobot prioritas sudah digunakan oleh level risiko lain.',
            'makna_resiko.required' => 'Makna risiko tidak boleh kosong.',
            'prioritas_respon.required' => 'Prioritas respons tidak boleh kosong.',
            'kode_warna.required' => 'Kode warna wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $kategoriResiko->update([
            'level_reisko' => trim($request->level_reisko),
            'bobot_prioritas' => (int) $request->bobot_prioritas,
            'makna_resiko' => trim($request->makna_resiko),
            'prioritas_respon' => trim($request->prioritas_respon),
            'kode_warna' => trim($request->kode_warna),
        ]);

        return response()->json([
            'message' => 'Data Kategori Risiko berhasil diupdate!',
            'data' => $kategoriResiko
        ], 200);
    }

    public function hapusDataKategoriResiko($id)
    {
        $kategoriResiko = KategoriResikoModel::withCount([ 'relasiKategoriResikoKeAturanK3', 'relasiKategoriResikoKePenilaianResiko', ])->find($id);

        if (!$kategoriResiko) {
            return response()->json(['message' => 'Data kategori risiko tidak ditemukan.'], 404);
        }

        $totalRelasi =$kategoriResiko->relasi_kategori_resiko_ke_aturan_k3_count
            + $kategoriResiko->relasi_kategori_resiko_ke_penilaian_resiko_count;

        if ($totalRelasi > 0) {
            return response()->json([
                'message' => 'Kategori risiko tidak dapat dihapus karena masih terhubung dengan aturan K3 atau riwayat penilaian.'
            ], 422);
        }

        $kategoriResiko->delete();

        return response()->json([
            'message' => 'Data kategori risiko berhasil dihapus!'
        ], 200);
    }
}
