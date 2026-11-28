<?php

namespace App\Http\Controllers;

use App\Models\UnitKerjaModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UnitKerjaController extends Controller
{
    public function index()
    {
        // Mengambil seluruh data unit kerja beserta jumlah pengguna yang berelasi
        $unitKerja = UnitKerjaModel::withCount('relasiKeUser')
            ->latest()
            ->get();

        return response()->json([
            'data' => $unitKerja
        ], 200);
    }

    public function simpanDataUnitKerja(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode_unit' => 'required|string|max:20|unique:unit_kerja_models,kode_unit',
            'nama_unit' => 'required|string|max:100',
            'kategori_area' => 'required|string|max:50',
            'status_resiko_akhir' => 'required|in:Rendah,Sedang,Tinggi,Kritis',
        ], [
            'kode_unit.required' => 'Kode unit tidak boleh kosong.',
            'kode_unit.max' => 'Kode unit maksimal 20 karakter.',
            'kode_unit.unique' => 'Kode unit sudah terdaftar.',
            'nama_unit.required' => 'Nama unit kerja tidak boleh kosong.',
            'nama_unit.max' => 'Nama unit maksimal 100 karakter.',
            'kategori_area.required' => 'Kategori area wajib dipilih.',
            'status_resiko_akhir.required' => 'Status risiko akhir wajib dipilih.',
            'status_resiko_akhir.in' => 'Status risiko harus Rendah, Sedang, Tinggi, atau Kritis.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $unitKerja = UnitKerjaModel::create([
            'kode_unit' => strtoupper(trim($request->kode_unit)),
            'nama_unit' => trim($request->nama_unit),
            'kategori_area' => $request->kategori_area,
            'status_resiko_akhir' => $request->status_resiko_akhir ?? 'Rendah',
        ]);

        return response()->json([
            'message' => 'Data Unit Kerja berhasil disimpan!',
            'data' => $unitKerja
        ], 201);
    }

    public function updateDataUnitKerja(Request $request, $id)
    {
        $unitKerja = UnitKerjaModel::find($id);

        if (!$unitKerja) {
            return response()->json(['message' => 'Data unit kerja tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_unit' => 'required|string|max:20|unique:unit_kerja_models,kode_unit,' . $id,
            'nama_unit' => 'required|string|max:100',
            'kategori_area' => 'required|string|max:50',
            'status_resiko_akhir' => 'required|in:Rendah,Sedang,Tinggi,Kritis',
        ], [
            'kode_unit.required' => 'Kode unit tidak boleh kosong.',
            'kode_unit.max' => 'Kode unit maksimal 20 karakter.',
            'kode_unit.unique' => 'Kode unit sudah digunakan unit lain.',
            'nama_unit.required' => 'Nama unit kerja tidak boleh kosong.',
            'nama_unit.max' => 'Nama unit maksimal 100 karakter.',
            'kategori_area.required' => 'Kategori area wajib dipilih.',
            'status_resiko_akhir.required' => 'Status risiko akhir wajib dipilih.',
            'status_resiko_akhir.in' => 'Status risiko harus Rendah, Sedang, Tinggi, atau Kritis.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $unitKerja->update([
            'kode_unit' => strtoupper(trim($request->kode_unit)),
            'nama_unit' => trim($request->nama_unit),
            'kategori_area' => $request->kategori_area,
            'status_resiko_akhir' => $request->status_resiko_akhir,
        ]);

        return response()->json([
            'message' => 'Data Unit Kerja berhasil diupdate!',
            'data' => $unitKerja
        ], 200);
    }

    public function hapusDataUnitKerja($id)
    {
        $unitKerja = UnitKerjaModel::withCount('relasiKeUser')->find($id);

        if (!$unitKerja) {
            return response()->json(['message' => 'Data unit kerja tidak ditemukan.'], 404);
        }

        if ($unitKerja->relasi_ke_user_count > 0) {
            return response()->json([
                'message' => 'Unit kerja tidak dapat dihapus karena masih memiliki ' . $unitKerja->relasi_ke_user_count . ' pengguna aktif.'
            ], 422);
        }

        $unitKerja->delete();

        return response()->json([
            'message' => 'Data unit kerja berhasil dihapus!'
        ], 200);
    }
}
