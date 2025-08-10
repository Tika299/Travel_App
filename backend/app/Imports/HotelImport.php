<?php
namespace App\Imports;

use App\Models\Hotel;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithBatchInserts;

class HotelImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure, WithBatchInserts
{
    public function model(array $row)
    {
        if (empty(trim($row['name'] ?? ''))) {
            Log::warning('Bỏ qua dòng không có tên khách sạn: ' . json_encode($row));
            return null;
        }

        $imagePaths = $this->handleImages($row['images'] ?? null);

        return new Hotel([
            'name' => $row['name'],
            'description' => $row['description'],
            'address' => $row['address'],
            'images' => $imagePaths,
            'latitude' => $row['latitude'],
            'longitude' => $row['longitude'],
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'],
            'website' => $row['website'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'email' => 'nullable|email',
            'phone' => 'required|string',
            'website' => 'nullable|url',
        ];
    }

    public function onFailure(\Maatwebsite\Excel\Validators\Failure ...$failures)
    {
        foreach ($failures as $failure) {
            Log::error("Lỗi import sheet Hotels, dòng {$failure->row()}: " . json_encode($failure->errors()));
        }
    }

    public function batchSize(): int
    {
        return 100; // Lưu 100 bản ghi mỗi lần
    }

    protected function handleImages($images)
    {
        if (!$images) {
            return null;
        }

        $imagePaths = [];
        $imageUrls = is_array($images) ? $images : explode(',', $images);

        foreach ($imageUrls as $url) {
            $url = trim($url);
            if (!$url) {
                continue;
            }

            // Xử lý URL Google Drive
            if (preg_match('/drive\.google\.com\/file\/d\/(.+?)\/view/', $url, $matches)) {
                $fileId = $matches[1];
                $url = "https://drive.google.com/uc?export=download&id={$fileId}";
            }

            // Xử lý đường dẫn cục bộ
            if (file_exists(public_path($url))) {
                $imageName = time() . '_' . uniqid() . '.' . pathinfo($url, PATHINFO_EXTENSION);
                $destinationPath = 'storage/uploads/hotels/' . $imageName;
                copy(public_path($url), public_path($destinationPath));
                $imagePaths[] = $destinationPath;
            }
            // Xử lý URL trực tuyến
            elseif (filter_var($url, FILTER_VALIDATE_URL)) {
                try {
                    $imageName = time() . '_' . uniqid() . '.jpg';
                    $destinationPath = 'storage/uploads/hotels/' . $imageName;
                    file_put_contents(public_path($destinationPath), file_get_contents($url));
                    $imagePaths[] = $destinationPath;
                } catch (\Exception $e) {
                    Log::error('Lỗi tải hình ảnh từ URL: ' . $e->getMessage());
                }
            }
        }

        return $imagePaths ?: null;
    }
}