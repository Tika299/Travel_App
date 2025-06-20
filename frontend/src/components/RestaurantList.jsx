"use client"

import { useState, useEffect } from "react"
import RestaurantCard from "./RestaurantCard"
import RestaurantDetail from "./RestaurantDetail"
import { restaurantAPI } from "../services/api"

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    price_range: "",
    min_rating: "",
    sort_by: "created_at",
    sort_order: "desc",
  })

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  const priceRanges = [
    { value: "", label: "Tất cả mức giá" },
    { value: "$", label: "$ - Bình dân" },
    { value: "$$", label: "$$ - Trung bình" },
    { value: "$$$", label: "$$$ - Cao cấp" },
    { value: "$$$$", label: "$$$$ - Sang trọng" },
  ]

  const ratingFilters = [
    { value: "", label: "Tất cả đánh giá" },
    { value: "4", label: "4+ sao" },
    { value: "4.5", label: "4.5+ sao" },
  ]

  useEffect(() => {
    if (!selectedRestaurant) {
      setPagination((prev) => ({ ...prev, current_page: 1 }))
      fetchRestaurants(1)
    }
  }, [filters, selectedRestaurant])

  const fetchRestaurants = async (page = 1) => {
    try {
      setLoading(true)

      const params = {
        ...filters,
        page,
        per_page: 9,
      }

      // Xoá key rỗng
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      console.log("📡 Gọi API với params:", params)

      const response = await restaurantAPI.getAll(params)

      const rawData = response.data
      console.log("✅ Kết quả trả về:", rawData)

      let data = []
      let paginationData = {
        current_page: page,
        last_page: 1,
        total: 0,
      }

      if (Array.isArray(rawData)) {
        data = rawData
        paginationData.total = rawData.length
      } else if (rawData.success && Array.isArray(rawData.data)) {
        data = rawData.data
        paginationData = rawData.pagination || paginationData
      } else {
        throw new Error("Không có dữ liệu hợp lệ")
      }

      if (page === 1) {
        setRestaurants(data)
      } else {
        setRestaurants((prev) => [...prev, ...data])
      }

      setPagination(paginationData)
      setError(null)
    } catch (err) {
      console.error("❌ Lỗi khi fetch:", err)
      setError("Không thể tải danh sách nhà hàng")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleLoadMore = () => {
    if (pagination.current_page < pagination.last_page) {
      fetchRestaurants(pagination.current_page + 1)
    }
  }

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant.id)
  }

  const handleBackToList = () => {
    setSelectedRestaurant(null)
  }

  // 👉 Trang chi tiết
  if (selectedRestaurant) {
    return <RestaurantDetail restaurantId={selectedRestaurant} onBack={handleBackToList} />
  }

  // 👉 Loading đầu
  if (loading && restaurants.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // 👉 Lỗi
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchRestaurants(1)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // 👉 Trang danh sách
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tiêu đề */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tất cả nhà hàng/ quán ăn</h2>
        <p className="text-gray-600">Khám phá những địa điểm ẩm thực tuyệt vời của Việt Nam</p>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          {/* Mức giá */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-700 font-medium">Mức giá:</span>
            {priceRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleFilterChange("price_range", range.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.price_range === range.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Đánh giá */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-700 font-medium">Đánh giá:</span>
            {ratingFilters.map((rating) => (
              <button
                key={rating.value}
                onClick={() => handleFilterChange("min_rating", rating.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filters.min_rating === rating.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Sắp xếp:</span>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="created_at">Mới nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Số kết quả */}
      <div className="mb-6">
        <p className="text-gray-600">Tìm thấy {pagination.total} nhà hàng</p>
      </div>

      {/* Grid danh sách */}
      {restaurants.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={handleRestaurantClick}
              />
            ))}
          </div>

          {/* Load more */}
          {pagination.current_page < pagination.last_page && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Đang tải..." : "Xem thêm"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy nhà hàng nào</p>
        </div>
      )}
    </div>
  )
}

export default RestaurantList
