import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate

import { getAllCheckinPlaces } from "../../../services/ui/CheckinPlace/checkinPlaceService";
import { getSuggestedHotels } from "../../../services/ui/Hotel/hotelService";
import { getSuggestedDishes } from "../../../services/ui/Dish/dishService";
import { getSuggestedRestaurant } from "../../../services/ui/Restaurant/restaurantService";
import { getSuggestedTransportations } from "../../../services/ui/Transportation/transportationService";
import bannerImage from "../../../assets/images/banner.png";

const HeartIcon = ({ filled = false, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`w-6 h-6 ${filled ? "text-red-500" : "text-white"} ${className}`}
  >
    {filled ? (
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    ) : (
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    )}
  </svg>
);

const CheckinPlacePage = () => {
  const [places, setPlaces] = useState([]);
  const [suggestedHotels, setSuggestedHotels] = useState([]);
  const [suggestedDishes, setSuggestedDishes] = useState([]);
  const [suggestedRestaurants, setSuggestedRestaurants] = useState([]);
  const [suggestedTransportations, setSuggestedTransportations] = useState([]);
  const [loading, setLoading] = useState(true);

  // State mới để quản lý danh sách ID của các mục yêu thích
  const [favoritePlaceIds, setFavoritePlaceIds] = useState(() => {
    // Lấy danh sách yêu thích từ localStorage khi khởi tạo
    try {
      const storedFavorites = localStorage.getItem("favoritePlaceIds");
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Lỗi khi đọc favorites từ localStorage:", error);
      return [];
    }
  });

  // Sử dụng useEffect để lưu favoritePlaceIds vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem("favoritePlaceIds", JSON.stringify(favoritePlaceIds));
  }, [favoritePlaceIds]);

  const [searchTermInput, setSearchTermInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("Tất cả miền");
  const [placeTypeFilter, setPlaceTypeFilter] = useState("Tất cả");
  const [sortOrder, setSortOrder] = useState("popular");

  const showMoreIncrement = 6;
  const itemsPerPageInPagination = 12;
  const initialVisibleCounts = useMemo(
    () => ({
      mainPlaces: 3,
      popularPlaces: 4,
      hotels: 3,
      dishes: 3,
      transports: 4,
      restaurants: 2,
    }),
    []
  );

  const [mainPlacesState, setMainPlacesState] = useState({
    visibleCount: initialVisibleCounts.mainPlaces,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [popularPlacesState, setPopularPlacesState] = useState({
    visibleCount: initialVisibleCounts.popularPlaces,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [hotelsState, setHotelsState] = useState({
    visibleCount: initialVisibleCounts.hotels,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [dishesState, setDishesState] = useState({
    visibleCount: initialVisibleCounts.dishes,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [transportsState, setTransportsState] = useState({
    visibleCount: initialVisibleCounts.transports,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [restaurantsState, setRestaurantsState] = useState({
    visibleCount: initialVisibleCounts.restaurants,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resPlaces = await getAllCheckinPlaces();
      const activePlaces =
        resPlaces.data?.data
          ?.filter((p) => p.status === "active")
          ?.map((place) => ({
            ...place,
            specialties_count: Math.floor(Math.random() * 20) + 5, // Random 5-24
          })) || [];
      setPlaces(activePlaces);

      const hotelRes = await getSuggestedHotels();
      setSuggestedHotels(hotelRes.data?.data || []);

      const dishRes = await getSuggestedDishes();
      setSuggestedDishes(dishRes.data?.data || []);

      const restaurantRes = await getSuggestedRestaurant();
      setSuggestedRestaurants(restaurantRes.data?.data || []);
      const transportationRes = await getSuggestedTransportations();
      setSuggestedTransportations(transportationRes.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (sectionSetter, pageNumber) => {
    sectionSetter((prev) => ({
      ...prev,
      currentPage: pageNumber,
      isPaginatedMode: true,
      visibleCount: 0,
    }));
  };

  const handleShowMore = (sectionName) => {
    const sectionStateMap = {
      mainPlaces: mainPlacesState,
      popularPlaces: popularPlacesState,
      hotels: hotelsState,
      dishes: dishesState,
      transports: transportsState,
      restaurants: restaurantsState,
    };
    const sectionSetterMap = {
      mainPlaces: setMainPlacesState,
      popularPlaces: setPopularPlacesState,
      hotels: setHotelsState,
      dishes: setDishesState,
      transports: setTransportsState,
      restaurants: setRestaurantsState,
    };
    const currentState = sectionStateMap[sectionName];
    const setter = sectionSetterMap[sectionName];

    if (!currentState || !setter) return;

    const newVisibleCount = currentState.visibleCount + showMoreIncrement;

    if (newVisibleCount > itemsPerPageInPagination) {
      setter((prev) => ({
        ...prev,
        isPaginatedMode: true,
        currentPage: 1,
        visibleCount: 0,
      }));
    } else {
      setter((prev) => ({
        ...prev,
        visibleCount: newVisibleCount,
      }));
    }
  };

  const handleShowAll = (sectionSetter) => {
    sectionSetter((prev) => ({
      ...prev,
      isPaginatedMode: true,
      currentPage: 1,
      visibleCount: 0,
    }));
  };

  const parseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(data)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
  };

  const filteredAndSortedMainPlaces = useMemo(() => {
    let currentPlaces = [...places];

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

    if (regionFilter !== "Tất cả miền") {
      currentPlaces = currentPlaces.filter(
        (place) =>
          (place.region || "").trim().toLowerCase() ===
          regionFilter.toLowerCase()
      );
    }

    if (placeTypeFilter !== "Tất cả") {
      currentPlaces = currentPlaces.filter((place) => {
        if (placeTypeFilter === "Miễn phí") {
          return place.is_free === true;
        } else if (placeTypeFilter === "Có phí") {
          return place.is_free === false;
        }
        return (
          (place.type || "").trim().toLowerCase() ===
          placeTypeFilter.toLowerCase()
        );
      });
    }

 currentPlaces.sort((a, b) => {
  if (sortOrder === "newest") {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  } else if (sortOrder === "rating") {
    return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
  } else if (sortOrder === "popular") {
    // Sắp xếp theo specialties_count (ví dụ về độ phổ biến khác)
    return (b.specialties_count || 0) - (a.specialties_count || 0);
  }
  return 0;
});
    return currentPlaces;
  }, [places, searchTerm, regionFilter, placeTypeFilter, sortOrder]);

  const getPaginatedData = (data, state) => {
    if (state.isPaginatedMode) {
      const indexOfLastItem = state.currentPage * state.itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - state.itemsPerPage;
      return data.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      return data.slice(0, state.visibleCount);
    }
  };

  const mainPlacesToDisplay = getPaginatedData(
    filteredAndSortedMainPlaces,
    mainPlacesState
  );
  const popularPlacesSorted = useMemo(() => {
    return [...places].sort(
      (a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)
    );
  }, [places]);
  const popularPlacesToDisplay = getPaginatedData(
    popularPlacesSorted,
    popularPlacesState
  );
  const hotelsToDisplay = getPaginatedData(suggestedHotels, hotelsState);
  const dishesToDisplay = getPaginatedData(suggestedDishes, dishesState);
  const transportsToDisplay = getPaginatedData(
    suggestedTransportations,
    transportsState
  );
  const restaurantsToDisplay = getPaginatedData(
    suggestedRestaurants,
    restaurantsState
  );

  const renderCard = (item, type) => {
    let linkPath = "#";
    if (type === "places" && item.id) {
      linkPath = `/checkin-places/${item.id}`;
    } else if (type === "hotels" && item.id) {
      linkPath = `/hotels/${item.id}`;
    } else if (type === "transports" && item.id) {
      linkPath = `/transport-companies?type=${item.id}`; // ✅ chuyển hướng theo transportation id
    }

    const cardContent = (
      <>
        {type === "places" && (
          <>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.address || "Không có địa chỉ"}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description || "Không có mô tả"}
            </p>
            <p>
              đây làm thêm
            </p>

          </>
        )}

        {type === "hotels" && (
  <>
    {item.image ? ( // Kiểm tra xem có ảnh không
      <img
        src={`http://localhost:8000/storage/${item.image}`} // Đường dẫn đến ảnh của khách sạn
        alt={item.name}
        className="w-full h-40 object-cover rounded mb-2" // Các lớp CSS để định dạng ảnh
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/path/to/placeholder-image.jpg"; // Ảnh dự phòng nếu không tải được
        }}
      />
    ) : (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
        Không có ảnh
      </div>
    )}

<div className="flex justify-between items-center w-full">
  <p className="text-sm text-gray-600 font-bold">{item.name || "Chưa có tên"}</p>
  <p className="text-sm text-black-500">
    {item.price
      ? `${Number(item.price).toLocaleString()} đ/đêm`
      : "—"}
  </p>
</div>

    <p className="text-sm text-gray-600">{item.address || "—"}</p>
    <p className="text-sm text-yellow-600">
      ⭐ {item.rating || "4.5"} / 5
    </p>

  </>
)}

        {type === "dishes" && (
  <>
    {item.image ? ( // Kiểm tra xem có ảnh không
      <img
        src={`http://localhost:8000/storage/${item.image}`} // Đường dẫn đến ảnh của món ăn
        alt={item.name}
        className="w-full h-40 object-cover rounded mb-2" // Các lớp CSS để định dạng ảnh
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/path/to/placeholder-image.jpg"; // Ảnh dự phòng nếu không tải được
        }}
      />
    ) : (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
        Không có ảnh
      </div>
    )}
    
  <p className="text-sm text-gray-600 font-bold">
    {item.name || "Chưa có tên"}</p>
 

    
    <p className="text-sm text-yellow-500">
     Khu vực: {item.d || "Không rõ"}
    </p>
    <p className="text-sm text-black-500">
    Giá:  {item.restaurant?.price_range || "—"}
    </p>
    <p>
          <p className="text-sm text-black-500">
    {item.description || "—"}
    </p>
    </p>
  </>
)}

        {type === "transports" && (
          <>
            {/* Xử lý đường dẫn banner chính xác, tránh bị lặp */}
            {(() => {
              const rawPath = item.banner || item.image;
              const bannerPath = rawPath?.includes("uploads/")
                ? `http://localhost:8000/storage/${rawPath}`
                : `http://localhost:8000/storage/uploads/transportations/banners/${rawPath}`;

              return rawPath ? (
                <img
                  src={bannerPath}
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
              );
            })()}

            <div className="flex justify-between items-center mb-1 w-full">
              <div className="flex items-center gap-2 max-w-[75%]">
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
                <h3 className="font-semibold text-black text-base truncate font-bold">
                  {item.name || "Không có tên"}
                </h3>
              </div>
              <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap">
                <span className="mr-1">⭐</span>
                {item.rating || "Chưa đánh giá"}
              </div>
            </div>

            <p className="text-black-500 mt-1">
              Giá trung bình:
              {item.average_price
                ? ` ${Number(item.average_price).toLocaleString()} đ`
                : " —"}
            </p>
          </>
        )}

       {type === "restaurants" && (
  <>
    {item.image ? ( // Kiểm tra xem có ảnh không
      <img
        src={`http://localhost:8000/storage/${item.image}`} // Đường dẫn đến ảnh của nhà hàng
        alt={item.name}
        className="w-full h-40 object-cover rounded mb-2" // Các lớp CSS để định dạng ảnh
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/path/to/placeholder-image.jpg"; // Ảnh dự phòng nếu không tải được
        }}
      />
    ) : (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
        Không có ảnh
      </div>
    )}
    <p className="text-sm text-gray-600 line-clamp-2 font-bold">
      {item.name || "Không có tên"}
    </p>
   
    <p className="text-sm text-yellow-500">
      ⭐ {item.rating || "—"} / 5
    </p>
     <p className="text-sm text-gray-500"> {item.description || "Không có mô tả"}</p>
    <p className="text-sm text-black-500 text-right">
      💸 {item.price_range || "Chưa có giá chính thức"}
    </p>
  </>
)}
      </>
    );
    return (
      <Link
        to={linkPath}
        key={item.id || `${item.name}-${type}`}
        className="block h-full"
      >
        <div className="border rounded p-3 bg-white shadow hover:shadow-md transition duration-200 h-full flex flex-col justify-between">
          {" "}
          {cardContent}
        </div>
      </Link>
    );
  };

  const renderPopularPlaceCard = (item) => {
    const linkPath = item.id ? `/checkin-places/${item.id}` : "#";

    return (
      <Link to={linkPath} key={item.id || item.name} className="block h-full">
        <div className="border rounded p-3 bg-white shadow hover:shadow-md transition duration-200 flex h-full">
          <div className="w-1/3 flex-shrink-0 mr-4">
            {item.image ? (
              <img
                src={`http://localhost:8000/storage/${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/path/to/placeholder-image.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                Không có ảnh
              </div>
            )}
          </div>

          <div className="w-2/3 flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1 w-full">
              <div className="flex items-center gap-2 max-w-[75%]">
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
                <h3 className="font-semibold text-black text-base truncate">
                  {item.name || "Không có tên"}
                </h3>
              </div>
              <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap">
                <span className="mr-1">⭐</span>
                {item.rating || "Chưa đánh giá"}
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">
              {item.address || "Không có địa chỉ"}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description || "Không có mô tả"}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  // CẬP NHẬT HÀM handleFavoriteClick
  const handleFavoriteClick = (e, itemId) => {
    e.stopPropagation();
    e.preventDefault();

    setFavoritePlaceIds((prevFavoriteIds) => {
      if (prevFavoriteIds.includes(itemId)) {
        // Nếu đã có trong danh sách, thì bỏ yêu thích (xóa đi)
        console.log(`Đã bỏ yêu thích: ${itemId}`);
        return prevFavoriteIds.filter((id) => id !== itemId);
      } else {
        // Nếu chưa có, thì thêm vào yêu thích
        console.log(`Đã thêm vào yêu thích: ${itemId}`);
        return [...prevFavoriteIds, itemId];
      }
    });
  };

  const renderFeaturedPlaceCard = (item) => {
    const linkPath = item.id ? `/checkin-places/${item.id}` : "#";
    const isFavorited = favoritePlaceIds.includes(item.id); // Kiểm tra xem mục này có trong danh sách yêu thích không

    return (
      <Link to={linkPath} key={item.id || item.name} className="block h-full">
        <div className="relative border rounded-lg bg-white shadow hover:shadow-lg transition duration-200 h-full flex flex-col">
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            {item.image ? (
              <img
                src={`http://localhost:8000/storage/${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/path/to/placeholder-image.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                Không có ảnh
              </div>
            )}

            <button
              onClick={(e) => handleFavoriteClick(e, item.id)} // Truyền item.id vào hàm
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 transition-all z-10"
            >
              <HeartIcon filled={isFavorited} className="text-white" />{" "}
              {/* Truyền trạng thái filled */}
            </button>
          </div>

          <div className="p-3 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-800 text-lg line-clamp-2 pr-2">
                  {item.name || "Không có tên"}
                </h3>
                <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap flex-shrink-0">
                  <span className="mr-1">⭐</span>
                  {(parseFloat(item.rating) || 0).toFixed(1)}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {item.address || "Không có địa chỉ"}
              </p>
              <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                {item.description || "Không có mô tả"}
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              {item.specialties_count && (
                <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 0 24 24"
                    width="18px"
                    fill="#4B5563"
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v-2zM9 11v-2H7v2H9zm8 0h-2v-2h2v2z" />
                  </svg>
                  {item.specialties_count} đặc sản
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log(`Khám phá: ${item.name}`);
                }}
                className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 shadow"
              >
                Khám phá
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const PaginationControls = ({
    totalItems,
    currentState,
    sectionSetter,
    sectionName,
  }) => {
    const totalPages = Math.ceil(totalItems / currentState.itemsPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    if (totalItems === 0 || totalPages <= 1) return null;

    return (
      <nav className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => paginate(sectionSetter, currentState.currentPage - 1)}
          disabled={currentState.currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Trước
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(sectionSetter, number)}
            className={`px-3 py-1 rounded-md ${
              currentState.currentPage === number
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => paginate(sectionSetter, currentState.currentPage + 1)}
          disabled={currentState.currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Sau
        </button>
      </nav>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div
        className="relative bg-cover bg-center h-[400px] flex items-center justify-start"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        <div className="relative text-white z-10 px-4 max-w-3xl ml-20">
          <h1 className="text-5xl md:text-4xl font-bold mb-4 text-left">
            KHÁM PHÁ ĐIỂM ĐẾN TUYỆT VỜI
          </h1>
          <p className="text-lg mb-6 text-left">
            Trải nghiệm những địa điểm tuyệt vời, ẩm thực đặc sắc và văn hóa độc
            đáo
          </p>
          <div className="flex items-center justify-start gap-2">
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
              <span className="hidden md:inline ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#ffffff"
                >
                  <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                </svg>
              </span>{" "}
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white py-4 px-6 flex flex-wrap gap-4 shadow-sm border-b border-gray-200 mx-auto max-w-7xl">
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
                : "bg-black text-white "
            }`}
            onClick={() => setSortOrder("popular")}
          >
            Phổ biến
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
              sortOrder === "newest"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-white "
            }`}
            onClick={() => setSortOrder("newest")}
          >
            Mới nhất
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
              sortOrder === "rating"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-white "
            }`}
            onClick={() => setSortOrder("rating")}
          >
            Đánh giá cao
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg my-6">
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

        <h2 className="text-2xl font-bold text-black-600 ">Gợi ý điểm đến</h2>
        <p className="pb-10">
          Khám phá những địa điểm tuyệt vời cho chuyến đi của bạn
        </p>

        <div className="flex justify-between items-center mb-2 pb-2">
          <h2 className="text-2xl font-bold text-black-600">
            Điểm đến nổi bật
          </h2>
          <Link
            to="/favorites"
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            Xem tất cả yêu thích <span className="text-lg">→</span>
          </Link>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 justify-items-center">
              {mainPlacesToDisplay.map((place) =>
                renderFeaturedPlaceCard(place)
              )}
            </div>

            {(!mainPlacesState.isPaginatedMode &&
              mainPlacesState.visibleCount <
                filteredAndSortedMainPlaces.length) ||
            (!mainPlacesState.isPaginatedMode &&
              filteredAndSortedMainPlaces.length >
                initialVisibleCounts.mainPlaces) ? (
              <div className="text-center mt-8 flex justify-center gap-4">
                {!mainPlacesState.isPaginatedMode &&
                  mainPlacesState.visibleCount <
                    filteredAndSortedMainPlaces.length && (
                    <button
                      onClick={() => handleShowMore("mainPlaces")}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem thêm
                    </button>
                  )}

                {!mainPlacesState.isPaginatedMode &&
                  filteredAndSortedMainPlaces.length >
                    initialVisibleCounts.mainPlaces && (
                    <button
                      onClick={() => handleShowAll(setMainPlacesState)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem tất cả
                    </button>
                  )}
              </div>
            ) : null}

            {mainPlacesState.isPaginatedMode && (
              <PaginationControls
                totalItems={filteredAndSortedMainPlaces.length}
                currentState={mainPlacesState}
                sectionSetter={setMainPlacesState}
                sectionName="mainPlaces"
              />
            )}
          </>
        )}
      </div>

      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            Địa điểm phổ biến
          </h2>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải địa điểm...</p>
        ) : popularPlacesSorted.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có địa điểm phổ biến nào.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 justify-items-center">
              {popularPlacesToDisplay.map((place) =>
                renderPopularPlaceCard(place)
              )}
            </div>

            {(!popularPlacesState.isPaginatedMode &&
              popularPlacesState.visibleCount < popularPlacesSorted.length) ||
            (!popularPlacesState.isPaginatedMode &&
              popularPlacesSorted.length >
                initialVisibleCounts.popularPlaces) ? (
              <div className="text-center mt-8 flex justify-center gap-4">
                {!popularPlacesState.isPaginatedMode &&
                  popularPlacesState.visibleCount <
                    popularPlacesSorted.length && (
                    <button
                      onClick={() => handleShowMore("popularPlaces")}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem thêm
                    </button>
                  )}

                {!popularPlacesState.isPaginatedMode &&
                  popularPlacesSorted.length >
                    initialVisibleCounts.popularPlaces && (
                    <button
                      onClick={() => handleShowAll(setPopularPlacesState)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem tất cả
                    </button>
                  )}
              </div>
            ) : null}

            {popularPlacesState.isPaginatedMode && (
              <PaginationControls
                totalItems={popularPlacesSorted.length}
                currentState={popularPlacesState}
                sectionSetter={setPopularPlacesState}
                sectionName="popularPlaces"
              />
            )}
          </>
        )}
      </section>

      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
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
           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 justify-items-center">
  {hotelsToDisplay.map((hotel) => renderCard(hotel, "hotels"))}
</div>

            {(!hotelsState.isPaginatedMode &&
              hotelsState.visibleCount < suggestedHotels.length) ||
            (!hotelsState.isPaginatedMode &&
              suggestedHotels.length > initialVisibleCounts.hotels) ? (
              <div className="text-center mt-8 flex justify-center gap-4">
                {!hotelsState.isPaginatedMode &&
                  hotelsState.visibleCount < suggestedHotels.length && (
                    <button
                      onClick={() => handleShowMore("hotels")}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem thêm
                    </button>
                  )}

                {!hotelsState.isPaginatedMode &&
                  suggestedHotels.length > initialVisibleCounts.hotels && (
                    <button
                      onClick={() => handleShowAll(setHotelsState)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem tất cả
                    </button>
                  )}
              </div>
            ) : null}

            {hotelsState.isPaginatedMode && (
              <PaginationControls
                totalItems={suggestedHotels.length}
                currentState={hotelsState}
                sectionSetter={setHotelsState}
                sectionName="hotels"
              />
            )}
          </>
        )}
      </section>

      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
        Đặc sản địa phương
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Đang tải món ăn...</p>
        ) : suggestedDishes.length === 0 ? (
          <p className="text-center text-gray-500">
            Không có món ăn nào được đề xuất.
          </p>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2">
  {dishesToDisplay.map((dish) => renderCard(dish, "dishes"))}
</div>

            {(!dishesState.isPaginatedMode &&
              dishesState.visibleCount < suggestedDishes.length) ||
            (!dishesState.isPaginatedMode &&
              suggestedDishes.length > initialVisibleCounts.dishes) ? (
              <div className="text-center mt-8 flex justify-center gap-4">
                {!dishesState.isPaginatedMode &&
                  dishesState.visibleCount < suggestedDishes.length && (
                    <button
                      onClick={() => handleShowMore("dishes")}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem thêm
                    </button>
                  )}

                {!dishesState.isPaginatedMode &&
                  suggestedDishes.length > initialVisibleCounts.dishes && (
                    <button
                      onClick={() => handleShowAll(setDishesState)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem tất cả
                    </button>
                  )}
              </div>
            ) : null}

            {dishesState.isPaginatedMode && (
              <PaginationControls
                totalItems={suggestedDishes.length}
                currentState={dishesState}
                sectionSetter={setDishesState}
                sectionName="dishes"
              />
            )}
          </>
        )}
      </section>

      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center">
              {transportsToDisplay.map((transport) =>
                renderCard(transport, "transports")
              )}
            </div>

            {(!transportsState.isPaginatedMode &&
              transportsState.visibleCount < suggestedTransportations.length) ||
            (!transportsState.isPaginatedMode &&
              suggestedTransportations.length >
                initialVisibleCounts.transports) ? (
              <div className="text-center mt-8 flex justify-center gap-4">
                {!transportsState.isPaginatedMode &&
                  transportsState.visibleCount <
                    suggestedTransportations.length && (
                    <button
                      onClick={() => handleShowMore("transports")}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem thêm
                    </button>
                  )}

                {!transportsState.isPaginatedMode &&
                  suggestedTransportations.length >
                    initialVisibleCounts.transports && (
                    <button
                      onClick={() => handleShowAll(setTransportsState)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem tất cả
                    </button>
                  )}
              </div>
            ) : null}

            {transportsState.isPaginatedMode && (
              <PaginationControls
                totalItems={suggestedTransportations.length}
                currentState={transportsState}
                sectionSetter={setTransportsState}
                sectionName="transports"
              />
            )}
          </>
        )}
      </section>

      <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
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
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2">
  {restaurantsToDisplay.map((restaurant) =>
    renderCard(restaurant, "restaurants")
  )}
</div>

            {(!restaurantsState.isPaginatedMode &&
              restaurantsState.visibleCount < suggestedRestaurants.length) ||
            (!restaurantsState.isPaginatedMode &&
              suggestedRestaurants.length >
                initialVisibleCounts.restaurants) ? (
              <div className="text-center mt-8 flex justify-center gap-4">
                {!restaurantsState.isPaginatedMode &&
                  restaurantsState.visibleCount <
                    suggestedRestaurants.length && (
                    <button
                      onClick={() => handleShowMore("restaurants")}
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem thêm
                    </button>
                  )}

                {!restaurantsState.isPaginatedMode &&
                  suggestedRestaurants.length >
                    initialVisibleCounts.restaurants && (
                    <button
                      onClick={() => handleShowAll(setRestaurantsState)}
                      className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 transition-colors duration-300 text-sm font-semibold shadow-md"
                    >
                      Xem tất cả
                    </button>
                  )}
              </div>
            ) : null}

            {restaurantsState.isPaginatedMode && (
              <PaginationControls
                totalItems={suggestedRestaurants.length}
                currentState={restaurantsState}
                sectionSetter={setRestaurantsState}
                sectionName="restaurants"
              />
            )}
          </>
        )}
      </section>

  
    </div>
  );
};

export default CheckinPlacePage;
