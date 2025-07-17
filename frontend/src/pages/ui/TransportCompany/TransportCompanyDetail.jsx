import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTransportCompanyById,
  getReviewsForTransportCompany,
} from "../../../services/ui/TransportCompany/transportCompanyService"; // Corrected path based on previous conversation
import MyMap from "../../../MyMap";

// --- START: Các Component và Hàm hỗ trợ cần thêm ---

// Component StarRating: Giả định bạn có component này
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.517c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {halfStar && (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.517c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          <path fill="url(#half)" d="M10 2.927c-.3-.921-1.603-.921-1.902 0l-1.07 3.292a1 1 0 01-.95.69H2.616c-.969 0-1.371 1.24-.588 1.81l2.8 2.034a1 1 0 01.364 1.118l-1.07 3.292c-.3.921.755 1.688 1.54 1.118l2.8-2.034a1 1 0 011.175 0l2.8 2.034c.784.57 1.838-.197 1.539-1.118l-1.07-3.292a1 1 0 01.364-1.118L17.08 8.517c.783-.57.38-1.81-.588-1.81h-3.461a1 1 0 01-.951-.69l-1.07-3.292zM10 2.927V17.073L10 2.927z">
            <defs>
              <linearGradient id="half" x1="0" x2="100%" y1="0" y2="0">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </path>
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.517c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Hàm định dạng thời gian
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return Math.floor(seconds) + " giây trước";
};

// Hàm lấy URL đầy đủ cho ảnh, sử dụng import.meta.env
const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  // Sử dụng import.meta.env.VITE_APP_API_URL
  return `${import.meta.env.VITE_APP_API_URL}/storage/${cleanPath}`;
};

// --- END: Các Component và Hàm hỗ trợ cần thêm ---


// --- Label Mappings ---
const labelMapPrice = {
  base_km: "Giá khởi điểm (2km đầu)",
  additional_km: "Giá mỗi km thêm",
  waiting_hour: "Phí thời gian muộn mỗi giờ",
  waiting_minute_fee: "Phụ phí chờ mỗi phút",
  night_fee: "Phụ phí 22h - 5h",
  daily_rate: "Giá thuê theo ngày",
  hourly_rate: "Giá thuê theo giờ",
  base_fare: "Giá vé cơ bản (xe buýt)",
};

const labelMapPayment = {
  cash: "Tiền mặt",
  bank_card: "Thanh toán thẻ",
  insurance: "Bảo hiểm",
  momo: "MoMo",
  zalopay: "ZaloPay",
};

