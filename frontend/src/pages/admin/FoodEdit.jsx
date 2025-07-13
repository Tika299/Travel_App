import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import categoryService from "../../services/categoryService";
import cuisineService from "../../services/cuisineService";
import provinceData from "../../../datatinhthanh34.json";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import api from "../../services/api";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const FoodEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    short_description: "",
    detailed_description: "",
    province: "",
    ward: "",
    address: "",
    price: 0,
    categories_id: "",
    image: null,
    region: "",
    status: "available",
    operating_hours: "",
    serving_time: "",
    suitable_for: "",
    delivery: 0,
  });
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [initialForm, setInitialForm] = useState(null);
  const formRef = useRef();
  const navigate = useNavigate();

  // Lấy danh mục
  useEffect(() => {
    categoryService.getAllCategories().then(res => {
      setCategories(Array.isArray(res.data) ? res.data : res);
    });
  }, []);

  // Lấy tỉnh/thành phố
  useEffect(() => {
    const sortedProvinces = [...provinceData].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    setProvinces(sortedProvinces);
  }, []);

  // Lấy xã/phường theo tỉnh/thành
  useEffect(() => {
    if (form.province) {
      const selectedProvince = provinces.find(p => p.province_code === form.province);
      if (selectedProvince && selectedProvince.wards) {
        const sortedWards = [...selectedProvince.wards].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setWards(sortedWards);
      } else {
        setWards([]);
      }
    } else {
      setWards([]);
    }
  }, [form.province, provinces]);

  // Lấy dữ liệu món ăn từ API
  useEffect(() => {
    if (!id) return;
    cuisineService.getCuisineById(id).then(res => {
      const data = res.data || res;
      // Tách address thành address, ward, province nếu có
      let address = data.address || "";
      let province = "", ward = "";
      if (address) {
        // Tách theo format: [địa chỉ], [xã/phường], [tỉnh/thành]
        const parts = address.split(",").map(s => s.trim());
        if (parts.length >= 3) {
          address = parts[0];
          // Tìm mã code từ tên
          province = provinceData.find(p => p.name === parts[2])?.province_code || "";
          let wardsArr = [];
          if (province) {
            const prov = provinceData.find(p => p.province_code === province);
            wardsArr = prov?.wards || [];
          }
          ward = wardsArr.find(w => w.name === parts[1])?.ward_code || "";
        }
      }
      const formData = {
        ...data,
        address,
        province,
        ward,
        categories_id: data.categories_id || data.category?.id || "",
        image: null, // Không set file, chỉ preview
        detailed_description: data.detailed_description || "",
        delivery: typeof data.delivery === 'boolean' ? (data.delivery ? 1 : 0) : Number(data.delivery) || 0,
        status: data.status || "available",
        operating_hours: data.operating_hours || "",
        serving_time: data.serving_time || "",
        suitable_for: data.suitable_for || "",
      };
      setForm(formData);
      setInitialForm({ ...formData, image: data.image || null }); // Lưu lại image gốc
      setImagePreview(data.image || null);
    });
  }, [id]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setForm(f => ({ ...f, image: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    }
  };

  // Drag & drop ảnh
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setForm(f => ({ ...f, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Nút Đặt lại
  const handleReset = () => {
    setForm(initialForm);
    setImagePreview(initialForm?.image || null);
    if (formRef.current) formRef.current.scrollIntoView({ behavior: "smooth" });
  };
  // Nút Hủy
  const handleCancel = () => { navigate("/admin/foods"); };

  // Helper gửi request với method override (POST + _method=PUT nếu cần)
  const apiCallOverrideMethod = (endpoint, data, method) => {
    if (data instanceof FormData) {
      return fetch(`http://localhost:8000/api${endpoint}`, {
        method: method,
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(async res => {
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      });
    } else {
      // Dùng api.put như cũ
      return api.put(endpoint, data);
    }
  };

  // Nút Lưu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const wardName = wards.find(w => w.ward_code === form.ward)?.name || "";
    const provinceName = provinces.find(p => p.province_code === form.province)?.name || "";
    const fullAddress = [form.address, wardName, provinceName].filter(Boolean).join(", ");
    try {
      let payload;
      let method = 'PUT';
      if (form.image && typeof form.image !== 'string') {
        payload = new FormData();
        Object.entries({ ...form, address: fullAddress, delivery: Number(form.delivery) }).forEach(([key, value]) => {
          if (key === 'image') {
            if (value && typeof value !== 'string') payload.append('image', value);
          } else if (value !== undefined && value !== null && value !== '') {
            payload.append(key, value);
          }
        });
        // Trick cho Laravel nhận file khi update: dùng POST + _method=PUT
        payload.append('_method', 'PUT');
        method = 'POST';
      } else {
        // Chỉ gửi các trường có giá trị
        payload = {};
        Object.entries({ ...form, address: fullAddress, delivery: Number(form.delivery) }).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            payload[key] = value;
          }
        });
      }
      await apiCallOverrideMethod(`/cuisines/${id}`, payload, method);
      await MySwal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Cập nhật ẩm thực thành công!',
        confirmButtonText: 'OK',
      });
      navigate("/admin/foods");
      window.location.reload();
    } catch (err) {
      await MySwal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Có lỗi khi cập nhật! ' + (err?.response?.data?.message || ""),
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formRef} className="bg-white rounded shadow p-4 md:p-8 max-w-3xl mx-auto my-6" onSubmit={handleSubmit}>
      {/* Bắt đầu điền thông tin ẩm thực */}
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-md bg-blue-100 mr-3" />
        <div>
          <div className="font-bold text-gray-900">Chỉnh sửa thông tin ẩm thực</div>
          <div className="text-gray-500 text-sm">Cập nhật đầy đủ thông tin để sửa ẩm thực</div>
        </div>
      </div>
      {/* Thông tin cơ bản */}
      <div className="mb-6">
        <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <BsFillInfoCircleFill className="text-blue-500" />
          Thông tin cơ bản
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tên món/Loại ẩm thực <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Nhập tên món/loại ẩm thực..." className="w-full border rounded px-3 py-2 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mô tả ngắn</label>
            <input name="short_description" value={form.short_description} onChange={handleChange} placeholder="Viết mô tả ngắn về món ăn/ẩm thực..." className="w-full border rounded px-3 py-2 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mô tả chi tiết</label>
            <textarea name="detailed_description" value={form.detailed_description} onChange={handleChange} rows={3} placeholder="Viết mô tả chi tiết về món ăn/ẩm thực..." className="w-full border rounded px-3 py-2 focus:outline-none" />
          </div>
        </div>
      </div>
      {/* Địa chỉ */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tỉnh/Thành phố</label>
            <select name="province" value={form.province} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">--Chọn Tỉnh/Thành phố--</option>
              {provinces.map(p => <option key={p.province_code} value={p.province_code}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Xã/Phường</label>
            <select name="ward" value={form.ward} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">--Chọn Xã/Phường--</option>
              {wards.map(w => <option key={w.ward_code} value={w.ward_code}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Địa chỉ</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ chi tiết" className="w-full border rounded px-3 py-2 focus:outline-none" />
        </div>
      </div>
      {/* Giá, danh mục, giao hàng */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Giá</label>
          <input name="price" type="number" min={0} value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2 focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Danh mục</label>
          <select name="categories_id" value={form.categories_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Chọn danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Giao hàng</label>
          <select name="delivery" value={String(form.delivery)} onChange={e => setForm(f => ({ ...f, delivery: Number(e.target.value) }))} className="w-full border rounded px-3 py-2">
            <option value={0}>Không</option>
            <option value={1}>Có</option>
          </select>
        </div>
      </div>
      {/* Ảnh */}
      <div className="mb-6">
        <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FiImage className="text-blue-500" />
          Hình ảnh
        </div>
        <div className="text-gray-700 mb-1">Ảnh chính</div>
        <div
          className={`border-2 border-dashed border-gray-300 rounded p-6 flex flex-col items-center justify-center text-gray-400 min-h-[160px] ${dragActive ? 'bg-blue-50 border-blue-400' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-40 object-contain mb-2 rounded" />
          ) : (
            <FiUploadCloud size={48} className="mb-2" />
          )}
          <span className="mb-2 text-black">Kéo thả hình ảnh vào đây</span>
          <label className="cursor-pointer text-blue-500 hover:underline">
            Chọn file
            <input type="file" name="image" accept="image/*" className="hidden" onChange={handleChange} />
          </label>
          {form.image && !imagePreview && <div className="mt-2 text-gray-700 text-sm">{form.image.name}</div>}
        </div>
      </div>
      {/* Thông tin bổ sung */}
      <div className="mb-6">
        <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FaStar className="text-blue-500" />
          Thông tin bổ sung
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Vùng miền</label>
            <select name="region" value={form.region} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">--Chọn vùng miền--</option>
              <option value="Miền Bắc">Miền Bắc</option>
              <option value="Miền Trung">Miền Trung</option>
              <option value="Miền Nam">Miền Nam</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="available">Có sẵn</option>
              <option value="unavailable">Không có sẵn</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Giờ hoạt động</label>
            <input name="operating_hours" value={form.operating_hours} onChange={handleChange} placeholder="Ví dụ: 8:00 - 22:00 hằng ngày" className="w-full border rounded px-3 py-2 focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Giờ phục vụ</label>
            <input name="serving_time" value={form.serving_time} onChange={handleChange} placeholder="Ví dụ: sáng trưa chiều tối" className="w-full border rounded px-3 py-2 focus:outline-none" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Phù hợp cho</label>
          <input name="suitable_for" value={form.suitable_for} onChange={handleChange} placeholder="Ví dụ: Gia đình, Hẹn hò, Bạn bè..." className="w-full border rounded px-3 py-2 focus:outline-none" />
        </div>
      </div>
      {/* Nút hành động */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 justify-end">
        <button type="button" className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={handleCancel}>Hủy</button>
        <button type="button" className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={handleReset}>Đặt lại</button>
        <button type="submit" className="px-5 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
      </div>
    </form>
  );
};

export default FoodEdit; 