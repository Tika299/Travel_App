import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom"; // Import Link nếu bạn muốn liên kết đến trang chi tiết

import { getAllCheckinPlaces } from "../../../services/ui/CheckinPlace/checkinPlaceService";
import { getSuggestedHotels } from "../../../services/ui/Hotel/hotelService";
import { getSuggestedDishes } from "../../../services/ui/Dish/dishService";
import { getSuggestedRestaurant } from "../../../services/ui/Restaurant/restaurantService";
import { getSuggestedTransportation } from "../../../services/ui/Transportation/transportationService";
import bannerImage from "../../../assets/images/banner.png";

const CheckinPlacePage = () => {
  // --- State quản lý dữ liệu và trạng thái tải ---
  const [places, setPlaces] = useState([]);
  const [suggestedHotels, setSuggestedHotels] = useState([]);
  const [suggestedDishes, setSuggestedDishes] = useState([]);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState([]);
  const [suggestedTransportations, setSuggestedTransportations] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State quản lý bộ lọc và sắp xếp cho phần 'Gợi ý điểm đến' chính ---
const [searchTermInput, setSearchTermInput] = useState(""); // 👉 Thêm dòng này
const [searchTerm, setSearchTerm] = useState("");

  const [regionFilter, setRegionFilter] = useState("Tất cả miền");
  const [placeTypeFilter, setPlaceTypeFilter] = useState("Tất cả"); // 'Tất cả', 'Miễn phí', 'Có phí', 'Biển', 'Núi', 'Thành phố'
  const [sortOrder, setSortOrder] = useState("popular"); // 'popular', 'newest', 'rating'

  // --- State quản lý số lượng mục hiển thị cho từng phần (cho chức năng "Xem thêm") ---
  const [visibleCounts, setVisibleCounts] = useState({
    mainPlaces: 3, // Cho phần 'Gợi ý điểm đến' (có áp dụng bộ lọc)
    popularPlaces: 4, // Cho phần 'Địa điểm phổ biến' (có thể hiển thị tất cả, không bị bộ lọc ảnh hưởng)
    hotels: 3,
    dishes: 3,
    transports: 4,
    restaurants: 2,
  });

  // --- useEffect để gọi API khi component được mount ---
  useEffect(() => {
    fetchData();
  }, []); // [] đảm bảo chỉ chạy một lần khi component được mount

  // --- Hàm fetch dữ liệu từ API ---
  const fetchData = async () => {
    try {
      const resPlaces = await getAllCheckinPlaces();
      // Lọc các địa điểm có status là 'active'
      const activePlaces =
        resPlaces.data?.data?.filter((p) => p.status === "active") || [];
      setPlaces(activePlaces);

      const hotelRes = await getSuggestedHotels();
      setSuggestedHotels(hotelRes.data?.data || []);

      const dishRes = await getSuggestedDishes();
      setSuggestedDishes(dishRes.data?.data || []);

      const restaurantRes = await getSuggestedRestaurant();
      setSuggestedRestaurants(restaurantRes.data?.data || []);




      const transportationRes = await getSuggestedTransportation();
      setSuggestedTransportations(transportationRes.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  

  // --- Hàm xử lý khi nhấn "Xem thêm" ---
  const handleShowMore = (section) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [section]: prev[section] + 6, // Tăng số lượng hiển thị thêm 6 mục
    }));
  };

  // --- Hàm hỗ trợ phân tích chuỗi JSON hoặc chuỗi ngăn cách bằng dấu phẩy ---
  const parseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Fallback cho chuỗi ngăn cách bằng dấu phẩy
      return String(data)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
  };

  // --- Hàm hiển thị giờ hoạt động (cho Place) ---
  const renderOperatingHours = (hours) => {
    const data = parseArray(hours);
    if (!Array.isArray(data) || data.length === 0) return "—";
    // Giả định chỉ hiển thị mục đầu tiên hoặc định dạng lại tùy theo cấu trúc data
    const first = data[0];
    return (
      <div className="ml-2 text-sm text-gray-700">
        <div>Mở cửa: {first?.open || "—"}</div>
        <div>Đóng cửa: {first?.close || "—"}</div>
      </div>
    );
  };

  // --- Hàm hiển thị các tùy chọn phương tiện (cho Place) ---
  const renderTransportOptions = (options) => {
    const data = parseArray(options);
    if (!Array.isArray(data) || data.length === 0) return <span>Không có</span>;
    return (
      <ul className="list-disc list-inside text-sm text-gray-700">
        {data.map((opt, i) => (
          <li key={i}>{opt.trim()}</li>
        ))}
      </ul>
    );
  };

  // --- Logic lọc và sắp xếp cho phần "Gợi ý điểm đến" chính (sử dụng useMemo để tối ưu) ---
  const filteredAndSortedMainPlaces = useMemo(() => {
    let currentPlaces = [...places]; // Bắt đầu với tất cả địa điểm đã active

    // 1. Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      currentPlaces = currentPlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (place.description &&
            place.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (place.address &&
            place.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 2. Lọc theo miền
    if (regionFilter !== "Tất cả miền") {
      currentPlaces = currentPlaces.filter(
        (place) =>
          (place.region || "").trim().toLowerCase() ===
          regionFilter.toLowerCase()
      );
    }

    // 3. Lọc theo loại địa điểm (Miễn phí/Có phí hoặc loại cụ thể như Biển, Núi, Thành phố)
    if (placeTypeFilter !== "Tất cả") {
      currentPlaces = currentPlaces.filter((place) => {
        if (placeTypeFilter === "Miễn phí") {
          return place.is_free === true;
        } else if (placeTypeFilter === "Có phí") {
          return place.is_free === false;
        }
        // Nếu có trường `type` cụ thể trong dữ liệu `place`
        return (
          (place.type || "").trim().toLowerCase() ===
          placeTypeFilter.toLowerCase()
        );
      });
    }

    // 4. Sắp xếp
    currentPlaces.sort((a, b) => {
      if (sortOrder === "newest") {
        // Giả định có trường `createdAt` hoặc `updatedAt` để sắp xếp theo mới nhất
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortOrder === "rating") {
        // Sắp xếp theo đánh giá giảm dần
        return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      }
      // 'popular' hoặc mặc định: không sắp xếp cụ thể ở đây, giữ nguyên thứ tự ban đầu
      // Hoặc bạn có thể thêm một trường 'popularityScore' vào dữ liệu để sắp xếp
      return 0;
    });

    return currentPlaces;
  }, [places, searchTerm, regionFilter, placeTypeFilter, sortOrder]);

  // --- Hàm render thẻ (card) chung cho tất cả các loại item ---
  const renderCard = (item, type) => {
    let linkPath = "#"; // Mặc định không có link
    if (type === "places" && item.id) {
      linkPath = `/checkin-places/${item.id}`; // Đường dẫn đến trang chi tiết địa điểm
    }
    // Bạn có thể thêm các link khác cho khách sạn, món ăn, v.v. nếu có trang chi tiết



   const cardContent = (
  <>
    {/* Ảnh chính */}
    {item.image ? (
      <img
        src={`http://localhost:8000/storage/${item.image}`}
        alt={item.name}
        className="w-full h-40 object-cover rounded mb-2"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/path/to/placeholder-image.jpg";
        }}
      />
    ) : (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
        Không có ảnh
      </div>
    )}

    {/* Tên có kèm icon */}
    <div className="flex items-center gap-2 mb-1">
      {item.icon && (
        <img
          src={`http://localhost:8000/storage/${item.icon}`}
          alt="icon"
          className="w-5 h-5 object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-icon.png";
          }}
        />
      )}