// --- Main Component ---
const TransportCompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const mapRef = useRef(null);

  // --- States for Reviews ---
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // Thêm state để mở/đóng modal review
  const [showAllReviews, setShowAllReviews] = useState(false); // State để hiển thị tất cả reviews

  // Helper function to safely parse JSON strings
  const parseJSON = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
  };

  // Function to get user's geolocation
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
            alert("Bạn đã từ chối cấp quyền vị trí. Vui lòng bật quyền vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường.");
          }
          if (callback) callback(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Geolocation.");
      if (callback) callback(null, null);
    }
  }, []);


  // Function to fetch company details
  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransportCompanyById(id);
      const rawData = res.data?.data;
      if (rawData) {
        let parsedOperatingHours = {};
        if (rawData.operating_hours) {
          try {
            parsedOperatingHours = typeof rawData.operating_hours === 'string'
              ? JSON.parse(rawData.operating_hours)
              : rawData.operating_hours;
          } catch (e) {
            console.error('Lỗi khi parse operating_hours:', e);
            parsedOperatingHours = {};
          }
        }

        let parsedHighlightServices = [];
        if (rawData.highlight_services) {
          try {
            if (typeof rawData.highlight_services === 'string') {
                const tempArray = JSON.parse(rawData.highlight_services);
                if (Array.isArray(tempArray)) {
                    parsedHighlightServices = tempArray.map(item => String(item));
                }
            } else if (Array.isArray(rawData.highlight_services)) {
                parsedHighlightServices = rawData.highlight_services.flatMap(item => {
                    try {
                        const parsedItem = JSON.parse(item);
                        return Array.isArray(parsedItem) ? parsedItem : [parsedItem];
                    } catch {
                        return String(item);
                    }
                }).filter(Boolean);
            }
          } catch (e) {
            console.warn('Could not parse highlight_services, falling back to simple map:', rawData.highlight_services, e);
            if (typeof rawData.highlight_services === 'string') {
              parsedHighlightServices = rawData.highlight_services.split(',').map(s => s.trim());
            } else if (Array.isArray(rawData.highlight_services)) {
              parsedHighlightServices = rawData.highlight_services.map(item => String(item));
            }
          }
        }

        setCompany({
          ...rawData,
          operating_hours: parsedOperatingHours,
          highlight_services: parsedHighlightServices,
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu hãng vận chuyển:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Function to fetch reviews for the company
  const fetchReviews = useCallback(async () => {
    try {
      const response = await getReviewsForTransportCompany(id);
      // Giả sử API trả về reviews trong res.data.data
      setReviews(response.data.data);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanyDetails();
    fetchReviews();
  }, [fetchCompanyDetails, fetchReviews]);

  // --- Event Handlers ---
  const handleDirections = () => {
    if (!company.latitude || !company.longitude) {
      alert("Thông tin vị trí của hãng không khả dụng.");
      return;
    }

    if (!userLocation) {
      getUserLocation((lat, lng) => {
        if (lat && lng) {
          const url = `https://www.google.com/maps/dir/${lat},${lng}/${company.latitude},${company.longitude}`;
          window.open(url, "_blank");
        }
      });
    } else {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${company.latitude},${company.longitude}`;
      window.open(url, "_blank");
    }
  };

  const handleMapSectionInteraction = () => {
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

  // --- Loading and Error States ---
  if (loading) return <p className="p-4">🔄 Đang tải dữ liệu...</p>;
  if (!company) return <p className="p-4">❌ Không tìm thấy hãng.</p>;

  // --- Data Preparation ---
  const price = company.price_range ? parseJSON(company.price_range) : {};
  const hours = company.operating_hours || {};
  // payment_methods có thể là string JSON hoặc mảng. Đảm bảo nó là mảng.
  const paymentMethodsRaw = company.payment_methods;
  const paymentMethods = typeof paymentMethodsRaw === 'string'
    ? parseJSON(paymentMethodsRaw)
    : (Array.isArray(paymentMethodsRaw) ? paymentMethodsRaw : []);


  // Sử dụng getFullImageUrl cho logo và banner
  const logoUrl = getFullImageUrl(company.transportation?.icon);
  const bannerUrl = getFullImageUrl(company.transportation?.banner || "default-banner.jpg");


  // --- Review Calculation Logic ---
  const placeReviews = reviews.filter(review => review.is_approved); // Lọc chỉ các review đã được duyệt
  const totalReviews = placeReviews.length;
  const sumRatings = placeReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : "0.0";

  const ratingBreakdown = {};
  for (let i = 1; i <= 5; i++) {
    const count = placeReviews.filter(review => Math.floor(review.rating) === i).length;
    ratingBreakdown[i] = totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
  }

  const reviewsToDisplay = showAllReviews ? placeReviews : placeReviews.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* --- Header Section --- */}
      <div
        className="relative bg-cover bg-center h-64 flex items-center justify-start pl-8 md:pl-16"
        style={{ backgroundImage: `url('${bannerUrl}')` }}
      >
        <div className="flex items-center gap-6 text-white">
          <img
            src={logoUrl}
            alt={company.name}
            onError={(e) => (e.target.src = "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Icon")}
            className="w-20 h-20 object-contain rounded-full border-4 border-white shadow-lg bg-white p-2"
          />
          <div>
            <h1 className="text-3xl font-extrabold">{company.name}</h1>
            <p className="text-base font-light">
              {company.short_description || "Hãng xe uy tín hàng đầu Việt Nam"}
            </p>
            <p className="text-sm mt-1">
              ⭐ {company.rating ? company.rating.toFixed(1) : "Chưa có"} đánh giá -{" "}
              {company.coverage_area || "Toàn quốc"} -{" "}
              {company.is_24_7 ? "24/7 hoạt động" : "Giờ giới hạn"}
            </p>
          </div>
        </div>
      </div>

      {/* --- Main Content Section --- */}
      <section className="max-w-6xl mx-auto mt-6 grid lg:grid-cols-10 gap-6 px-4">
        {/* LEFT column: Details */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Detailed Info */}
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-xl font-bold mb-3">Thông tin chi tiết</h2>
            <p className="text-sm text-gray-700 mb-6 leading-relaxed">
              {company.description || "Không có mô tả chi tiết."}
            </p>

            {/* Price & Hours Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Price card */}
              <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                <h3 className="font-semibold mb-3">Bảng giá dịch vụ</h3>
                <ul className="text-sm space-y-1">
                  {Object.keys(price).length ? (
                    Object.entries(price).map(([k, v]) => (
                      <li key={k} className="flex justify-between">
                        <span>{labelMapPrice[k] || k}</span>
                        <span className="font-medium text-emerald-600">
                          {Number(v).toLocaleString()}đ
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>—</li>
                  )}
                </ul>
              </div>

              {/* Hours card - Updated to reflect specific keys */}
              <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                <h3 className="font-semibold mb-3">Thời gian hoạt động</h3>
                <ul className="text-sm space-y-1">
                  {hours['Thứ 2- Chủ Nhật'] && (
                    <li className="flex justify-between">
                      <span>Thứ 2 - Chủ Nhật</span>
                      <span className="font-medium text-emerald-600">{hours['Thứ 2- Chủ Nhật']}</span>
                    </li>
                  )}
                  {hours['Tổng Đài '] && (
                    <li className="flex justify-between">
                      <span>Tổng Đài</span>
                      <span className="font-medium text-emerald-600">{hours['Tổng Đài ']}</span>
                    </li>
                  )}
                  {hours['Thời gian phản hồi'] && (
                    <li className="flex justify-between">
                      <span>Thời gian phản hồi</span>
                      <span className="font-medium text-emerald-600">{hours['Thời gian phản hồi']}</span>
                    </li>
                  )}
                  {!hours['Thứ 2- Chủ Nhật'] && !hours['Tổng Đài '] && !hours['Thời gian phản hồi'] && (
                    <li>—</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Highlight Services */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Dịch vụ nổi bật</h3>
              <div className="flex flex-wrap gap-3 text-sm">
                {company.highlight_services && company.highlight_services.length > 0 ? (
                  company.highlight_services.map((service, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      {service.replace(/_/g, ' ')}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có dịch vụ nổi bật nào.</p>
                )}
                {paymentMethods.includes('momo') && (
                  <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full">MoMo</span>
                )}
                {paymentMethods.includes('zalopay') && (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">ZaloPay</span>
                )}
                {company.has_mobile_app && (
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">Ứng dụng di động</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column: Contact & Actions */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          {/* Contact card */}
          <div className="bg-white rounded-xl shadow p-6 border flex flex-col gap-4">
            <h3 className="font-semibold text-lg">Thông tin liên hệ</h3>
            <ul className="text-sm space-y-3">
              <li className="flex items-start gap-2">
                <span className="material-icons text-indigo-600">place</span>
                <span>{company.address || "—"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-600">call</span>
                <span>{company.phone_number || "—"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-pink-600">email</span>
                <span>{company.email || "—"}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-600">web</span>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noreferrer" className="underline text-blue-600">
                    {company.website}
                  </a>
                ) : (
                  "—"
                )}
              </li>
            </ul>
            <div className="pt-4 mt-auto grid gap-3">
              <a href={`tel:${company.phone_number}`} className="py-3 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600 flex items-center justify-center gap-2">
                Gọi ngay
              </a>
              <button className="py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 flex items-center justify-center gap-2">
                Nhắn tin quản lý
              </button>
              <button
                onClick={handleDirections}
                className="py-3 bg-orange-500 text-white font-medium rounded-lg shadow hover:bg-orange-600 flex items-center justify-center gap-2"
              >
                Chỉ đường
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* --- Map Section --- */}
      <div
        className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
        ref={mapRef}
        onMouseEnter={handleMapSectionInteraction}
      >
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Vị trí trên bản đồ</h3>
        <div className="w-full h-96 rounded-md overflow-hidden">
          {company.latitude && company.longitude ? (
            <MyMap lat={parseFloat(company.latitude)} lng={parseFloat(company.longitude)} name={company.name} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Không có thông tin vị trí.
            </div>
          )}
        </div>
      </div>

      {/* NEW: Customer Reviews Section with two columns */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto"> {/* Added max-w-6xl mx-auto for consistent centering */}
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
                        alt={review.user?.name || review.guest_name || 'User'}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {review.user?.name || review.guest_name || 'Người dùng ẩn danh'}
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
                    {/* Parse review.images if it's a string, or directly map if it's an array */}
                    {(review.images && typeof review.images === 'string' && JSON.parse(review.images).length > 0) ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {JSON.parse(review.images).map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={getFullImageUrl(img)}
                            alt={`Review image ${imgIdx + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=Image+Error'}
                          />
                        ))}
                      </div>
                    ) : (review.images && Array.isArray(review.images) && review.images.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.images.map((img, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={getFullImageUrl(img)}
                            alt={`Review image ${imgIdx + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=Image+Error'}
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
              {placeReviews.length > reviewsToDisplay.length && ( // Kiểm tra nếu có nhiều hơn số reviews đang hiển thị
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors duration-200 font-semibold shadow-sm"
                  >
                    {showAllReviews
                      ? "Thu gọn"
                      : `Xem thêm (${placeReviews.length - reviewsToDisplay.length} đánh giá)`}
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
      {/* TODO: Add Review Modal Component Here */}
      {/* {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
          reviewableType="App\\Models\\TransportCompany"
          reviewableId={id}
          // Pass any other necessary props like user, initial content, etc.
        />
      )} */}
    </div>
  );
};

export default TransportCompanyDetail;