import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getTransportCompanyById } from "../../../services/ui/TransportCompany/transportCompanyService";
import MyMap from "../../../MyMap";

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
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const mapRef = useRef(null); // Ref for the map section

  const ASSET_BASE_URL = "http://localhost:8000/storage/";

  useEffect(() => {
    getTransportCompanyById(id)
      .then((res) => {
        const rawData = res.data?.data;
        if (rawData) {
          // Parse operating_hours here from the raw data
          let parsedOperatingHours = {};
          if (rawData.operating_hours) {
            try {
              if (typeof rawData.operating_hours === 'string') {
                parsedOperatingHours = JSON.parse(rawData.operating_hours);
              } else if (typeof rawData.operating_hours === 'object') {
                parsedOperatingHours = rawData.operating_hours;
              }
            } catch (e) {
              console.error('Lỗi khi parse operating_hours:', e);
              parsedOperatingHours = {}; // Fallback to empty object on error
            }
          }

          // Parse highlight_services (similar to how you did in EditTransportCompany)
          let parsedHighlightServices = [];
          if (rawData.highlight_services) {
              try {
                  if (Array.isArray(rawData.highlight_services) && rawData.highlight_services.length > 0 && typeof rawData.highlight_services[0] === 'string' && rawData.highlight_services[0].startsWith('["')) {
                      const combinedString = rawData.highlight_services.join('');
                      const tempArray = JSON.parse(combinedString);
                      if (Array.isArray(tempArray)) {
                          parsedHighlightServices = tempArray.map(item => String(item));
                      }
                  } else if (typeof rawData.highlight_services === 'string') {
                      const tempArray = JSON.parse(rawData.highlight_services);
                      if (Array.isArray(tempArray)) {
                          parsedHighlightServices = tempArray.map(item => String(item));
                      }
                  } else if (Array.isArray(rawData.highlight_services)) {
                      parsedHighlightServices = rawData.highlight_services.map(item => String(item));
                  }
              } catch (e) {
                  console.warn('Could not parse highlight_services, falling back to comma split:', rawData.highlight_services, e);
                  if (typeof rawData.highlight_services === 'string') {
                      parsedHighlightServices = rawData.highlight_services.split(',').map(s => s.trim());
                  } else if (Array.isArray(rawData.highlight_services)) {
                      parsedHighlightServices = rawData.highlight_services.map(item => {
                          try {
                              return JSON.parse(item);
                          } catch (e) {
                              return String(item).replace(/^\["|"\]$/g, '').trim();
                          }
                      }).flat().filter(Boolean);
                  }
              }
          }

          setCompany({
            ...rawData,
            operating_hours: parsedOperatingHours, // Use the parsed object
            highlight_services: parsedHighlightServices, // Use parsed highlight services
          });
        }
      })
      .catch((err) => console.error("Lỗi khi tải dữ liệu:", err))
      .finally(() => setLoading(false));

    // No need to call navigator.geolocation.getCurrentPosition here.
    // It will be called when the user scrolls to the map section.
  }, [id]);

  // Helper function to safely parse JSON strings
  const parseJSON = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {}; // Return empty object on parse error
      }
    }
    return value || {}; // Return value itself if not a string, or empty object if null/undefined
  };

  // Function to get user's geolocation
  const getUserLocation = (callback = null) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationPermissionDenied(false); // Reset permission denied status on success
          if (callback) callback(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Không thể lấy vị trí người dùng:", err);
          // Error code 1 is Permission Denied
          if (err.code === 1) {
            setLocationPermissionDenied(true);
            alert("Bạn đã từ chối cấp quyền vị trí. Vui lòng bật quyền vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường.");
          }
          if (callback) callback(null, null); // Call callback with null on error
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Options for better accuracy
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Geolocation.");
      if (callback) callback(null, null);
    }
  };

  // --- Loading and Error States ---
  if (loading) return <p className="p-4">🔄 Đang tải dữ liệu...</p>;
  if (!company) return <p className="p-4">❌ Không tìm thấy hãng.</p>;

  // --- Data Preparation ---
  const price = company.price_range ? parseJSON(company.price_range) : {};
  // operating_hours is now directly an object due to parsing in useEffect
  const hours = company.operating_hours || {};
  const paymentMethodsRaw = company.payment_methods;
  const paymentMethods = Array.isArray(paymentMethodsRaw) ? paymentMethodsRaw : [];


  const logoUrl = company.transportation?.icon?.startsWith("http")
    ? company.transportation.icon
    : ASSET_BASE_URL + (company.transportation?.icon || "");

  const bannerUrl = company.transportation?.banner?.startsWith("http")
    ? company.transportation.banner
    : ASSET_BASE_URL + (company.transportation?.banner || "default-banner.jpg");

  // --- Event Handlers ---
  const handleDirections = () => {
    // If user location is not available, try to get it first
    if (!userLocation) {
      getUserLocation((lat, lng) => {
        if (lat && lng) {
          // Once location is obtained, open Google Maps
          const url = `https://www.google.com/maps/dir/${lat},${lng}/${company.latitude},${company.longitude}`;
          window.open(url, "_blank");
        }
      });
    } else {
      // If user location is already available, open Google Maps directly
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${company.latitude},${company.longitude}`;
      window.open(url, "_blank");
    }
  };

  // Function to handle scroll/mouse enter on map section to request location
  const handleMapSectionInteraction = () => {
    // Only request location if not already obtained and permission not denied
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

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
                  {hours['Tổng Đài '] && ( // Keep the space if that's how it's stored in DB
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
                  {/* Fallback if no operating hours are available */}
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
                      {service.replace(/_/g, ' ')} {/* Replace underscores for better display */}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có dịch vụ nổi bật nào.</p>
                )}
                {/* Dynamically add payment methods as highlights if desired */}
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
              {/* Assuming "Nhắn tin quản lý" means opening a chat app or similar, for now just a placeholder button */}
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
      {/* Use onMouseEnter to trigger location request when user interacts with the map section */}
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
    </div>
  );
};

export default TransportCompanyDetail;