<div className="flex justify-between items-center mb-1 w-full">
  <h3 className="font-semibold text-black text-base truncate max-w-[75%]">
    {item.name || "Không có tên"}
  </h3>
  <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap">
    <span className="mr-1">⭐</span>
    {item.rating || "Chưa đánh giá"}
  </div>
</div>









    </div>



    {/* Phần nội dung tùy theo loại */}
  {type === "places" && (
  <>
    <p className="text-sm text-gray-600 line-clamp-2">
       {item.address || "Không có tỉnh"}
    </p>


    <p className="text-sm text-gray-600 line-clamp-2">
      {item.description || "Không có mô tả"}
    </p>
  </>
)}


    {type === "hotels" && (
      <>
        <p className="text-sm text-gray-600">{item.address || "—"}</p>
        <p className="text-sm text-yellow-600">⭐ {item.rating || "4.5"} / 5</p>
        <p className="text-sm text-black-500">
          {item.price ? `${Number(item.price).toLocaleString()} đ/đêm` : "—"}
        </p>
      </>
    )}

    {type === "dishes" && (
      <>
        <p className="text-sm text-gray-600 line-clamp-2">
          {item.description || "Không có mô tả"}
        </p>
        <p className="text-sm text-yellow-500">
          🍽️ Nhà hàng: {item.restaurant?.name || "Không rõ"}
        </p>
        <p className="text-sm text-black-500">
          {item.price ? `${Number(item.price).toLocaleString()} đ` : "—"}
        </p>
      </>
    )}

    {type === "transports" && (
      <>

        <p className="text-black-500 mt-1">
          Giá trung bình:
          {item.average_price
            ? `${Number(item.average_price).toLocaleString()} đ`
            : "—"}
        </p>
      </>
    )}

    {type === "restaurants" && (
      <>
        <p className="text-sm text-gray-600 line-clamp-2">
          {item.description || "Không có mô tả"}
        </p>
        <p className="text-sm text-gray-500">📍 {item.address || "—"}</p>
        <p className="text-sm text-yellow-500">
          ⭐ {item.rating || "—"} / 5
        </p>
        <p className="text-sm text-black-500">
          💸 {item.price_range || "—"}
        </p>
      </>
    )}
  </>
);


    return (
      <Link
        to={linkPath}
        key={item.id || `${item.name}-${type}`} // Key duy nhất cho mỗi card
        className="block h-full" // Đảm bảo thẻ có cùng chiều cao
      >
        <div className="border rounded p-3 bg-white shadow hover:shadow-md transition duration-200 h-full flex flex-col justify-between">
          {cardContent}
        </div>
      </Link>
    );
  };

  return (
    
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* --- Phần Banner --- */}
      <div
        className="relative bg-cover bg-center h-[400px] flex items-center justify-start" // Đã thay justify-center thành justify-start
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
     
        <div className="relative text-white z-10 px-4 max-w-3xl ml-20">
          {" "}
         
          <h1 className="text-5xl md:text-4xl font-bold mb-4 text-left">
            {" "}
          
            KHÁM PHÁ ĐIỂM ĐẾN TUYỆT VỜI
          </h1>
          <p className="text-lg mb-6 text-left">
            {" "}
        
            Trải nghiệm những địa điểm tuyệt vời, ẩm thực đặc sắc và văn hóa độc
            đáo
          </p>
          <div className="flex items-center justify-start gap-2">
            {" "}
            {/* Đã thay justify-center thành justify-start */}
           <input
  type="text"
  placeholder="📍 Tìm kiếm địa điểm..."
  className="bg-transparent placeholder-white px-4 py-2 rounded-md w-full md:w-64 focus:outline-none text-white shadow-inner border border-white"
  value={searchTermInput}
  onChange={(e) => setSearchTermInput(e.target.value)}
