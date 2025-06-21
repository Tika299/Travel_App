import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCheckinPlaces } from "../../../services/ui/CheckinPlace/checkinPlaceService";
import { getSuggestedHotels } from "../../../services/ui/Hotel/hotelService";
import { getSuggestedDishes } from "../../../services/ui/Dish/dishService";
import { getSuggestedRestaurant } from "../../../services/ui/Restaurant/restaurantService";
import { getSuggestedTransportation } from "../../../services/ui/Transportation/transportationService";

const CheckinPlacePage = () => {
  const [places, setPlaces] = useState([]);
  const [suggestedHotels, setSuggestedHotels] = useState([]);
  const [suggestedDishes, setSuggestedDishes] = useState([]);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState([]);
  const [suggestedTransportations, setSuggestedTransportations] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAllCheckinPlaces();
      const allPlaces = res.data?.data || [];
      setPlaces(allPlaces.filter((p) => p.status === "active"));

      const hotelRes = await getSuggestedHotels();
      setSuggestedHotels(hotelRes.data?.data || []);

      const dishRes = await getSuggestedDishes();
      setSuggestedDishes(dishRes.data?.data || []);

      const restaurantRes = await getSuggestedRestaurant();
      setSuggestedRestaurants(restaurantRes.data?.data || []);
          const transportationRes = await getSuggestedTransportation();
    setSuggestedTransportations(transportationRes.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseArray = (data) => {
    if (!data) return [];
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return data.split(",");
    }
  };

  const renderOperatingHours = (hours) => {
    const data = parseArray(hours);
    const first = Array.isArray(data) ? data[0] : data;
    return (
      <div className="ml-2">
        <div>Mở: {first?.open || "—"}</div>
        <div>Đóng: {first?.close || "—"}</div>
      </div>
    );
  };

  const renderTransport = (options) => {
    const data = parseArray(options);
    if (!Array.isArray(data) || data.length === 0) return <span>Không có</span>;
    return (
      <ul className="list-disc list-inside">
        {data.map((opt, i) => (
          <li key={i}>{opt.trim()}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* === ĐỊA ĐIỂM CHECK-IN === */}
      <h2 className="text-2xl font-bold text-pink-600 mb-4">
        📍 Địa điểm phổ biến
      </h2>
      {loading ? (
        <p>Đang tải địa điểm...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => (
            <div
              key={place.id}
              className="border rounded p-4 bg-white shadow hover:shadow-md transition"
            >
              <Link to={`/checkin-places/${place.id}`}>
                {place.image ? (
                  <img
                    src={`/uploads/${place.image}`}
                    alt={place.name}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-2 text-gray-500">
                    Không có ảnh
                  </div>
                )}
                <h3 className="text-lg font-semibold text-pink-600">
                  {place.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {place.description || "Không có mô tả"}
                </p>
              </Link>
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  📍 <strong>Địa chỉ:</strong> {place.address || "—"}
                </p>
                <p>
                  🗺 <strong>Miền:</strong> {place.region || "—"}
                </p>
                <p>
                  ⭐ <strong>Đánh giá:</strong> {place.rating || "0"}/5
                </p>
                <p>
                  💸 <strong>Giá vé:</strong> {place.price || "Miễn phí"}
                </p>
                <p>
                  📏 <strong>Khoảng cách:</strong> {place.distance || "—"} km
                </p>
              </div>
              <div className="mt-2">
                <strong>🕐 Giờ hoạt động:</strong>
                {renderOperatingHours(place.operating_hours)}
              </div>
              <div className="mt-2">
                <strong>🚗 Phương tiện:</strong>
                {renderTransport(place.transport_options)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === KHÁCH SẠN ĐỀ XUẤT === */}
      <h2 className="text-2xl font-bold text-pink-600 mt-10 mb-4">
        🏨 Khách sạn đề xuất
      </h2>
      {loading ? (
        <p>Đang tải khách sạn...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedHotels.map((hotel, index) => (
            <div
              key={index}
              className="border rounded p-3 bg-white shadow hover:shadow-md transition"
            >
              {hotel.image ? (
                <img
                  src={`/uploads/${hotel.image}`}
                  alt={hotel.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
                  Không có ảnh
                </div>
              )}
              <h3 className="text-base font-semibold text-pink-600">
                {hotel.name}
              </h3>
              <p className="text-sm text-gray-600">{hotel.address || "—"}</p>
              <p className="text-sm text-yellow-600">
                ⭐ {hotel.rating || "4.5"} / 5
              </p>
              <p className="text-sm text-pink-500">
                {hotel.price || "—"} đ/đêm
              </p>
            </div>
          ))}
        </div>
      )}

      {/* === MÓN ĂN ĐẶC SẢN === */}
      <h2 className="text-2xl font-bold text-pink-600 mt-10 mb-4">
        🍽 Đặc sản nổi bật
      </h2>
      {loading ? (
        <p>Đang tải món ăn...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedDishes.map((dish, index) => (
            <div
              key={index}
              className="border rounded p-3 bg-white shadow hover:shadow-md transition"
            >
              <img
                src={`/uploads/${dish.image || "default-dish.jpg"}`}
                alt={dish.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-base font-semibold">{dish.name}</h3>
              <p className="text-sm text-gray-600">{dish.description}</p>
              <p className="text-sm text-yellow-500">
                ⭐ {dish.restaurant?.name || "Không rõ"}
              </p>
              <p className="text-sm text-pink-500">{dish.price}đ</p>
            </div>
          ))}
        </div>
      )}
{/* === Xe đề xuất === */}
<h2 className="text-2xl font-bold text-pink-600 mt-10 mb-4">🚌 Xe đề xuất</h2>
{loading ? (
  <p>Đang tải xe...</p>
) : (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {suggestedTransportations.map((vehicle, index) => (
      <div
        key={index}
        className="border rounded p-3 bg-white shadow hover:shadow-md transition"
      >
        <h3 className="text-base font-semibold text-pink-600">
          {vehicle.name}
        </h3>
 <p className="text-sm text-pink-500"> {vehicle.average_price} VND</p>
        
        <p></p>
      </div>
    ))}
  </div>
)}


      {/* === NHÀ HÀNG ĐỀ XUẤT === */}
      <h2 className="text-2xl font-bold text-pink-600 mt-10 mb-4">
        🍴 Nhà hàng nổi bật
      </h2>
      {loading ? (
        <p>Đang tải nhà hàng...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suggestedRestaurants.map((res, index) => (
            <div
              key={index}
              className="border rounded p-3 bg-white shadow hover:shadow-md transition"
            >
              <h3 className="text-base font-semibold text-pink-600">
                {res.name}
              </h3>
              <p className="text-sm text-gray-600">{res.description}</p>
              <p className="text-sm text-gray-500">📍 {res.address}</p>
              <p className="text-sm text-yellow-500">
                ⭐ {res.rating || "—"} / 5
              </p>
              <p className="text-sm text-pink-500">💸 {res.price_range}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckinPlacePage;
