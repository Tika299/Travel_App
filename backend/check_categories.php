<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Category;

echo "Categories hiện tại trong database:\n";
$categories = Category::all(['name']);
foreach ($categories as $category) {
    echo "- " . $category->name . "\n";
}

echo "\nTổng số categories: " . $categories->count() . "\n";