/>

           <button
  onClick={() => setSearchTerm(searchTermInput)}
  className="bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200"
>
  <span className="hidden md:inline "><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></span> Tìm kiếm
</button>

          </div>
        </div>
      </div>

      {/* --- Phần Bộ lọc và Sắp xếp --- */}
      <div className="bg-white py-4 px-6 flex flex-wrap  gap-4 shadow-sm border-b border-gray-200 mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="region-filter" className="font-medium text-gray-700">
            Lọc theo:
          </label>
          <select
            id="region-filter"
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="Tất cả miền">Tất cả miền</option>
            <option value="Bắc">Miền Bắc</option>
            <option value="Trung">Miền Trung</option>
            <option value="Nam">Miền Nam</option>
          </select>
          <select
            id="type-filter"
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={placeTypeFilter}
            onChange={(e) => setPlaceTypeFilter(e.target.value)}
          >
            <option value="Tất cả">Loại địa điểm</option>
            <option value="Miễn phí">Miễn phí</option>
            <option value="Có phí">Có phí</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-md ms-20 text-sm transition-colors duration-200 ${
              sortOrder === "popular"
                ? "bg-red-500 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSortOrder("popular")}
          >
            Phổ biến
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
              sortOrder === "newest"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSortOrder("newest")}
          >
            Mới nhất
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
              sortOrder === "rating"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSortOrder("rating")}
          >
            Đánh giá cao
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg my-6">
        {/* --- Phần "Địa điểm gần đây" --- */}
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
          Địa điểm gần đây
        </h2>
        <div className="mb-10 flex justify-center">
          <img
            src="/Uploads/cb281260-2ca2-4970-90c9-22ab6253f694.png"
            alt="Địa điểm gần đây"
            className="w-full max-w-4xl h-64 object-cover rounded-lg shadow-md"
          />
        </div>


        {/* --- Phần "Gợi ý điểm đến" (được lọc và sắp xếp) --- */}
  <h2 className="text-2xl font-bold text-black-600 ">Gợi ý điểm đến</h2>
  <p className="pb-10">Khám phá những địa điểm tuyệt vời cho chuyến đi của bạn</p>

