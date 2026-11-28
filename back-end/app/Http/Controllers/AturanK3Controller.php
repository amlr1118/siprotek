<?php

namespace App\Http\Controllers;

use App\Models\AturanK3Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AturanK3Controller extends Controller
{
    public function index()
    {
        $aturanK3 = AturanK3Model::with([
            'relasiAturanK3KeDimensiBahaya',
            'relasiAturanK3KeUnitKerja',
            'relasiAturanK3KeKategoriResiko',
            'relasiAturanK3KeHierarkiNiosh',
        ])
            ->withCount([
                'relasiAturanK3KeDetailInputFakta',
                'relasiAturanK3KeDetailEvaluasiAturan',
            ])
            ->orderBy('kode_rule', 'asc')
            ->get();

        return response()->json([
            'data' => $aturanK3
        ], 200);
    }

    public function simpanDataAturanK3(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kode_rule' => 'required|string|max:50|unique:aturan_k3_models,kode_rule',
            'kelompok_aturan' => 'required|string|max:150',
            'id_dimensi' => 'required|exists:dimensi_bahaya_models,id',
            'id_unit' => 'required|exists:unit_kerja_models,id',
            'kondisi_if' => 'required|string|max:255',
            'operator_logika' => 'required|string|max:30',
            'kondisi_and' => 'required|string|max:255',
            'tindakan_then' => 'required|string|max:255',
            'tingkat_keparahan' => 'required|string|max:100',
            'tingkat_kemungkinan' => 'required|string|max:100',
            'id_kategori_resiko' => 'required|exists:kategori_resiko_models,id',
            'id_hierarki' => 'required|exists:hierarki_niosh_models,id',
            'rekomendasi_mitigasi' => 'required|string|max:255',
            'basis_temuan_tahap1' => 'required|string|max:255',
            'status_aturan' => 'nullable|boolean',
        ], [
            'kode_rule.required' => 'Kode aturan (Rule ID) tidak boleh kosong.',
            'kode_rule.unique' => 'Kode aturan sudah terdaftar.',
            'kelompok_aturan.required' => 'Kelompok aturan tidak boleh kosong.',
            'id_dimensi.required' => 'Dimensi bahaya wajib dipilih.',
            'id_dimensi.exists' => 'Dimensi bahaya tidak valid.',
            'id_unit.required' => 'Unit kerja wajib dipilih.',
            'id_unit.exists' => 'Unit kerja tidak valid.',
            'kondisi_if.required' => 'Premis Kondisi IF tidak boleh kosong.',
            'operator_logika.required' => 'Operator logika wajib dipilih.',
            'kondisi_and.required' => 'Premis Kondisi AND tidak boleh kosong.',
            'tindakan_then.required' => 'Konklusi Tindakan THEN tidak boleh kosong.',
            'tingkat_keparahan.required' => 'Tingkat keparahan wajib diisi.',
            'tingkat_kemungkinan.required' => 'Tingkat kemungkinan wajib diisi.',
            'id_kategori_resiko.required' => 'Kategori risiko wajib dipilih.',
            'id_kategori_resiko.exists' => 'Kategori risiko tidak valid.',
            'id_hierarki.required' => 'Hierarki NIOSH wajib dipilih.',
            'id_hierarki.exists' => 'Hierarki NIOSH tidak valid.',
            'rekomendasi_mitigasi.required' => 'Rekomendasi mitigasi tidak boleh kosong.',
            'basis_temuan_tahap1.required' => 'Basis temuan tahap 1 tidak boleh kosong.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $aturanK3 = AturanK3Model::create([
            'kode_rule' => strtoupper(trim($request->kode_rule)),
            'kelompok_aturan' => trim($request->kelompok_aturan),
            'id_dimensi' => $request->id_dimensi,
            'id_unit' => $request->id_unit,
            'kondisi_if' => trim($request->kondisi_if),
            'operator_logika' => strtoupper(trim($request->operator_logika)),
            'kondisi_and' => trim($request->kondisi_and),
            'tindakan_then' => trim($request->tindakan_then),
            'tingkat_keparahan' => trim($request->tingkat_keparahan),
            'tingkat_kemungkinan' => trim($request->tingkat_kemungkinan),
            'id_kategori_resiko' => $request->id_kategori_resiko,
            'id_hierarki' => $request->id_hierarki,
            'rekomendasi_mitigasi' => trim($request->rekomendasi_mitigasi),
            'basis_temuan_tahap1' => trim($request->basis_temuan_tahap1),
            'status_aturan' => $request->boolean('status_aturan', true),
        ]);

        $aturanK3->load([
            'relasiAturanK3KeDimensiBahaya',
            'relasiAturanK3KeUnitKerja',
            'relasiAturanK3KeKategoriResiko',
            'relasiAturanK3KeHierarkiNiosh',
        ]);

        return response()->json([
            'message' => 'Basis aturan K3 berhasil disimpan!',
            'data' => $aturanK3
        ], 201);
    }

    public function updateDataAturanK3(Request $request, $id)
    {
        $aturanK3 = AturanK3Model::find($id);

        if (!$aturanK3) {
            return response()->json(['message' => 'Data aturan K3 tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kode_rule' => 'required|string|max:50|unique:aturan_k3_models,kode_rule,' . $id,
            'kelompok_aturan' => 'required|string|max:150',
            'id_dimensi' => 'required|exists:dimensi_bahaya_models,id',
            'id_unit' => 'required|exists:unit_kerja_models,id',
            'kondisi_if' => 'required|string|max:255',
            'operator_logika' => 'required|string|max:30',
            'kondisi_and' => 'required|string|max:255',
            'tindakan_then' => 'required|string|max:255',
            'tingkat_keparahan' => 'required|string|max:100',
            'tingkat_kemungkinan' => 'required|string|max:100',
            'id_kategori_resiko' => 'required|exists:kategori_resiko_models,id',
            'id_hierarki' => 'required|exists:hierarki_niosh_models,id',
            'rekomendasi_mitigasi' => 'required|string|max:255',
            'basis_temuan_tahap1' => 'required|string|max:255',
            'status_aturan' => 'nullable|boolean',
        ], [
            'kode_rule.required' => 'Kode aturan (Rule ID) tidak boleh kosong.',
            'kode_rule.unique' => 'Kode aturan sudah digunakan aturan lain.',
            'kelompok_aturan.required' => 'Kelompok aturan tidak boleh kosong.',
            'id_dimensi.required' => 'Dimensi bahaya wajib dipilih.',
            'id_unit.required' => 'Unit kerja wajib dipilih.',
            'kondisi_if.required' => 'Premis Kondisi IF tidak boleh kosong.',
            'operator_logika.required' => 'Operator logika wajib dipilih.',
            'kondisi_and.required' => 'Premis Kondisi AND tidak boleh kosong.',
            'tindakan_then.required' => 'Konklusi Tindakan THEN tidak boleh kosong.',
            'tingkat_keparahan.required' => 'Tingkat keparahan wajib diisi.',
            'tingkat_kemungkinan.required' => 'Tingkat kemungkinan wajib diisi.',
            'id_kategori_resiko.required' => 'Kategori risiko wajib dipilih.',
            'id_hierarki.required' => 'Hierarki NIOSH wajib dipilih.',
            'rekomendasi_mitigasi.required' => 'Rekomendasi mitigasi tidak boleh kosong.',
            'basis_temuan_tahap1.required' => 'Basis temuan tahap 1 tidak boleh kosong.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $aturanK3->update([
            'kode_rule' => strtoupper(trim($request->kode_rule)),
            'kelompok_aturan' => trim($request->kelompok_aturan),
            'id_dimensi' => $request->id_dimensi,
            'id_unit' => $request->id_unit,
            'kondisi_if' => trim($request->kondisi_if),
            'operator_logika' => strtoupper(trim($request->operator_logika)),
            'kondisi_and' => trim($request->kondisi_and),
            'tindakan_then' => trim($request->tindakan_then),
            'tingkat_keparahan' => trim($request->tingkat_keparahan),
            'tingkat_kemungkinan' => trim($request->tingkat_kemungkinan),
            'id_kategori_resiko' => $request->id_kategori_resiko,
            'id_hierarki' => $request->id_hierarki,
            'rekomendasi_mitigasi' => trim($request->rekomendasi_mitigasi),
            'basis_temuan_tahap1' => trim($request->basis_temuan_tahap1),
            'status_aturan' => $request->boolean('status_aturan'),
        ]);

        $aturanK3->load([
            'relasiAturanK3KeDimensiBahaya',
            'relasiAturanK3KeUnitKerja',
            'relasiAturanK3KeKategoriResiko',
            'relasiAturanK3KeHierarkiNiosh',
        ]);

        return response()->json([
            'message' => 'Basis aturan K3 berhasil diperbarui!',
            'data' => $aturanK3
        ], 200);
    }

    public function toggleStatusAturanK3($id)
    {
        $aturanK3 = AturanK3Model::find($id);

        if (!$aturanK3) {
            return response()->json(['message' => 'Data aturan K3 tidak ditemukan.'], 404);
        }

        $aturanK3->update([
            'status_aturan' => !$aturanK3->status_aturan,
        ]);

        return response()->json([
            'message' => 'Status aturan ' . $aturanK3->kode_rule . ' berhasil diubah.',
            'data' => $aturanK3
        ], 200);
    }

    public function hapusDataAturanK3($id)
    {
        $aturanK3 = AturanK3Model::withCount([
            'relasiAturanK3KeDetailInputFakta',
            'relasiAturanK3KeDetailEvaluasiAturan',
        ])->find($id);

        if (!$aturanK3) {
            return response()->json(['message' => 'Data aturan K3 tidak ditemukan.'], 404);
        }

        $totalRelasi = $aturanK3->relasi_aturan_k3_ke_detail_input_fakta_count
            + $aturanK3->relasi_aturan_k3_ke_detail_evaluasi_aturan_count;

        if ($totalRelasi > 0) {
            return response()->json([
                'message' => 'Aturan K3 tidak dapat dihapus karena sudah digunakan pada riwayat penilaian risiko.'
            ], 422);
        }

        $aturanK3->delete();

        return response()->json([
            'message' => 'Basis aturan K3 berhasil dihapus!'
        ], 200);
    }
}
