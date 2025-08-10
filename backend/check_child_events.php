<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ItineraryEvent;

echo "Checking child events in database...\n\n";

try {
    $childEvents = ItineraryEvent::all(['id', 'schedule_id', 'title', 'type', 'date', 'start_time', 'end_time']);
    
    if ($childEvents->count() > 0) {
        echo "Found " . $childEvents->count() . " child events:\n";
        foreach ($childEvents as $event) {
            echo "ID: {$event->id} - Schedule ID: {$event->schedule_id} - {$event->title}\n";
            echo "Type: {$event->type} - Date: {$event->date} - Time: {$event->start_time} - {$event->end_time}\n";
            echo "---\n";
        }
        
        // Group by schedule_id
        $eventsBySchedule = $childEvents->groupBy('schedule_id');
        echo "\nEvents by schedule:\n";
        foreach ($eventsBySchedule as $scheduleId => $events) {
            echo "Schedule ID {$scheduleId}: {$events->count()} events\n";
        }
    } else {
        echo "No child events found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>


