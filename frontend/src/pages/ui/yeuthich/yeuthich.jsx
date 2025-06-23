import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCheckinPlaces } from '../../../services/ui/CheckinPlace/checkinPlaceService'; // Đảm bảo đường dẫn đúng

const FavoritePlaceCard = ({ item }) => {
  const linkPath = item.id ? `/checkin-places/${item.id}` : "#";

  return (
    <Link to={linkPath} key={item.id} className="block h-full">
      <div className="relative border rounded-lg bg-white shadow hover:shadow-lg transition duration-200 h-full flex flex-col">
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          {item.image ? (
            <img
              src={`http://localhost:8000/storage/${item.image}`}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/path/to/placeholder-image.jpg"; // Fallback image
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              Không có ảnh
            </div>
          )}
        </div>

        <div className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-gray-800 text-lg line-clamp-2 pr-2">
                {item.name || "Không có tên"}
              </h3>
              <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap flex-shrink-0">
                <span className="mr-1">⭐</span>
                {(parseFloat(item.rating) || 0).toFixed(1)}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {item.address || "Không có địa chỉ"}
            </p>
            <p className="text-sm text-gray-500 line-clamp-3 mb-3">
              {item.description || "Không có mô tả"}
            </p>
          </div>

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
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Logic khám phá nếu cần, hoặc bỏ nút này nếu không muốn
              }}
              className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 shadow"
            >
              Khám phá
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

const YeuthichPage = () => {
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritePlaces = async () => {
      setLoading(true);
      try {
        // 1. Lấy danh sách ID yêu thích từ localStorage
        const storedFavorites = localStorage.getItem('favoritePlaceIds');
        const favoriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

        if (favoriteIds.length > 0) {
          // 2. Gọi API để lấy tất cả địa điểm
          const resPlaces = await getAllCheckinPlaces();
          const allPlaces = resPlaces.data?.data || [];

          // 3. Lọc ra các địa điểm có ID nằm trong danh sách yêu thích
          const foundFavoritePlaces = allPlaces.filter(place =>
            favoriteIds.includes(place.id)
          );
          setFavoritePlaces(foundFavoritePlaces);
        } else {
          setFavoritePlaces([]); // Không có địa điểm yêu thích nào
        }
      } catch (error) {
        console.error("Lỗi khi tải địa điểm yêu thích:", error);
        setFavoritePlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePlaces();
  }, []); // Chạy một lần khi component mount

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
            <p className="text-gray-600 text-lg mb-4">
              Bạn chưa có địa điểm yêu thích nào.
            </p>
            <Link
              to="/checkin-places"
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-lg font-semibold shadow-md"
            >
              Khám phá các địa điểm ngay!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoritePlaces.map((place) => (
              <FavoritePlaceCard key={place.id} item={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YeuthichPage;