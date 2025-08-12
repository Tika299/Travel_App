<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Cuisine;

echo "=== Kiểm tra vấn đề rating ===\n";

// Lấy cuisine đầu tiên
$cuisine = Cuisine::first();

if (!$cuisine) {
    echo "Không có dữ liệu cuisine\n";
    exit;
}

echo "Cuisine ID: " . $cuisine->id . "\n";
echo "Cuisine Name: " . $cuisine->name . "\n";

// Kiểm tra xem có attribute rating không
echo "Has rating attribute: " . (isset($cuisine->rating) ? 'Yes' : 'No') . "\n";
echo "Rating value: " . ($cuisine->rating ?? 'null') . "\n";

// Kiểm tra tất cả attributes
echo "\nAll attributes:\n";
print_r($cuisine->getAttributes());

// Kiểm tra xem có accessor nào cho rating không
echo "\nChecking for rating accessor...\n";
$reflection = new ReflectionClass($cuisine);
$methods = $reflection->getMethods(ReflectionMethod::IS_PUBLIC);

foreach ($methods as $method) {
    if (strpos($method->getName(), 'get') === 0 && strpos($method->getName(), 'Rating') !== false) {
        echo "Found rating method: " . $method->getName() . "\n";
    }
}

// Kiểm tra appends
echo "\nAppends: ";
print_r($cuisine->getAppends());

echo "\n=== Kết thúc kiểm tra ===\n";
