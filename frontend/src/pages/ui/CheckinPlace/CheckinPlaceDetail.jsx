import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import {
  getCheckinPlaceById,
  submitCheckin,
} from '../../../services/ui/CheckinPlace/checkinPlaceService';
import { getSuggestedHotels } from '../../../services/ui/Hotel/hotelService';

Modal.setAppElement('#root');

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
