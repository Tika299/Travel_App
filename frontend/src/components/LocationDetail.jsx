"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { locationAPI } from "../services/api";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  ChevronLeft,
  Check,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";

export default function LocationDetail() {
  const { id } = useParams();
  const [showScroll, setShowScroll] = useState(false);
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchLocationDetail();
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [id]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const fetchLocationDetail = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getById(id);
      setLocation(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error fetching location detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Call API to add/remove favorite
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: location.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép link!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Lỗi: {error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy địa điểm</p>
      </div>
    );
  }

  const displayRating = location.average_rating || location.rating || 0;
  const images = location.images || [location.image]; // Lấy Ảnh Bên Api
  const mockImages = [
    "/image/Ho-Hoan-Kiem.jpg",
    "/image/Ho-Hoan-Kiem.jpg",
    "/image/Ho-Hoan-Kiem.jpg",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                className={isFavorite ? "text-red-500" : ""}
              >
                <Heart
                  className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Rating */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {location.name}
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {renderStars(displayRating)}
              <span className="text-lg font-medium ml-2">
                {Number(displayRating).toFixed(1)}
              </span>
              <span className="text-gray-600">
                ({location.reviews_count || 0} đánh giá)
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{location.address}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 h-100">
          {/* Main Image */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-lg">
            <img
              //   src={mockImages[selectedImageIndex] || "/placeholder.svg"}
              src={"/image/" + location.image || "/placeholder.svg"}
              alt={location.name}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() => setSelectedImageIndex(0)}
            />
          </div>

          {/* Thumbnail Images */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {mockImages.slice(1, 5).map((img, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setSelectedImageIndex(index + 1)}
              >
                <img
                  src={img || "/placeholder.svg"}
                  alt={`${location.name} ${index + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {index === 3 && mockImages.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{mockImages.length - 5}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                {location.description}
              </p>
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Điểm nổi bật
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12 p-5">
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Tầm nhìn ra biển 100% tuyệt đẹp
                    </h3>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Thưởng thức các món ăn đặc sản
                    </h3>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Trung tâm và gần các điểm tham quan
                    </h3>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Chụp ảnh và quay video tuyệt đẹp
                    </h3>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Nghỉ dưỡng lý tưởng cùng gia đình
                    </h3>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Tận hưởng không khí trong lành
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 ">
                Lịch trình chi tiết
              </h2>
              <div className="space-y-6 p-6">
                <div className="flex gap-4 ms-12 ms-12">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Tập trung và di chuyển (30 phút)
                    </h3>
                    <p className="text-gray-600">
                      Tập trung tại điểm hẹn, làm thủ tục và di chuyển đến điểm
                      tham quan
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 ms-12">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Hoạt động tại điểm (3-4 tiếng)
                    </h3>
                    <p className="text-gray-600">
                      Tham gia các hoạt động, khám phá và trải nghiệm tại địa
                      điểm
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 ms-12">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Cắt cánh và bay lượn (20 phút)
                    </h3>
                    <p className="text-gray-600">
                      Cất cánh từ đỉnh núi, bay lượn và ngắm cảnh từ trên cao
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 ms-12">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Hạ cánh và chụp ảnh (15 phút)
                    </h3>
                    <p className="text-gray-600">
                      Hạ cánh an toàn, chụp ảnh lưu niệm và kết thúc chuyến tham
                      quan
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Requirements */}
            {/* <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#1c1b1f] mb-6">
                Yêu cầu tham gia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-[#fdf9ed] p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#f6ab27] flex-shrink-0" />
                  <span className="text-gray-700">Tuổi: 12-65 tuổi</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#fdf9ed] p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#f6ab27] flex-shrink-0" />
                  <span className="text-gray-700">
                    Trang phục thể thao, giày thể thao
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-[#fdf9ed] p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#f6ab27] flex-shrink-0" />
                  <span className="text-gray-700">Cân nặng: 40-100kg</span>
                </div>
                <div className="flex items-center space-x-3 bg-[#fdf9ed] p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#f6ab27] flex-shrink-0" />
                  <span className="text-gray-700">
                    Không có bệnh tim, huyết áp
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-[#fdf9ed] p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#f6ab27] flex-shrink-0" />
                  <span className="text-gray-700">
                    Sức khỏe tốt, không sợ độ cao
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-[#fdf9ed] p-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-[#f6ab27] flex-shrink-0" />
                  <span className="text-gray-700">Không mang thai</span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-14">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Yêu cầu tham gia
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Đặt trước ít nhất 1 ngày
                    </h4>
                    <p className="text-sm text-gray-600">
                      Để chuẩn bị tốt nhất cho chuyến đi
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Tối đa 10 người
                    </h4>
                    <p className="text-sm text-gray-600">
                      Đảm bảo chất lượng trải nghiệm tốt nhất
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Thời gian hoạt động
                    </h4>
                    <p className="text-sm text-gray-600">
                      6:00 - 18:00 hàng ngày
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Độ tuổi phù hợp
                    </h4>
                    <p className="text-sm text-gray-600">Từ 16 tuổi trở lên</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {location.has_fee ? "Có phí tham quan" : "Miễn phí"}
                  </span>
                  {location.has_fee && (
                    <span className="text-2xl font-bold text-orange-600">
                      {location.has_fee || "Liên hệ"}
                    </span>
                  )}
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3">
                  Đặt ngay
                </Button>
                <Button variant="outline" className="w-full mt-2">
                  Liên hệ tư vấn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full 
             bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-500 
             text-white text-xl font-bold shadow-[0_0_20px_rgba(100,100,255,0.6)]
             hover:shadow-[0_0_30px_rgba(255,255,255,0.9)] 
             transition-all duration-300 ease-in-out animate-pulse"
          aria-label="Lên đầu trang"
        >
          ↑
        </button>
      )}
    </div>
  );
}
