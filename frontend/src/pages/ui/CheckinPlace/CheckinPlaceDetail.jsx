import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";

import {
  getCheckinPlaceById,
  submitCheckin,
  getReviewsForCheckinPlace,
  submitReview, // <-- Thêm hàm này
} from "../../../services/ui/CheckinPlace/checkinPlaceService";

import { getSuggestedHotels } from "../../../services/ui/Hotel/hotelService";

import MyMap from "../../../MyMap";

Modal.setAppElement("#root");

// Component hiển thị xếp hạng sao
const StarRating = ({ rating, setRating = null, editable = false }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  const handleClick = (starValue) => {
    if (editable && setRating) {
      setRating(starValue);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        return (
          <svg
            key={`star-${i}`}
            className={`w-5 h-5 ${
              starValue <= rating ? "text-yellow-400" : "text-gray-300"
            } ${editable ? "cursor-pointer" : ""} fill-current`}
            viewBox="0 0 24 24"
            onClick={() => handleClick(starValue)}
          >
            {editable && starValue === Math.ceil(rating) && rating % 1 > 0 && halfStar ? (
              <defs>
                <linearGradient id={`half-editable-${starValue}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            ) : null}
            <path
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={editable && starValue === Math.ceil(rating) && rating % 1 > 0 && halfStar ? `url(#half-editable-${starValue})` : "currentColor"}
            />
          </svg>
        );
      })}
    </div>
  );
};


// Helper function to format time difference (e.g., "2 Ngày trước")
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
};

const CheckinPlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [suggestedHotels, setSuggestedHotels] = useState([]);
  const [placeReviews, setPlaceReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for image handling
  const [mainImage, setMainImage] = useState("");
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // State for check-in modal
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinImage, setCheckinImage] = useState(null);
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  // State for Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  // State for user location and review display
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const mapSectionRef = useRef(null);

  // Function to get full image URL
  const getFullImageUrl = (imgPath) => {
    if (!imgPath) return "https://placehold.co/600x400?text=No+Image";
    // Check if the path is already a full URL or starts with http/https
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
        return imgPath;
    }
    // For paths starting with /storage (Laravel storage link)
    if (imgPath.startsWith("/storage")) {
        return `http://localhost:8000${imgPath}`;
    }
    // For other paths, assume they are relative to storage/app/public
    return `http://localhost:8000/storage/${imgPath.replace(/^\/+/, "")}`;
  };

  // Function to load place data
  const loadPlaceData = useCallback(() => {
    getCheckinPlaceById(id)
      .then((res) => {
        const data = res.data.data;

        let parsedImages = [];
        if (Array.isArray(data.images)) {
          parsedImages = data.images;
        } else if (typeof data.images === "string") {
          try {
            parsedImages = JSON.parse(data.images);
            if (!Array.isArray(parsedImages)) {
              parsedImages = [parsedImages];
            }
          } catch (e) {
            console.warn("Lỗi khi parse data.images (không phải JSON):", e);
            parsedImages = [data.images];
          }
        } else {
          parsedImages = [];
        }

        const combinedImages = [];
        if (data.image) {
          combinedImages.push(data.image);
        }
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          combinedImages.push(...parsedImages);
        }
        if (Array.isArray(data.checkin_photos) && data.checkin_photos.length > 0) {
          combinedImages.push(...data.checkin_photos.map((p) => p.image));
        }

        const uniqueImages = [...new Set(combinedImages)];

        setPlace({
          ...data,
          images: uniqueImages,
        });

        const initialMainImage =
          data.image || (uniqueImages.length > 0 ? uniqueImages[0] : "");
        setMainImage(initialMainImage);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy chi tiết địa điểm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // Function to load place reviews
  const loadPlaceReviews = useCallback(() => {
    getReviewsForCheckinPlace(id)
      .then((res) => {
        setPlaceReviews(res.data.data || []);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy đánh giá địa điểm:", err));
  }, [id]);

  // Function to get user's location
  const getUserLocation = useCallback((callback = null) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationPermissionDenied(false);
          if (callback) callback(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Không thể lấy vị trí người dùng:", err);
          if (err.code === 1) {
            setLocationPermissionDenied(true);
            alert(
              "Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường."
            );
          }
          if (callback) callback(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Định vị địa lý.");
      if (callback) callback(null, null);
    }
  }, []);

  // Effect to load data on component mount or ID change
  useEffect(() => {
    loadPlaceData();
    loadPlaceReviews();

    getSuggestedHotels()
      .then((res) => setSuggestedHotels(res.data.data || []))
      .catch((err) => console.error("❌ Lỗi khi lấy khách sạn đề xuất:", err));
  }, [id, loadPlaceData, loadPlaceReviews]);

  // Handle directions to the place
  const handleDirections = () => {
    if (!userLocation) {
      getUserLocation((lat, lng) => {
        if (lat && lng && place) {
          const url = `http://maps.google.com/maps?saddr=${lat},${lng}&daddr=${place.latitude},${place.longitude}`;
          window.open(url, "_blank");
        }
      });
    } else if (place) {
      const url = `http://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${place.latitude},${place.longitude}`;
      window.open(url, "_blank");
    }
  };

  // Handle map section interaction (to request location if needed)
  const handleMapSectionInteraction = () => {
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

  // Memoized thumbnails for performance
  const allDisplayImages = useMemo(() => {
    if (!place) return [];
    return place.images;
  }, [place]);

  const thumbnailsToShow = useMemo(() => {
    return showAllThumbnails ? allDisplayImages : allDisplayImages.slice(0, 3);
  }, [showAllThumbnails, allDisplayImages]);

  // Memoized reviews to display
  const reviewsToDisplay = useMemo(() => {
    // Lọc chỉ những đánh giá đã được duyệt (is_approved === true)
    const approvedReviews = placeReviews.filter(review => review.is_approved);
    return showAllReviews ? approvedReviews : approvedReviews.slice(0, 2);
  }, [showAllReviews, placeReviews]);


  // Calculate overall rating and breakdown from placeReviews
  const { averageRating, totalReviews, ratingBreakdown } = useMemo(() => {
    // Chỉ tính toán dựa trên các đánh giá đã được duyệt
    const approvedReviews = placeReviews.filter(review => review.is_approved);
    const total = approvedReviews.length;
    let sumRatings = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    approvedReviews.forEach(review => {
      sumRatings += review.rating;
      // Làm tròn điểm đánh giá xuống để phân loại vào breakdown (ví dụ: 4.8 -> 4 sao)
      const roundedRating = Math.floor(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        breakdown[roundedRating]++;
      }
    });

    const avg = total > 0 ? (sumRatings / total).toFixed(1) : "0.0";

    const calculatedBreakdown = Object.keys(breakdown).reduce((acc, star) => {
      acc[star] = total > 0 ? (breakdown[star] / total * 100).toFixed(0) : 0;
      return acc;
    }, {});

    return {
      averageRating: avg,
      totalReviews: total,
      ratingBreakdown: calculatedBreakdown,
    };
  }, [placeReviews]);


  // Function to format price
  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + " VND";

  // Handle check-in submission
  const handleCheckinSubmit = async () => {
    if (!checkinImage) {
      alert("Vui lòng chọn một hình ảnh để check-in.");
      return;
    }

    const formData = new FormData();
    formData.append("image", checkinImage);
    formData.append("checkin_place_id", id);

    setSubmittingCheckin(true);
    try {
      await submitCheckin(formData);
      alert("✅ Check-in thành công!");
      setIsCheckinModalOpen(false);
      setCheckinImage(null);
      loadPlaceData(); // Reload data to update checkin_count
      loadPlaceReviews(); // Reload reviews just in case
    } catch (err) {
      console.error("❌ Lỗi khi gửi check-in:", err);
      alert("Đã xảy ra lỗi trong quá trình check-in.");
    } finally {
      setSubmittingCheckin(false);
    }
  };

  // Handle review image selection
  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Limit to 3 images, or whatever you prefer
    setReviewImages(files.slice(0, 3));
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      alert("Vui lòng chọn số sao để đánh giá.");
      return;
    }
    if (reviewContent.trim() === "") {
      alert("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    const formData = new FormData();
    formData.append("reviewable_type", "App\\Models\\CheckinPlace");
    formData.append("reviewable_id", id);
    formData.append("content", reviewContent);
    formData.append("rating", reviewRating);

    reviewImages.forEach((image, index) => {
      formData.append(`images[${index}]`, image); // Adjust field name if API expects something different
    });

    setSubmittingReview(true);
    try {
      await submitReview(formData);
      alert("✅ Đánh giá của bạn đã được gửi thành công và đang chờ duyệt!");
      setIsReviewModalOpen(false);
      setReviewRating(0);
      setReviewContent("");
      setReviewImages([]);
      loadPlaceReviews(); // Reload reviews to show the new one (if approved, or pending)
    } catch (err) {
      console.error("❌ Lỗi khi gửi đánh giá:", err);
      // Check for specific error messages from backend, e.g., if user already reviewed
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Đã xảy ra lỗi: ${err.response.data.message}`);
      } else {
        alert("Đã xảy ra lỗi trong quá trình gửi đánh giá.");
      }
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading)
    return <div className="p-6 text-center text-gray-600">🔄 Đang tải...</div>;
  if (!place)
    return (
      <div className="p-6 text-center text-red-500">
        ❌ Không tìm thấy địa điểm.
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main image and thumbnails section */}
        <div className="md:w-1/2">
          <img
            src={getFullImageUrl(mainImage)}
            alt={place.name}
            className="w-full h-96 object-cover rounded shadow border-2 border-blue-400 cursor-pointer"
            onClick={() => {
              setIsPreviewOpen(true);
            }}
          />
          <div className="grid grid-cols-4 gap-2 mt-2">
            {thumbnailsToShow.map((img, idx) => (
              <img
                key={idx}
                src={getFullImageUrl(img)}
                className={`h-20 w-full object-cover rounded cursor-pointer ${
                  mainImage === img ? "border-2 border-blue-500" : "border"
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
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

        {/* Basic Information Section */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
          <p className="text-gray-600 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {place.address}
          </p>

          <div className="bg-pink-100 border border-pink-300 rounded p-4 shadow">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <p className="text-xl font-bold text-pink-600">
                  {place.checkin_count?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-pink-700">Lượt check-in</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-purple-600">
                  {totalReviews?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-purple-700">Người ghé thăm / Đánh giá</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm text-gray-800">
            <div className="flex justify-between items-center">
              <span className="font-medium">💸 Giá vé:</span>
              <span className="text-right">
                {place.is_free ? "Miễn phí" : formatPrice(place.price)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">🕒 Giờ mở cửa:</span>
              <span className="text-right">
                {place.operating_hours?.open && place.operating_hours?.close
                  ? `${place.operating_hours.open} - ${place.operating_hours.close}`
                  : "Không có thông tin"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">⌛ Thời gian tham quan:</span>
              <span className="text-right">4-6 giờ</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckinModalOpen(true)}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-lg font-semibold shadow-md"
          >
            Check-in ngay
          </button>
        </div>
      </div>

      {/* Detailed Description */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">
          📌 Mô tả chi tiết
        </h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {place.description}
        </p>
      </div>

      {/* Map Section */}
      <div
        className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
        ref={mapSectionRef}
        onMouseEnter={handleMapSectionInteraction}
      >
        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">
          Vị trí trên bản đồ
        </h3>
        <div className="w-full h-96 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {place.latitude && place.longitude ? (
            <MyMap
              lat={parseFloat(place.latitude)}
              lng={parseFloat(place.longitude)}
              name={place.name}
            />
          ) : (
            <div className="text-gray-500">
              Không có thông tin vị trí để hiển thị bản đồ.
            </div>
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
            Không thể hiển thị chỉ đường. Vui lòng cấp quyền vị trí trong cài
            đặt trình duyệt của bạn.
          </p>
        )}
      </div>

      {/* Suggested Hotels */}
      <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-800">
        🏨 Khách sạn đề xuất
      </h2>
      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {suggestedHotels.slice(0, 3).map((hotel) => (
            <div
              key={hotel.id}
              className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <img
                src={getFullImageUrl(hotel.image)}
                className="w-full h-40 object-cover"
                alt={hotel.name}
              />
              <div className="p-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {hotel.name}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {hotel.address}
                </p>
                <p className="text-blue-600 font-bold mt-1">
                  {formatPrice(hotel.price)} / đêm
                </p>
              </div>
            </div>
          ))}
          {suggestedHotels.length === 0 && (
            <p className="text-gray-500 text-center col-span-full">
              Không có khách sạn đề xuất nào.
            </p>
          )}
        </div>
      </div>

      {/* NEW: Customer Reviews Section with two columns */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Đánh giá từ khách hàng
          </h2>
          <button
            onClick={() => setIsReviewModalOpen(true)} // Mở modal đánh giá
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-md"
          >
            Viết đánh giá
          </button>
        </div>

        {totalReviews > 0 ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Overall Rating and Breakdown */}
            <div className="md:w-1/3 flex-shrink-0">
              <div className="sticky top-6"> {/* Optional: Make it sticky */}
                <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-5xl font-bold text-gray-900">{averageRating}</p>
                  <StarRating rating={parseFloat(averageRating)} />
                  <p className="text-sm text-gray-600 mt-1">Dựa trên {totalReviews} đánh giá</p>
                </div>

                <div className="space-y-2 mt-4">
                  {Object.keys(ratingBreakdown).sort((a,b) => b-a).map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{star} sao</span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${ratingBreakdown[star]}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-10 text-right">{ratingBreakdown[star]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Individual Reviews */}
            <div className="md:w-2/3">
              <div className="space-y-6">
                {reviewsToDisplay.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={
                          review.user?.avatar
                            ? getFullImageUrl(review.user.avatar) // Sử dụng getFullImageUrl cho avatar user
                            : "https://via.placeholder.com/40/CCCCCC/FFFFFF?text=U"
                        }
                        alt={review.user?.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.user?.name}
                        </p>
                        <StarRating rating={review.rating} />
                      </div>
                      <p className="text-sm text-gray-500 ml-auto">
                        {formatTimeAgo(review.created_at)}
                      </p>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {review.content}
                    </p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.images.map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={getFullImageUrl(img)}
                            alt={`Review image ${imgIdx + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 text-sm mt-2">
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors duration-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Hữu ích ({review.likes || 0})
                      </button>
                      <button className="ml-4 hover:text-blue-500 transition-colors duration-200">
                        Trả lời
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* "Show more reviews" button for the right column */}
              {placeReviews.filter(review => review.is_approved).length > 2 && ( // Chỉ đếm reviews đã duyệt
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors duration-200 font-semibold shadow-sm"
                  >
                    {showAllReviews
                      ? "Thu gọn"
                      : `Xem thêm (${placeReviews.filter(review => review.is_approved).length - reviewsToDisplay.length} đánh giá)`}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">
            Chưa có bình luận nào cho địa điểm này. Hãy là người đầu tiên!
          </p>
        )}
      </div>

      {/* Check-in Modal */}
      <Modal
        isOpen={isCheckinModalOpen}
        onRequestClose={() => setIsCheckinModalOpen(false)}
        className="relative bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto my-12 focus:outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
          📷 Tải ảnh check-in
        </h2>
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
              setIsCheckinModalOpen(false);
              setCheckinImage(null);
            }}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleCheckinSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
            disabled={submittingCheckin || !checkinImage}
          >
            {submittingCheckin ? "Đang gửi..." : "Xác nhận"}
          </button>
        </div>
      </Modal>

      {/* NEW: Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onRequestClose={() => {
          setIsReviewModalOpen(false);
          setReviewRating(0);
          setReviewContent("");
          setReviewImages([]);
        }}
        className="relative bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto my-12 focus:outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
          📝 Viết đánh giá của bạn
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Xếp hạng của bạn:
          </label>
          <StarRating rating={reviewRating} setRating={setReviewRating} editable={true} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reviewContent">
            Nội dung đánh giá:
          </label>
          <textarea
            id="reviewContent"
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Thêm ảnh (tối đa 3 ảnh):
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleReviewImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-2"
          />
          <div className="flex gap-2 mt-2">
            {reviewImages.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Review preview ${index}`}
                className="w-24 h-24 object-cover rounded-md border border-gray-300"
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setIsReviewModalOpen(false);
              setReviewRating(0);
              setReviewContent("");
              setReviewImages([]);
            }}
            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleReviewSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
            disabled={submittingReview || reviewRating === 0 || reviewContent.trim() === ""}
          >
            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </Modal>


      {/* Image Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onRequestClose={() => setIsPreviewOpen(false)}
        className="relative max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden focus:outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]"
      >
        <button
          onClick={() => setIsPreviewOpen(false)}
          className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-sm hover:bg-opacity-100 transition-all duration-200 z-10"
          aria-label="Close image preview"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <img
          src={getFullImageUrl(mainImage)}
          className="w-full h-auto max-h-[90vh] object-contain mx-auto"
          alt="Large preview"
          onError={(e) => {
            e.target.src = "https://placehold.co/800x600?text=Image+Load+Error";
          }}
        />
      </Modal>
    </div>
  );
};

export default CheckinPlaceDetail;