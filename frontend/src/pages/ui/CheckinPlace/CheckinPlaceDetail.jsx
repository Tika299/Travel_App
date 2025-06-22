import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCheckinPlaceById } from '../../../services/ui/CheckinPlace/checkinPlaceService';
import { getSuggestedHotels } from '../../../services/ui/Hotel/hotelService';

const CheckinPlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);

  useEffect(() => {
    getCheckinPlaceById(id)
      .then((res) => {
        const placeData = res.data.data;
        setPlace(placeData);
        if (placeData) {
          setMainImage(placeData.image || (placeData.images?.[0] || ''));
        }
      })
      .catch((err) => console.error('❌ Lỗi khi lấy chi tiết địa điểm:', err));

    getSuggestedHotels()
      .then((res) => setHotels(res.data.data || []))
      .catch((err) => console.error('❌ Lỗi khi lấy khách sạn:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const allImages = useMemo(() => {
    if (!place) return [];
    const images = [];
    if (place.image) images.push(place.image);
    if (Array.isArray(place.images)) images.push(...place.images);
    return [...new Set(images)];
  }, [place]);

  const thumbnailsToShow = useMemo(() => {
    return showAllThumbnails ? allImages : allImages.slice(0, 3);
  }, [showAllThumbnails, allImages]);

  if (loading) return <div className="p-6">🔄 Đang tải...</div>;
  if (!place) return <div className="p-6 text-red-500">❌ Không tìm thấy địa điểm.</div>;

  const formatPrice = (price) => Number(price).toLocaleString() + ' VND';
  const imageBaseUrl = 'http://localhost:8000/storage/';

  const handleThumbnailClick = (imageName) => {
    setMainImage(imageName);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        className="mb-4 text-sm text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Image & Gallery */}
        <div className="md:w-1/2">
          <img
            src={mainImage ? imageBaseUrl + mainImage : '/placeholder.jpg'}
            alt={place.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg border-2 border-blue-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
          <div className="grid grid-cols-4 gap-2 mt-3">
            {thumbnailsToShow.map((img, idx) => (
              <img
                key={idx}
                src={imageBaseUrl + img}
                alt={`ảnh ${idx + 1}`}
                className={`w-full h-20 object-cover rounded cursor-pointer ${
                  mainImage === img
                    ? 'border-2 border-blue-500 shadow-md'
                    : 'border border-gray-300'
                }`}
                onClick={() => handleThumbnailClick(img)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
            ))}
            {!showAllThumbnails && allImages.length > 3 && (
              <div
                className="w-full h-20 bg-gray-300 text-center flex items-center justify-center text-sm rounded cursor-pointer hover:bg-gray-400 transition-colors"
                onClick={() => setShowAllThumbnails(true)}
              >
                +{allImages.length - 3} ảnh khác
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{place.name}</h1>
          <p className="text-gray-600">📍 {place.address}</p>

          <div className="bg-pink-50 border border-pink-200 p-4 rounded shadow-sm">
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
            <p className="mt-2 text-sm text-gray-500 text-center">📸 Trung bình 4.2 ảnh/người</p>
          </div>

          <div className="space-y-1 text-sm text-gray-800">
            <div className="flex justify-between">
              <span><strong>💸 Giá vé:</strong></span>
              <span>{place.is_free ? 'Miễn phí' : formatPrice(place.price)}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>🕒 Giờ mở cửa:</strong></span>
              <span>{Array.isArray(place.operating_hours) && place.operating_hours.length > 0
                ? `${place.operating_hours[0].open} - ${place.operating_hours[0].close}`
                : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span><strong>⌛ Thời gian tham quan:</strong></span>
              <span>4-6 giờ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Check-in ngay
            </button>
            <button className="w-10 h-10 rounded-full border hover:bg-gray-100 flex items-center justify-center text-red-500 text-xl">
              ❤️
            </button>
            <button className="w-10 h-10 rounded-full border hover:bg-gray-100 flex items-center justify-center text-gray-600 text-xl">
              🔗
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Mô tả chi tiết</h2>
        <p className="text-gray-700 leading-relaxed">{place.description}</p>
      </div>

      {/* Map & Location */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Vị trí & bản đồ</h2>
        <p>📍 Tọa độ: {place.latitude}, {place.longitude}</p>
        <div className="my-4 w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
          Bản đồ sẽ được nhúng tại đây
        </div>

        <div className="flex gap-4 text-sm text-gray-600">
          {Array.isArray(place.transport_options) && place.transport_options.includes('car') && <p>🚗 45 phút từ trung tâm</p>}
          {Array.isArray(place.transport_options) && place.transport_options.includes('bus') && <p>🚌 Tuyến 12 từ Đà Nẵng</p>}
          {Array.isArray(place.transport_options) && place.transport_options.includes('bike') && <p>🏍️ 35 phút, dễ đi</p>}
        </div>
      </div>

      {/* Suggested Hotels */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Khách sạn đề xuất</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {hotels.slice(0, 3).map((hotel) => (
            <div key={hotel.id} className="bg-white rounded shadow overflow-hidden">
              <img
                src={hotel.image ? imageBaseUrl + hotel.image : '/placeholder.jpg'}
                alt={hotel.name}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
              <div className="p-3">
                <h3 className="text-lg font-semibold text-pink-600">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.address}</p>
                <p className="text-sm text-blue-600">{formatPrice(hotel.price || 1000000)} / đêm</p>
                <p className="text-yellow-500">⭐ {hotel.rating || '4.5'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CheckinPlaceDetail;
