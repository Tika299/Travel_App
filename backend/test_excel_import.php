<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CategoryImport;

echo "Test Excel Import\n";
echo "================\n\n";

// Tạo dữ liệu test
$testData = [
    ['name' => 'Nem', 'icon' => 'https://drive.google.com/', 'type' => 'food'],
    ['name' => 'Bánh', 'icon' => 'https://drive.google.com/', 'type' => 'food'],
    ['name' => 'Nước', 'icon' => 'https://drive.google.com/', 'type' => 'drink'],
];

echo "Dữ liệu test:\n";
foreach ($testData as $row) {
    echo "- {$row['name']} ({$row['type']})\n";
}

echo "\nCategories hiện tại:\n";
$existingCategories = Category::all(['name']);
foreach ($existingCategories as $category) {
    echo "- " . $category->name . "\n";
}

echo "\nTest import từng dòng:\n";
$imported = 0;
$skipped = 0;

foreach ($testData as $row) {
    $name = trim($row['name']);
    $icon = trim($row['icon']);
    $type = trim($row['type']);
    
    // Kiểm tra xem category đã tồn tại chưa
    $existingCategory = Category::where('name', $name)->first();
    if ($existingCategory) {
        echo "- Bỏ qua '{$name}' (đã tồn tại)\n";
        $skipped++;
        continue;
    }
    
    // Tạo category mới
    try {
        $category = new Category([
            'name' => $name,
            'icon' => $icon ?: null,
            'type' => $type ?: 'food',
        ]);
        
        // Lưu vào database
        $category->save();
        echo "- Tạo thành công '{$name}'\n";
        $imported++;
        
    } catch (Exception $e) {
        echo "- Lỗi tạo '{$name}': " . $e->getMessage() . "\n";
        $skipped++;
    }
}

echo "\nKết quả:\n";
echo "- Imported: {$imported}\n";
echo "- Skipped: {$skipped}\n";

echo "\nCategories sau khi test:\n";
$newCategories = Category::all(['name']);
foreach ($newCategories as $category) {
    echo "- " . $category->name . "\n";
}

echo "\nTest hoàn thành!\n";
