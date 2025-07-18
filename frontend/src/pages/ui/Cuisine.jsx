import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaStar, FaUtensils, FaFireAlt, FaLeaf, FaFish, FaIceCream, FaHeart, FaChevronDown, FaChevronUp, FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";
import { Star as StarIcon, Clock, Flame, Soup, MapPin, ThumbsUp, MessageCircle, Users } from 'lucide-react';
import cuisineService from "../../services/cuisineService.js";
import categoryService from "../../services/categoryService.js";
import { FiChevronsDown } from "react-icons/fi";

// Danh sách icon cho các danh mục (dùng cho UI)
const categoryIcons = [
  <FaUtensils className="text-orange-400 text-2xl" />, // Phở
  <FaFireAlt className="text-pink-400 text-2xl" />,    // Bún bò Huế
  <FaLeaf className="text-yellow-400 text-2xl" />,     // Bánh mì
  <FaFish className="text-blue-400 text-2xl" />,       // Cá kho tộ
  <FaIceCream className="text-purple-400 text-2xl" />, // Chè
];

/**
 * Hàm render số sao đánh giá
 * @param {number} rating - Số điểm đánh giá (1-5)
 */
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStar key={i} className="text-yellow-300" />); // nửa sao
    } else {
      stars.push(<FaStar key={i} className="text-gray-300" />);
    }
  }
  return <span className="flex items-center">{stars}</span>;
};

/**
 * Hàm render nhãn miền với màu sắc
 * @param {string} region - Miền (Miền Bắc, Miền Trung, Miền Nam)
 */
