<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Cuisine;

echo "Latest 5 cuisines with images:\n";

$latestCuisines = Cuisine::latest()->take(5)->get(['name', 'image']);

foreach ($latestCuisines as $cuisine) {
    echo "- {$cuisine->name}: {$cuisine->image}\n";
    
    // Kiểm tra xem ảnh có tồn tại không
    if ($cuisine->image && strpos($cuisine->image, 'storage/') === 0) {
        $imagePath = public_path($cuisine->image);
        if (file_exists($imagePath)) {
            echo "  ✅ File exists: " . filesize($imagePath) . " bytes\n";
        } else {
            echo "  ❌ File not found: {$imagePath}\n";
        }
    }
}

echo "\nTotal cuisines: " . Cuisine::count() . "\n";
