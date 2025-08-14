<?php

require_once 'vendor/autoload.php';

// Test Vietnamese encoding middleware directly
echo "=== TEST VIETNAMESE ENCODING MIDDLEWARE ===\n";

// Sample AI response with Vietnamese encoding errors
$testResponse = [
    'success' => true,
    'response' => '?? du lịch Đà Nẵng, bạn có th? thĐm các ĐiĐm Đến như Bà Nà Hills, Ngũ Hành Sơn, bãi biĐn Mỹ Khê, Bãi biÐn Non NưĐc, Chùa Linh Ứng, cầu RĐng, và khu ph? c? HĐi An. Ngoài ra, bạn cũng nên thử các món Đn đặc sản như bún chả cá, bánh xèo, mì Quảng và bún bò Huế. ThĐi gian tĐt nhất ?? du lịch Đà Nẵng là từ tháng 4 Đến tháng 8 ?? tránh mưa và thĐi tiết nắng nóng. ?ừng quên mang theo ?? bơi khi Đến bãi biĐn và chuẩn b? ?? ấm nếu bạn muĐn thĐm Bà Nà Hills vì nơi Đây có khí hậu se lạnh. Chúc bạn có chuyến du lịch thú vị!',
    'suggestions' => [
        'Gợi ý địa điểm du lịch',
        'Thông tin về thời tiết',
        'Tạo lịch trình'
    ]
];

echo "Original response with errors:\n";
echo $testResponse['response'] . "\n\n";

// Simulate middleware processing
$jsonContent = json_encode($testResponse, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// Apply the same fix logic as middleware
$data = json_decode($jsonContent, true);

function fixArrayEncoding($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = fixStringEncoding($value);
            } elseif (is_array($value)) {
                $data[$key] = fixArrayEncoding($value);
            }
        }
    }
    return $data;
}

