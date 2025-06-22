import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCheckinPlaces,
  deleteCheckinPlace,
} from '../../../services/ui/CheckinPlace/checkinPlaceService';

const CheckinPlaceList = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const res = await getAllCheckinPlaces();
      const allPlaces = res.data.data || [];

      // Ghi log kiểm tra trạng thái thực tế từ API
      console.log('📦 Dữ liệu trả về từ API:', allPlaces.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })));

      setPlaces(allPlaces);
    } catch (err) {
      console.error('❌ Lỗi khi tải danh sách địa điểm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá địa điểm này không?')) {
      try {
        await deleteCheckinPlace(id);
        alert('✅ Đã xoá thành công');
        loadPlaces();
      } catch (err) {
        alert('❌ Xoá thất bại');
        console.error(err);
      }
    }
  };

  const renderTransportOptions = (options) => {
    let list = [];

    if (Array.isArray(options)) {
      list = options;
    } else if (typeof options === 'string') {
      try {
        list = JSON.parse(options);
      } catch {
        list = options.split(',');
      }
    }

    return (
      <ul className="list-disc list-inside ml-4 mt-1">
        {list.map((option, index) => (
          <li key={index}>{option.trim()}</li>
        ))}
      </ul>
    );
  };

  const getRegionColor = (region) => {
    switch (region) {
      case 'Bắc':
        return 'text-blue-600';
      case 'Trung':
        return 'text-yellow-600';
      case 'Nam':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-red-600';
      case 'draft':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'inactive':
        return 'Ngừng hoạt động';
      case 'draft':
        return 'Bản nháp';
      default:
        return 'Không rõ';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📍 Danh sách địa điểm check-in</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          onClick={() => navigate('/admin/checkin-places/create')}
        >
          ➕ Thêm mới
        </button>
      </div>

      {loading ? (
        <p>🔄 Đang tải dữ liệu...</p>
      ) : places.length === 0 ? (
        <p>⚠️ Không có địa điểm nào.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {places.map((place) => (
            <div key={place.id} className="p-4 border rounded shadow bg-white flex flex-col">
              <div>
                <h3 className="text-lg font-bold mb-2">{place.name}</h3>

    {place.image ? (
  <img
    src={`http://localhost:8000/storage/${place.image}`}
    alt={place.name}
    className="w-full h-40 object-cover rounded mb-2"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = '/placeholder.jpg';
    }}
  />

                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
                    Không có ảnh
                  </div>
                )}

                

                <p className="text-gray-700 mb-2">
                  {place.description || 'Không có mô tả.'}
                </p>

                <div className="text-sm space-y-1">
                  <p><strong>📍 Địa chỉ:</strong> {place.address || 'Không rõ'}</p>
                  <p>
                    <strong>📌 Miền:</strong>{' '}
                    <span className={getRegionColor(place.region)}>
                      {place.region || 'Không rõ'}
                    </span>
                  </p>
                  <p><strong>⭐ Đánh giá:</strong> {place.rating}</p>
                  <p><strong>✅ Lượt check-in:</strong> {place.checkin_count}</p>
                  <p><strong>🗣️ Lượt đánh giá:</strong> {place.review_count}</p>
                  <p>
                    <strong>📶 Trạng thái:</strong>{' '}
                    <span className={getStatusColor(place.status)}>
                      {getStatusLabel(place.status)}
                    </span>
                  </p>
                  <p><strong>📏 Khoảng cách:</strong> {place.distance ? `${place.distance} km` : 'Không rõ'}</p>
                  <p><strong>💸 Giá vé:</strong> {place.is_free ? 'Miễn phí' : (place.price ? `${place.price} đ` : 'Không rõ')}</p>

                  {place.transport_options && (
                    <div className="mt-2">
                      <strong>🚌 Phương tiện:</strong>
                      {renderTransportOptions(place.transport_options)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => navigate(`/admin/checkin-places/edit/${place.id}`)}
                >
                  ✏️ Sửa
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDelete(place.id)}
                >
                  🗑️ Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckinPlaceList;
