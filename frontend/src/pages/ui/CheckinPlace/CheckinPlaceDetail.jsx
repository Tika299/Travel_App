import React, { useEffect, useState, useMemo, useRef } from 'react'; // Import useRef for map section
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal'; 
// IMPORTANT: Make sure 'react-modal' is installed in your project:
// Run 'npm install react-modal' or 'yarn add react-modal' in your project's root directory.

import {
  getCheckinPlaceById,
  submitCheckin,
} from '../../../services/ui/CheckinPlace/checkinPlaceService'; 
// IMPORTANT: Please verify this path carefully.
// Ensure 'checkinPlaceService.js' exists exactly at this location
// relative to this file, and that folder/file names (services, ui, CheckinPlace, checkinPlaceService)
// have no typos or case sensitivity issues.

import { getSuggestedHotels } from '../../../services/ui/Hotel/hotelService'; 
// IMPORTANT: Please verify this path carefully.
// Ensure 'hotelService.js' exists exactly at this location
// relative to this file, and that folder/file names (services, ui, Hotel, hotelService)
// have no typos or case sensitivity issues.

import MyMap from '../../../MyMap'; 
// IMPORTANT: Please verify this path carefully.
// Ensure 'MyMap.js' exists exactly at this location
// relative to this file, and that the file name is correct.

