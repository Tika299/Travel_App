"use client";

import { useState, useEffect } from "react";
import LocationCard from "./LocationCard";
import { locationAPI } from "../services/api";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { Button } from "../components/ui/button";

export default function LocationGrid({ searchQuery, category, userLocation }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQueryState, setSearchQueryState] = useState(searchQuery || "");
  const [filters, setFilters] = useState({
    min_rating: "",
    has_fee: "",
    sort_by: "created_at",
    sort_order: "desc",
    province: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLocations();
  }, [
    searchQuery,
    category,
    filters,
    userLocation,
    currentPage,
    searchQueryState,
  ]);

  const buildParams = () => {
    const parsedFilters = { ...filters };

    if (parsedFilters.has_fee === "true") {
      parsedFilters.has_fee = true;
    } else if (parsedFilters.has_fee === "false") {
      parsedFilters.has_fee = false;
    } else {
      delete parsedFilters.has_fee;
    }

    if (parsedFilters.min_rating === "") {
      delete parsedFilters.min_rating;
    }

    return {
      ...parsedFilters,
      ...(searchQueryState && { search: searchQueryState }),
      ...(category && { category }),
      page: currentPage,
      per_page: 4, // Hiển Thị Số Lượng Sản Phẩm Cho Mỗi Trang
    };
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = buildParams();

      let response;
      let locationData = [];

      if (userLocation && !searchQueryState && !category) {
        response = await locationAPI.getNearby({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: 20,
          limit: 20,
        });
        locationData = response.data.data || response.data;
        setTotalPages(1);
      } else {
        response = await locationAPI.getAll(params);
        locationData = response.data.data;
        setTotalPages(response.data.last_page || 1);
      }

      // ✅ Lọc theo province nếu có
      if (filters.province) {
        locationData = locationData.filter((loc) =>
          loc.address.toLowerCase().includes(filters.province.toLowerCase())
        );
      }

      setLocations(locationData);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (locationId) => {
    console.log("Favorite location:", locationId);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const onSearchSubmit = () => {
    setSearchQueryState(searchInput);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Lỗi: {error}</p>
        <button
          onClick={fetchLocations}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Banner đầu trang với aspect ratio 4:1 */}
      <section className="relative aspect-[25/5] w-full overflow-hidden">
        <img
          src="/image/Kham-Pha-Dia-Diem.jpg"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white text-4xl md:text-5xl font-bold text-center">
            Khám phá trải nghiệm tuyệt vời
          </h1>
          <p className="text-white text-lg md:text-2xl mt-4">
            Những điểm đến lý tưởng đang chờ bạn khám phá
         </p>
          
        </div>

      </section>

      {/* Search and Filter Section */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm kiếm những trải nghiệm..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onSearchSubmit();
                        }
                      }}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>

                  <Button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={onSearchSubmit}
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-0">
                <div className="flex flex-col max-w-[160px] flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đánh giá tối thiểu
                  </label>
                  <Select
                    value={filters.min_rating}
                    onValueChange={(value) =>
                      handleFilterChange("min_rating", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4+ sao</SelectItem>
                      <SelectItem value="3">3+ sao</SelectItem>
                      <SelectItem value="2">2+ sao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col max-w-[160px] flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sắp xếp theo
                  </label>
                  <Select
                    value={filters.sort_by}
                    onValueChange={(value) =>
                      handleFilterChange("sort_by", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Mới nhất</SelectItem>
                      <SelectItem value="rating">Đánh giá</SelectItem>
                      <SelectItem value="checkin_count">Phổ biến</SelectItem>
                      <SelectItem value="name">Tên A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col max-w-[160px] flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh/Thành phố
                  </label>
                  <Select
                    value={filters.province}
                    onValueChange={(value) =>
                      handleFilterChange("province", value)
                    }
                  >
                    
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                      <SelectItem value="TP.HCM">
                        TP Hồ Chí Minh
                      </SelectItem>
                      <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                      <SelectItem value="Huế">Huế</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6 text-gray-600">
              Tìm thấy {locations.length} địa điểm
              {userLocation && !searchQueryState && !category && " gần bạn"}
            </div>
          </div>
        </div>
      </section>

      {/* Location Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                Không tìm thấy địa điểm nào.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onFavorite={handleFavorite}
                    showDistance={!!location.distance}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center space-x-2 mt-12">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant="ghost"
                      onClick={() => handlePageChange(page)}
                      className={
                        page === currentPage ? "bg-blue-600 text-white" : ""
                      }
                    >
                      {page}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
