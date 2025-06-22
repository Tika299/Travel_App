import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCheckinPlaces,
  deleteCheckinPlace,
} from '../../../services/ui/CheckinPlace/checkinPlaceService';

const CheckinPlaceList = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // State cho trang hiện tại
  const itemsPerPage = 6; // Số lượng mục trên mỗi trang
  const navigate = useNavigate();

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const res = await getAllCheckinPlaces();
      const allPlaces = res.data.data || [];

      console.log('📦 Dữ liệu trả về từ API:', allPlaces.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })));

      setPlaces(allPlaces);
    } catch (err) {
      console.error('❌ Lỗi khi tải danh sách địa điểm:', err);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa điểm này không? Hành động này không thể hoàn tác!')) {
      try {
        await deleteCheckinPlace(id);
        alert('✅ Đã xóa thành công!');
        loadPlaces(); // Tải lại danh sách sau khi xóa
      } catch (err) {
        alert('❌ Xóa thất bại. Vui lòng thử lại sau.');
        console.error('Lỗi khi xóa địa điểm:', err);
      }
    }
  };

  const renderTransportOptions = (options) => {
    let list = [];
    if (typeof options === 'string') {
      try {
        list = JSON.parse(options);
      } catch {
        // Fallback if JSON parsing fails: split by comma and trim
        list = options.split(',').map(item => item.trim());
      }
    } else if (Array.isArray(options)) {
      list = options;
    }

    if (list.length === 0) {
      return <span className="italic text-gray-500">Không có.</span>;
    }

    return (
      <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
        {list.map((option, index) => (
          <li key={index}>{option}</li>
        ))}
      </ul>
    );
  };

  const getRegionColor = (region) => {
    switch (region) {
      case 'Bắc': return 'text-blue-600 font-semibold';
      case 'Trung': return 'text-yellow-600 font-semibold';
      case 'Nam': return 'text-red-600 font-semibold';
      default: return 'text-gray-500 italic';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 font-medium';
      case 'inactive': return 'text-red-600 font-medium';
      case 'draft': return 'text-orange-500 font-medium';
      default: return 'text-gray-400 italic';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'inactive': return 'Ngừng hoạt động';
      case 'draft': return 'Bản nháp';
      default: return 'Không rõ';
    }
  };

  // Lọc danh sách địa điểm dựa trên từ khóa tìm kiếm
  const filteredPlaces = useMemo(() => {
    return places.filter(place =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [places, searchTerm]);

  // Tính toán các mục sẽ hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlaces.slice(indexOfFirstItem, indexOfLastItem);

  // Tính toán tổng số trang
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);

  // Xử lý chuyển đổi trang
  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return; // Ngăn chặn nhảy trang không hợp lệ
    setCurrentPage(pageNumber);
  };

  // Tạo mảng các số trang để render nút
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-4 md:mb-0">
          📍 Danh sách địa điểm check-in
        </h2>
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên địa điểm..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 flex-grow"
          />
          <button
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-lg hover:from-green-600 hover:to-green-700 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => navigate('/admin/checkin-places/create')}
          >
            ➕ Thêm mới
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-lg text-gray-600 py-10">🔄 Đang tải dữ liệu, vui lòng chờ...</p>
      ) : filteredPlaces.length === 0 ? (
        <p className="text-center text-lg text-gray-600 py-10">⚠️ Không tìm thấy địa điểm nào phù hợp.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((place) => (
              <div key={place.id} className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col transition-transform duration-300 ease-in-out hover:scale-[1.02]">
                {place.image ? (
                  <img
                    src={`http://localhost:8000/storage/${place.image}`}
                    alt={place.name}
                    className="w-full h-48 object-cover object-center"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; // Placeholder if image fails
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-medium">
                    Không có ảnh
                  </div>
                )}

                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{place.name}</h3>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    {place.description || 'Chưa có mô tả chi tiết cho địa điểm này.'}
                  </p>

                  <div className="text-sm space-y-1 text-gray-800 flex-grow">
                    <p><strong>📍 Địa chỉ:</strong> <span className="text-gray-600">{place.address || 'Đang cập nhật'}</span></p>
                    <p>
                      <strong>📌 Miền:</strong>{' '}
                      <span className={getRegionColor(place.region)}>
                        {place.region || 'Chưa xác định'}
                      </span>
                    </p>
                    <p><strong>⭐ Đánh giá:</strong> <span className="text-blue-700 font-semibold">{place.rating || 'N/A'}</span></p>
                    <p><strong>✅ Lượt check-in:</strong> <span className="text-indigo-700 font-semibold">{place.checkin_count || 0}</span></p>
                    <p><strong>🗣️ Lượt đánh giá:</strong> <span className="text-purple-700 font-semibold">{place.review_count || 0}</span></p>
                    <p>
                      <strong>📶 Trạng thái:</strong>{' '}
                      <span className={getStatusColor(place.status)}>
                        {getStatusLabel(place.status)}
                      </span>
                    </p>
                    <p><strong>📏 Khoảng cách:</strong> <span className="text-gray-600">{place.distance ? `${place.distance} km` : 'Không rõ'}</span></p>
                    <p><strong>💸 Giá vé:</strong> <span className="text-green-700 font-semibold">{place.is_free ? 'Miễn phí' : (place.price ? `${place.price} đ` : 'Có phí')}</span></p>

                    <div className="mt-2">
                      <strong>🚌 Phương tiện:</strong>
                      {renderTransportOptions(place.transport_options)}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition duration-200 ease-in-out text-sm"
                      onClick={() => navigate(`/admin/checkin-places/edit/${place.id}`)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition duration-200 ease-in-out text-sm"
                      onClick={() => handleDelete(place.id)}
                    >
                      🗑️ Xoá
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Trang trước
              </button>
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 rounded-md transition duration-200 ${
                    currentPage === number
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Trang sau
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default CheckinPlaceList;