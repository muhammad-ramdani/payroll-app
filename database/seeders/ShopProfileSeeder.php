<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ShopProfile;

class ShopProfileSeeder extends Seeder
{
    public function run(): void
    {
        ShopProfile::create([
            'shop_name' => 'GS Elektronik',
            'address' => 'Jl. Raya Banjar - Pangandaran No.653, Desa Sukajadi, Kacamatan Pamarican, Kabupaten Ciamis, Jawa Barat, 46382',
            'phone' => '0812-3456-7890',
        ]);
    }
}
