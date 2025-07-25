import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { favouriteService } from "../../../services/ui/favouriteService";
import { FaStar, FaMapMarkerAlt, FaPhone, FaWheelchair, FaBed, FaWifi, FaSwimmer, FaUtensils } from "react-icons/fa";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";

function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [favouritesLoaded, setFavouritesLoaded] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/hotels/${id}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Khách sạn không tồn tại");
        }

        try {
          // Fetch favorites riêng biệt
          let favData = [];
          if (localStorage.getItem('token')) {
            const favResponse = await favouriteService.getFavourites();
            favData = favResponse.data || favResponse;
          }

          setFavourites(favData);
          setFavouritesLoaded(true);

        } catch (err) {
          console.error('Error fetching favourites:', err);
        }

        setHotel(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError(error.message || "Lỗi khi tải thông tin khách sạn");
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id]);

  
  const isFavourited = favourites.some(fav =>
    fav.favouritable_id === destination.id
    &&
    fav.favouritable_type === 'App\\Models\\Hotels'
  );

  const toggleFavourite = async (item, type) => {
    try {
      const existing = favourites.find(fav =>
        fav.favouritable_id === item.id &&
        fav.favouritable_type === type
      );

      if (existing) {
        await favouriteService.deleteFavourite(existing.id);
        setFavourites(prev => prev.filter(fav => fav.id !== existing.id));
      } else {
        const response = await favouriteService.addFavourite(item.id, type);

        // Kiểm tra cấu trúc response
        const newFavourite = response.favourite || response.data;
        setFavourites(prev => [...prev, newFavourite]);
      }
    } catch (err) {
      console.error('Toggle favourite error:', err);
      setError('Failed to update favorite');
    }
  };

  if (loading) return <p className="text-center text-gray-500 py-10">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!hotel) return <p className="text-center text-gray-500 py-10">Không tìm thấy khách sạn</p>;

  const roomImage = hotel.rooms && hotel.rooms[0] && hotel.rooms[0].images
    ? JSON.parse(hotel.rooms[0].images)[0]
    : hotel.hotel.image || "/public/img/default-hotel.jpg";
  const price = hotel.rooms && hotel.rooms[0]
    ? Number(hotel.rooms[0].price_per_night).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VNĐ"
    : "N/A";

  const amenities = [
    { icon: FaBed, label: "Phòng ngủ" },
    { icon: FaWifi, label: "Wi-Fi miễn phí" },
    { icon: FaSwimmer, label: "Hồ bơi" },
    { icon: FaUtensils, label: "Nhà hàng" },
  ];

  // Chuyển đổi amenities từ phòng thành mảng
  const roomAmenities = hotel.rooms && hotel.rooms[0] && hotel.rooms[0].amenities
    ? JSON.parse(hotel.rooms[0].amenities)
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4 py-10">
        {/* Hình ảnh và thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <img
            src={roomImage}
            alt={hotel.hotel.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{hotel.hotel.name}</h1>
                <div className="flex items-center text-yellow-500 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < Math.round(hotel.hotel.rating || 0) ? "filled" : ""}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">({hotel.hotel.review_count || 0} đánh giá)</span>
                </div>
                <p className="flex items-center text-gray-600 mt-2">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  {hotel.hotel.address}
                </p>
                <p className="flex items-center text-gray-600 mt-1">
                  <FaPhone className="mr-2 text-blue-500" />
                  {hotel.hotel.contact_info}
                </p>
                {hotel.hotel.wheelchair_access && (
                  <p className="flex items-center text-green-600 mt-1">
                    <FaWheelchair className="mr-2" />
                    Hỗ trợ xe lăn
                  </p>
                )}
              </div>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await toggleFavourite(hotel, 'App\\Models\\Hotels');
                }}
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                {isFavourited ? (
                  <IoMdHeart className="h-6 w-6 text-red-600" />
                ) : (
                  <IoMdHeartEmpty className="h-6 w-6" />
                )}
              </button>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-3">{hotel.hotel.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-blue-600">{price}/đêm</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                Đặt ngay
              </button>
            </div>
          </div>
        </div>

        {/* Danh sách phòng */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Phòng có sẵn</h2>
          {hotel.rooms.length > 0 ? (
            <div className="space-y-4">
              {hotel.rooms.map((room) => {
                const roomPrice = Number(room.price_per_night)
                  .toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VNĐ";
                const roomImages = JSON.parse(room.images);
                return (
                  <div key={room.id} className="flex flex-col md:flex-row items-center justify-between p-4 border rounded-lg">
                    <img
                      src={roomImages[0]}
                      alt={room.room_type}
                      className="w-32 h-24 object-cover rounded-lg mr-4 mb-4 md:mb-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{room.room_type}</h3>
                      <p className="text-gray-600 mb-2">{room.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {JSON.parse(room.amenities).map((amenity, index) => (
                          <span key={index} className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <p className="text-blue-600 font-semibold">{roomPrice}/đêm</p>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4 md:mt-0">
                      Chọn phòng
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Không có phòng nào hiện có.</p>
          )}
        </div>

        {/* Tiện nghi của khách sạn */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Tiện nghi của khách sạn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center text-gray-600">
                <amenity.icon className="mr-2 text-blue-500" />
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Đánh giá */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Đánh giá</h2>
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-500 mr-2">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.round(hotel.hotel.rating || 0) ? "filled" : ""}
                />
              ))}
            </div>
            <span className="text-gray-600">{hotel.hotel.rating || 0}/5</span>
          </div>
          <p className="text-gray-700">Dựa trên {hotel.hotel.review_count || 0} đánh giá</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HotelDetailPage;