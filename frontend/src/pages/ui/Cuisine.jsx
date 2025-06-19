import React, { useEffect, useState } from "react";
import { FaSearch, FaStar, FaUtensils, FaFireAlt, FaLeaf, FaFish, FaIceCream, FaHeart } from "react-icons/fa";

// Mock icon cho các danh mục
const categoryIcons = [
  <FaUtensils className="text-orange-400 text-2xl" />, // Phở
  <FaFireAlt className="text-pink-400 text-2xl" />,    // Bún bò Huế
  <FaLeaf className="text-yellow-400 text-2xl" />,     // Bánh mì
  <FaLeaf className="text-green-400 text-2xl" />,      // Gỏi cuốn
  <FaFish className="text-blue-400 text-2xl" />,       // Cá kho tộ
  <FaIceCream className="text-purple-400 text-2xl" />, // Chè
];

// Mock data, sau này sẽ lấy từ backend
const mockStats = [
  { label: "Món ăn", value: 5678, color: "text-yellow-500" },
  { label: "Nhà hàng", value: 123, color: "text-blue-500" },
  { label: "Đánh giá", value: 12345, color: "text-fuchsia-600" },
  { label: "Điểm trung bình", value: 4.8, color: "text-green-600" },
];

const mockCategories = [
  { name: "Phở", icon: categoryIcons[0] },
  { name: "Bún bò Huế", icon: categoryIcons[1] },
  { name: "Bánh mì", icon: categoryIcons[2] },
  { name: "Gỏi cuốn", icon: categoryIcons[3] },
  { name: "Cá kho tộ", icon: categoryIcons[4] },
  { name: "Chè", icon: categoryIcons[5] },
];

const mockFoods = [
  {
    name: "Phở Bò Hà Nội",
    region: "Miền Bắc",
    desc: "Món ăn truyền thống với nước dùng trong, thịt bò tươi ngon",
    rating: 4.9,
    reviews: 1200,
    price: "45,000đ",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    address: "Phở Lý Quốc Sư",
    time: "15-20 phút",
    delivery: true,
  },
  {
    name: "Bánh Mì Thịt Nướng",
    region: "Miền Nam",
    desc: "Bánh mì giòn với thịt nướng thơm lừng, rau sống tươi mát",
    rating: 4.7,
    reviews: 890,
    price: "25,000đ",
    img: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    address: "Quận 1, TP.HCM",
    time: "5-10 phút",
    delivery: true,
  },
  {
    name: "Bún Bò Huế",
    region: "Miền Trung",
    desc: "Món bún đặc trưng xứ Huế với vị cay nồng đậm đà",
    rating: 4.8,
    reviews: 756,
    price: "40,000đ",
    img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
    address: "Thành phố Huế",
    time: "20-25 phút",
    delivery: true,
  },
  {
    name: "Cơm Tấm Sườn Nướng",
    region: "Miền Nam",
    desc: "Cơm tấm thơm ngon với sườn nướng đặc biệt",
    rating: 4.5,
    reviews: 500,
    price: "35,000đ",
    img: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
    address: "TP.HCM",
    time: "10-15 phút",
    delivery: false,
  },
];

const mockRestaurants = [
  {
    name: "Quán Phở Thin",
    desc: "Phở truyền thống Hà Nội từ 1979",
    rating: 4.9,
    reviews: 2100,
    price: "$$",
    address: "13 Lò Đức, Hai Bà Trưng",
    distance: "2.5km",
    status: "Đang mở",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Bánh Mì Huỳnh Hoa",
    desc: "Bánh mì Sài Gòn nổi tiếng",
    rating: 4.6,
    reviews: 1800,
    price: "$",
    address: "26 Lê Thị Riêng, Q1",
    distance: "1.2km",
    status: "Đang mở",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
  },
];

const mockReviews = [
  {
    name: "Nguyễn Mai Anh",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5.0,
    comment: "Phở bò ở đây thật sự tuyệt vời! Thịt bò tươi, mềm. Giá cả hợp lý, phục vụ nhiệt tình. Sẽ quay lại nhiều lần nữa!",
    food: "Phở Bò Hà Nội",
    time: "2 ngày trước",
  },
  {
    name: "Trần Minh Đức",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 4.0,
    comment: "Bánh mì thịt nướng ngon, bánh giòn, thịt thơm. Rau sống tươi, sốt vừa miệng. Nhìn chung vẫn ổn.",
    food: "Bánh Mì Thịt Nướng",
    time: "1 tuần trước",
  },
  {
    name: "Lê Thị Hương",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5.0,
    comment: "Bún bò Huế chuẩn vị xứ Huế! Nước dùng đậm đà, cay nồng vừa phải. Thịt bò mềm, chả cua thơm ngon. Không gian quán sạch sẽ, thoáng mát.",
    food: "Bún Bò Huế",
    time: "3 ngày trước",
  },
  {
    name: "Phạm Văn Hùng",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 4.5,
    comment: "Cơm tấm sườn nướng ở đây rất ngon! Sườn nướng thơm, cơm tấm dẻo. Đồ chua ngọt vừa miệng. Giá hơi cao nhưng chất lượng xứng đáng.",
    food: "Cơm Tấm Sườn Nướng",
    time: "5 ngày trước",
  },
  {
    name: "Vũ Thị Lan",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    rating: 5.0,
    comment: "Gỏi cuốn tôm thịt tươi ngon, bánh tráng mỏng, tôm to. Nước chấm đậm đà. Nhân viên phục vụ chu đáo. Quán sạch sẽ, view đẹp. Recommend!",
    food: "Gỏi Cuốn Tôm Thịt",
    time: "1 ngày trước",
  },
  {
    name: "Hoàng Minh Tuấn",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    rating: 4.0,
    comment: "Bánh xèo giòn rụm, nhân đầy đặn với tôm, thịt. Rau sống đa dạng, nước chấm chua ngọt hấp dẫn. Thời gian chờ hơi lâu nhưng đáng để thử.",
    food: "Bánh Xèo Miền Tây",
    time: "4 ngày trước",
  },
];

