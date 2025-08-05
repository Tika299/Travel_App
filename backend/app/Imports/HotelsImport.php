<?php
namespace App\Imports;

use App\Models\Hotel;
use Maatwebsite\Excel\Concerns\ToModel;

class HotelsImport implements ToModel
{
    public function model(array $row)
    {
        return new Hotel([
            'name'     => $row[0],
            'email'    => $row[1],
            'password' => bcrypt($row[2]),
        ]);
    }
}
