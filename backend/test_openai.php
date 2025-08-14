<?php

// Test OpenAI API Key
require_once 'vendor/autoload.php';

// Load environment variables
$envFile = '.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

$apiKey = $_ENV['OPENAI_API_KEY'] ?? null;

echo "=== Test OpenAI API Key ===\n";
echo "API Key exists: " . ($apiKey ? 'YES' : 'NO') . "\n";

if ($apiKey) {
    echo "API Key length: " . strlen($apiKey) . "\n";
    echo "API Key starts with: " . substr($apiKey, 0, 7) . "...\n";
    
    // Test API call
    $url = 'https://api.openai.com/v1/chat/completions';
    $data = [
        'model' => 'gpt-3.5-turbo',
        'messages' => [
            [
                'role' => 'system',
                'content' => 'Bạn là chuyên gia du lịch Việt Nam.'
            ],
            [
                'role' => 'user',
                'content' => 'Xin chào! Hãy trả lời ngắn gọn bằng tiếng Việt.'
            ]
        ],
        'max_tokens' => 50,
        'temperature' => 0.7
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    echo "\n=== API Test Results ===\n";
    echo "HTTP Code: " . $httpCode . "\n";
    
    if ($error) {
        echo "CURL Error: " . $error . "\n";
    } else {
        $result = json_decode($response, true);
        if ($result && isset($result['choices'][0]['message']['content'])) {
            echo "✅ API Test SUCCESS!\n";
            echo "Response: " . $result['choices'][0]['message']['content'] . "\n";
        } else {
            echo "❌ API Test FAILED!\n";
            echo "Response: " . $response . "\n";
        }
    }
} else {
    echo "\n❌ No API Key found in .env file!\n";
    echo "Please add: OPENAI_API_KEY=sk-your-key-here\n";
}

echo "\n=== End Test ===\n";


