import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTransportCompanyById,
  updateTransportCompany,
} from '../../../services/ui/TransportCompany/transportCompanyService';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const EditTransportCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [operatingHours, setOperatingHours] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransportCompanyById(id)
      .then((res) => {
        const data = res.data.data;

        const hours = data.operating_hours || {};

        setOperatingHours(daysOfWeek.reduce((acc, day) => ({
          ...acc,
          [day]: hours[day] || '24/7'
        }), {
          hotline: hours.hotline || '24/7'
        }));

        setForm({
          ...data,
          base_km: data.price_range?.base_km || '',
          additional_km: data.price_range?.additional_km || '',
          waiting_minute_fee: data.price_range?.waiting_minute_fee || '',
          night_fee: data.price_range?.night_fee || '',
          hotline_response_time: data.operating_hours?.hotline_response_time || '',
          payment_cash: data.payment_methods?.includes('cash') || false,
          payment_card: data.payment_methods?.includes('bank_card') || false,
          payment_insurance: data.payment_methods?.includes('insurance') || false,
          has_mobile_app: data.has_mobile_app || false
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi khi lấy dữ liệu:', err);
        alert('Không tìm thấy hãng vận chuyển');
        navigate('/admin/transport-companies');
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHoursChange = (day, value) => {
    setOperatingHours((prev) => ({ ...prev, [day]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      rating: parseFloat(form.rating) || null,
      price_range: {
        base_km: parseInt(form.base_km),
        additional_km: parseInt(form.additional_km),
        waiting_minute_fee: parseInt(form.waiting_minute_fee),
        night_fee: parseInt(form.night_fee),
      },
      operating_hours: {
        ...operatingHours,
        hotline_response_time: form.hotline_response_time
      },
      payment_methods: [
        ...(form.payment_cash ? ['cash'] : []),
        ...(form.payment_card ? ['bank_card'] : []),
        ...(form.payment_insurance ? ['insurance'] : [])
      ],
      has_mobile_app: form.has_mobile_app
    };

    try {
      await updateTransportCompany(id, payload);
      alert('✅ Cập nhật thành công');
      navigate('/admin/transport-companies');
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      alert('❌ Cập nhật thất bại. Kiểm tra dữ liệu hoặc mạng.');
    }
  };

  if (loading || !form) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">✏️ Sửa Hãng Vận Chuyển</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" placeholder="Tên hãng" value={form.name} onChange={handleChange} className="p-2 border rounded" required />
        <input name="transportation_id" placeholder="ID loại hình vận chuyển" value={form.transportation_id} onChange={handleChange} className="p-2 border rounded" required />
        <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} className="p-2 border rounded" required />
        <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} className="p-2 border rounded" required />
        <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} className="p-2 border rounded" required />
        <input name="contact_info" placeholder="Thông tin liên hệ" value={form.contact_info || ''} onChange={handleChange} className="p-2 border rounded" />
        <input name="phone_number" placeholder="Số điện thoại" value={form.phone_number || ''} onChange={handleChange} className="p-2 border rounded" />
        <input name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} className="p-2 border rounded" />
        <input name="website" placeholder="Website" value={form.website || ''} onChange={handleChange} className="p-2 border rounded" />
        <input name="logo" placeholder="Đường dẫn logo" value={form.logo || ''} onChange={handleChange} className="p-2 border rounded" />
        <input name="rating" placeholder="Đánh giá" type="number" step="0.1" value={form.rating || ''} onChange={handleChange} className="p-2 border rounded" />

        <textarea name="description" placeholder="Mô tả" value={form.description || ''} onChange={handleChange} className="p-2 border rounded col-span-1 md:col-span-2" rows="3" />

        <div className="md:col-span-2">
          <h3 className="font-semibold mb-2">🕒 Giờ hoạt động</h3>
          {daysOfWeek.map((day) => (
            <div key={day} className="mb-1">
              <label className="block text-sm font-medium text-gray-700">{day}</label>
              <input
                type="text"
                value={operatingHours[day] || ''}
                onChange={(e) => handleHoursChange(day, e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
        </div>

        <input name="hotline_response_time" placeholder="Thời gian phản hồi tổng đài (VD: Dưới 30 giây)" value={form.hotline_response_time || ''} onChange={handleChange} className="p-2 border rounded md:col-span-2" />

        <div className="md:col-span-2">
          <h3 className="font-semibold mb-2">💰 Giá cước</h3>
          <input name="base_km" placeholder="Giá 2km đầu (VND)" value={form.base_km} onChange={handleChange} className="p-2 border rounded mb-2 w-full" />
          <input name="additional_km" placeholder="Giá mỗi km tiếp theo (VND)" value={form.additional_km} onChange={handleChange} className="p-2 border rounded mb-2 w-full" />
          <input name="waiting_minute_fee" placeholder="Phí chờ mỗi phút (VND)" value={form.waiting_minute_fee} onChange={handleChange} className="p-2 border rounded mb-2 w-full" />
          <input name="night_fee" placeholder="Phụ thu ban đêm (VND)" value={form.night_fee} onChange={handleChange} className="p-2 border rounded w-full" />
        </div>

        <div className="md:col-span-2 flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="payment_cash" checked={form.payment_cash} onChange={handleChange} /> Tiền mặt
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="payment_card" checked={form.payment_card} onChange={handleChange} /> Thẻ ngân hàng
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="payment_insurance" checked={form.payment_insurance} onChange={handleChange} /> Bảo hiểm
          </label>
        </div>

        <label className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" name="has_mobile_app" checked={form.has_mobile_app} onChange={handleChange} /> Có ứng dụng di động
        </label>

        <button
          type="submit"
          className="col-span-1 md:col-span-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          💾 Lưu Cập Nhật
        </button>
      </form>
    </div>
  );
};

export default EditTransportCompany;