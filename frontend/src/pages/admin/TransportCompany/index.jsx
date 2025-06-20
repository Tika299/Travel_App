import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllTransportCompanies,
  deleteTransportCompany,
} from '../../../services/ui/TransportCompany/transportCompanyService';

const TransportCompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getAllTransportCompanies();
        setCompanies(res.data.data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách:', err);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xoá hãng vận chuyển này không?')) {
      try {
        await deleteTransportCompany(id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        alert('Xoá thất bại');
      }
    }
  };

  const renderOperatingHours = (hours) => {
    if (!hours || typeof hours !== 'object') return '—';
    const { hotline_response_time, ...days } = hours;
    return (
      <div className="text-sm space-y-1">
        {Object.entries(days).map(([day, value]) => (
          <div key={day}><strong>{day}:</strong> {value}</div>
        ))}
        {hotline_response_time && (
          <div><strong>Phản hồi tổng đài:</strong> {hotline_response_time}</div>
        )}
      </div>
    );
  };

  const renderPriceRange = (price) => {
    if (!price || typeof price !== 'object') return '—';
    return (
      <ul className="list-disc list-inside text-sm text-gray-700">
        {price.base_km && <li>Giá 2km đầu: {price.base_km.toLocaleString()} VND</li>}
        {price.additional_km && <li>Giá mỗi km thêm: {price.additional_km.toLocaleString()} VND</li>}
        {price.waiting_minute_fee && <li>Phí chờ mỗi phút: {price.waiting_minute_fee.toLocaleString()} VND</li>}
        {price.night_fee && <li>Phụ thu ban đêm: {price.night_fee.toLocaleString()} VND</li>}
      </ul>
    );
  };

  const renderPaymentMethods = (methods) => {
    let list = methods;

    try {
      if (typeof methods === 'string') {
        list = JSON.parse(methods);
      }
    } catch {
      return '—';
    }

    if (!Array.isArray(list)) return '—';

    const map = {
      cash: 'Tiền mặt',
      bank_card: 'Thẻ ngân hàng',
      insurance: 'Bảo hiểm',
    };

    return (
      <ul className="list-disc list-inside text-sm text-gray-700">
        {list.map((m, i) => (
          <li key={i}>{map[m] || m}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🚗 Danh sách Hãng Vận Chuyển</h1>
      <button
        onClick={() => navigate('/admin/transport-companies/create')}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        ➕ Thêm mới
      </button>

      <div className="space-y-4">
        {companies.map((c) => (
          <div key={c.id} className="border p-4 rounded bg-white shadow space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">{c.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/admin/transport-companies/edit/${c.id}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  🗑️ Xoá
                </button>
              </div>
            </div>

            {c.logo && (
              <img
                src={c.logo}
                alt={c.name}
                className="h-24 object-contain rounded border"
              />
            )}

            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <p><strong>Địa chỉ:</strong> {c.address}</p>
              <p><strong>Loại hình:</strong> {c.transportation_id}</p>
              <p><strong>Liên hệ:</strong> {c.contact_info || '—'}</p>
              <p><strong>Điện thoại:</strong> {c.phone_number || '—'}</p>
              <p><strong>Email:</strong> {c.email || '—'}</p>
              <p>
                <strong>Website:</strong>{' '}
                {c.website ? (
                  <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {c.website}
                  </a>
                ) : '—'}
              </p>
              <p><strong>Latitude:</strong> {c.latitude}</p>
              <p><strong>Longitude:</strong> {c.longitude}</p>
              <p><strong>Đánh giá:</strong> {c.rating ?? '—'}</p>
              <p><strong>📱 Ứng dụng di động:</strong> {c.has_mobile_app ? 'Có' : 'Không'}</p>

              <div className="md:col-span-2">
                <strong>🕒 Giờ hoạt động:</strong>
                {renderOperatingHours(c.operating_hours)}
              </div>

              <div className="md:col-span-2">
                <strong>💰 Giá cước:</strong>
                {renderPriceRange(c.price_range)}
              </div>

              <div className="md:col-span-2">
                <strong>💳 Phương thức thanh toán:</strong>
                {renderPaymentMethods(c.payment_methods)}
              </div>
            </div>

            {c.description && (
              <div className="mt-2 text-sm">
                <strong>Mô tả:</strong>
                <p className="text-gray-700">{c.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportCompanyList;
