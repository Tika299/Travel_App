import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCheckinPlaceById } from '../../../services/ui/CheckinPlace/checkinPlaceService';

const CheckinPlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCheckinPlaceById(id)
      .then((res) => {
        setPlace(res.data.data);
      })
      .catch((err) => {
        console.error('❌ Lỗi khi lấy chi tiết địa điểm:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const renderArrayField = (field) => {
    if (!field) return 'Không có';
    let parsed;
    try {
      parsed = typeof field === 'string' ? JSON.parse(field) : field;
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
    } catch {
      return field;
    }
  };

  if (loading) return <div className="p-6">🔄 Đang tải...</div>;
  if (!place) return <div className="p-6 text-red-500">❌ Không tìm thấy địa điểm.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        className="mb-4 text-sm text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image & Gallery */}
        <div className="md:w-1/2">
          <img
            src={`/uploads/${place.image}`}
            alt={place.name}
            className="w-full h-64 object-cover rounded-lg shadow"
          />
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="w-full h-20 bg-gray-200 rounded-md"
              />
            ))}
            <div className="w-full h-20 bg-gray-300 text-center flex items-center justify-center text-sm rounded-md">
              +8 ảnh
            </div>
          </div>
        </div>

        {/* Right Info */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{place.name}</h1>

          <p className="text-gray-600 flex items-center gap-2">
            📍 {place.address}
          </p>

          {/* Check-in Statistics */}
          <div className="bg-pink-50 border border-pink-200 p-4 rounded-md shadow-sm">
            <div className="flex justify-between text-center">
              <div>
                <p className="text-xl font-bold text-pink-600">{place.checkin_count}</p>
                <p className="text-sm text-gray-600">Lượt check-in</p>
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{place.review_count}</p>
                <p className="text-sm text-gray-600">Người ghé thăm</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              📸 Trung bình 4.2 ảnh/người
            </p>
          </div>

          {/* Info */}
          <div className="space-y-1 text-sm text-gray-800">
            <p><strong>💸 Giá vé:</strong> {place.price || 'Miễn phí'}</p>
            <p><strong>🕒 Giờ mở cửa:</strong> {renderArrayField(place.operating_hours)}</p>
            <p><strong>⌛ Thời gian tham quan:</strong> 4-6 giờ</p>
          </div>

          {/* Action */}
          <div className="flex items-center gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Check-in ngay
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100">
              ❤️
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100">
              🔗
            </button>
          </div>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Mô tả chi tiết</h2>
        <p className="text-gray-700 leading-relaxed">{place.description}</p>
      </div>

      {/* Vị trí */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Vị trí & bản đồ</h2>
        <p>🗺️ Vĩ độ / Kinh độ: {place.latitude}, {place.longitude}</p>
        <div className="mt-2 w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
          Bản đồ sẽ được nhúng tại đây
        </div>
      </div>
    </div>
  );
};

export default CheckinPlaceDetail;
