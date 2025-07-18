"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { ApiService } from "../../services/api";

const FoodManagement = () => {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalDishes, setTotalDishes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedDishes, setSelectedDishes] = useState([]);

  // Fetch dishes from API
  const fetchDishes = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getDishes({ page});

      if (response && Array.isArray(response.data?.data)) {
        setDishes(response.data.data);
        setTotalDishes(response.data.total || response.data.data.length);
        setCurrentPage(response.data.current_page || 1);
        setLastPage(response.data.last_page || 1);
      } else {
        console.error("Dữ liệu trả về không hợp lệ:", response);
        setDishes([]);
        setTotalDishes(0);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu món ăn. Vui lòng thử lại.");
      console.error("Error fetching dishes:", err);
    } finally {
      setLoading(false);
    }
  };
const handlePageChange = (page) => {
  if (page >= 1 && page <= lastPage) {
    fetchDishes(page)
  }
}

  // Search dishes
  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchDishes();
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.searchDishes(query);

      if (response && Array.isArray(response.data?.data)) {
        setDishes(response.data.data);
      } else {
        console.error("Dữ liệu trả về không hợp lệ (search):", response);
        setDishes([]);
      }
    } catch (err) {
      setError("Không thể tìm kiếm món ăn.");
      console.error("Error searching dishes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete selected dishes
  const handleDeleteSelected = async () => {
    if (selectedDishes.length === 0) return;
    try {
      setLoading(true);
      await Promise.all(selectedDishes.map((id) => ApiService.deleteDish(id)));
      setSelectedDishes([]);
      fetchDishes();
    } catch (err) {
      setError("Không thể xóa món ăn đã chọn.");
      console.error("Error deleting dishes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete single dish
  const handleDeleteDish = async (id) => {
    console.log("Xóa món ăn với ID:", id);
    try {
      if (!id) {
        console.error("ID không hợp lệ:", id);
        return;
      }
      await ApiService.deleteDish(id);
      fetchDishes();
    } catch (err) {
      setError("Không thể xóa món ăn.");
      console.error("Error deleting dish:", err.response?.data || err.message);
    }
  };

  // Navigate to add food page
  const handleAddFood = () => {
    navigate("/Admin/AddDishe");
  };

  // Navigate to edit food page
  const handleEditFood = (id) => {
    navigate(`/Admin/EditDishe/${id}`);
  };

  // Toggle dish selection
  const toggleDishSelection = (id) => {
    setSelectedDishes((prev) =>
      prev.includes(id) ? prev.filter((dishId) => dishId !== id) : [...prev, id]
    );
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  // Get status color
  const getStatusColor = (status) => {
    if (typeof status !== "string") return "gray";
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("có sẵn") || lowerStatus.includes("available")) {
      return "green";
    }
    return "red";
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (loading && dishes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Card */}
      <div className="bg-white p-4 rounded-lg shadow w-fit">
        <div className="text-sm text-gray-600 mb-1">Tổng số món ăn</div>
        <div className="text-2xl font-bold text-gray-800">{totalDishes}</div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm món ăn (tất hoặc tên)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
          onClick={handleDeleteSelected}
          disabled={selectedDishes.length === 0}
        >
          🗑️ Chọn xóa ({selectedDishes.length})
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          onClick={handleAddFood}
        >
          <Plus className="w-4 h-4" />
          Thêm món ăn
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDishes(dishes.map((dish) => dish.id));
                      } else {
                        setSelectedDishes([]);
                      }
                    }}
                    checked={
                      selectedDishes.length === dishes.length &&
                      dishes.length > 0
                    }
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Món ăn
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Mô tả ngắn
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Nhà hàng
                </th>

                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Giá(VND)
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Vùng miền
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Trạng thái
                </th>

                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Giao hàng
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish) => {
                const statusColor = getStatusColor(dish.status);
                return (
                  <tr key={dish.id} className="border-b border-gray-200">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedDishes.includes(dish.id)}
                        onChange={() => toggleDishSelection(dish.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {dish.image ? (
                            <img
                              src={'/'+dish.image || "/placeholder.svg"}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {dish.name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">
                          {dish.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800 max-w-xs truncate">
                        {dish.description}
                      </div>
                    </td>
                    <td className="p-4">
                      {/* <div className="text-sm text-gray-800">{dish.restaurant?.name}</div> */}
                      <div className="text-sm text-gray-800 max-w-xm truncate">
                        {dish.location}
                      </div>
                    </td>

                    {/* <td className="p-4">
                      {dish.is_best_seller && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Best Seller
                        </span>
                      )}
                    </td> */}
                    <td className="p-4">
                      <div className="text-sm text-gray-800">
                        {formatPrice(dish.price)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">{dish.region}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-800">{dish.status}</div>
                    </td>
                    <td className="p-4">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          statusColor === "green"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {statusColor === "green" ? (
                          <span className="text-white text-xs">✓</span>
                        ) : (
                          <span className="text-white text-xs">✕</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                          onClick={() => handleEditFood(dish.id)}
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                          onClick={() => handleDeleteDish(dish.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {dishes.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-600">
            Không có dữ liệu món ăn
          </div>
        )}

        {/* Pagination */}
        {
          /* <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
          <button
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="px-3 py-1 bg-blue-500 text-white border border-blue-500 rounded">{currentPage}</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">19</button>
          <span className="text-sm text-gray-600 mx-2">Tiếp</span>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div> */
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
            <button
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(lastPage)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${
                    page === currentPage
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        }
      </div>
    </div>
  );
};

export default FoodManagement;
