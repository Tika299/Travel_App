<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Cities in database:\n";

$places = \App\Models\CheckinPlace::select('address')->get();
$cities = [];

foreach ($places as $place) {
    if (preg_match('/(Hà Nội|TP\.HCM|Đà Nẵng|Huế|Hội An|Đà Lạt|Sa Pa|Phú Quốc|Vịnh Hạ Long)/', $place->address, $matches)) {
        $cities[$matches[1]] = true;
    }
}

foreach (array_keys($cities) as $city) {
    echo "- " . $city . "\n";
}

echo "\nTotal cities: " . count($cities) . "\n"; 