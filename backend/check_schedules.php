<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Schedule;

echo "Checking schedules in database...\n\n";

try {
    $schedules = Schedule::all(['id', 'name', 'description']);
    
    if ($schedules->count() > 0) {
        echo "Found " . $schedules->count() . " schedules:\n";
        foreach ($schedules as $schedule) {
            echo "ID: {$schedule->id} - {$schedule->name}\n";
            echo "Description: {$schedule->description}\n";
            echo "---\n";
        }
    } else {
        echo "No schedules found in database.\n";
    }
    
    // Check if schedule ID 15 exists
    $schedule15 = Schedule::find(15);
    if ($schedule15) {
        echo "\nSchedule ID 15 exists: {$schedule15->name}\n";
    } else {
        echo "\nSchedule ID 15 does NOT exist.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>


