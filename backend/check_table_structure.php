<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking table structures...\n\n";

try {
    // Check checkin_places structure
    echo "=== CHECKIN_PLACES STRUCTURE ===\n";
    $columns = DB::select("DESCRIBE checkin_places");
    foreach ($columns as $column) {
        echo "{$column->Field} - {$column->Type}\n";
    }
    echo "\n";
    
    // Check hotels structure
    echo "=== HOTELS STRUCTURE ===\n";
    $columns = DB::select("DESCRIBE hotels");
    foreach ($columns as $column) {
        echo "{$column->Field} - {$column->Type}\n";
    }
    echo "\n";
    
    // Check restaurants structure
    echo "=== RESTAURANTS STRUCTURE ===\n";
    $columns = DB::select("DESCRIBE restaurants");
    foreach ($columns as $column) {
        echo "{$column->Field} - {$column->Type}\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>