const RegionBadge = ({ region }) => {
  let color = "bg-gray-100 text-gray-600";
  if (region === "Miền Bắc") color = "bg-blue-100 text-blue-600";
  if (region === "Miền Trung") color = "bg-orange-100 text-orange-600";
  if (region === "Miền Nam") color = "bg-green-100 text-green-600";
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${color}`}>{region}</span>
  );
};

/**
 * Nút tym (yêu thích món ăn)
 */
const HeartButton = ({ liked, onClick, size = 16 }) => (
  <button onClick={onClick} className="focus:outline-none">
    <FaHeart className={liked ? "text-red-500" : "text-gray-300"} size={size} />
  </button>
);

/**
 * Component chính hiển thị trang Ẩm thực
 */
const Cuisine = () => {
  // State cho dữ liệu từ API
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // Có thể xóa nếu không dùng
  const [reviews, setReviews] = useState([]); // Có thể xóa nếu không dùng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State lưu món ăn đã tym
  const [likedFoods, setLikedFoods] = useState({});
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [regionFilter, setRegionFilter] = useState('Tất cả');
  const [sortType, setSortType] = useState('Phổ biến');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const navigate = useNavigate();

  /**
   * Lấy dữ liệu từ backend API khi component mount
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy danh sách món ăn
        const cuisinesResponse = await cuisineService.getAllCuisines();
        const cuisinesData = cuisinesResponse.data || cuisinesResponse;
        
        // Lấy danh mục
        const categoriesResponse = await categoryService.getAllCategories();
        const categoriesData = categoriesResponse.data || categoriesResponse;

        // Chuyển đổi dữ liệu từ API sang format hiển thị
        const formattedFoods = cuisinesData.map(cuisine => ({
          id: cuisine.id,
          name: cuisine.name,
          region: cuisine.region,
          desc: cuisine.short_description,
          category_id: cuisine.category?.id, // Sử dụng đúng trường để lọc
          rating: 4.5, // Mock rating vì API chưa có
          reviews: Math.floor(Math.random() * 1000) + 100, // Mock reviews
          price: cuisine.price_formatted || `${cuisine.price}đ`,
          img: cuisine.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
          address: cuisine.address,
          time: cuisine.serving_time || "15-20 phút",
          delivery: cuisine.delivery,
        }));

        // Sửa map categories để lấy icon thực tế từ backend
        const formattedCategories = categoriesData.map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
        }));

        // Tính toán stats từ dữ liệu thực
        const totalCuisines = cuisinesData.length;
        const totalCategories = categoriesData.length;
        const avgRating = 4.8; // Mock average rating
        const totalReviews = formattedFoods.reduce((sum, food) => sum + food.reviews, 0);

        const calculatedStats = [
          { label: "Món ăn", value: totalCuisines, color: "text-yellow-500" },
          { label: "Danh mục", value: totalCategories, color: "text-blue-500" },
          { label: "Đánh giá", value: totalReviews, color: "text-fuchsia-600" },
          { label: "Điểm trung bình", value: avgRating, color: "text-green-600" },
        ];

        setStats(calculatedStats);
        setCategories(formattedCategories);
        setFoods(formattedFoods);
        // setRestaurants(mockRestaurants); // Nếu không dùng, có thể xóa
        // setReviews(mockReviews); // Nếu không dùng, có thể xóa

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Xử lý bấm nút tym (yêu thích món ăn)
   */
  const handleToggleLike = (foodName) => {
    setLikedFoods((prev) => ({ ...prev, [foodName]: !prev[foodName] }));
  };

  // Lọc món ăn theo miền
  const filteredFoods = regionFilter === 'Tất cả'
    ? foods
    : foods.filter(food => food.region === regionFilter);

  // Lọc theo danh mục
  const categoryFilteredFoods = selectedCategoryId === 'all'
    ? filteredFoods
    : filteredFoods.filter(food => String(food.category_id) === String(selectedCategoryId));

  // Lọc theo tìm kiếm
  const searchedFoods = categoryFilteredFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (food.desc && food.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sắp xếp món ăn theo sortType
  const sortedFoods = [...searchedFoods].sort((a, b) => {
    if (sortType === 'Phổ biến') {
      return b.reviews - a.reviews;
    } else if (sortType === 'Mới nhất') {
      return b.id - a.id;
    } else if (sortType === 'Giá tốt') {
      const getPrice = (price) => {
        if (!price) return 0;
        const match = price.toString().replace(/\./g, '').match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      return getPrice(a.price) - getPrice(b.price);
    }
    return 0;
  });

  // Số lượng sản phẩm tối đa trên trang đầu
  const MAX_PRODUCTS = 12;
  const displayedFoods = sortedFoods.slice(0, MAX_PRODUCTS);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Tiêu đề động cho danh sách món ăn
  let dynamicTitle = 'Món ăn nổi bật';
  let dynamicSubtitle = 'Những món ăn được yêu thích nhất tuần này';
  if (searchTerm.trim()) {
    dynamicTitle = `Kết quả tìm kiếm cho: "${searchTerm}"`;
    dynamicSubtitle = `Kết quả tìm kiếm cho từ khóa "${searchTerm}"`;
  } else if (selectedCategoryId !== 'all') {
    const selectedCat = categories.find(cat => String(cat.id) === String(selectedCategoryId));
    if (selectedCat) {
      dynamicTitle = `Món ăn thuộc danh mục: ${selectedCat.name}`;
      dynamicSubtitle = `Danh sách món ăn thuộc danh mục "${selectedCat.name}"`;
    }
  } else if (regionFilter !== 'Tất cả') {
    dynamicTitle = `Món ăn ${regionFilter.toLowerCase()}`;
    dynamicSubtitle = `Danh sách món ăn của ${regionFilter}`;
  } else if (sortType === 'Mới nhất') {
    dynamicTitle = 'Món ăn mới nhất';
    dynamicSubtitle = 'Những món ăn mới nhất vừa được cập nhật';
  } else if (sortType === 'Giá tốt') {
    dynamicTitle = 'Món ăn giá tốt';
    dynamicSubtitle = 'Những món ăn có giá tốt nhất hiện nay';
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner lớn full width */}
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-start bg-black/60" style={{backgroundImage: `url('https://images.unsplash.com/photo-1597345637412-9fd611e758f3')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 mt-8 md:mt-0">Khám Phá Ẩm Thực Việt Nam</h1>
          <p className="text-white text-lg md:text-xl mb-6">Hành trình khám phá hương vị đặc sắc từ Bắc đến Nam</p>
          <div className="w-full max-w-xl">
            <div className="relative w-full">
              {/* Icon kính lúp bên trái */}
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-lg pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn, Nhà hàng..."
                className="w-full pl-10 pr-12 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 focus:outline-none text-gray-700 text-base shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {/* Icon kính lúp bên phải */}
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-lg cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Thống kê */}
        <div className="flex flex-wrap justify-center items-center gap-8 py-6 w-full mt-6 relative z-20">
          {stats.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center min-w-[120px]">
              <span className={`text-2xl md:text-3xl font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
              <span className="text-gray-700 mt-1 font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Danh mục ẩm thực */}
        <div className="w-full mt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">Danh mục ẩm thực</h2>
            <div className="flex gap-2">
              <button
                className={`px-4 py-1 rounded-lg font-semibold transition-all ${selectedCategoryId === 'all' ? 'bg-gray-100 text-gray-800 font-bold' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedCategoryId('all')}
              >
                Tất cả
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
            {(showAllCategories ? categories : categories.slice(0, 6)).map((cat, idx) => (
              <button
                key={cat.id}
                className={`flex flex-col items-center bg-white rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer border-2 ${selectedCategoryId === cat.id ? 'border-orange-500 font-bold' : 'border-transparent'}`}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{ minWidth: 140 }}
              >
                {typeof cat.icon === 'string' && (cat.icon.endsWith('.png') || cat.icon.endsWith('.svg') || cat.icon.startsWith('category_icons/')) ? (
                  <img
                    src={
                      cat.icon.startsWith('http')
                        ? cat.icon
                        : `http://localhost:8000${cat.icon}`
                    }
                    alt={cat.name}
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  cat.icon
                )}
                <span className="mt-2 text-gray-700 text-sm md:text-base">{cat.name}</span>
              </button>
            ))}
          </div>
          {categories.length > 6 && (
            <div className="flex justify-center mb-4">
              <button
                className="flex items-center justify-center p-0 bg-transparent shadow-none border-none outline-none focus:outline-none group"
                style={{ minWidth: 40 }}
                onClick={() => setShowAllCategories((prev) => !prev)}
              >
                <span
                  className={`transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''} group-hover:animate-bounce-arrow`}
                >
                  <FiChevronsDown className="text-orange-500 text-3xl" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Món ăn nổi bật */}
        <div className="w-full mt-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{dynamicTitle}</h2>
              <p className="text-gray-500 text-sm">{dynamicSubtitle}</p>
            </div>
            <div className="flex gap-2 items-center">
              {['Phổ biến', 'Mới nhất', 'Giá tốt'].map(type => (
                <button
                  key={type}
                  className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${sortType === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSortType(type)}
                >
                  {type}
                </button>
              ))}
              <Link to="/cuisine/all" className="text-orange-500 font-semibold text-sm ml-2 hover:text-orange-600 transition">Xem tất cả &rarr;</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayedFoods.map((food, idx) => (
              <div
                key={food.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col h-full cursor-pointer"
                onClick={() => navigate(`/cuisine/${food.id}`)}
              >
                <img
                  src={
                    food.img
                      ? food.img.startsWith('http')
                        ? food.img
                        : `http://localhost:8000${food.img}`
                      : "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={food.name}
                  className="w-full h-36 object-cover rounded-t-xl"
                />
                <div className="flex-1 flex flex-col p-4">
                  {/* Dòng 1: Tên món ăn và nhãn miền */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 text-base">{food.name}</span>
                    <RegionBadge region={food.region} />
                  </div>
                  {/* Dòng 2: Mô tả */}
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2">{food.desc}</p>
                  {/* Dòng 3: Đánh giá và giá tiền */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center text-sm">
                      <StarRating rating={food.rating} />
                      <span className="ml-2 font-bold text-gray-700">{food.rating}</span>
                      <span className="ml-1 text-gray-400">({food.reviews.toLocaleString()})</span>
                    </div>
                    <span className="text-orange-500 font-bold text-base">{food.price}</span>
                  </div>
                  {/* Dòng 4: Địa chỉ/thời gian (trái), tym/giao hàng (phải) */}
                  <div className="flex justify-between items-start mt-auto pt-1 text-xs text-gray-500">
                    {/* Cột trái */}
                    <div className="flex flex-col">
                      <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{food.address}</span>
                      <span className="flex items-center mt-1"><svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>{food.time}</span>
                    </div>
                    {/* Cột phải */}
                    <div className="flex flex-col items-end">
                      <HeartButton liked={!!likedFoods[food.name]} onClick={(e) => { e.preventDefault(); handleToggleLike(food.name); }} size={14} />
                      {food.delivery && <span className="flex items-center text-green-500 mt-1"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 17a2 2 0 104 0 2 2 0 00-4 0zM17 17a2 2 0 104 0 2 2 0 00-4 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 17V7a2 2 0 012-2h10a2 2 0 012 2v10" /></svg>Giao hàng</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sortedFoods.length > MAX_PRODUCTS && (
            <div className="flex justify-center mt-6">
              <Link to="/cuisine/all" className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">
                Xem thêm món ăn
              </Link>
            </div>
          )}
        </div>

        {/* Nhà hàng được đề xuất */}
        <div className="w-full mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Nhà hàng được đề xuất</h2>
            <a href="#" className="text-orange-500 font-semibold text-sm">Xem tất cả &rarr;</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurants.map((res, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow hover:shadow-lg transition flex items-center p-4 gap-4">
                <img src={res.img} alt={res.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-lg">{res.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600 font-medium">{res.status}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{res.desc}</p>
                  <div className="flex items-center text-sm mb-1">
                    <StarRating rating={res.rating} />
                    <span className="ml-2 font-bold text-gray-700">{res.rating}</span>
                    <span className="ml-1 text-gray-400">({res.reviews.toLocaleString()})</span>
                    <span className="ml-2 text-gray-500">{res.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{res.address}</span>
                    <span>{res.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cuisine; 