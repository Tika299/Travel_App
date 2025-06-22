import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCheckinPlaceById,
  updateCheckinPlace,
  deleteCheckinPhoto, // Đảm bảo import đúng hàm này
} from "../../../services/ui/CheckinPlace/checkinPlaceService";

const EditCheckinPlace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state để vô hiệu hóa nút submit khi đang gửi form

  useEffect(() => {
    (async () => {
      try {
        const res = await getCheckinPlaceById(id);
        const data = res.data.data;

        // Xử lý oldImages: đảm bảo luôn là một mảng các chuỗi
        let oldImages = [];
        if (typeof data.images === "string") {
          try {
            oldImages = JSON.parse(data.images);
          } catch (e) {
            oldImages = [];
          }
        } else if (Array.isArray(data.images)) {
          oldImages = data.images;
        }

        // Xử lý operating_hours: đảm bảo là object { open: "", close: "" }
        let operatingHours = { open: "", close: "" };
        if (typeof data.operating_hours === "string" && data.operating_hours) {
          try {
            operatingHours = JSON.parse(data.operating_hours);
          } catch (e) {
            // Nếu parse lỗi, dùng giá trị mặc định
          }
        } else if (typeof data.operating_hours === "object" && data.operating_hours !== null) {
          operatingHours = data.operating_hours;
        }

        // Xử lý transport_options: đảm bảo là mảng
        let transportOptions = [];
        if (typeof data.transport_options === "string" && data.transport_options) {
          try {
            transportOptions = JSON.parse(data.transport_options);
          } catch (e) {
            transportOptions = data.transport_options.split(',').map(item => item.trim()); // Fallback to split string by comma
          }
        } else if (Array.isArray(data.transport_options)) {
          transportOptions = data.transport_options;
        }

        setForm({
          name: data.name ?? "",
          description: data.description ?? "",
          address: data.address ?? "",
          latitude: data.latitude ?? "",
          longitude: data.longitude ?? "",
          rating: data.rating ?? 0,
          location_id: data.location_id ?? "",
          is_free: !!data.is_free, // Convert to boolean
          price: data.price ?? "",
          checkin_count: data.checkin_count ?? 0,
          review_count: data.review_count ?? 0,
          region: data.region ?? "",
          caption: data.caption ?? "",
          distance: data.distance ?? "",
          status: data.status ?? "active",
          image: null, // Dùng để tải ảnh bìa mới
          old_image: data.image ?? null, // Lưu ảnh bìa cũ để hiển thị
          images: [], // Dùng để tải nhiều ảnh phụ mới
          old_images: oldImages, // Lưu ảnh phụ cũ để hiển thị và gửi lại
          checkin_photos: data.checkin_photos ?? [], // Ảnh check-in từ người dùng (không gửi lên khi update, chỉ để xóa)
          operating_hours: operatingHours,
          transport_options: transportOptions,
        });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        alert("Không thể tải dữ liệu địa điểm. Vui lòng thử lại.");
        navigate("/admin/checkin-places"); // Quay về danh sách nếu lỗi
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]); // Thêm navigate vào dependencies

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const finalValue =
      type === "checkbox" ? checked : type === "file" ? files[0] : value;

    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...(form[field] || [])]; // Đảm bảo là mảng
    updated[index] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addArrayItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""], // Thêm phần tử rỗng
    }));
  };

  const removeArrayItem = (field, index) => {
    const updated = [...(form[field] || [])];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const handleDeleteCheckinPhoto = async (photoId) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh check-in này?")) return;
    try {
      // Đảm bảo URL API và photoId là đúng
      // Nếu service của bạn cần photoId trực tiếp, thì dòng này là đúng
      await deleteCheckinPhoto(photoId);
      setForm((prev) => ({
        ...prev,
        checkin_photos: prev.checkin_photos.filter((p) => p.id !== photoId),
      }));
      alert("✅ Ảnh check-in đã được xóa!");
    } catch (err) {
      console.error("❌ Lỗi xóa ảnh check-in:", err.response?.data || err.message);
      alert("Không thể xóa ảnh. Vui lòng thử lại. Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Bắt đầu gửi form

    const newErrors = {};
    const trimmedName = form.name?.trim();
    if (!trimmedName) newErrors.name = "Tên địa điểm không được để trống.";
    if (form.rating < 0 || form.rating > 5) newErrors.rating = "Đánh giá phải từ 0 đến 5.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false); // Dừng gửi form nếu có lỗi
      return;
    }

    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel yêu cầu _method PUT cho update
    formData.append("name", trimmedName);
    formData.append("description", form.description ?? "");
    formData.append("address", form.address ?? "");
    formData.append("latitude", form.latitude ?? "");
    formData.append("longitude", form.longitude ?? "");
    formData.append("rating", parseFloat(form.rating) || 0); // Đảm bảo là số
    formData.append("location_id", form.location_id ?? "");
    formData.append("is_free", form.is_free ? "1" : "0");
    formData.append("price", form.is_free ? "" : form.price ?? ""); // Gửi giá trống nếu miễn phí
    formData.append("checkin_count", parseInt(form.checkin_count) || 0); // Đảm bảo là số nguyên
    formData.append("review_count", parseInt(form.review_count) || 0); // Đảm bảo là số nguyên
    formData.append("region", form.region ?? "");
    formData.append("caption", form.caption ?? "");
    formData.append("distance", form.distance ?? "");
    formData.append("status", form.status ?? "active");

    // Thêm giờ mở/đóng
    formData.append("operating_hours[open]", form.operating_hours?.open ?? "");
    formData.append("operating_hours[close]", form.operating_hours?.close ?? "");

    // Thêm ảnh bìa mới nếu có
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    // Thêm các ảnh phụ mới nếu có
    form.images?.forEach((img, i) => {
      if (img instanceof File) {
        formData.append(`images[${i}]`, img);
      }
    });

    // Gửi lại các đường dẫn ảnh cũ để server biết ảnh nào cần giữ
    form.old_images?.forEach((img, i) => {
      // Đảm bảo chỉ gửi đường dẫn, không phải full URL
      const path = img?.startsWith('http://localhost:8000/storage/') ? img.replace('http://localhost:8000/storage/', '') : img;
      if (path) { // Chỉ gửi nếu đường dẫn không rỗng
        formData.append(`old_images[]`, path);
      }
    });

    // Thêm các tùy chọn phương tiện
    form.transport_options?.forEach((v, i) => {
      if (v?.trim()) { // Chỉ thêm nếu giá trị không rỗng
        formData.append(`transport_options[${i}]`, v.trim());
      }
    });

    try {
      await updateCheckinPlace(id, formData);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/checkin-places");
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err.response?.data || err.message);
      alert("❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false); // Kết thúc gửi form
    }
  };

  if (loading || !form) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">🔄 Đang tải dữ liệu địa điểm...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-xl my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        ✏️ Chỉnh sửa địa điểm check-in
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tên địa điểm */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên địa điểm <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Cà phê Cộng"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.name ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            required
          />
          {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name}</p>}
        </div>

        {/* Mô tả */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Mô tả chi tiết về địa điểm"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={3}
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ
          </label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Địa chỉ cụ thể của địa điểm"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Vĩ độ (Latitude)
            </label>
            <input
              id="latitude"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Ví dụ: 10.762622"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              type="text" // Có thể là text vì GPS có thể là chuỗi
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Kinh độ (Longitude)
            </label>
            <input
              id="longitude"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Ví dụ: 106.660172"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              type="text"
            />
          </div>
        </div>

        {/* Ảnh bìa hiện tại */}
        {form.old_image && (
          <div className="my-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh bìa hiện tại:
            </label>
            <img
              src={`http://localhost:8000/storage/${form.old_image}`}
              alt="Ảnh bìa hiện tại"
              className="w-full h-48 object-cover rounded-md shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }}
            />
          </div>
        )}

        {/* Tải ảnh bìa mới */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Chọn ảnh bìa mới (nếu muốn thay đổi)
          </label>
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
          />
        </div>

        {/* Đánh giá */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            Đánh giá (0 - 5)
          </label>
          <input
            id="rating"
            name="rating"
            value={form.rating}
            onChange={handleChange}
            placeholder="Ví dụ: 4.5"
            type="number"
            min="0"
            max="5"
            step="0.1"
            className={`mt-1 block w-full px-3 py-2 border ${
                errors.rating ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {errors.rating && <p className="mt-1 text-red-500 text-xs">{errors.rating}</p>}
        </div>

        {/* ID vị trí */}
        <div>
          <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 mb-1">
            ID vị trí (nếu có)
          </label>
          <input
            id="location_id"
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            placeholder="Ví dụ: place_id_google"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Miễn phí / Có phí */}
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-gray-700">Giá vé:</span>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="is_free"
              value="false"
              checked={!form.is_free}
              onChange={() => setForm((prev) => ({ ...prev, is_free: false, price: "" }))} // Clear price if switching to free
              className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-gray-700">Có phí</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="is_free"
              value="true"
              checked={form.is_free}
              onChange={() => setForm((prev) => ({ ...prev, is_free: true, price: "" }))}
              className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            />
            <span className="ml-2 text-gray-700">Miễn phí</span>
          </label>
        </div>

        {!form.is_free && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Giá vé (đơn vị: VNĐ)
            </label>
            <input
              id="price"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Ví dụ: 50000"
              type="number"
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}

        {/* Giờ hoạt động */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giờ hoạt động
          </label>
          <div className="flex gap-4">
            <input
              type="time"
              value={form.operating_hours?.open || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  operating_hours: {
                    ...prev.operating_hours,
                    open: e.target.value,
                  },
                }))
              }
              className="p-2 border rounded-md shadow-sm w-1/2 focus:ring-blue-500 focus:border-blue-500"
              title="Giờ mở cửa"
            />
            <input
              type="time"
              value={form.operating_hours?.close || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  operating_hours: {
                    ...prev.operating_hours,
                    close: e.target.value,
                  },
                }))
              }
              className="p-2 border rounded-md shadow-sm w-1/2 focus:ring-blue-500 focus:border-blue-500"
              title="Giờ đóng cửa"
            />
          </div>
        </div>

        {/* Lượt check-in & Đánh giá */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkin_count" className="block text-sm font-medium text-gray-700 mb-1">
              Số lượt check-in
            </label>
            <input
              id="checkin_count"
              name="checkin_count"
              value={form.checkin_count}
              onChange={handleChange}
              placeholder="Số lượt check-in"
              type="number"
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="review_count" className="block text-sm font-medium text-gray-700 mb-1">
              Số lượt đánh giá
            </label>
            <input
              id="review_count"
              name="review_count"
              value={form.review_count}
              onChange={handleChange}
              placeholder="Số lượt đánh giá"
              type="number"
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Ảnh phụ hiện tại */}
        {form.old_images?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Ảnh phụ hiện tại:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {form.old_images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={
                      img?.startsWith("/storage/")
                        ? `http://localhost:8000${img}`
                        : `http://localhost:8000/storage/${img}`
                    }
                    alt={`Ảnh phụ ${index}`}
                    className="w-full h-28 object-cover rounded-md shadow-sm"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x70?text=Error'; }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        old_images: prev.old_images.filter((_, i) => i !== index),
                      }))
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Xóa ảnh này"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ảnh phụ mới */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🖼️ Thêm ảnh phụ mới:
          </label>
          {form.images.map((img, index) => (
            <div key={index} className="flex items-center gap-3 mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleArrayChange("images", index, e.target.files[0])}
                className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-1.5 file:px-3
                           file:rounded-full file:border-0
                           file:text-sm file:font-semibold
                           file:bg-purple-50 file:text-purple-700
                           hover:file:bg-purple-100"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("images", index)}
                className="text-red-600 hover:text-red-800 text-lg transition duration-200"
                title="Xóa ảnh này"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("images")}
            className="mt-2 px-3 py-1.5 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition duration-200 text-sm"
          >
            + Thêm ảnh
          </button>
        </div>

        {/* Miền */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
            Miền
          </label>
          <select
            id="region"
            name="region"
            value={form.region}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Chọn miền --</option>
            <option value="Bắc">Bắc</option>
            <option value="Trung">Trung</option>
            <option value="Nam">Nam</option>
          </select>
        </div>

        {/* Chú thích */}
        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
            Chú thích
          </label>
          <textarea
            id="caption"
            name="caption"
            value={form.caption}
            onChange={handleChange}
            placeholder="Thêm chú thích cho địa điểm"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={2}
          />
        </div>

        {/* Khoảng cách */}
        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng cách (km)
          </label>
          <input
            id="distance"
            name="distance"
            value={form.distance}
            onChange={handleChange}
            placeholder="Ví dụ: 10.5"
            type="number"
            step="0.1"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Trạng thái hoạt động */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            ⚙️ Trạng thái hoạt động:
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        {/* Phương tiện di chuyển */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🚗 Phương tiện di chuyển:
          </label>
          {form.transport_options.map((option, index) => (
            <div key={index} className="flex items-center gap-3 mb-3">
              <input
                value={option}
                onChange={(e) =>
                  handleArrayChange("transport_options", index, e.target.value)
                }
                placeholder={`Phương tiện ${index + 1}`}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeArrayItem("transport_options", index)}
                className="text-red-600 hover:text-red-800 text-lg transition duration-200"
                title="Xóa phương tiện này"
              >
                🗑️
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem("transport_options")}
            className="mt-2 px-3 py-1.5 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition duration-200 text-sm"
          >
            + Thêm phương tiện
          </button>
        </div>

        {/* Ảnh check-in người dùng */}
        {form.checkin_photos?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📸 Ảnh check-in từ người dùng:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {form.checkin_photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={`http://localhost:8000/storage/${photo.image}`}
                    alt={`Ảnh check-in của ${photo.user_name || 'người dùng'}`}
                    className="w-full h-28 object-cover rounded-md shadow-sm"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x70?text=Error'; }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCheckinPhoto(photo.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Xóa ảnh check-in này"
                  >
                    ✖
                  </button>
                  {photo.user_name && (
                    <p className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-50 px-1 py-0.5 rounded">
                      {photo.user_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nút lưu và quay về */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/admin/checkin-places")}
            className="px-6 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
          >
            ⬅️ Quay về
          </button>
          <button
            type="submit"
            disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi form
            className={`px-6 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "💾 Đang lưu..." : "💾 Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCheckinPlace;