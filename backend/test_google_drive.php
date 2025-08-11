<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Imports\CategoryImport;

echo "Test Google Drive URL Processing\n";
echo "===============================\n\n";

// Tạo instance của CategoryImport
$import = new CategoryImport();

// Test các URL Google Drive khác nhau
$testUrls = [
    'https://drive.google.com/',
    'https://drive.google.com/file/d/14gVnZKRwF5N6-fceZsyXcaUMyxZpBc1c/view',
    'https://drive.google.com/open?id=14gVnZKRwF5N6-fceZsyXcaUMyxZpBc1c',
    'https://drive.google.com/uc?id=14gVnZKRwF5N6-fceZsyXcaUMyxZpBc1c&export=download',
];

foreach ($testUrls as $url) {
    echo "Testing URL: {$url}\n";
    
    // Sử dụng reflection để gọi private method
    $reflection = new ReflectionClass($import);
    $method = $reflection->getMethod('downloadGoogleDriveImage');
    $method->setAccessible(true);
    
    try {
        $result = $method->invoke($import, $url, 'test_category');
        if ($result) {
            echo "✓ Success: {$result}\n";
        } else {
            echo "✗ Failed: Could not download image\n";
        }
    } catch (Exception $e) {
        echo "✗ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

echo "Test completed!\n";
