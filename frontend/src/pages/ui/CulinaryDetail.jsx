import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import cuisineService from '../../services/cuisineService';
import { Star, Clock, Soup, MapPin, ThumbsUp, MessageCircle, Utensils, Users, Flame, Leaf } from 'lucide-react';

// Component để hiển thị các ngôi sao đánh giá
const StarRating = ({ rating, className = '' }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);
  
    return (
      <div className={`flex items-center ${className}`}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
        {halfStar && <Star key="half" className="w-5 h-5 text-yellow-400 fill-current" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" />
        ))}
      </div>
    );
  };

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full sm:w-32 sm:h-32 rounded-lg object-cover"
        />
        <div className="flex flex-col flex-1">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-x-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold text-gray-800">{restaurant.rating}</span>
                <span className="ml-1">({restaurant.reviews} reviews)</span>
              </div>
              <span className="hidden sm:inline">-</span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {restaurant.address}
              </span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{restaurant.description}</p>
          </div>
          <div className="flex justify-between items-center mt-3 w-full">
            <p className="font-bold text-blue-600 text-lg">{restaurant.priceRange}</p>
            <button className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CulinaryDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await cuisineService.getCuisineById(id);
        setData({
          detail: res.data?.data || res.data || res,
          priceDetails: res.data?.priceDetails || res.priceDetails || [],
        });
      } catch (err) {
        setError('Không thể tải dữ liệu chi tiết.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const detail = data?.detail || {};
  let filteredPriceDetails = data?.priceDetails || [];

  // Chuẩn hóa dữ liệu info nhanh từ API hoặc mock
  const quickInfo = {
    type: detail.quickInfo?.type || (typeof detail.category === 'object' ? detail.category?.name : detail.category) || detail.category || '',
    openingHours: detail.quickInfo?.openingHours || detail.operating_hours || '',
    suitableFor: detail.quickInfo?.suitableFor || detail.suitable_for || '',
    priceRange: detail.quickInfo?.priceRange || detail.price_formatted || detail.price || '',
  };

  // Chuẩn hóa dữ liệu info hàng ngang
  const infoRow = {
    time: detail.serving_time || detail.metadata?.time || '',
    category: (typeof detail.category === 'object' ? detail.category?.name : detail.category) || detail.metadata?.category || '',
    spicy: detail.spicy_level || 'nhẹ',
  };

  // Chuẩn hóa mô tả chi tiết
  let detailDescription = [];
  if (Array.isArray(detail.detailed_description)) {
    detailDescription = detail.detailed_description;
  } else if (typeof detail.detailed_description === 'string') {
    detailDescription = detail.detailed_description.split('\n').filter(Boolean);
  } else if (Array.isArray(detail.description)) {
    detailDescription = detail.description;
  } else if (typeof detail.description === 'string') {
    detailDescription = detail.description.split('\n').filter(Boolean);
  }

  // Lọc priceDetails theo category hiện tại nếu có, fallback nếu ít hơn 2
  const currentCategory = (typeof detail.category === 'object' ? detail.category?.name : detail.category) || '';
  if (Array.isArray(filteredPriceDetails) && currentCategory) {
    // Chỉ lọc nếu tất cả item đều có trường category
    const allHaveCategory = filteredPriceDetails.every(item => item.category);
    if (allHaveCategory) {
      const byCategory = filteredPriceDetails.filter(item => {
        if (typeof item.category === 'object') {
          return item.category?.name === currentCategory;
        }
        return item.category === currentCategory;
      });
      if (byCategory.length >= 2 && byCategory.length <= 4) {
        filteredPriceDetails = byCategory;
      } else if (byCategory.length > 4) {
        filteredPriceDetails = byCategory.slice(0, 4);
      } else {
        filteredPriceDetails = filteredPriceDetails.slice(0, 4);
      }
    } else {
      filteredPriceDetails = filteredPriceDetails.slice(0, 4);
    }
  } else if (Array.isArray(filteredPriceDetails)) {
    filteredPriceDetails = filteredPriceDetails.slice(0, 4);
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="bg-white font-sans">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Phần 1: Banner và Thông tin nhanh */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cột trái: Ảnh banner */}
          <div className="lg:col-span-2">
            <img 
              src={
                detail.image
                  ? detail.image.startsWith('http')
                    ? detail.image
                    : `http://localhost:8000${detail.image}`
                  : "https://via.placeholder.com/400x300?text=No+Image"
              }
              alt={detail.name} 
              className="w-full h-[450px] rounded-2xl object-cover"
            />
          </div>
          
          {/* Cột phải: Box thông tin nhanh */}
          <div className="lg:col-span-1 bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Thông tin nhanh</h3>
            {/* Thêm 'flex-grow' để phần này chiếm không gian thừa */}
            <div className="space-y-4 flex-grow">
              <div className="flex items-center">
                <Utensils className="w-6 h-6 text-blue-500 mr-4"/>
                <span className="text-gray-700">{quickInfo.type}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-blue-500 mr-4"/>
                <span className="text-gray-700">Mở cửa: {quickInfo.openingHours}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-500 mr-4"/>
                <span className="text-gray-700">Phù hợp: {quickInfo.suitableFor}</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-500 mr-4">$</span>
                <span className="text-gray-700">Giá: {quickInfo.priceRange}</span>
              </div>
            </div>
            {/* Các nút bấm sẽ được đẩy xuống dưới */}
            <div className="mt-8 space-y-3">
                <button className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    Lưu món ăn
                </button>
                <button className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300">
                    Chia sẻ
                </button>
            </div>
          </div>
        </div>

        {/* Phần 2: Tên, đánh giá, mô tả chi tiết */}
        <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{detail.name}</h1>
            {/* Cấu trúc lại phần đánh giá và thông tin */}
            <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center text-yellow-500 text-base">
            <StarRating rating={Number.isFinite(detail.rating) && detail.rating >= 0 && detail.rating <= 5 ? detail.rating : 0} />
            <span className="ml-2 text-gray-800 font-semibold text-base">{detail.rating}</span>
            <span className="ml-1 text-gray-500 text-sm">({detail.reviewsCount} đánh giá)</span>
          </div>
          <div className="flex items-center text-gray-700 text-base gap-6 mt-1">
            <span className="flex items-center"><Clock className="w-5 h-5 mr-1" />Thời gian: {infoRow.time}</span>
            <span className="flex items-center"><Leaf className="w-5 h-5 mr-1" />{infoRow.category}</span>
          </div>
        </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-4">Mô tả chi tiết</h2>
            <div className="text-gray-700 leading-relaxed space-y-4">
                {detailDescription.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>

        {/* Phần 3: Khoảng giá */}
        <div className="mb-12 w-full">
            <div className="w-full max-w-2xl ml-0">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Khoảng giá</h2>
                <div className="bg-blue-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.isArray(filteredPriceDetails) && filteredPriceDetails.length > 0 ? (
            filteredPriceDetails.map((item, index) => (
              <div key={index}>
                <p className="text-gray-800 font-semibold">{item.name}</p>
                <p className="font-bold text-2xl">
                  <span className="text-blue-600">{(item.price || '').replace(/đ|\s*VND/gi, '')}</span>
                  <span className="text-blue-600 font-semibold ml-1">VND</span>
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-500">Không có dữ liệu khoảng giá phù hợp.</div>
          )}
                </div>
            </div>
        </div>


        {/* Phần 4: Nhà hàng tiêu biểu */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Nhà hàng tiêu biểu</h2>
            <a href="#" className="text-orange-500 font-semibold hover:text-orange-600">Xem tất cả →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.isArray(detail.featuredRestaurants) && detail.featuredRestaurants.map((resto) => (
              <RestaurantCard key={resto.id} restaurant={resto} />
            ))}
          </div>
        </div>

        {/* Phần 5: Reviews được đánh giá cao */}
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Reviews được đánh giá cao</h2>
                <button className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                Viết đánh giá
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Thống kê review */}
                <div className="p-6 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
                    <p className="text-6xl font-bold text-gray-800">{detail.reviews?.average ?? '-'}</p>
                    <StarRating rating={Number.isFinite(detail.reviews?.average) && detail.reviews.average >= 0 && detail.reviews.average <= 5 ? detail.reviews.average : 0} />
                    <p className="text-gray-600 mt-2">Dựa trên {detail.reviews?.total ?? 0} đánh giá</p>
                    <div className="w-full mt-6 space-y-2">
                    {Array.isArray(detail.reviews?.distribution) && detail.reviews.distribution.map((dist) => (
                        <div key={dist.star} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{dist.star}</span>
                            <Star className="w-4 h-4 text-yellow-400" />
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${dist.percentage}%` }}></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8 text-right">{dist.percentage}%</span>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Danh sách review */}
                <div className="lg:col-span-2 space-y-6">
                    {Array.isArray(detail.reviews?.items) && detail.reviews.items.map((review) => (
                    <div key={review.id} className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center">
                                <img src={review.avatar} alt={review.author} className="w-12 h-12 rounded-full mr-4" />
                                <div>
                                    <p className="font-bold text-gray-800">{review.author}</p>
                                    <StarRating rating={Number.isFinite(review.rating) && review.rating >= 0 && review.rating <= 5 ? review.rating : 0}/>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.time}</span>
                        </div>
                        <p className="text-gray-700 my-4">{review.text}</p>
                        <div className="flex items-center text-gray-600">
                            <button className="flex items-center hover:text-blue-500">
                                <ThumbsUp className="w-5 h-5 mr-2" /> {review.likes}
                            </button>
                            <button className="flex items-center ml-6 hover:text-blue-500">
                                <MessageCircle className="w-5 h-5 mr-2" /> Trả lời
                            </button>
                        </div>
                    </div>
                    ))}
                    <button className="w-full bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300">
                        Xem thêm
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CulinaryDetail; 