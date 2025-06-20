import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckinPlace } from "../../../services/ui/CheckinPlace/checkinPlaceService";

const CreateCheckinPlace = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
    rating: 0,
    location_id: "",
    price: "",
    is_free: false,
    operating_hours: { open: "", close: "" },
    checkin_count: 0,
    review_count: 0,
    images: [],
    region: "",
    caption: "",
    distance: "",
    transport_options: [""],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOperatingHourChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      operating_hours: { ...prev.operating_hours, [key]: value },
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...form[field]];
    newArray[index] = value;
    setForm((prev) => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeImage = (index) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const handleFileUpload = (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === "image") {
      setForm((prev) => ({ ...prev, image: file }));
    } else if (field === "images" && index !== null) {
      const newImages = [...form.images];
      newImages[index] = file;
      setForm((prev) => ({ ...prev, images: newImages }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "operating_hours") {
          formData.append("operating_hours[open]", value.open);
          formData.append("operating_hours[close]", value.close);
        } else if (key === "transport_options") {
          value.forEach((v, i) => formData.append(`transport_options[${i}]`, v));
        } else if (key === "images") {
          value.forEach((img, i) => img && formData.append(`images[${i}]`, img));
        } else if (key === "image") {
          value && formData.append("image", value);
        } else if (key === "is_free") {
          formData.append("is_free", value ? "1" : "0");
        } else {
          formData.append(key, value);
        }
      });

      await createCheckinPlace(formData);
      alert("✅ Tạo địa điểm thành công!");
      navigate("/admin/checkin-places");
    } catch (err) {
      console.error(err);
      alert("❌ Tạo thất bại");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">➕ Thêm địa điểm check-in</h2>

      <button
        onClick={() => navigate("/admin/checkin-places")}
        className="mb-4 text-blue-600 underline"
      >
        ⬅ Quay lại danh sách
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên địa điểm" className="p-2 border w-full rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="p-2 border w-full rounded" rows={3} />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="p-2 border w-full rounded" />
        <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Vĩ độ" className="p-2 border w-full rounded" />
        <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Kinh độ" className="p-2 border w-full rounded" />

        <div>
          <label className="block font-medium">🖼️ Ảnh đại diện:</label>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} />
          {form.image && (
            <div className="relative mt-2">
              <img src={URL.createObjectURL(form.image)} alt="Preview" className="w-full h-40 object-cover rounded" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: null }))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
              >
                ❌
              </button>
            </div>
          )}
        </div>

        <input name="rating" value={form.rating} onChange={handleChange} placeholder="Đánh giá (0-5)" className="p-2 border w-full rounded" />
        <input name="location_id" value={form.location_id} onChange={handleChange} placeholder="ID vị trí" className="p-2 border w-full rounded" />

        {/* is_free radio */}
        <div>
          <label className="block font-medium">💰 Miễn phí?</label>
          <div className="flex gap-4">
            <label>
              <input type="radio" name="is_free" value="false" checked={!form.is_free} onChange={() => setForm((prev) => ({ ...prev, is_free: false }))} />
              &nbsp;Có phí
            </label>
            <label>
              <input type="radio" name="is_free" value="true" checked={form.is_free} onChange={() => setForm((prev) => ({ ...prev, is_free: true }))} />
              &nbsp;Miễn phí
            </label>
          </div>
        </div>

        {!form.is_free && (
          <input name="price" value={form.price} onChange={handleChange} placeholder="Giá vé" className="p-2 border w-full rounded" />
        )}

        {/* Operating hours */}
        <div>
          <label className="block font-medium">🕐 Giờ hoạt động:</label>
          <div className="flex gap-2">
            <input type="time" value={form.operating_hours.open} onChange={(e) => handleOperatingHourChange("open", e.target.value)} className="p-2 border rounded w-1/2" />
            <input type="time" value={form.operating_hours.close} onChange={(e) => handleOperatingHourChange("close", e.target.value)} className="p-2 border rounded w-1/2" />
          </div>
        </div>

        <input name="checkin_count" value={form.checkin_count} onChange={handleChange} placeholder="Số lượt check-in" className="p-2 border w-full rounded" />
        <input name="review_count" value={form.review_count} onChange={handleChange} placeholder="Số lượt đánh giá" className="p-2 border w-full rounded" />

        {/* Danh sách ảnh */}
        <div>
          <label className="block font-medium">📷 Danh sách ảnh:</label>
          {form.images.map((img, index) => (
            <div key={index} className="relative mb-2">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "images", index)} />
              {img && (
                <div className="mt-1">
                  <img src={URL.createObjectURL(img)} alt={`Image ${index}`} className="w-full h-32 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                  >
                    ❌
                  </button>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("images")} className="text-blue-600 underline">
            + Thêm ảnh
          </button>
        </div>

        {/* Region */}
        <div>
          <label className="block font-medium">🗺️ Miền:</label>
          <select name="region" value={form.region} onChange={handleChange} className="p-2 border w-full rounded">
            <option value="">-- Chọn miền --</option>
            <option value="Bắc">Bắc</option>
            <option value="Trung">Trung</option>
            <option value="Nam">Nam</option>
          </select>
        </div>

        <textarea name="caption" value={form.caption} onChange={handleChange} placeholder="Chú thích" className="p-2 border w-full rounded" rows={2} />
        <input name="distance" value={form.distance} onChange={handleChange} placeholder="Khoảng cách" className="p-2 border w-full rounded" />

        {/* Phương tiện */}
        <div>
          <label className="block font-medium">🚗 Phương tiện di chuyển:</label>
          {form.transport_options.map((option, index) => (
            <input
              key={index}
              value={option}
              onChange={(e) => handleArrayChange("transport_options", index, e.target.value)}
              placeholder={`Phương tiện ${index + 1}`}
              className="p-2 border w-full rounded mb-2"
            />
          ))}
          <button type="button" onClick={() => addArrayItem("transport_options")} className="text-blue-600 underline">
            + Thêm phương tiện
          </button>
        </div>

        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          💾 Lưu
        </button>
      </form>
    </div>
  );
};

export default CreateCheckinPlace;