Modal.setAppElement('#root'); // This line is crucial for react-modal to work correctly

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
  const [mainImage, setMainImage] = useState(''); // Current main image displayed
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Check-in modal
  const [checkinImage, setCheckinImage] = useState(null); // Check-in image to upload
  const [submitting, setSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Large image preview modal (only for main image click)
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const mapSectionRef = useRef(null); // Ref for map section to trigger location request

  // Function to get full image URL, handling various path formats
  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return 'https://placehold.co/600x400?text=No+Image'; // Placeholder for missing images
    if (imgPath.startsWith('http')) return imgPath; // Already a full URL
    if (imgPath.startsWith('/storage')) return `http://localhost:8000${imgPath}`; // Relative to storage
    return `http://localhost:8000/storage/${imgPath.replace(/^\/+/, '')}`; // Default to storage
  };

  // Function to load place data from API
  const loadPlaceData = () => {
    getCheckinPlaceById(id)
      .then((res) => {
        const data = res.data.data;
      

        let parsedImages = [];
        if (Array.isArray(data.images)) {
         
          parsedImages = data.images;
         
        } else if (typeof data.images === 'string') {
          try {
           
            parsedImages = JSON.parse(data.images);
            
            if (!Array.isArray(parsedImages)) {
              parsedImages = [parsedImages]; // Treat as a single image if parsing results in non-array
            }
         
          } catch (e) {
            // If parsing fails, treat the string as a single image path
            console.warn("Lỗi khi parse data.images (không phải JSON):", e);
            parsedImages = [data.images]; // Treat as a single image
          }
        } else {
          parsedImages = []; // Fallback to empty array if images field is unexpected
        }


        // Add dummy data for reviews and ratings if not present for demonstration
        if (!data.reviews) {
          data.rating = 4.8;
          data.review_count = 2347;
          data.rating_breakdown = {
            5: 0.78, 4: 0.15, 3: 0.05, 2: 0.01, 1: 0.01,
          };
          data.reviews = [
            { id: 1, user_name: 'Nguyễn Minh Anh', time_ago: '2 ngày trước', rating: 5, comment: 'Cảnh tượng thực sự là một kiệt tác kiến trúc! Cảnh quan từ trên xuống rất hùng vĩ và ấn tượng. Đồi bàn tay khổng lồ tạo nên điểm nhấn độc đáo. Tuy nhiên, vào cuối tuần khá đông khách nên cần có thời gian chờ đợi để chụp ảnh.', likes: 23, avatar: 'https://via.placeholder.com/40/FF5733/FFFFFF?text=NA' },
            { id: 2, user_name: 'Nguyễn Kim Anh', time_ago: '5 ngày trước', rating: 4, comment: 'Địa điểm tuyệt vời để check-in và chụp ảnh! Cáp treo lên Ba Na Hills cũng rất thú vị. Giá vé hơi cao nhưng xứng đáng với trải nghiệm. Nên đi vào buổi sáng sớm để tránh đông người và thời tiết mát mẻ hơn.', likes: 39, avatar: 'https://via.placeholder.com/40/3366FF/FFFFFF?text=KA' },
            { id: 3, user_name: 'Trần Văn B', time_ago: '1 tuần trước', rating: 5, comment: 'Tuyệt vời ông mặt trời! Cảnh đẹp mê hồn, nhất định phải quay lại lần nữa.', likes: 15, avatar: 'https://via.placeholder.com/40/33FF57/FFFFFF?text=TB' },
            { id: 4, user_name: 'Lê Thị C', time_ago: '2 tuần trước', rating: 3, comment: 'Khá đông, nhưng bù lại cảnh đẹp và có nhiều chỗ ăn uống.', likes: 8, avatar: 'https://via.placeholder.com/40/FFFF33/000000?text=LC' }
          ];
        }

        // Combine all possible image sources into a single array for display
        const combinedImages = [];
        if (data.image) { // Main image from the place data itself
          combinedImages.push(data.image);
         
        }
        if (Array.isArray(parsedImages) && parsedImages.length > 0) { // Images from the 'images' field (if any)
          combinedImages.push(...parsedImages);
         
        }
        if (Array.isArray(data.checkin_photos) && data.checkin_photos.length > 0) { // Images from check-in photos (if any)
          combinedImages.push(...data.checkin_photos.map(p => p.image));
         
        }

        // Remove duplicates to ensure unique thumbnails and main image
        const uniqueImages = [...new Set(combinedImages)];
       
        
        setPlace({
          ...data,
          images: uniqueImages, // Store all unique images in place.images for memoization
        });
        
        // Set the initial main image to display: prioritize data.image, then first unique image, else empty
        const initialMainImage = data.image || (uniqueImages.length > 0 ? uniqueImages[0] : '');
        setMainImage(initialMainImage);
      

      })
      .catch((err) => console.error('❌ Error fetching place details:', err))
      .finally(() => setLoading(false));
  };

  // Function to request user's geolocation
  const getUserLocation = (callback = null) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationPermissionDenied(false); // Reset error status if successful
          if (callback) callback(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Could not get user location:", err);
          if (err.code === 1) { // Error code 1 means Permission Denied
            setLocationPermissionDenied(true);
            alert("Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường.");
          }
          if (callback) callback(null, null); // Call callback with null on error
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Options for better accuracy
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Định vị địa lý.");
      if (callback) callback(null, null);
    }
  };

  useEffect(() => {
    loadPlaceData();

    // Fetch suggested hotels
    getSuggestedHotels()
      .then((res) => setHotels(res.data.data || []))
      .catch((err) => console.error('❌ Error fetching hotels:', err));

  }, [id]); // Re-run effect if ID changes

  // Handler for directions button
  const handleDirections = () => {
    if (!userLocation) {
      // If user location is not available, try to get it first
      getUserLocation((lat, lng) => {
        if (lat && lng) {
          // Once location is obtained, open Google Maps
          const url = `http://maps.google.com/maps?saddr=${lat},${lng}&daddr=${place.latitude},${place.longitude}`;
          window.open(url, "_blank");
        }
      });
    } else {
      // If user location is already available, open Google Maps directly
      const url = `http://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${place.latitude},${place.longitude}`;
      window.open(url, "_blank");
    }
  };

  // Handler for map section interaction (e.g., mouse enter) to trigger location request
  const handleMapSectionInteraction = () => {
    // Only attempt to get location if not already obtained and not previously denied
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

  // Memoized list of all unique images for display (including main, parsed, and check-in)
  const allDisplayImages = useMemo(() => {
    // place.images should now contain all unique images combined during loadPlaceData
    if (!place || !Array.isArray(place.images)) return [];
    return place.images;
  }, [place]);

  // Memoized list of thumbnails to show (either first 3 or all)
  const thumbnailsToShow = useMemo(() => {
    return showAllThumbnails ? allDisplayImages : allDisplayImages.slice(0, 3);
  }, [showAllThumbnails, allDisplayImages]);

  // Memoized list of reviews to display (either first 2 or all)
  const reviewsToDisplay = useMemo(() => {
    if (!place || !Array.isArray(place.reviews)) {
      return [];
    }
    return showAllReviews ? place.reviews : place.reviews.slice(0, 2);
  }, [showAllReviews, place]);

  // Helper function to format price for display
  const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + ' VND';

  // Handler for check-in submission
  const handleCheckinSubmit = async () => {
    if (!checkinImage) {
      alert("Vui lòng chọn một hình ảnh để check-in.");
      return;
    }

    const formData = new FormData();
    formData.append('image', checkinImage);
    formData.append('checkin_place_id', id);

    setSubmitting(true);
    try {
      await submitCheckin(formData);
      alert('✅ Check-in thành công!');
      setIsModalOpen(false);
      setCheckinImage(null);
      loadPlaceData(); // Reload data to show new check-in photos immediately
    } catch (err) {
      console.error('❌ Lỗi khi gửi check-in:', err);
      alert('Đã xảy ra lỗi trong quá trình check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading and error states
  if (loading) return <div className="p-6 text-center text-gray-600">🔄 Đang tải...</div>;
  if (!place) return <div className="p-6 text-center text-red-500">❌ Không tìm thấy địa điểm.</div>;

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
          {/* Main Image Display */}
          <img
            src={getFullImageUrl(mainImage)}
            alt={place.name}
            className="w-full h-96 object-cover rounded shadow border-2 border-blue-400 cursor-pointer"
            // On click, open the large image preview modal for the current mainImage
            onClick={() => {
              setIsPreviewOpen(true);
            }}
          />
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {/* Map through all unique images to create thumbnails */}
            {thumbnailsToShow.map((img, idx) => (
              <img
                key={idx} // Using index as key is acceptable for static lists like this
                src={getFullImageUrl(img)}
                className={`h-20 w-full object-cover rounded cursor-pointer ${
                  mainImage === img ? 'border-2 border-blue-500' : 'border' // Highlight active thumbnail
                }`}
                // When a thumbnail is clicked, update the main image
                onClick={() => setMainImage(img)} 
              />
            ))}
            {/* "Show more" button for thumbnails if there are more than 3 */}
            {!showAllThumbnails && allDisplayImages.length > 3 && (
              <div
                onClick={() => setShowAllThumbnails(true)}
                className="h-20 flex items-center justify-center bg-gray-200 rounded cursor-pointer text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                +{allDisplayImages.length - 3} ảnh
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
          <p className="text-gray-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {place.address}
          </p>

          <div className="bg-pink-100 border border-pink-300 rounded p-4 shadow">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <p className="text-xl font-bold text-pink-600">{place.checkin_count?.toLocaleString() || 0}</p>
                <p className="text-sm text-pink-700">Lượt check-in</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">{place.review_count?.toLocaleString() || 0}</p>
                <p className="text-sm text-purple-700">Người ghé thăm</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-medium">💸 Giá vé:</span>
              <span className="text-right">{place.is_free ? 'Miễn phí' : formatPrice(place.price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">🕒 Giờ mở cửa:</span>
              <span className="text-right">
                {place.operating_hours?.open && place.operating_hours?.close
                  ? `${place.operating_hours.open} - ${place.operating_hours.close}`
                  : 'Không có thông tin'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">⌛ Thời gian tham quan:</span>
              <span className="text-right">4-6 giờ</span> {/* Dữ liệu cứng, có thể làm động sau */}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-lg font-semibold shadow-md"
          >
            Check-in ngay
          </button>
        </div>
      </div>

      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">📌 Mô tả chi tiết</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{place.description}</p>
      </div>

      {/* --- Map Section --- */}
      <div
        className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
        ref={mapSectionRef} 
        onMouseEnter={handleMapSectionInteraction} 
      >
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Vị trí trên bản đồ</h3>
        <div className="w-full h-96 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {place.latitude && place.longitude ? (
            <MyMap
              lat={parseFloat(place.latitude)}
              lng={parseFloat(place.longitude)}
              name={place.name} 
            />
          ) : (
            <div className="text-gray-500">Không có thông tin vị trí để hiển thị bản đồ.</div>
          )}
        </div>
        {place.latitude && place.longitude && (
          <button
            onClick={handleDirections}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold shadow-md"
          >
            Chỉ đường đến đây
          </button>
        )}
         {locationPermissionDenied && (
          <p className="text-red-500 text-sm mt-2">
            Không thể hiển thị chỉ đường. Vui lòng cấp quyền vị trí trong cài đặt trình duyệt của bạn.
          </p>
        )}
      </div>

      {/* --- Customer Reviews Section --- */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Đánh giá từ khách hàng</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-md">
            Viết đánh giá
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {/* Overall Rating Summary */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg w-full md:w-1/4 flex-shrink-0 border border-gray-200">
            <p className="text-5xl font-bold text-gray-800">{place.rating?.toFixed(1) || 'N/A'}</p>
            <StarRating rating={place.rating || 0} />
            <p className="text-sm text-gray-600 mt-1">Dựa trên {place.review_count?.toLocaleString() || 0} đánh giá</p>
          </div>

          {/* Rating Breakdown Bars */}
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

        {/* Individual Reviews */}
        <div className="space-y-6">
          {reviewsToDisplay.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={review.avatar || 'https://via.placeholder.com/40/CCCCCC/FFFFFF?text=U'}
                  alt={review.user_name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="font-semibold text-gray-800">{review.user_name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-gray-500 ml-auto">{review.time_ago}</p>
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              <div className="flex items-center text-gray-500 text-sm">
                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    {/* Fixed SVG path for the like icon */}
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                  </svg> 
                  Hữu ích ({review.likes})
                </button>
                <button className="ml-4 hover:text-blue-500 transition-colors duration-200">Trả lời</button>
              </div>
            </div>
          ))}
        </div>

        {/* "Show more reviews" button */}
        {place.reviews && place.reviews.length > 2 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors duration-200 font-semibold shadow-sm"
            >
              {showAllReviews ? 'Thu gọn' : `Xem thêm (${place.reviews.length - reviewsToDisplay.length} đánh giá)`}
            </button>
          </div>
        )}
      </div>

      {/* Suggested Hotels Section */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">🏨 Khách sạn đề xuất</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {hotels.slice(0, 3).map((hotel) => (
            <div key={hotel.id} className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <img
                src={getFullImageUrl(hotel.image)}
                className="w-full h-40 object-cover"
                alt={hotel.name}
              />
              <div className="p-3">
                <h3 className="text-lg font-semibold text-gray-800">{hotel.name}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {hotel.address}
                </p>
                <p className="text-blue-600 font-bold mt-1">{formatPrice(hotel.price)} / đêm</p>
              </div>
            </div>
          ))}
           {hotels.length === 0 && (
            <p className="text-gray-500 text-center col-span-full">Không có khách sạn đề xuất nào.</p>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="relative bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto my-12 focus:outline-none" // Added focus:outline-none
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">📷 Tải ảnh check-in</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCheckinImage(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
        />
        {checkinImage && (
          <img
            src={URL.createObjectURL(checkinImage)}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300 mb-4 shadow-sm"
          />
        )}
        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={() => {
              setIsModalOpen(false);
              setCheckinImage(null); // Clear selected image on cancel
            }} 
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleCheckinSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
            disabled={submitting || !checkinImage} // Disable if submitting or no image selected
          >
            {submitting ? 'Đang gửi...' : 'Xác nhận'}
          </button>
        </div>
      </Modal>

      {/* Large Image Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onRequestClose={() => setIsPreviewOpen(false)}
        className="relative max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden focus:outline-none" // Increased max-width
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]" // Higher z-index for this modal
      >
        <button
          onClick={() => setIsPreviewOpen(false)}
          className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-sm hover:bg-opacity-100 transition-all duration-200 z-10"
          aria-label="Close image preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={getFullImageUrl(mainImage)} // Always display the current mainImage
          className="w-full h-auto max-h-[90vh] object-contain mx-auto" // Use object-contain to prevent cropping
          alt="Large preview"
          onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Image+Load+Error'; }} // Fallback for image load error
        />
        {/* No separate close button below image, using absolute button above */}
      </Modal>
    </div>
  );
};

export default CheckinPlaceDetail;