// Hàm render 5 sao theo rating
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStar key={i} className="text-yellow-300" />); // nửa sao (có thể dùng icon khác nếu muốn)
    } else {
      stars.push(<FaStar key={i} className="text-gray-300" />);
    }
  }
  return <span className="flex items-center">{stars}</span>;
};

// Hàm render nhãn miền với màu sắc
const RegionBadge = ({ region }) => {
  let color = "bg-gray-100 text-gray-600";
  if (region === "Miền Bắc") color = "bg-blue-100 text-blue-600";
  if (region === "Miền Trung") color = "bg-orange-100 text-orange-600";
  if (region === "Miền Nam") color = "bg-green-100 text-green-600";
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${color}`}>{region}</span>
  );
};

// Nút tym (yêu thích)
const HeartButton = ({ liked, onClick, size = 16 }) => (
  <button onClick={onClick} className="focus:outline-none">
    <FaHeart className={liked ? "text-red-500" : "text-gray-300"} size={size} />
  </button>
);

const Cuisine = () => {
  // State cho dữ liệu, sau này sẽ lấy từ backend
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  // State lưu món ăn đã tym
  const [likedFoods, setLikedFoods] = useState({});

  // Lấy dữ liệu từ backend (hiện tại dùng mock)
  useEffect(() => {
    // TODO: Gọi API backend ở đây
    setStats(mockStats);
    setCategories(mockCategories);
    setFoods(mockFoods);
    setRestaurants(mockRestaurants);
    setReviews(mockReviews);
  }, []);

  // Xử lý bấm tym
  const handleToggleLike = (foodName) => {
    setLikedFoods((prev) => ({ ...prev, [foodName]: !prev[foodName] }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner lớn full width */}
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-start bg-black/60" style={{backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 w-full flex flex-col items-start justify-center pl-4 md:pl-24">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 mt-8 md:mt-0">KHÁM PHÁ ẨM THỰC VIỆT NAM</h1>
          <p className="text-white text-lg md:text-xl mb-6">Hành trình khám phá hương vị đặc sắc từ Bắc đến Nam</p>
          <div className="w-full max-w-xl">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn, Nhà hàng..."
                className="w-full pl-10 pr-32 py-3 rounded-full bg-white/90 focus:outline-none text-gray-700 text-base shadow"
              />
              <button className="absolute top-1/2 right-2 -translate-y-1/2 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-full shadow transition text-base">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="flex flex-wrap justify-center items-center gap-8 py-6 w-full px-[120px] mt-6 relative z-20">
        {stats.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center min-w-[120px]">
            <span className={`text-2xl md:text-3xl font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
            <span className="text-gray-700 mt-1 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Danh mục ẩm thực */}
      <div className="w-full px-[70px] mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">Danh mục ẩm thực</h2>
          <div className="flex gap-2">
            <button className="px-4 py-1 rounded-lg bg-orange-500 text-white font-semibold">Tất cả</button>
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold">Miền Bắc</button>
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold">Miền Trung</button>
            <button className="px-4 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold">Miền Nam</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col items-center bg-white rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer">
              {cat.icon}
              <span className="mt-2 font-semibold text-gray-700 text-sm md:text-base">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Món ăn nổi bật */}
      <div className="w-full px-[70px] mt-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Món ăn nổi bật</h2>
            <p className="text-gray-500 text-sm">Những món ăn được yêu thích nhất tuần này</p>
          </div>
          <div className="flex gap-2 items-center">
            <button className="px-3 py-1 rounded-lg bg-orange-500 text-white font-semibold text-sm">Phổ biến</button>
            <button className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm">Mới nhất</button>
            <button className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm">Giá tốt</button>
            <a href="#" className="text-orange-500 font-semibold text-sm ml-2">Xem tất cả &rarr;</a>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {foods.map((food, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col h-full">
              <img src={food.img} alt={food.name} className="w-full h-36 object-cover rounded-t-xl" />
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
                    <HeartButton liked={!!likedFoods[food.name]} onClick={() => handleToggleLike(food.name)} size={14} />
                    {food.delivery && <span className="flex items-center text-green-500 mt-1"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 17a2 2 0 104 0 2 2 0 00-4 0zM17 17a2 2 0 104 0 2 2 0 00-4 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 17V7a2 2 0 012-2h10a2 2 0 012 2v10" /></svg>Giao hàng</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nhà hàng được đề xuất */}
      <div className="w-full px-[70px] mt-8">
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

      {/* Đánh giá từ thực khách */}
      <div className="w-full px-[70px] mt-12 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Đánh giá từ thực khách</h2>
        <p className="text-gray-500 text-center mb-8">Khám phá những trải nghiệm ẩm thực tuyệt vời qua lời kể của hàng nghìn thực khách đã thưởng thức</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {reviews.map((rv, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-5 flex flex-col h-full">
              <div className="flex items-center mb-2">
                <img src={rv.avatar} alt={rv.name} className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <span className="font-semibold text-gray-800 text-sm">{rv.name}</span>
                  <div className="flex items-center text-yellow-500 text-xs">
                    <StarRating rating={rv.rating} />
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-3 flex-1">"{rv.comment}"</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                <span>🍽 {rv.food}</span>
                <span>{rv.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <a href="#" className="text-orange-500 font-semibold text-sm">Xem tất cả &rarr;</a>
        </div>
      </div>
    </div>
  );
};

export default Cuisine; 