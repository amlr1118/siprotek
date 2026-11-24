<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id_pengguna',
        'id_unit',
        'nama_lengkap',
        'role',
        'jenis_profesi',
        'masa_kerja',
        'password'
    ];

    // const ROLE_DOKTER = 1;
    // const ROLE_PERAWAT = 2;
    // const ROLE_GIZI = 3;
    // const ROLE_APOTEKER = 4;
    // const ROLE_ADMINISTRASI = 5;
    // const ROLE_PIC = 6;

    public function relasiKeUnitKerja()
    {
        return $this->belongsTo(UnitKerjaModel::class, 'id_unit', 'id');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
