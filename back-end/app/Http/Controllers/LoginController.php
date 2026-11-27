<?php

namespace App\Http\Controllers;

use App\Models\UnitKerjaModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function index()
    {
       // Eager load relasiKeUnitKerja agar nama_unit ikut terkirim dalam JSON
        $pengguna = User::with('relasiKeUnitKerja')->latest()->get();

        return response()->json([
            'data' => $pengguna
        ]);
    }

    public function getUnitKerja()
    {
       $unit_kerja = UnitKerjaModel::orderBy('nama_unit', 'asc')->get();

        return response()->json([
            'data' => $unit_kerja
        ]);
    }

    public function updateDataPengguna(Request $request, $id)
    {
        $pengguna = User::find($id);

        if (!$pengguna) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_pengguna' => 'required',
            'id_unit' => 'required',
            // 'email' => 'required|email|unique:users,email',
            'nama_lengkap' => 'required|string|max:255',
            'role' => 'required',
            'jenis_profesi' => 'required',
            'masa_kerja' => 'required',
            'password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
            ],

        ], [
            'id_pengguna.required' => 'ID Pengguna tidak boleh kosong',
            'id_unit.required' => 'ID Unit tidak boleh kosong',
            // 'email.required' => 'Email tidak boleh kosong.',
            // 'email.email' => 'Format email tidak valid.',
            // 'email.unique' => 'Email ini sudah terdaftar.',

            'nama_lengkap.required' => 'Nama lengkap tidak boleh kosong.',
            'role.required' => 'Role tidak boleh kosong.',
            'jenis_profesi.required' => 'Jenis profesi tidak boleh kosong.',
            'masa_kerja.required' => 'Masa kerja tidak boleh kosong.',

            'password.required' => 'Password tidak boleh kosong.',
            'password.max' => 'Password maksimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan data dengan password terenkripsi

        $pengguna->update([
            'id_pengguna' => $request->id_pengguna,
            'id_unit' => $request->id_unit,
            'nama_lengkap' => $request->nama_lengkap,
            'role' => $request->role,
            'jenis_profesi' => $request->jenis_profesi,
            'masa_kerja' => $request->masa_kerja,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Data Pengguna berhasil diupdate!',
            'data' => $pengguna
        ], 201);
    }

    public function hapusDataPengguna($id)
    {
        $pengguna = User::find($id);

        if (!$pengguna) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        // Hapus data dari database
        $pengguna->delete();

        return response()->json([
            'message' => 'Data peserta berhasil dihapus!'
        ], 200);
    }


    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'id_pengguna' => 'required',
            'id_unit' => 'required',
            // 'email' => 'required|email|unique:users,email',
            'nama_lengkap' => 'required|string|max:255',
            'role' => 'required',
            'jenis_profesi' => 'required',
            'masa_kerja' => 'required',
            'password' => [
                'required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
            ],

        ], [
            'id_pengguna.required' => 'ID Pengguna tidak boleh kosong',
            'id_unit.required' => 'ID Unit tidak boleh kosong',
            // 'email.required' => 'Email tidak boleh kosong.',
            // 'email.email' => 'Format email tidak valid.',
            // 'email.unique' => 'Email ini sudah terdaftar.',

            'nama_lengkap.required' => 'Nama lengkap tidak boleh kosong.',
            'role.required' => 'Role tidak boleh kosong.',
            'jenis_profesi.required' => 'Jenis profesi tidak boleh kosong.',
            'masa_kerja.required' => 'Masa kerja tidak boleh kosong.',

            'password.required' => 'Password tidak boleh kosong.',
            'password.max' => 'Password maksimal 8 karakter.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan data dengan password terenkripsi
        $pengguna = User::create([
            'id_pengguna' => $request->id_pengguna,
            'id_unit' => $request->id_unit,
            'nama_lengkap' => $request->nama_lengkap,
            'role' => $request->role,
            'jenis_profesi' => $request->jenis_profesi,
            'masa_kerja' => $request->masa_kerja,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Data Pengguna berhasil disimpan!',
            'data' => $pengguna
        ], 201);
    }

    public function login(Request $request)
    {
        // 1. Validasi input
        // Jika gagal, Laravel otomatis mengirimkan status 422 (Unprocessable Entity)
        // beserta pesan error validasinya ke React.
        $request->validate([
            'id_pengguna' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('id_pengguna', $request->id_pengguna)->first();

        // 2. Cek kecocokan kredensial
        if (!$user || !Hash::check($request->password, $user->password)) {
            // Harus menggunakan status 401 agar memicu blok 'catch' di Frontend
            return response()->json([
                'message' => 'Id Pengguna atau password yang Anda masukkan salah.'
            ], 401);
        }

        // 3. Buat token baru
        $token = $user->createToken($user->id_pengguna);

        // 4. Kembalikan data dengan format JSON standar (Status 200 OK)
        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return [
            'message' => 'You are logged out.'
        ];
    }

    // public function update(Request $request, $id)
    // {
    //     $user = User::findOrFail($id);

    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|email|unique:users,email,' . $id,
    //         'password' => 'nullable|string|min:6',
    //     ]);

    //     $user->name = $request->name;
    //     $user->email = $request->email;

    //     if ($request->filled('password')) {
    //         $user->password = Hash::make($request->password);
    //     }

    //     $user->save();

    //     return response()->json(['message' => 'User updated successfully']);
    // }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
