import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUtensils } from "react-icons/fa";
import categoryService from '../../services/categoryService';
import ReactLogo from '../../assets/react.svg';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "", type: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadedIcon, setUploadedIcon] = useState(null);

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoryService.getCategoriesWithCuisinesCount();
      // Chuẩn hóa dữ liệu (cuisines_count -> cuisineCount)
      setCategories((res.data || []).map(c => ({
        ...c,
        cuisineCount: c.cuisines_count ?? 0,
      })));
    } catch (err) {
      setError("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Lọc theo search
  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.type.toLowerCase().includes(search.toLowerCase())
  );

  // Chọn/xóa nhiều
  const toggleSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };
  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map(c => c.id));
  };
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    const result = await MySwal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(selected.map(async (id) => {
        try {
          await categoryService.deleteCategory(id);
        } catch (err) {
          MySwal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err?.response?.data?.message || 'Xóa thất bại một số hoặc tất cả danh mục!',
          });
        }
      }));
      setSelected([]);
      fetchCategories();
      MySwal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Xóa danh mục thành công!',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err?.response?.data?.message || 'Xóa thất bại một số hoặc tất cả danh mục!',
      });
      fetchCategories();
    }
  };
  // Xử lý xóa 1
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Bạn có chắc chắn muốn xóa danh mục này?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (!result.isConfirmed) return;
    try {
      await categoryService.deleteCategory(id);
      setSelected(selected.filter(s => s !== id));
      fetchCategories();
      MySwal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Xóa danh mục thành công!',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể xóa danh mục này!',
      });
    }
  };

  // Xử lý form
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name.trim() ||
      (!form.icon || (typeof form.icon === 'string' && !form.icon.trim())) ||
      !form.type.trim()
    ) {
      return alert("Vui lòng nhập đủ thông tin!");
    }
    try {
      if (editId) {
        await categoryService.updateCategory(editId, form);
      } else {
        await categoryService.createCategory(form);
      }
      MySwal.fire({
        icon: 'success',
        title: 'Thành công',
        text: editId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!',
        timer: 1500,
        showConfirmButton: false,
      });
      setForm({ name: "", icon: "", type: "" });
      setShowForm(false);
      setEditId(null);
      fetchCategories();
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lưu thất bại!',
      });
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon, type: cat.type });
    setShowForm(true);
    setEditId(cat.id);
  };
  const handleCancelForm = () => {
    setForm({ name: "", icon: "", type: "" });
    setShowForm(false);
    setEditId(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      {/* Loading/Error */}
      {loading && <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {/* Thống kê tổng số danh mục */}
      <div className="flex items-center mb-6">
        <div className="bg-white rounded shadow p-4 w-full md:w-64">
          <div className="text-gray-600 text-sm mb-1">Tổng số danh mục</div>
          <div className="text-3xl font-bold text-black">{categories.length}</div>
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
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm danh mục (tên hoặc loại)"
              className="w-full pl-10 pr-4 py-2 rounded bg-white border border-gray-200 focus:outline-none text-gray-700 text-base shadow"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleDeleteSelected} className="flex items-center px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded shadow w-full md:w-auto">
            <FaTrash className="mr-2" /> Chọn xóa
          </button>
          <button
            className="flex items-center px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow w-full md:w-auto"
            onClick={() => setShowForm(true)}
          >
            <FaPlus className="mr-2" /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Bố cục 2 cột: bảng bên trái, form bên phải */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Bảng danh sách category */}
        <div className={`bg-white rounded shadow md:ml-0 mx-0 ${showForm ? 'w-full md:w-1/2' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="p-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={selectAll} /></th>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Icon</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-center">Số món ăn</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3 text-center"><input type="checkbox" checked={selected.includes(cat.id)} onChange={() => toggleSelect(cat.id)} /></td>
                    <td className="p-3 font-bold text-gray-800">{cat.name}</td>
                    <td className="p-3 text-2xl">
                      {typeof cat.icon === 'string' && (cat.icon.endsWith('.png') || cat.icon.endsWith('.svg') || cat.icon.startsWith('category_icons/')) ? (
                        <img
                          src={`http://localhost:8000/storage/${cat.icon}`}
                          alt={cat.name}
                          className="w-8 h-8 object-contain inline"
                        />
                      ) : (
                        <span className="text-xs break-all">{cat.icon}</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-700">{cat.type}</td>
                    <td className="p-3 text-center text-blue-500 font-semibold">{cat.cuisineCount}</td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEdit(cat)}><FaEdit /></button>
                      <button className="text-orange-500 hover:text-orange-600" onClick={() => handleDelete(cat.id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Form thêm danh mục */}
        {showForm && (
          <div className="w-full md:w-1/2">
            <form onSubmit={handleFormSubmit} className="bg-white rounded shadow p-6 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{editId ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Tên danh mục</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="w-full border rounded px-3 py-2 focus:outline-none" placeholder="Nhập tên danh mục" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Icon (PNG hoặc SVG)</label>
                <div className="flex items-center gap-2">
                  {/* Chỉ cho upload file PNG, SVG */}
                  <input
                    type="file"
                    accept=".svg,.png"
                    className="hidden"
                    id="icon-upload"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadedIcon(URL.createObjectURL(file));
                        setForm(f => ({ ...f, icon: file }));
                      }
                    }}
                  />
                  <label htmlFor="icon-upload" className="px-2 py-1 border rounded cursor-pointer bg-gray-100 hover:bg-gray-200">Tải ảnh</label>
                  {/* Hiển thị preview icon vừa upload */}
                  {uploadedIcon && (
                    <img src={uploadedIcon} alt="icon preview" className="w-6 h-6 inline ml-2" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Type</label>
                <input name="type" value={form.type} onChange={handleFormChange} className="w-full border rounded px-3 py-2 focus:outline-none" placeholder="food, drink..." />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded">Lưu</button>
                <button type="button" className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded" onClick={handleCancelForm}>Hủy</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList; 