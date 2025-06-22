import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransportCompanyById } from '../../../services/ui/TransportCompany/transportCompanyService';
const labelMapPrice = {
  base_km: 'Giá khởi điểm (2km đầu)',
  additional_km: 'Giá mỗi km thêm',
  waiting_hour: 'Phí thời gian muộn mỗi phút', // ← để khớp key từ API
  waiting_minute_fee: 'Phụ phí chờ mỗi phút',
  night_fee: 'Phụ phí 22h - 5h',
  daily_rate: 'Giá thuê theo ngày',
  hourly_rate: 'Giá thuê theo giờ',
  base_fare: 'Giá vé cơ bản (xe buýt)',
};


const labelMapPayment = {
  cash: 'Tiền mặt',
  bank_card: 'Thanh toán thẻ',
  insurance: 'Bảo hiểm',
};

const bannerMap = {
  1: '/banners/bike.jpg',
  2: '/banners/taxi.jpg',
  3: '/banners/bus.jpg',
  4: '/banners/grab.jpg',
};

const TransportCompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const ASSET_BASE_URL = 'http://localhost:8000/storage/';

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
  const methodsRaw = parseJSON(company.payment_methods);
  const methods = Array.isArray(methodsRaw) ? methodsRaw : [];
  const logoUrl = company.logo
    ? ASSET_BASE_URL + company.logo
    : 'https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Logo';
  const bannerUrl = bannerMap[company.transportation_id] || '/banners/default.jpg';

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div
        className="relative bg-cover bg-center h-64 flex items-center justify-start pl-8 md:pl-16"
        style={{ backgroundImage: `url('${bannerUrl}')` }}
      >
        <div className="flex items-center gap-6 text-white">
          <img
            src={logoUrl}
            alt={company.name}
            onError={(e) => (e.target.src = 'https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Logo')}
            className="w-20 h-20 object-contain rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h1 className="text-3xl font-extrabold">{company.name}</h1>
            <p className="text-base font-light">Hãng xe uy tín hàng đầu Việt Nam</p>
            <p className="text-sm mt-1">⭐ {company.rating ?? '4.8'} đánh giá - Toàn quốc - 24/7 hoạt động</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Thông tin chi tiết</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
            <p className="text-sm text-gray-700">{company.description || 'Không có mô tả.'}</p>

            <div className="mt-4">
              <h3 className="font-semibold">Bảng giá dịch vụ</h3>
              <ul className="text-sm mt-2 space-y-1">
                {Object.entries(price).map(([k, v]) => (
                  <li key={k}>{labelMapPrice[k] || k}: {Number(v).toLocaleString()} VND</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Thời gian hoạt động</h3>
              <ul className="text-sm mt-2 space-y-1">
                {Object.entries(hours).map(([k, v]) => (
                  <li key={k}>{k === 'hotline_response_time' ? 'Thời gian phản hồi' : k}: {v}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Phương thức thanh toán</h3>
              <ul className="text-sm mt-2 space-y-1">
                {methods.map((m, i) => (
                  <li key={i}>{labelMapPayment[m] || m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Thông tin liên hệ</h3>
            <ul className="text-sm space-y-2">
              <li><strong>📍 Địa chỉ:</strong> {company.address}</li>
              <li><strong>📞 Hotline:</strong> {company.phone_number || '—'}</li>
              <li><strong>📧 Email:</strong> {company.email || '—'}</li>
              <li><strong>🌐 Website:</strong> <a href={company.website} target="_blank" className="text-blue-600 underline">{company.website}</a></li>
            </ul>

            <div className="mt-6">
              <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Gọi ngay</button>
              <button className="w-full py-2 mt-2 bg-green-600 text-white rounded hover:bg-green-700">Nhắn tin quản lý</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Vị trí trên bản đồ</h3>
        <div className="w-full h-64 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
          <img
            src="https://placehold.co/600x400/999999/FFFFFF?text=Map+Placeholder"
            alt="Vị trí trên bản đồ"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default TransportCompanyDetail;
