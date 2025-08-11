<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CategoryImport;

echo "Test Category Import\n";
echo "===================\n\n";

// Kiểm tra categories hiện tại
echo "Categories hiện tại:\n";
$existingCategories = Category::all(['name']);
foreach ($existingCategories as $category) {
    echo "- " . $category->name . "\n";
}

echo "\nTổng số categories hiện tại: " . $existingCategories->count() . "\n\n";

// Test tạo category mới
echo "Test tạo category mới:\n";
try {
    $testCategory = new Category([
        'name' => 'Test Category',
        'icon' => 'test-icon',
        'type' => 'test'
    ]);
    
    // Kiểm tra xem có tồn tại không
    $existing = Category::where('name', 'Test Category')->first();
    if ($existing) {
        echo "- Category 'Test Category' đã tồn tại (ID: {$existing->id})\n";
    } else {
        echo "- Category 'Test Category' chưa tồn tại, có thể tạo mới\n";
    }
    
} catch (Exception $e) {
    echo "Lỗi: " . $e->getMessage() . "\n";
}

echo "\nTest hoàn thành!\n";
