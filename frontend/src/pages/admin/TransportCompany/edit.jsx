import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTransportCompanyById,
  updateTransportCompany,
} from '../../../services/ui/TransportCompany/transportCompanyService';

const EditTransportCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  // State mới để quản lý giá trị chuỗi thô của input highlight_services
  const [highlightServicesInputString, setHighlightServicesInputString] = useState('');

  useEffect(() => {
    getTransportCompanyById(id)
      .then((res) => {
        const data = res.data.data;

        // Xử lý operating_hours
        let parsedOperatingHours = {};
        if (data.operating_hours) {
          try {
            // Nếu là một chuỗi, parse nó. Ngược lại, giả định nó đã là một đối tượng.
            if (typeof data.operating_hours === 'string') {
              parsedOperatingHours = JSON.parse(data.operating_hours);
            } else if (typeof data.operating_hours === 'object') {
              parsedOperatingHours = data.operating_hours;
            }
          } catch (e) {
            console.error('Lỗi khi parse operating_hours:', e);
            parsedOperatingHours = {}; // Quay về đối tượng rỗng khi lỗi
          }
        }
        // Đảm bảo các khóa cụ thể có mặt, ngay cả khi rỗng
        parsedOperatingHours['Thứ 2- Chủ Nhật'] = parsedOperatingHours['Thứ 2- Chủ Nhật'] || '';
        parsedOperatingHours['Tổng Đài '] = parsedOperatingHours['Tổng Đài '] || ''; // Duy trì khoảng trắng cuối nếu backend sử dụng
        parsedOperatingHours['Thời gian phản hồi'] = parsedOperatingHours['Thời gian phản hồi'] || '';


        // Xử lý highlight_services - Logic parse mạnh mẽ từ các cuộc thảo luận trước
        let parsedHighlightServices = [];
        if (data.highlight_services) {
            try {
                if (Array.isArray(data.highlight_services) && data.highlight_services.length > 0 && typeof data.highlight_services[0] === 'string' && data.highlight_services[0].startsWith('["')) {
                    const combinedString = data.highlight_services.join('');
                    const tempArray = JSON.parse(combinedString);
                    if (Array.isArray(tempArray)) {
                        parsedHighlightServices = tempArray.map(item => String(item));
                    }
                } else if (typeof data.highlight_services === 'string') {
                    const tempArray = JSON.parse(data.highlight_services);
                    if (Array.isArray(tempArray)) {
                        parsedHighlightServices = tempArray.map(item => String(item));
                    }
                } else if (Array.isArray(data.highlight_services)) {
                    parsedHighlightServices = data.highlight_services.map(item => String(item));
                }
            } catch (e) {
                console.warn('Could not parse highlight_services, falling back to comma split:', data.highlight_services, e);
                if (typeof data.highlight_services === 'string') {
                    parsedHighlightServices = data.highlight_services.split(',').map(s => s.trim());
                } else if (Array.isArray(data.highlight_services)) {
                    parsedHighlightServices = data.highlight_services.map(item => {
                        try {
                            return JSON.parse(item);
                        } catch (e) {
                            return String(item).replace(/^\["|"\]$/g, '').trim();
                        }
                    }).flat().filter(Boolean);
                }
            }
        }

        setForm({
          ...data,
          short_description: data.short_description || '',
          base_km: data.price_range?.base_km || '',
          additional_km: data.price_range?.additional_km || '',
          waiting_minute_fee: data.price_range?.waiting_minute_fee || '',
          night_fee: data.price_range?.night_fee || '',
          contact_response_time: data.contact_response_time || '',
          payment_cash: data.payment_methods?.includes('cash') || false,
          payment_card: data.payment_methods?.includes('bank_card') || false,
          payment_insurance: data.payment_methods?.includes('insurance') || false,
          has_mobile_app: data.has_mobile_app || false,
          highlight_services: parsedHighlightServices, // Sử dụng giá trị đã được xử lý
          status: data.status || 'active',
          operating_hours: parsedOperatingHours, // Sử dụng đối tượng đã được xử lý
        });
        
        // Khởi tạo giá trị chuỗi input khi form được tải
        setHighlightServicesInputString(parsedHighlightServices.join(', '));

        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi lấy dữ liệu hãng vận chuyển:', err);
        alert('Không tìm thấy hãng vận chuyển hoặc có lỗi khi tải dữ liệu.');
        navigate('/admin/transport-companies');
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Hàm xử lý thay đổi đối tượng operating_hours
  const handleOperatingHoursChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [key]: value,
      },
    }));
  };

  // Hàm xử lý khi input highlight_services mất focus
  const handleHighlightServicesInputBlur = () => {
    // Chuyển đổi chuỗi input thành mảng và cập nhật state form
    setForm(prev => ({
      ...prev,
      highlight_services: highlightServicesInputString.split(',').map(s => s.trim()).filter(s => s),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Đảm bảo highlight_services được cập nhật từ input string trước khi gửi
    // Điều này sẽ được xử lý tự động nếu blur event xảy ra trước khi submit,
    // nhưng thêm vào đây để chắc chắn trong mọi trường hợp.
    const finalHighlightServices = highlightServicesInputString.split(',').map(s => s.trim()).filter(s => s);


    const payload = {
      name: form.name,
      transportation_id: parseInt(form.transportation_id) || 0, // Đảm bảo phân tích cú pháp ngay cả khi rỗng
      address: form.address,
      latitude: parseFloat(form.latitude) || 0, // Đảm bảo phân tích cú pháp ngay cả khi rỗng
      longitude: parseFloat(form.longitude) || 0, // Đảm bảo phân tích cú pháp ngay cả khi rỗng
      phone_number: form.phone_number || null,
      email: form.email || null,
      website: form.website || null,
      logo: form.logo || null,
      short_description: form.short_description || '',
      description: form.description || '',
      rating: parseFloat(form.rating) || null,
      price_range: {
        base_km: parseInt(form.base_km) || 0, // Đảm bảo phân tích cú pháp
        additional_km: parseInt(form.additional_km) || 0, // Đảm bảo phân tích cú pháp
        waiting_minute_fee: parseInt(form.waiting_minute_fee) || 0, // Đảm bảo phân tích cú pháp
        night_fee: parseInt(form.night_fee) || 0, // Đảm bảo phân tích cú pháp
      },
      // operating_hours được gửi dưới dạng đối tượng trực tiếp
      operating_hours: form.operating_hours, 
      contact_response_time: form.contact_response_time || 'N/A',
      payment_methods: [
        ...(form.payment_cash ? ['cash'] : []),
        ...(form.payment_card ? ['bank_card'] : []),
        ...(form.payment_insurance ? ['insurance'] : []),
      ],
      has_mobile_app: form.has_mobile_app,
      // highlight_services được gửi dưới dạng mảng trực tiếp
      highlight_services: finalHighlightServices, // Sử dụng giá trị đã xử lý ngay trước khi gửi
      status: form.status || 'active',
    };

    try {
      await updateTransportCompany(id, payload);
      alert('✅ Cập nhật thông tin hãng vận chuyển thành công!');
      navigate('/admin/transport-companies');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error('Lỗi xác thực dữ liệu:', error.response.data.errors);
        alert('❌ Lỗi dữ liệu nhập vào: ' + JSON.stringify(error.response.data.errors, null, 2));
      } else {
        console.error('Lỗi khi cập nhật hãng vận chuyển:', error);
        alert('❌ Cập nhật thất bại. Vui lòng kiểm tra dữ liệu hoặc kết nối mạng.');
      }
    }
  };

  if (loading || !form) {
    return <div className="p-6 text-center text-gray-600">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">✏️ Sửa Hãng Vận Chuyển</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
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
          <input id="phone_number" name="phone_number" placeholder="Số điện thoại" value={form.phone_number || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="email" name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="email" />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input id="website" name="website" placeholder="Website" value={form.website || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="url" />
        </div>
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn logo</label>
          <input id="logo" name="logo" placeholder="Đường dẫn logo" value={form.logo || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="text" />
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Đánh giá</label>
          <input id="rating" name="rating" placeholder="Đánh giá" type="number" step="0.1" value={form.rating || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Descriptions */}
        <div className="md:col-span-2">
          <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu ngắn</label>
          <input id="short_description" name="short_description" placeholder="Giới thiệu ngắn" value={form.short_description || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
          <textarea id="description" name="description" placeholder="Mô tả" value={form.description || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" rows="3" />
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
              value={form.operating_hours['Tổng Đài ']}
              onChange={(e) => handleOperatingHoursChange('Tổng Đài ', e.target.value)}
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
              className="w-full p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Contact Response Time */}
        <div className="md:col-span-2">
          <label htmlFor="contact_response_time" className="block text-sm font-medium text-gray-700 mb-1">Thời gian phản hồi liên hệ</label>
          <input id="contact_response_time" name="contact_response_time" placeholder="Thời gian phản hồi liên hệ (VD: 1-2 giờ)" value={form.contact_response_time || ''} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" />
        </div>

        {/* Price Range */}
        <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">💰 Giá cước</h3>
          <div>
            <label htmlFor="base_km" className="block text-sm font-medium text-gray-700 mb-1">Giá 2km đầu (VND)</label>
            <input id="base_km" name="base_km" placeholder="Giá 2km đầu (VND)" value={form.base_km} onChange={handleChange} className="p-2 border border-gray-300 rounded-md mb-2 w-full focus:ring-blue-500 focus:border-blue-500" type="number" />
          </div>
          <div>
            <label htmlFor="additional_km" className="block text-sm font-medium text-gray-700 mb-1">Giá mỗi km tiếp theo (VND)</label>
            <input id="additional_km" name="additional_km" placeholder="Giá mỗi km tiếp theo (VND)" value={form.additional_km} onChange={handleChange} className="p-2 border border-gray-300 rounded-md mb-2 w-full focus:ring-blue-500 focus:border-blue-500" type="number" />
          </div>
          <div>
            <label htmlFor="waiting_minute_fee" className="block text-sm font-medium text-gray-700 mb-1">Phí chờ mỗi phút (VND)</label>
            <input id="waiting_minute_fee" name="waiting_minute_fee" placeholder="Phí chờ mỗi phút (VND)" value={form.waiting_minute_fee} onChange={handleChange} className="p-2 border border-gray-300 rounded-md mb-2 w-full focus:ring-blue-500 focus:border-blue-500" type="number" />
          </div>
          <div>
            <label htmlFor="night_fee" className="block text-sm font-medium text-gray-700 mb-1">Phụ thu ban đêm (VND)</label>
            <input id="night_fee" name="night_fee" placeholder="Phụ thu ban đêm (VND)" value={form.night_fee} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500" type="number" />
          </div>
        </div>

        {/* Payment Methods and Mobile App */}
        <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-3 items-center">
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" name="payment_cash" checked={form.payment_cash} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" /> Tiền mặt
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input type="checkbox" name="payment_card" checked={form.payment_card} onChange={handleChange} className="form-checkbox h-5 w-5 text-blue-600 rounded" /> Thẻ ngân hàng
          </label>
          <label className="flex items-center gap-2 text-gray-700">
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
            value={highlightServicesInputString} // Sử dụng state riêng cho input string
            onChange={(e) => setHighlightServicesInputString(e.target.value)} // Cập nhật state string
            onBlur={handleHighlightServicesInputBlur} // Cập nhật state form khi mất focus
            className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="col-span-1 md:col-span-2">
          <label htmlFor="status" className="block font-medium text-gray-700 mb-1">📌 Trạng thái hoạt động:</label>
          <select id="status" name="status" value={form.status || 'active'} onChange={handleChange} className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500">
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
            <option value="draft">Nháp</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="col-span-1 md:col-span-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">
          💾 Lưu Cập Nhật
        </button>
      </form>
    </div>
  );
};

export default EditTransportCompany;