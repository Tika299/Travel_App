import React, { useEffect, useState } from 'react';
import { getAllTransportCompanies } from '../../../services/ui/TransportCompany/transportCompanyService';
import { Link } from 'react-router-dom';

const TransportCompanyPage = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    getAllTransportCompanies()
      .then((res) => {
        const allCompanies = res.data.data || [];
        const activeCompanies = allCompanies.filter(c => c.status === 'active');
        setCompanies(activeCompanies);
      })
      .catch((err) => console.error('Lỗi gọi API:', err));
  }, []);

  const renderOperatingHours = (data) => {
    if (!data || typeof data !== 'object') return null;

    const { hotline_response_time, ...days } = data;
    return (
      <div className="text-sm text-gray-700">
        <strong>🕒 Giờ hoạt động:</strong>
        <ul className="list-disc list-inside">
          {Object.entries(days).map(([day, hours]) => (
            <li key={day}>{day}: {hours}</li>
          ))}
          {hotline_response_time && (
            <li><strong>Tổng đài phản hồi:</strong> {hotline_response_time}</li>
          )}
        </ul>
      </div>
    );
  };

  const renderPriceRange = (data) => {
    if (!data || typeof data !== 'object') return null;

    const labelMap = {
      base_km: 'Giá 2km đầu',
      additional_km: 'Giá mỗi km thêm',
      waiting_minute_fee: 'Phí chờ mỗi phút',
      night_fee: 'Phụ thu ban đêm'
    };

    return (
      <div className="text-sm text-gray-700">
        <strong>💰 Giá cước:</strong>
        <ul className="list-disc list-inside">
          {Object.entries(data).map(([key, val]) => (
            <li key={key}>
              {(labelMap[key] || key)}: {Number(val).toLocaleString()} VND
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderPaymentMethods = (methods) => {
    if (!methods || !Array.isArray(methods)) return null;

    const map = {
      cash: 'Tiền mặt',
      bank_card: 'Thẻ ngân hàng',
      insurance: 'Bảo hiểm'
    };

    return (
      <div className="text-sm text-gray-700">
        <strong>💳 Phương thức thanh toán:</strong>
        <ul className="list-disc list-inside">
          {methods.map((m, i) => (
            <li key={i}>{map[m] || m}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🚗 Danh sách Hãng Vận Chuyển</h2>

      {companies.length === 0 ? (
        <p className="text-gray-600">⚠️ Không có hãng vận chuyển nào đang hoạt động.</p>
      ) : (
        <div className="space-y-6">
          {companies.map((c) => {
            const priceRange = typeof c.price_range === 'string'
              ? JSON.parse(c.price_range || '{}')
              : c.price_range || {};

            const operatingHours = typeof c.operating_hours === 'string'
              ? JSON.parse(c.operating_hours || '{}')
              : c.operating_hours || {};

            return (
              <div
                key={c.id}
                className="border rounded p-4 shadow-md bg-white flex flex-col md:flex-row gap-4"
              >
                {c.logo && (
                  <img
                    src={c.logo}
                    alt={c.name}
                    className="w-32 h-32 object-contain rounded border"
                  />
                )}

                <div className="flex-1 space-y-2">
                  <Link
                    to={`/transport-companies/${c.id}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {c.name}
                  </Link>

                  <p className="text-gray-700">{c.description || 'Không có mô tả.'}</p>

                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><strong>Địa chỉ:</strong> {c.address}</p>
                    <p><strong>Điện thoại:</strong> {c.phone_number || '—'}</p>
                    <p><strong>Email:</strong> {c.email || '—'}</p>
                    <p>
                      <strong>Website:</strong>{' '}
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {c.website}
                        </a>
                      ) : '—'}
                    </p>
                    <p><strong>Loại hình:</strong> #{c.transportation_id}</p>
                    <p><strong>Đánh giá:</strong> ⭐ {c.rating ?? 'Chưa có'}</p>
                    <p><strong>Ứng dụng di động:</strong> {c.has_mobile_app ? 'Có' : 'Không'}</p>
                  </div>

                  {renderOperatingHours(operatingHours)}
                  {renderPriceRange(priceRange)}
                  {renderPaymentMethods(c.payment_methods)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransportCompanyPage;
