import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTransportCompanyById } from '../../../services/ui/TransportCompany/transportCompanyService';

const TransportCompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransportCompanyById(id)
      .then((res) => setCompany(res.data?.data))
      .catch((err) => console.error('Lỗi khi tải dữ liệu:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const parseJSON = (value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
  };

  if (loading) return <p className="p-4">🔄 Đang tải dữ liệu...</p>;
  if (!company) return <p className="p-4">❌ Không tìm thấy hãng.</p>;

  const price = parseJSON(company.price_range);
  const hours = parseJSON(company.operating_hours);
  const methods = Array.isArray(company.payment_methods)
    ? company.payment_methods
    : parseJSON(company.payment_methods);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">{company.name}</h2>

      {company.logo && (
        <img src={company.logo} alt={company.name} className="w-40 h-40 object-contain rounded border mb-4" />
      )}

      <p className="text-gray-700 mb-4">{company.description || 'Không có mô tả.'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
        <p><strong>Địa chỉ:</strong> {company.address}</p>
        <p><strong>Điện thoại:</strong> {company.phone_number || '—'}</p>
        <p><strong>Email:</strong> {company.email || '—'}</p>
        <p><strong>Website:</strong> {company.website || '—'}</p>
        <p><strong>Đánh giá:</strong> ⭐ {company.rating ?? 'Chưa có'}</p>
        <p><strong>Ứng dụng:</strong> {company.has_mobile_app ? 'Có' : 'Không'}</p>
      </div>

      <div className="mt-4">
        <strong>🕐 Giờ hoạt động:</strong>
        <ul className="list-disc ml-5 mt-1">
          {Object.entries(hours).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <strong>💰 Giá cước:</strong>
        <ul className="list-disc ml-5 mt-1">
          {Object.entries(price).map(([k, v]) => (
            <li key={k}>{k}: {Number(v).toLocaleString()} VND</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <strong>💳 Thanh toán:</strong>
        <ul className="list-disc ml-5 mt-1">
          {methods.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransportCompanyDetail;
