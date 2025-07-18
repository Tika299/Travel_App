import React, { useState, useEffect } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import cuisineService from "../../services/cuisineService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

const PAGE_SIZE = 10;

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});
  const navigate = useNavigate();

  // Lấy dữ liệu từ API
  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cuisineService.getAllCuisines({ per_page: PAGE_SIZE, page, search });
      // Lấy đúng dữ liệu từ response Laravel
      const items = res.data || [];
      const metaData = res.meta || {};
      setFoods(items);
      setTotal(metaData.total || items.length);
      setMeta(metaData);
      // Nếu không còn dữ liệu ở trang hiện tại và page > 1, chuyển về trang 1
      if (items.length === 0 && page > 1) {
        setPage(1);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line
  }, [page, search]);

  // Chọn/xóa
  const toggleSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };
  const selectAll = () => {
    if (selected.length === foods.length) setSelected([]);
    else setSelected(foods.map(f => f.id));
  };

  // Xử lý xóa 1 món ăn
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (result.isConfirmed) {
      try {
        await cuisineService.deleteCuisine(id);
        fetchFoods();
        MySwal.fire('Đã xóa!', 'Món ăn đã được xóa thành công.', 'success');
      } catch (err) {
        MySwal.fire('Lỗi!', 'Xóa thất bại!', 'error');
      }
    }
  };

  // Xử lý xóa nhiều
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa các món đã chọn?")) return;
    try {
      await Promise.all(selected.map(id => cuisineService.deleteCuisine(id)));
      setSelected([]);
      fetchFoods();
      alert("Đã xóa các món đã chọn!");
    } catch (err) {
      alert("Xóa thất bại một số hoặc tất cả món!");
      fetchFoods();
    }
  };

  // Phân trang
  const totalPages = meta.last_page || Math.ceil(total / PAGE_SIZE);

  // Tạo mảng các trang cần hiển thị (tối đa 3 đầu, 1 cuối, ... nếu cần)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      {/* Thống kê tổng số món ăn */}
      <div className="flex items-center mb-6">
        <div className="bg-white rounded shadow p-4 w-full md:w-64">
          <div className="text-gray-600 text-sm mb-1">Tổng số món ăn</div>
          <div className="text-3xl font-bold text-black">{total}</div>
        </div>
      </div>

      {/* Thanh tìm kiếm và nút */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 md:gap-0">
        <div className="w-full md:w-1/3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm món ăn (tên hoặc mô tả)"
              className="w-full pl-10 pr-4 py-2 rounded bg-white border border-gray-200 focus:outline-none text-gray-700 text-base shadow"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleDeleteSelected} className="flex items-center px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded shadow w-full md:w-auto">
            <FaTrash className="mr-2" /> Chọn xóa
          </button>
          <button onClick={() => navigate("/admin/foods/create")}
            className="flex items-center px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow w-full md:w-auto">
            <FaPlus className="mr-2" /> Thêm món ăn
          </button>
        </div>
      </div>

      {/* Bảng danh sách món ăn */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3"><input type="checkbox" checked={selected.length === foods.length && foods.length > 0} onChange={selectAll} /></th>
                <th className="p-3 text-left">Món ăn</th>
                <th className="p-3 text-left">Mô tả ngắn</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-right">Giá(VND)</th>
                <th className="p-3 text-center">Vùng miền</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center">Giao hàng</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food, idx) => (
                <tr key={food.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-center"><input type="checkbox" checked={selected.includes(food.id)} onChange={() => toggleSelect(food.id)} /></td>
                  <td className="p-3 flex items-center gap-2">
                    <img src={
                      food.image
                        ? food.image.startsWith('http')
                          ? food.image
                          : `http://localhost:8000${food.image}`
                        : "https://via.placeholder.com/80x80?text=No+Image"
                    } alt={food.name} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <div className="font-bold text-gray-800">{food.name}</div>
                      <div className="text-xs text-gray-500">{food.category?.name || ""}</div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">{food.short_description}</td>
                  <td className="p-3 text-gray-700">{food.address}</td>
                  <td className="p-3 text-right text-gray-800 font-semibold">{food.price?.toLocaleString() || ""}</td>
                  <td className="p-3 text-center text-gray-700">{food.region}</td>
                  <td className="p-3 text-center">
                    <span className={food.status === "available" ? "text-green-600" : "text-red-500"}>{food.status === "available" ? "Có sẵn" : "Không có sẵn"}</span>
                  </td>
                  <td className="p-3 text-center">
                    {food.delivery ? <FaCheckCircle className="text-green-500 text-lg mx-auto" /> : <FaTimesCircle className="text-red-400 text-lg mx-auto" />}
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => navigate(`/admin/foods/${food.id}/edit`)}><FaEdit /></button>
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(food.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 ? (
        <div className="flex justify-center mt-4 gap-2 items-center select-none">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >&lt;</button>
          {getPageNumbers().map((i, idx) =>
            i === '...'
              ? <span key={"ellipsis-"+idx} className="px-2">...</span>
              : <button
                  key={i}
                  className={`px-3 py-1 rounded ${page === i ? "bg-blue-500 text-white font-bold" : "bg-gray-200 hover:bg-gray-300"}`}
                  onClick={() => setPage(i)}
                  disabled={page === i}
                >{i}</button>
          )}
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >&gt;</button>
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >Tiếp</button>
        </div>
      ) : (
        <div className="flex justify-center mt-4 gap-2">
          <button className="px-3 py-1 rounded bg-blue-500 text-white font-bold" disabled>1</button>
        </div>
      )}
    </div>
  );
};

export default FoodList; 