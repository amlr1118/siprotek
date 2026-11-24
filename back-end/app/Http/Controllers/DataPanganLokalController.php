<?php

namespace App\Http\Controllers;

use App\Models\DataPanganLokalModel;
use Illuminate\Http\Request;

class DataPanganLokalController extends Controller
{
    /**
     * Menampung Aturan Validasi
     */
    private $validationRules = [
        'nama_pangan'     => 'required|string|max:255',
        'kategori'        => 'required|string',
        'kalori_per_100g' => 'required|numeric|min:0',
        'karbo_per_100g'  => 'required|numeric|min:0',
        'satuan_porsi'    => 'required|string|max:100',
        'berat_per_porsi' => 'required|numeric|min:1',
        'index_glikemik'  => 'required|string',
    ];

    /**
     * Menampung Pesan Error Berbahasa Indonesia
     */
    private $validationMessages = [
        'nama_pangan.required'     => 'Nama pangan lokal wajib diisi.',
        'nama_pangan.max'          => 'Nama pangan maksimal 255 karakter.',

        'kategori.required'        => 'Kategori pangan wajib dipilih.',

        'kalori_per_100g.required' => 'Jumlah kalori per 100g wajib diisi.',
        'kalori_per_100g.numeric'  => 'Jumlah kalori harus berupa angka.',
        'kalori_per_100g.min'      => 'Jumlah kalori tidak boleh kurang dari 0.',

        'karbo_per_100g.required'  => 'Kandungan karbohidrat per 100g wajib diisi.',
        'karbo_per_100g.numeric'   => 'Kandungan karbohidrat harus berupa angka.',
        'karbo_per_100g.min'       => 'Kandungan karbohidrat tidak boleh kurang dari 0.',

        'satuan_porsi.required'    => 'Satuan porsi standar wajib diisi (cth: piring, buah).',
        'satuan_porsi.max'         => 'Satuan porsi maksimal 100 karakter.',

        'berat_per_porsi.required' => 'Berat per porsi wajib diisi.',
        'berat_per_porsi.numeric'  => 'Berat per porsi harus berupa angka.',
        'berat_per_porsi.min'      => 'Berat per porsi minimal 1 gram.',

        'index_glikemik.required'  => 'Kategori Indeks Glikemik (IG) wajib dipilih.',
    ];

    // 1. Tampilkan Semua Data (Untuk Tabel)
    public function index()
    {
        $data = DataPanganLokalModel::orderBy('kategori', 'asc')
            ->orderBy('nama_pangan', 'asc')
            ->get();
        return response()->json(['data' => $data], 200);
    }

    // 2. Simpan Data Baru
    public function store(Request $request)
    {
        // Validasi input dengan menyertakan pesan bahasa Indonesia
        $validated = $request->validate($this->validationRules, $this->validationMessages);

        DataPanganLokalModel::create($validated);

        return response()->json(['message' => 'Data Pangan Lokal berhasil ditambahkan'], 201);
    }

    // 3. Update Data
    public function update(Request $request, $id)
    {
        // Validasi input dengan menyertakan pesan bahasa Indonesia
        $validated = $request->validate($this->validationRules, $this->validationMessages);

        $pangan = DataPanganLokalModel::find($id);

        if (!$pangan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $pangan->update($validated);

        return response()->json(['message' => 'Data Pangan Lokal berhasil diperbarui'], 200);
    }

    // 4. Hapus Data
    public function destroy($id)
    {
        $pangan = DataPanganLokalModel::find($id);
        if ($pangan) {
            $pangan->delete();
            return response()->json(['message' => 'Data berhasil dihapus'], 200);
        }
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }
}
