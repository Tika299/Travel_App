import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getCheckinPlaceById,
  updateCheckinPlace,
} from "../../../services/ui/CheckinPlace/checkinPlaceService";

const EditCheckinPlace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCheckinPlaceById(id);
        const data = res.data.data;
        setForm({
          ...data,
          image: null,
          images: [],
          is_free: !!data.is_free,
          operating_hours: typeof data.operating_hours === "string"
            ? JSON.parse(data.operating_hours)
            : data.operating_hours || { open: "", close: "" },
          transport_options: typeof data.transport_options === "string"
            ? JSON.parse(data.transport_options)
            : data.transport_options || [],
          status: data.status || "active",
        });
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    const finalValue = type === "checkbox" ? checked : type === "file" ? files[0] : value;
    console.log(`Change: ${name} =>`, finalValue);
    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleOperatingHourChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      operating_hours: { ...prev.operating_hours, [key]: value },
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const addArrayItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, [field]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const trimmedName = form.name?.trim();
    if (!trimmedName) newErrors.name = "Tên địa điểm không được để trống.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", trimmedName);
    formData.append("description", form.description || "");
    formData.append("address", form.address || "");
    formData.append("latitude", form.latitude || "");
    formData.append("longitude", form.longitude || "");
    formData.append("rating", form.rating || 0);
    formData.append("location_id", form.location_id || "");
    formData.append("is_free", form.is_free ? "1" : "0");
    formData.append("price", form.is_free ? "" : (form.price || ""));
    formData.append("checkin_count", form.checkin_count || 0);
    formData.append("review_count", form.review_count || 0);
    formData.append("region", form.region || "");
    formData.append("caption", form.caption || "");
    formData.append("distance", form.distance || "");
    formData.append("status", form.status); // giữ nguyên giá trị user chọn
    formData.append("operating_hours[open]", form.operating_hours.open || "");
    formData.append("operating_hours[close]", form.operating_hours.close || "");
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }
    form.transport_options.forEach((v, i) => {
      formData.append(`transport_options[${i}]`, v || "");
    });
    form.images.forEach((v, i) => {
      if (v instanceof File) {
        formData.append(`images[${i}]`, v);
      }
    });

    console.log("Submitting form with status:", form.status);

    try {
      await updateCheckinPlace(id, formData);
      alert("✅ Cập nhật thành công!");
      navigate("/admin/checkin-places");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading || !form) return <div className="p-6">🔄 Đang tải...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">✏️ Sửa địa điểm check-in</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên địa điểm" className={`p-2 border w-full rounded ${errors.name ? "border-red-500" : ""}`} required />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="p-2 border w-full rounded" rows={3} />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="p-2 border w-full rounded" />
        <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Vĩ độ" className="p-2 border w-full rounded" />
        <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Kinh độ" className="p-2 border w-full rounded" />

        <input type="file" name="image" accept="image/*" onChange={handleChange} className="p-2 border w-full rounded" />

        <input name="rating" value={form.rating} onChange={handleChange} placeholder="Đánh giá (0 - 5)" type="number" min="0" max="5" step="0.1" className="p-2 border w-full rounded" />
        <input name="location_id" value={form.location_id} onChange={handleChange} placeholder="ID vị trí" className="p-2 border w-full rounded" />

        <div>
          <label className="block font-medium">💰 Miễn phí?</label>
          <div className="flex gap-4">
            <label><input type="radio" name="is_free" value="false" checked={!form.is_free} onChange={() => setForm((prev) => ({ ...prev, is_free: false }))} /> Có phí</label>
            <label><input type="radio" name="is_free" value="true" checked={form.is_free} onChange={() => setForm((prev) => ({ ...prev, is_free: true }))} /> Miễn phí</label>
          </div>
        </div>

        {!form.is_free && (
          <input name="price" value={form.price} onChange={handleChange} placeholder="Giá vé" className="p-2 border w-full rounded" />
        )}

        <div className="flex gap-2">
          <input type="time" value={form.operating_hours.open} onChange={(e) => handleOperatingHourChange("open", e.target.value)} className="p-2 border rounded w-1/2" />
          <input type="time" value={form.operating_hours.close} onChange={(e) => handleOperatingHourChange("close", e.target.value)} className="p-2 border rounded w-1/2" />
        </div>

        <input name="checkin_count" value={form.checkin_count} onChange={handleChange} placeholder="Số lượt check-in" className="p-2 border w-full rounded" />
        <input name="review_count" value={form.review_count} onChange={handleChange} placeholder="Số lượt đánh giá" className="p-2 border w-full rounded" />

        <div>
          <label className="block font-medium">📷 Ảnh phụ:</label>
          {form.images.map((img, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input type="file" accept="image/*" onChange={(e) => handleArrayChange("images", index, e.target.files[0])} className="p-2 border w-full rounded" />
              <button type="button" onClick={() => removeArrayItem("images", index)} className="text-red-600 text-sm">🗑️</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("images")} className="text-blue-600 underline">+ Thêm ảnh</button>
        </div>

        <select name="region" value={form.region || ""} onChange={handleChange} className="p-2 border w-full rounded">
          <option value="">-- Chọn miền --</option>
          <option value="Bắc">Bắc</option>
          <option value="Trung">Trung</option>
          <option value="Nam">Nam</option>
        </select>

        <textarea name="caption" value={form.caption} onChange={handleChange} placeholder="Chú thích" className="p-2 border w-full rounded" rows={2} />
        <input name="distance" value={form.distance} onChange={handleChange} placeholder="Khoảng cách" className="p-2 border w-full rounded" />

        <div>
          <label className="block font-medium">⚙️ Trạng thái hoạt động:</label>
          <select name="status" value={form.status} onChange={handleChange} className="p-2 border w-full rounded">
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">🚗 Phương tiện di chuyển:</label>
          {form.transport_options.map((option, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input value={option} onChange={(e) => handleArrayChange("transport_options", index, e.target.value)} placeholder={`Phương tiện ${index + 1}`} className="p-2 border w-full rounded" />
              <button type="button" onClick={() => removeArrayItem("transport_options", index)} className="text-red-600 text-sm">🗑️</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("transport_options")} className="text-blue-600 underline">+ Thêm phương tiện</button>
        </div>

        <div className="flex justify-between mt-6">
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">💾 Lưu thay đổi</button>
          <button type="button" onClick={() => navigate("/admin/checkin-places")} className="px-4 py-2 bg-gray-400 text-white rounded">⬅️ Quay về</button>
        </div>
      </form>
    </div>
  );
};

export default EditCheckinPlace;
