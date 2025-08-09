<?php

namespace App\Imports;

use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\Amenity;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithBatchInserts;

class HotelRoomImport implements ToModel, WithHeadingRow, WithValidation, SkipsEmptyRows, SkipsOnFailure, WithBatchInserts
{
    public function model(array $row)
    {
        if (empty($row['hotel_id'] ?? '')) {
            Log::warning('Bỏ qua dòng không có hotel_id: ' . json_encode($row));
            return null;
        }

        $hotel = Hotel::find($row['hotel_id']);
        if (!$hotel) {
            Log::warning('Không tìm thấy khách sạn với ID: ' . ($row['hotel_id'] ?? 'N/A'));
            return null;
        }

        $imagePaths = $this->handleImages($row['images'] ?? null);

        // Tạo phòng mới
        $room = new HotelRoom([
            'hotel_id' => $hotel->id,
            'room_type' => $row['room_type'],
            'price_per_night' => $row['price_per_night'],
            'description' => $row['description'],
            'room_area' => $row['room_area'],
            'bed_type' => $row['bed_type'],
            'max_occupancy' => $row['max_occupancy'],
            'images' => $imagePaths,
        ]);

        // Xử lý tiện ích
        if (!empty($row['amenities'])) {
            $amenityIds = $this->processAmenities($row['amenities']);
            if (!empty($amenityIds)) {
                // Lưu phòng trước để có ID
                $room->save();
                // Đồng bộ tiện ích với phòng
                $room->amenityList()->sync($amenityIds);
                return null; // Trả về null vì đã lưu thủ công
            }
        }

        return $room;
    }

    public function rules(): array
    {
        return [
            'hotel_id' => 'required|exists:hotels,id',
            'room_type' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'room_area' => 'required|numeric|min:0',
            'bed_type' => 'required|string',
            'max_occupancy' => 'required|integer|min:1',
            'amenities' => 'nullable|string', // Thêm validation cho cột amenities
        ];
    }

    public function onFailure(\Maatwebsite\Excel\Validators\Failure ...$failures)
    {
        foreach ($failures as $failure) {
            Log::error("Lỗi import sheet Hotel_room, dòng {$failure->row()}: " . json_encode($failure->errors()));
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
            // Xử lý URL trực tuyến (thêm giới hạn thời gian)
            elseif (filter_var($url, FILTER_VALIDATE_URL)) {
                try {
                    $context = stream_context_create([
                        'http' => [
                            'timeout' => 5, // Timeout sau 5 giây
                        ],
                    ]);
                    $imageName = time() . '_' . uniqid() . '.jpg';
                    $destinationPath = 'storage/uploads/hotels/' . $imageName;
                    $imageContent = @file_get_contents($url, false, $context);
                    if ($imageContent !== false) {
                        file_put_contents(public_path($destinationPath), $imageContent);
                        $imagePaths[] = $destinationPath;
                    } else {
                        Log::warning("Không thể tải hình ảnh từ URL: $url");
                    }
                } catch (\Exception $e) {
                    Log::error('Lỗi tải hình ảnh từ URL: ' . $url . ' - ' . $e->getMessage());
                }
            }
        }

        return $imagePaths ?: null;
    }

    protected function processAmenities($amenities)
    {
        if (empty($amenities)) {
            return [];
        }

        $amenityIds = [];
        $amenityInputs = is_array($amenities) ? $amenities : explode(',', $amenities);

        foreach ($amenityInputs as $input) {
            $input = trim($input);
            if (empty($input)) {
                continue;
            }

            // Kiểm tra xem input là ID hay tên tiện ích
            if (is_numeric($input)) {
                // Nếu là ID, kiểm tra xem ID có tồn tại trong bảng amenities
                $amenity = Amenity::find($input);
                if ($amenity) {
                    $amenityIds[] = $amenity->id;
                } else {
                    Log::warning("Không tìm thấy tiện ích với ID: $input");
                }
            } else {
                // Nếu là tên, tìm hoặc tạo tiện ích
                $amenity = Amenity::firstOrCreate(
                    ['name' => $input],
                    ['react_icon' => null] // Có thể thêm logic để gán icon mặc định
                );
                $amenityIds[] = $amenity->id;
            }
        }

        return array_unique($amenityIds);
    }
}