function fixStringEncoding($string) {
    // Fix encoding issues
    $string = mb_convert_encoding($string, 'UTF-8', 'UTF-8');
    $string = iconv('UTF-8', 'UTF-8//IGNORE', $string);
    
    // Sửa các ký tự tiếng Việt bị lỗi từ AI
    $vietnameseFixes = [
        // Các ký tự Đ bị lỗi
        '?à' => 'Đà', '?á' => 'Đá', '?ả' => 'Đả', '?ã' => 'Đã', '?ạ' => 'Đạ',
        '?è' => 'Đè', '?é' => 'Đé', '?ẻ' => 'Đẻ', '?ẽ' => 'Đẽ', '?ẹ' => 'Đẹ',
        '?ì' => 'Đì', '?í' => 'Đí', '?ỉ' => 'Đỉ', '?ĩ' => 'Đĩ', '?ị' => 'Đị',
        '?ò' => 'Đò', '?ó' => 'Đó', '?ỏ' => 'Đỏ', '?õ' => 'Đõ', '?ọ' => 'Đọ',
        '?ù' => 'Đù', '?ú' => 'Đú', '?ủ' => 'Đủ', '?ũ' => 'Đũ', '?ụ' => 'Đụ',
        '?ỳ' => 'Đỳ', '?ý' => 'Đý', '?ỷ' => 'Đỷ', '?ỹ' => 'Đỹ', '?ỵ' => 'Đỵ',
        '?ầ' => 'Đầ', '?ấ' => 'Đấ', '?ẩ' => 'Đẩ', '?ẫ' => 'Đẫ', '?ậ' => 'Đậ',
        '?ề' => 'Đề', '?ế' => 'Đế', '?ể' => 'Để', '?ễ' => 'Đễ', '?ệ' => 'Đệ',
        '?ồ' => 'Đồ', '?ố' => 'Đố', '?ổ' => 'Đổ', '?ỗ' => 'Đỗ', '?ộ' => 'Độ',
        '?ờ' => 'Đờ', '?ớ' => 'Đớ', '?ở' => 'Đở', '?ỡ' => 'Đỡ', '?ợ' => 'Đợ',
        
        // Các ký tự khác bị lỗi
        '?i' => 'Đi', '?t' => 'Đt', '?n' => 'Đn', '?g' => 'Đg', '?h' => 'Đh', 
        '?p' => 'Đp', '?c' => 'Đc', '?k' => 'Đk', '?l' => 'Đl', '?x' => 'Đx', 
        '?s' => 'Đs', '?r' => 'Đr', '?v' => 'Đv', '?b' => 'Đb', '?m' => 'Đm', 
        '?y' => 'Đy', '?w' => 'Đw', '?f' => 'Đf', '?j' => 'Đj', '?q' => 'Đq', 
        '?z' => 'Đz', '?a' => 'Đa', '?e' => 'Đe', '?o' => 'Đo', '?u' => 'Đu',
        
        // Các từ cụ thể bị lỗi từ hình ảnh
        '?? du lịch' => 'Để du lịch', 'th?' => 'thể', 'thĐm' => 'thăm',
        'ĐiĐm Đến' => 'Điểm đến', 'biĐn' => 'biển', 'NưĐc' => 'Nước',
        'RĐng' => 'Rồng', 'ph?' => 'phố', 'c?' => 'cổ', 'HĐi' => 'Hội',
        'Đn' => 'ăn', 'ThĐi' => 'Thời', 'tĐt' => 'tốt', '?ừng' => 'Đừng',
        '??' => 'đồ', 'chuẩn b?' => 'chuẩn bị', 'muĐn' => 'muốn',
        'Đây' => 'Đây', 'biÐn' => 'biển', 'Đc Đáo' => 'Độc đáo',
        'Đặt vé' => 'đặt vé', 'viĐc' => 'việc', 'HĐi An c?' => 'Hội An cổ',
        'nĐi tiếng' => 'nổi tiếng', 'V? ẩm thực' => 'Về ẩm thực',
        'chĐn' => 'chọn', 'phương tiÐn' => 'phương tiện', 'tàu hĐa' => 'tàu hỏa',
        'Đẹp ? Đà Nẵng' => 'đẹp ở Đà Nẵng', 'ĐiĐm du lịch' => 'Điểm du lịch',
        'Đặc biệt' => 'đặc biệt', 'Để' => 'để', 'Đang' => 'đang',
        'Đó' => 'đó', 'Đã' => 'đã', 'Đủ' => 'đủ', 'Đến' => 'đến',
        'Đây' => 'đây', 'Đền' => 'đền', 'Đường' => 'đường', 'Đất' => 'đất',
        'Địa' => 'địa', 'Đồng' => 'đồng', 'Đặc' => 'đặc', 'Đẹp' => 'đẹp',
        
        // Sửa các từ ghép bị lỗi
        'Điểm du lịch' => 'điểm du lịch', 'Đặc biệt' => 'đặc biệt',
        'Để thưởng thức' => 'để thưởng thức', 'Đang phát triển' => 'đang phát triển',
        'Đó là' => 'đó là', 'Đã có' => 'đã có', 'Đủ tiền' => 'đủ tiền',
        'Đến nơi' => 'đến nơi', 'Đây là' => 'đây là', 'Đền thờ' => 'đền thờ',
        'Đường phố' => 'đường phố', 'Đất nước' => 'đất nước', 'Địa điểm' => 'địa điểm',
        'Đồng tiền' => 'đồng tiền', 'Đặc sản' => 'đặc sản', 'Đẹp mắt' => 'đẹp mắt'
    ];
    
    foreach ($vietnameseFixes as $wrong => $correct) {
        $string = str_replace($wrong, $correct, $string);
    }
    
    return $string;
}

// Apply fixes
$fixedData = fixArrayEncoding($data);
$fixedJson = json_encode($fixedData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

echo "Fixed response:\n";
echo $fixedData['response'] . "\n\n";

// Check for remaining errors
$errors = [];
if (strpos($fixedData['response'], '?') !== false) {
    $errors[] = "Still contains '?' characters";
}
if (strpos($fixedData['response'], 'Đ') !== false) {
    $errors[] = "Still contains 'Đ' characters (should be 'đ')";
}

echo "=== VIETNAMESE ENCODING CHECK ===\n";
if (empty($errors)) {
    echo "✅ No Vietnamese encoding errors found!\n";
} else {
    echo "❌ Vietnamese encoding errors found:\n";
    foreach ($errors as $error) {
        echo "  - " . $error . "\n";
    }
}

echo "\nTest completed!\n";
