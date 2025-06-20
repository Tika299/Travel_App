import React, { useEffect, useState } from 'react';
import { getAllCheckinPlaces } from '../../../services/ui/CheckinPlace/checkinPlaceService';

const CheckinPlacePage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCheckinPlaces()
      .then((res) => {
        setPlaces(res.data?.data || []);
      })
      .catch((err) => {
        console.error('Lỗi lấy danh sách địa điểm:', err);
        setPlaces([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const renderTransportOptions = (data) => {
    if (!data) return <span className="text-gray-500">Không có</span>;

    let options = data;
    if (typeof data === 'string') {
      try {
        options = JSON.parse(data);
      } catch {
        options = data.split(',');
      }
    }

    if (!Array.isArray(options)) return <span className="text-gray-500">Không có</span>;

    return (
      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
        {options.map((opt, i) => (
          <li key={i}>{opt.trim()}</li>
        ))}
      </ul>
    );
  };

  const renderOperatingHours = (data) => {
    if (!data) return <span className="text-gray-500 ml-2">Không rõ</span>;

    let hours = data;
    if (typeof data === 'string') {
      try {
        hours = JSON.parse(data);
      } catch {
        return <span className="text-gray-500 ml-2">Không rõ</span>;
      }
    }

    // Nếu là mảng (cũ), lấy ngày bất kỳ để hiển thị open/close
    if (Array.isArray(hours)) {
      const first = hours[0] || {};
      return (
        <div className="text-sm text-gray-700 ml-2">
          <div><strong>Mở:</strong> {first.open || '—'}</div>
          <div><strong>Đóng:</strong> {first.close || '—'}</div>
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-700 ml-2">
        <div><strong>Mở:</strong> {hours.open || '—'}</div>
        <div><strong>Đóng:</strong> {hours.close || '—'}</div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-pink-600">📍 Danh sách địa điểm check-in</h2>

      {loading ? (
        <p className="text-gray-600">🔄 Đang tải dữ liệu...</p>
      ) : places.length === 0 ? (
        <p className="text-gray-600">⚠️ Không có địa điểm nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <div key={place.id} className="border p-4 rounded-lg shadow-sm bg-white">
              {place.image ? (
                <img
                  src={`/uploads/${place.image}`}
                  alt={place.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded text-gray-500 mb-3">
                  Không có ảnh
                </div>
              )}

              <h3 className="text-lg font-semibold text-pink-600">{place.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{place.description || 'Không có mô tả'}</p>

              <div className="text-sm text-gray-700 space-y-1">
                <div><strong>📍 Địa chỉ:</strong> {place.address || 'Không rõ'}</div>
                <div><strong>📌 Miền:</strong> {place.region || 'Không rõ'}</div>
                <div><strong>⭐ Đánh giá:</strong> {place.rating || '0'}/5</div>
                <div><strong>💸 Giá vé:</strong> {place.price || 'Miễn phí'}</div>
                <div><strong>📏 Khoảng cách:</strong> {place.distance || 'Không rõ'} km</div>
              </div>

              <div className="mt-2">
                <strong>🕐 Giờ hoạt động:</strong>
                {renderOperatingHours(place.operating_hours)}
              </div>

              <div className="mt-2">
                <strong>🚗 Phương tiện:</strong>
                {renderTransportOptions(place.transport_options)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckinPlacePage;
