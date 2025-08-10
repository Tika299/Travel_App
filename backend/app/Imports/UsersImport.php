<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
         return new User([
            'name'     => $row['name'],
            'email'    => $row['email'],
            'password' => Hash::make($row['password']), // mã hóa mật khẩu
            'phone'    => $row['phone'] ?? null,
            'status'   => $row['status'] ?? 'active',
            'avatar'   => $row['avatar'] ?? null,
            'bio'      => $row['bio'] ?? null,
            'role'     => $row['role'] ?? 'user',
        ]);
    }
}
