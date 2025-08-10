<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\CheckinPlace;
use App\Models\Hotel;
use App\Models\Restaurant;

echo "Checking real data in database...\n\n";

try {
    // Check checkin_places
    $checkinPlaces = CheckinPlace::all(['id', 'name', 'address', 'region']);
    echo "=== CHECKIN PLACES ===\n";
    echo "Found " . $checkinPlaces->count() . " places:\n";
    foreach ($checkinPlaces as $place) {
        echo "ID: {$place->id} - {$place->name} - {$place->address} - {$place->region}\n";
    }
    echo "\n";
    
    // Check hotels
    $hotels = Hotel::all(['id', 'name', 'address']);
    echo "=== HOTELS ===\n";
    echo "Found " . $hotels->count() . " hotels:\n";
    foreach ($hotels as $hotel) {
        echo "ID: {$hotel->id} - {$hotel->name} - {$hotel->address}\n";
    }
    echo "\n";
    
    // Check restaurants
    $restaurants = Restaurant::all(['id', 'name', 'address']);
    echo "=== RESTAURANTS ===\n";
    echo "Found " . $restaurants->count() . " restaurants:\n";
    foreach ($restaurants as $restaurant) {
        echo "ID: {$restaurant->id} - {$restaurant->name} - {$restaurant->address}\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
