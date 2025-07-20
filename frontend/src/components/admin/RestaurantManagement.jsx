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
} from "lucide-react";
import { restaurantAPI } from "../../services/api"; // Đảm bảo đúng đường dẫn

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchRestaurants = async (page = 1) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll({ page });
      const data = response.data;
      setRestaurants(data.data);
      setCurrentPage(data.current_page);
      setLastPage(data.last_page);
    } catch (err) {
      setError("Không thể tải danh sách nhà hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await restaurantAPI.destroy(id);
      fetchRestaurants();
    } catch (err) {
      console.error("Lỗi xóa:", err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRestaurants.map((id) => restaurantAPI.destroy(id)));
      setSelectedRestaurants([]);
      fetchRestaurants(currentPage);
    } catch (err) {
      console.error("Lỗi xóa nhiều:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedRestaurants((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = restaurants.map((res) => res.id);
    const isAllSelected = allIds.every((id) => selectedRestaurants.includes(id));
    setSelectedRestaurants(isAllSelected ? [] : allIds);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchRestaurants();
      return;
    }
    try {
      const response = await restaurantAPI.getAll({ search: query });
      setRestaurants(response.data.data);
    } catch {
      setError("Không thể tìm kiếm.");
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      fetchRestaurants(page);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Quản lý Nhà hàng</h1>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedRestaurants.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 inline-block mr-1" />
              Xóa {selectedRestaurants.length} mục
            </button>
          )}
          <button
            onClick={() => navigate("/Admin/AddRestaurant")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 inline-block mr-1" />
            Thêm nhà hàng
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={
                    selectedRestaurants.length > 0 &&
                    restaurants.every((res) => selectedRestaurants.includes(res.id))
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Hình ảnh</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Địa chỉ</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Đánh giá</th>
              <th className="p-3 text-left">Ngày tạo</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((res) => (
              <tr key={res.id} className="border-b">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRestaurants.includes(res.id)}
                    onChange={() => toggleSelect(res.id)}
                  />
                </td>
                <td className="p-3">
                  <img
                    src={`/${res.image}`}
                    alt={res.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="p-3 font-semibold">{res.name}</td>
                <td className="p-3 text-sm text-gray-600 line-clamp-2 max-w-[200px]">
                  {res.description}
                </td>
                <td className="p-3 text-sm">{res.address}</td>
                <td className="p-3 text-sm">{res.price_range}</td>
                <td className="p-3 text-sm">{res.rating.toFixed(1)} ⭐</td>
                <td className="p-3 text-sm">
                  {new Date(res.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/Admin/EditRestaurant/${res.id}`)}
                    className="text-blue-500 hover:underline"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
                    className="text-red-500 hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(lastPage)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                className={`px-3 py-1 border rounded ${
                  page === currentPage ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="px-3 py-1 border rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantManagement;
