import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTransportCompany } from "../../../services/ui/TransportCompany/transportCompanyService";

const CreateTransportCompany = () => {
  const navigate = useNavigate();

  // Initialize form state with more structured operating_hours and highlight_services
  const [form, setForm] = useState({
    name: "",
    transportation_id: "",
    short_description: "",
    description: "",
    address: "",
    latitude: "", // Corrected: Removed duplicate latitude
    longitude: "",
    logo: "",
    rating: "",
    phone_number: "",
    email: "",
    website: "",
    base_km: "",
    additional_km: "",
    waiting_minute_fee: "",
    night_fee: "",
    contact_response_time: "", // Matches migration and previous discussion
    has_mobile_app: false,
    payment_cash: false,
    payment_card: false,
    payment_insurance: false, // Renamed from 'insurance' in form state to 'payment_insurance' for consistency with input name
    status: "active",
    // Structured operating_hours to match backend JSON_ENCODE
    operating_hours: {
      'Thứ 2- Chủ Nhật': '24/7',
      'Tổng Đài ': '24/7', // Note: Retaining the trailing space based on your backend example
      'Thời gian phản hồi': '3-5 phút',
    },
    highlight_services: [], // Initialized as an empty array
  });

  // General handler for most input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handler for operating_hours object changes
  const handleOperatingHoursChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [key]: value,
      },
    }));
  };

  // Handler for highlight_services input (comma-separated string to array)
  const handleHighlightServicesChange = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      // Split by comma, trim whitespace, and filter out empty strings
      highlight_services: value.split(',').map(s => s.trim()).filter(s => s),
    }));
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form, // Spread all form fields
      // Parse numbers if they are empty strings, otherwise parseFloat/parseInt
      transportation_id: parseInt(form.transportation_id) || 0,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      rating: parseFloat(form.rating) || null, // Allow null if not provided
      
      // Ensure specific fields are correctly parsed or formatted for backend
      phone_number: form.phone_number || null,
      email: form.email || null,
      website: form.website || null,
      logo: form.logo || null,
      short_description: form.short_description || '',
      description: form.description || '',

      // Price range is an object
      price_range: {
        base_km: parseInt(form.base_km) || 0,
        additional_km: parseInt(form.additional_km) || 0,
        waiting_minute_fee: parseInt(form.waiting_minute_fee) || 0,
        night_fee: parseInt(form.night_fee) || 0,
      },
      
      // operating_hours must be JSON stringified for backend
      operating_hours: JSON.stringify(form.operating_hours), 
      
      contact_response_time: form.contact_response_time || 'N/A', // Default to N/A if empty

      // payment_methods array based on checkboxes
      payment_methods: [
        ...(form.payment_cash ? ["cash"] : []),
        ...(form.payment_card ? ["bank_card"] : []),
        ...(form.payment_insurance ? ["insurance"] : []), // Matches 'insurance' from backend
      ],

      // highlight_services must be JSON stringified array for backend
      highlight_services: JSON.stringify(form.highlight_services), 
    };

    try {
      await createTransportCompany(payload);
      alert("✅ Tạo hãng vận chuyển thành công!");
      navigate("/admin/transport-companies");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Display validation errors from backend
        console.error('Lỗi xác thực dữ liệu:', error.response.data.errors);
        alert('❌ Lỗi dữ liệu nhập vào:\n' + JSON.stringify(error.response.data.errors, null, 2));
      } else {
        console.error("❌ Lỗi khi tạo hãng vận chuyển:", error);
        alert("❌ Lỗi khi tạo hãng vận chuyển. Vui lòng kiểm tra dữ liệu hoặc kết nối mạng.");
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">➕ Thêm Hãng Vận Chuyển Mới</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên hãng</label>
          <input id="name" name="name" placeholder="Tên hãng" value={form.name} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" required />
        </div>
        <div>
          <label htmlFor="transportation_id" className="block text-sm font-medium text-gray-700 mb-1">ID Loại hình vận chuyển</label>
          <input id="transportation_id" name="transportation_id" placeholder="ID loại hình vận chuyển" value={form.transportation_id} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="number" required />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
          <input id="address" name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input id="latitude" name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="number" step="0.000001" required />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input id="longitude" name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="number" step="0.000001" required />
          </div>
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input id="phone_number" name="phone_number" placeholder="Số điện thoại" value={form.phone_number} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="email" />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input id="website" name="website" placeholder="Website" value={form.website} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="url" />
        </div>
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn logo (URL)</label>
          <input id="logo" name="logo" placeholder="Đường dẫn logo (URL)" value={form.logo} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="url" />
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Đánh giá (VD: 4.5)</label>
          <input id="rating" name="rating" type="number" step="0.1" placeholder="Đánh giá (VD: 4.5)" value={form.rating} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Descriptions */}
        <div className="md:col-span-2">
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu ngắn</label>
          <input id="short_description" name="short_description" placeholder="Giới thiệu ngắn" value={form.short_description} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
          <textarea id="description" name="description" placeholder="Mô tả chi tiết" value={form.description} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" rows="3" />
        </div>

        {/* Operating Hours Input Fields */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">🕒 Giờ hoạt động</h3>
          {/* Thứ 2 - Chủ Nhật */}
          <div>
            <label htmlFor="operating_hours_monday_sunday" className="block text-sm font-medium text-gray-700 mb-1">Thứ 2 - Chủ Nhật</label>
            <input
              id="operating_hours_monday_sunday"
              type="text"
              placeholder="VD: 24/7 hoặc 8:00 - 22:00"
              value={form.operating_hours['Thứ 2- Chủ Nhật']}
              onChange={(e) => handleOperatingHoursChange('Thứ 2- Chủ Nhật', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Tổng Đài */}
          <div className="mt-4">
            <label htmlFor="operating_hours_hotline" className="block text-sm font-medium text-gray-700 mb-1">Tổng Đài</label>
            <input
              id="operating_hours_hotline"
              type="text"
              placeholder="VD: 24/7"
              value={form.operating_hours['Tổng Đài ']} // Ensure matching key with space
              onChange={(e) => handleOperatingHoursChange('Tổng Đài ', e.target.value)} // Ensure matching key with space
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Thời gian phản hồi */}
          <div className="mt-4">
            <label htmlFor="operating_hours_response_time" className="block text-sm font-medium text-gray-700 mb-1">Thời gian phản hồi</label>
            <input
              id="operating_hours_response_time"
              type="text"
              placeholder="VD: 3-5 phút"
              value={form.operating_hours['Thời gian phản hồi']}
              onChange={(e) => handleOperatingHoursChange('Thời gian phản hồi', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Contact Response Time */}
        <div className="md:col-span-2">
          <label htmlFor="contact_response_time" className="block text-sm font-medium text-gray-700 mb-1">Thời gian phản hồi liên hệ</label>
          <input id="contact_response_time" name="contact_response_time" placeholder="Thời gian phản hồi liên hệ (VD: Dưới 30 giây)" value={form.contact_response_time} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Price Range */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">💰 Giá cước</h3>
          <div>
            <label htmlFor="base_km" className="block text-sm font-medium text-gray-700 mb-1">Giá 2km đầu (VND)</label>
            <input id="base_km" name="base_km" type="number" placeholder="Giá 2km đầu (VND)" value={form.base_km} onChange={handleChange} className="p-2 border border-gray-300 rounded-md mb-2 w-full focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="additional_km" className="block text-sm font-medium text-gray-700 mb-1">Giá mỗi km tiếp theo (VND)</label>
            <input id="additional_km" name="additional_km" type="number" placeholder="Giá mỗi km tiếp theo (VND)" value={form.additional_km} onChange={handleChange} className="p-2 border border-gray-300 rounded-md mb-2 w-full focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="waiting_minute_fee" className="block text-sm font-medium text-gray-700 mb-1">Phí chờ mỗi phút (VND)</label>
            <input id="waiting_minute_fee" name="waiting_minute_fee" type="number" placeholder="Phí chờ mỗi phút (VND)" value={form.waiting_minute_fee} onChange={handleChange} className="p-2 border border-gray-300 rounded-md mb-2 w-full focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="night_fee" className="block text-sm font-medium text-gray-700 mb-1">Phụ thu ban đêm (VND)</label>
            <input id="night_fee" name="night_fee" type="number" placeholder="Phụ thu ban đêm (VND)" value={form.night_fee} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* Payment Methods and Mobile App Checkboxes */}
        <div className="md:col-span-2 flex gap-4 items-center flex-wrap">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" name="payment_cash" checked={form.payment_cash} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" /> Tiền mặt
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" name="payment_card" checked={form.payment_card} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" /> Thẻ ngân hàng
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="payment_insurance" checked={form.payment_insurance} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" /> Bảo hiểm
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" name="has_mobile_app" checked={form.has_mobile_app} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" /> Có ứng dụng di động
          </label>
        </div>

        {/* Highlight Services Input */}
        <div className="md:col-span-2">
          <label htmlFor="highlight_services" className="block text-sm font-medium text-gray-700 mb-1">Các dịch vụ nổi bật (phân cách bởi dấu phẩy)</label>
          <input
            id="highlight_services"
            name="highlight_services"
            placeholder="VD: Dịch vụ nhanh, Hỗ trợ 24/7, Xe 7 chỗ"
            value={form.highlight_services.join(', ')} // Display array as comma-separated string
            onChange={handleHighlightServicesChange} // Use specific handler for this field
            className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="status" className="block font-medium text-gray-700 mb-1">📌 Trạng thái hoạt động:</label>
          <select id="status" name="status" value={form.status} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500">
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
            <option value="draft">Nháp</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="col-span-1 md:col-span-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out">
          ✅ Lưu Hãng Vận Chuyển
        </button>
      </form>
    </div>
  );
};

export default CreateTransportCompany;
