import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import {
  getCheckinPlaceById,
  submitCheckin,
} from '../../../services/ui/CheckinPlace/checkinPlaceService';
import { getSuggestedHotels } from '../../../services/ui/Hotel/hotelService';

Modal.setAppElement('#root');

// Component for Star Rating display
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
      {halfStar && (
        <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="url(#half)" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
};


const CheckinPlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkinImage, setCheckinImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false); // State for showing all reviews

  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return '/placeholder.jpg';
    if (imgPath.startsWith('/storage')) return `http://localhost:8000${imgPath}`;
    return `http://localhost:8000/storage/${imgPath.replace(/^\/+/, '')}`;
  };

  const loadPlaceData = () => {
    getCheckinPlaceById(id)
      .then((res) => {
        const data = res.data.data;

        let parsedImages = [];
        try {
          parsedImages = JSON.parse(data.images || '[]');
        } catch {
          parsedImages = [];
        }

        // Mock review data for demonstration if not coming from API
        // Nếu API của bạn chưa trả về dữ liệu đánh giá, đoạn này sẽ tạo dữ liệu giả lập.
        // Bạn có thể xóa đoạn này khi API đã trả về đầy đủ.
        if (!data.reviews) {
          data.rating = 4.8;
          data.review_count = 2347;
          data.rating_breakdown = {
            5: 0.78,
            4: 0.15,
            3: 0.05,
            2: 0.01,
            1: 0.01,
          };
          data.reviews = [
            {
              id: 1,
              user_name: 'Nguyễn Minh Anh',
              time_ago: '2 ngày trước',
              rating: 5,
              comment: 'Cảnh tượng thực sự là một kiệt tác kiến trúc! Cảnh quan từ trên xuống rất hùng vĩ và ấn tượng. Đồi bàn tay khổng lồ tạo nên điểm nhấn độc đáo. Tuy nhiên, vào cuối tuần khá đông khách nên cần có thời gian chờ đợi để chụp ảnh.',
              likes: 23,
              avatar: 'https://via.placeholder.com/40/FF5733/FFFFFF?text=NA' // Example avatar
            },
            {
              id: 2,
              user_name: 'Nguyễn Kim Anh',
              time_ago: '5 ngày trước',
              rating: 4,
              comment: 'Địa điểm tuyệt vời để check-in và chụp ảnh! Cáp treo lên Ba Na Hills cũng rất thú vị. Giá vé hơi cao nhưng xứng đáng với trải nghiệm. Nên đi vào buổi sáng sớm để tránh đông người và thời tiết mát mẻ hơn.',
              likes: 39,
              avatar: 'https://via.placeholder.com/40/3366FF/FFFFFF?text=KA' // Example avatar
            },
            {
              id: 3,
              user_name: 'Trần Văn B',
              time_ago: '1 tuần trước',
              rating: 5,
              comment: 'Tuyệt vời ông mặt trời! Cảnh đẹp mê hồn, nhất định phải quay lại lần nữa.',
              likes: 15,
              avatar: 'https://via.placeholder.com/40/33FF57/FFFFFF?text=TB'
            },
            {
              id: 4,
              user_name: 'Lê Thị C',
              time_ago: '2 tuần trước',
              rating: 3,
              comment: 'Khá đông, nhưng bù lại cảnh đẹp và có nhiều chỗ ăn uống.',
              likes: 8,
              avatar: 'https://via.placeholder.com/40/FFFF33/000000?text=LC'
            }
          ];
        }


        const checkinPhotos = (data.checkinPhotos || []).map(p => p.image);

        data.images = parsedImages;
        data.checkinPhotos = checkinPhotos; // Ensure it's an array of image strings

        setPlace(data);
        setMainImage(data.image || parsedImages[0] || checkinPhotos[0] || '');
      })
      .catch((err) => console.error('❌ Lỗi khi lấy chi tiết địa điểm:', err))
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    loadPlaceData();
    getSuggestedHotels()
      .then((res) => setHotels(res.data.data || []))
      .catch((err) => console.error('❌ Lỗi khi lấy khách sạn:', err));
  }, [id]);

  const allImages = useMemo(() => {
    if (!place) return [];
    const images = [];

    if (place.image) images.push(place.image);
    if (Array.isArray(place.images)) images.push(...place.images);
    if (Array.isArray(place.checkin_photos)) {
      images.push(...place.checkin_photos.map((p) => p.image));
    }

    return [...new Set(images)];
  }, [place]);


  const thumbnailsToShow = useMemo(() => {
    return showAllThumbnails ? allImages : allImages.slice(0, 3);
  }, [showAllThumbnails, allImages]);

  // Sửa lỗi: Thêm kiểm tra null/undefined cho `place` và `place.reviews`
  const reviewsToDisplay = useMemo(() => {
    if (!place || !Array.isArray(place.reviews)) {
      return [];
    }
    return showAllReviews ? place.reviews : place.reviews.slice(0, 2); // Hiển thị 2 đánh giá đầu tiên ban đầu
  }, [showAllReviews, place]);


  const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + ' VND';

  const handleCheckinSubmit = async () => {
    if (!checkinImage) return;

    const formData = new FormData();
    formData.append('image', checkinImage);
    formData.append('checkin_place_id', id);

    setSubmitting(true);
    try {
      await submitCheckin(formData);
      alert('✅ Check-in thành công!');
      setIsModalOpen(false);
      setCheckinImage(null);
      loadPlaceData();
    } catch (err) {
      console.error('❌ Lỗi khi gửi check-in:', err);
      alert('Đã xảy ra lỗi khi check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">🔄 Đang tải...</div>;
  if (!place) return <div className="p-6 text-red-500">❌ Không tìm thấy địa điểm.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-500 hover:underline mb-4"
      >
        ← Quay lại
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <img
            src={getFullImageUrl(mainImage)}
            alt={place.name}
            className="w-full h-96 object-cover rounded shadow border-2 border-blue-400"
          />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {thumbnailsToShow.map((img, idx) => (
              <img
                key={idx}
                src={getFullImageUrl(img)}
                className={`h-20 w-full object-cover rounded cursor-pointer ${
                  mainImage === img ? 'border-2 border-blue-500' : 'border'
                }`}
                onClick={() => {
                  setPreviewImage(img);
                  setIsPreviewOpen(true);
                }}
              />
            ))}
            {!showAllThumbnails && allImages.length > 3 && (
              <div
                onClick={() => setShowAllThumbnails(true)}
                className="h-20 flex items-center justify-center bg-gray-200 rounded cursor-pointer"
              >
                +{allImages.length - 3} ảnh
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold">{place.name}</h1>
          <p className="text-gray-600">📍 {place.address}</p>

          <div className="bg-pink-100 border border-pink-300 rounded p-4 shadow">
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-xl font-bold text-pink-600">{place.checkin_count}</p>
                <p className="text-sm">Lượt check-in</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">{place.review_count}</p>
                <p className="text-sm">Người ghé thăm</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-800">
            <div className="flex justify-between">
              <span>💸 Giá vé:</span>
              <span>{place.is_free ? 'Miễn phí' : formatPrice(place.price)}</span>
            </div>
            <div className="flex justify-between">
              <span>🕒 Giờ mở cửa:</span>
              <span>
                {place.operating_hours?.open && place.operating_hours?.close
                  ? `${place.operating_hours.open} - ${place.operating_hours.close}`
                  : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>⌛ Thời gian tham quan:</span>
              <span>4-6 giờ</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Check-in ngay
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">📌 Mô tả chi tiết</h2>
        <p className="text-gray-700">{place.description}</p>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">📍 Vị trí & bản đồ</h2>
        <div className="bg-gray-200 h-64 rounded flex items-center justify-center text-gray-600">
          Bản đồ sẽ được hiển thị tại đây
        </div>
      </div>

      {/* --- Phần "Đánh giá từ khách hàng" --- */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Đánh giá từ khách hàng</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
            Viết đánh giá
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {/* Tổng quan đánh giá */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg w-full md:w-1/4 flex-shrink-0">
            <p className="text-5xl font-bold text-gray-800">{place.rating?.toFixed(1) || 'N/A'}</p>
            <StarRating rating={place.rating || 0} />
            <p className="text-sm text-gray-600 mt-1">Dựa trên {place.review_count?.toLocaleString() || 0} đánh giá</p>
          </div>

          {/* Biểu đồ phân tích đánh giá */}
          <div className="w-full md:w-3/4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 w-8 text-right">{star}</span>
                <svg className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <div className="flex-grow bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-yellow-400 h-full rounded-full"
                    style={{ width: `${((place.rating_breakdown?.[star] || 0) * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-10 text-right">
                  {((place.rating_breakdown?.[star] || 0) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Các đánh giá cá nhân */}
        <div className="space-y-6">
          {reviewsToDisplay.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={review.avatar || 'https://via.placeholder.com/40/CCCCCC/FFFFFF?text=U'}
                  alt={review.user_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">{review.user_name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-gray-500 ml-auto">{review.time_ago}</p>
              </div>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <button className="flex items-center gap-1 hover:text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                  </svg> {/* Placeholder for like icon */}
                  Hữu ích ({review.likes})
                </button>
                <button className="ml-4 hover:text-blue-500">Trả lời</button>
              </div>
            </div>
          ))}
        </div>

        {place.reviews && place.reviews.length > 2 && ( // Chỉ hiển thị "Xem thêm" nếu có hơn 2 đánh giá
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors duration-200 font-semibold"
            >
              {showAllReviews ? 'Thu gọn' : 'Xem thêm'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">🏨 Khách sạn đề xuất</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {hotels.slice(0, 3).map((hotel) => (
            <div key={hotel.id} className="border rounded shadow-sm overflow-hidden">
              <img
                src={getFullImageUrl(hotel.image)}
                className="w-full h-40 object-cover"
                alt={hotel.name}
              />
              <div className="p-3">
                <h3 className="text-lg font-semibold">{hotel.name}</h3>
                <p className="text-sm text-gray-600">{hotel.address}</p>
                <p className="text-blue-600">{formatPrice(hotel.price)} / đêm</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-32"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start"
      >
        <h2 className="text-lg font-bold mb-3">📷 Tải ảnh check-in</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCheckinImage(e.target.files[0])}
          className="mb-4"
        />
        {checkinImage && (
          <img
            src={URL.createObjectURL(checkinImage)}
            alt="Preview"
            className="w-full h-48 object-cover rounded border mb-4"
          />
        )}
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">
            Hủy
          </button>
          <button
            onClick={handleCheckinSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : 'Xác nhận'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onRequestClose={() => setIsPreviewOpen(false)}
        className="max-w-4xl mx-auto mt-20 bg-white rounded shadow-lg overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50"
      >
        <img
          src={getFullImageUrl(previewImage)}
          className="w-full max-h-[80vh] object-contain"
          alt="Xem lớn"
        />
      </Modal>
    </div>
  );
};

export default CheckinPlaceDetail;