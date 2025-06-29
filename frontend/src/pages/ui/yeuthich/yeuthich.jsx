import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { getAllCheckinPlaces } from "../../../services/ui/CheckinPlace/checkinPlaceService";

/**
 * Card hiển thị một địa điểm yêu thích.
 * @param {Object} props
 * @param {Object} props.item Dữ liệu địa điểm
 * @param {Function} props.onRemoveFavorite Hàm xoá địa điểm khỏi danh sách yêu thích
 */
const FavoritePlaceCard = ({ item, onRemoveFavorite }) => {
  // Thêm kiểm tra an toàn cho 'item' ngay từ đầu
  if (!item) {
    console.error("FavoritePlaceCard nhận được item prop là undefined hoặc null.");
    return null; // Không render gì nếu item không hợp lệ
  }

  const linkPath = item.id ? `/checkin-places/${item.id}` : "#";
  const navigate = useNavigate(); // Khởi tạo useNavigate

  return (
    <Link to={linkPath} className="block h-full">
      <div className="relative border rounded-lg bg-white shadow hover:shadow-lg transition duration-200 h-full flex flex-col">
        {/* Ảnh */}
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          {item.image ? (
            <img
              src={`http://localhost:8000/storage/${item.image}`}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/path/to/placeholder-image.jpg";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              Không có ảnh
            </div>
          )}
        </div>

        {/* Nội dung */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div>
            {/* Tiêu đề + Rating - Đảm bảo tên in đậm và nằm cùng dòng với rating */}
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-gray-800 text-lg line-clamp-2 pr-2 flex-grow">
                {item.name || "Không có tên"}
              </h3>
              <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap flex-shrink-0">
                <span className="mr-1">⭐</span>
                {(parseFloat(item.rating) || 0).toFixed(1)}
              </div>
            </div>

            {/* Địa chỉ */}
            <p className="text-sm text-gray-600 mb-2">
              {item.address || "Không có địa chỉ"}
            </p>
            {/* Mô tả */}
            <p className="text-sm text-gray-500 line-clamp-3 mb-3">
              {item.description || "Không có mô tả"}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-auto">
            {item.specialties_count && (
              <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18px"
                  viewBox="0 0 24 24"
                  width="18px"
                  fill="#4B5563"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zM9 11v-2H7v2H9zm8 0h-2v-2h2v2z" />
                </svg>
                {item.specialties_count} đặc sản
              </span>
            )}

            {/* Nhóm nút */}
            <div className="flex gap-2">
              {/* Nút xoá yêu thích */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn chặn click lan truyền lên Link cha
                  e.preventDefault(); // Ngăn hành vi mặc định của nút
                  onRemoveFavorite(item.id);
                }}
                className="bg-gray-300 text-gray-700 text-sm font-semibold px-3 py-2 rounded-full hover:bg-gray-400 transition-colors duration-300 shadow"
              >
                ❌ Bỏ yêu thích
              </button>

              {/* Nút khám phá (sử dụng useNavigate) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn chặn click lan truyền lên Link cha
                  e.preventDefault(); // Ngăn hành vi mặc định của nút
                  navigate(linkPath); // Điều hướng đến trang chi tiết
                }}
                className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 shadow"
              >
                Khám phá
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

/**
 * Trang danh sách địa điểm yêu thích của người dùng.
 */
const YeuthichPage = () => {
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm xoá địa điểm yêu thích
  const handleRemoveFavorite = (idToRemove) => {
    const storedFavorites = localStorage.getItem("favoritePlaceIds");
    const favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

    const updatedIds = favoriteIds.filter((id) => id !== idToRemove);
    localStorage.setItem("favoritePlaceIds", JSON.stringify(updatedIds));

    // Cập nhật UI ngay lập tức
    setFavoritePlaces((prev) => prev.filter((place) => place.id !== idToRemove));
  };

  // Lấy danh sách địa điểm yêu thích khi component mount
  useEffect(() => {
    const fetchFavoritePlaces = async () => {
      setLoading(true);
      try {
        const storedFavorites = localStorage.getItem("favoritePlaceIds");
        const favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

        if (favoriteIds.length > 0) {
          const resPlaces = await getAllCheckinPlaces();
          const allPlaces = resPlaces.data?.data || [];

          // Lọc địa điểm yêu thích, đảm bảo 'place' và 'place.id' tồn tại
          const foundFavoritePlaces = allPlaces.filter((place) => {
            if (!place || !place.id) {
              console.warn("Tìm thấy địa điểm không hợp lệ (thiếu id) trong dữ liệu:", place);
              return false; // Bỏ qua các địa điểm không hợp lệ
            }
            return favoriteIds.includes(place.id);
          });
          setFavoritePlaces(foundFavoritePlaces);
         
        } else {
          setFavoritePlaces([]);
          
        }
      } catch (error) {
        console.error("Lỗi khi tải địa điểm yêu thích:", error);
        setFavoritePlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePlaces();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen font-sans p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
          Địa điểm yêu thích của bạn ❤️
        </h1>

        {loading ? (
          <p className="text-center text-gray-600 text-lg">Đang tải địa điểm yêu thích...</p>
        ) : favoritePlaces.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg mb-4">Bạn chưa có địa điểm yêu thích nào.</p>
            <Link
              to="/checkin-places"
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-lg font-semibold shadow-md"
            >
              Khám phá các địa điểm ngay!
            </Link>
          </div>
        ) : (
          // Container lưới cho các thẻ địa điểm yêu thích
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoritePlaces.map((place) => (
              <FavoritePlaceCard key={place.id} item={place} onRemoveFavorite={handleRemoveFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YeuthichPage;