<div className="flex justify-between items-center mb-2 pb-2">
  <h2 className="text-2xl font-bold text-black-600">Điểm đến nổi bật</h2>

  <button
    onClick={() => handleShowMore("mainPlaces")}
    className="text-pink-600 hover:underline text-sm font-medium "
  >
    Xem tất cả ⭢
  </button>
</div>



        {loading ? (
          <p className="text-center text-gray-500">Đang tải địa điểm...</p>
        ) : filteredAndSortedMainPlaces.length === 0 ? (
          <p className="text-center text-gray-500">
            Không tìm thấy địa điểm nào phù hợp với tiêu chí tìm kiếm và lọc của
            bạn.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5 justify-items-center">
              {" "}
          
              {filteredAndSortedMainPlaces
                .slice(0, visibleCounts.mainPlaces)
                .map((place) => renderCard(place, "places"))}
            </div>
            {visibleCounts.mainPlaces < filteredAndSortedMainPlaces.length && (
              <div className="text-center mt-8">
  
              </div>
            )}
          </>
        )}
      </div>

 {/* Địa điểm phổ biến */}
<section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg my-6">
  {/* Tiêu đề + Xem tất cả */}
  <div className="flex justify-between items-center mb-4 border-b pb-2">
    <h2 className="text-2xl font-bold text-gray-800">
      Địa điểm phổ biến
    </h2>
    <button
      onClick={() => handleShowMore("mainPlaces")}
      className="text-pink-600 hover:underline text-sm font-medium"
    >
      Xem tất cả ⭢
    </button>
  </div>

  {/* Lưới hiển thị địa điểm */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5 justify-items-center">
    {places
      .sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))
      .slice(0, visibleCounts.popularPlaces)
      .map((place) => renderCard(place, "places"))}
  </div>

  {/* Nút Xem thêm nếu còn địa điểm */}
  {visibleCounts.popularPlaces < places.length && (
    <div className="flex justify-center mt-8">
      <button
        onClick={() => handleShowMore("popularPlaces")}
        className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
      >
        Xem thêm địa điểm
      </button>
    </div>
  )}
</section>


      {/* Khách sạn đề xuất */}
      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg my-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 text-center">
          Khách sạn đề xuất
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải khách sạn...</p>
        ) : suggestedHotels.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có khách sạn nào được đề xuất.
          </p>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 justify-items-center">

              {suggestedHotels
                .slice(0, visibleCounts.hotels)
                .map((hotel) => renderCard(hotel, "hotels"))}
            </div>
            {visibleCounts.hotels < suggestedHotels.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => handleShowMore("hotels")}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-lg font-semibold shadow-md"
                >
                  Xem thêm khách sạn
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Món ăn đặc sản */}
      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg my-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 text-center">
          Món ăn đặc sản
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải món ăn...</p>
        ) : suggestedDishes.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có món ăn nào được đề xuất.
          </p>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 justify-items-center">

              {suggestedDishes
                .slice(0, visibleCounts.dishes)
                .map((dish) => renderCard(dish, "dishes"))}
            </div>
            {visibleCounts.dishes < suggestedDishes.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => handleShowMore("dishes")}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-lg font-semibold shadow-md"
                >
                  Xem thêm món ăn
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Phương tiện di chuyển */}
      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg my-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 text-center">
          Phương tiện di chuyển
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải phương tiện...</p>
        ) : suggestedTransportations.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có phương tiện nào được đề xuất.
          </p>
        ) : (
          <>



            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
              {suggestedTransportations
                .slice(0, visibleCounts.transports)
                .map((transport) => renderCard(transport, "transports"))}
            </div>
            {visibleCounts.transports < suggestedTransportations.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => handleShowMore("transports")}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-lg font-semibold shadow-md"
                >
                  Xem thêm phương tiện
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Nhà hàng/Quán ăn */}
      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg my-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 text-center">
          Nhà hàng/Quán ăn
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải nhà hàng...</p>
        ) : suggestedRestaurants.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có nhà hàng nào được đề xuất.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5 justify-items-center">
              {" "}
              {/* Đã sửa thành lg:grid-cols-2 và xl:grid-cols-2 */}
              {suggestedRestaurants
                .slice(0, visibleCounts.restaurants)
                .map((restaurant) => renderCard(restaurant, "restaurants"))}
            </div>
            {visibleCounts.restaurants < suggestedRestaurants.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => handleShowMore("restaurants")}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-lg font-semibold shadow-md"
                >
                  Xem thêm nhà hàng
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CheckinPlacePage;
