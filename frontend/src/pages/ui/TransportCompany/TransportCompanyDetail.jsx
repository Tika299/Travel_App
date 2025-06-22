import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { getTransportCompanyById } from '../../../services/ui/TransportCompany/transportCompanyService';

// Maps raw price keys to more readable labels
const labelMapPrice = {
  base_km: 'Giá 2km đầu',
  additional_km: 'Giá mỗi km thêm',
  waiting_minute_fee: 'Phí chờ mỗi phút',
  night_fee: 'Phụ thu ban đêm',
};

// Maps raw payment method keys to more readable labels
const labelMapPayment = {
  cash: 'Tiền mặt',
  bank_card: 'Thẻ ngân hàng',
  insurance: 'Bảo hiểm',
};

const TransportCompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base URL for images, assuming your Laravel storage is public via /storage
  // Adjust this if your actual asset URL is different
  const ASSET_BASE_URL = 'http://localhost:8000/storage/';

  useEffect(() => {
    getTransportCompanyById(id)
      .then((res) => setCompany(res.data?.data))
      .catch((err) => console.error('Lỗi khi tải dữ liệu:', err))
      .finally(() => setLoading(false));
  }, [id]);

  // Safely parse JSON strings from the API response
  const parseJSON = (value) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {}; // Return empty object on parsing error
      }
    }
    return value || {}; // Return value if not a string, or empty object if null/undefined
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-gray-700">🔄 Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl text-red-500">❌ Không tìm thấy hãng.</p>
      </div>
    );
  }

  // Parse data fields that are stored as JSON strings
  const price = parseJSON(company.price_range); //
  const hours = parseJSON(company.operating_hours); //
  const methodsRaw = parseJSON(company.payment_methods); //
  // Ensure methods is an array for mapping
  const methods = Array.isArray(methodsRaw) ? methodsRaw : []; //

  // Construct the full image URL
  const logoUrl = company.logo ? ASSET_BASE_URL + company.logo : '/placeholder-logo.png'; //

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between">
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="absolute top-4 left-4 bg-white text-blue-600 p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Quay lại"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left w-full mt-12 sm:mt-0">
            {company.logo && (
              <img
                src={logoUrl} // Use the constructed logo URL
                alt={company.name} //
                onError={(e) => (e.target.src = '/placeholder-logo.png')} //
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-white p-2 rounded-full shadow-md border-4 border-white mb-4 sm:mb-0 sm:mr-6"
              />
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{company.name}</h1> {/* */}
              <p className="text-sm sm:text-base opacity-90">{company.description || 'Không có mô tả chi tiết.'}</p> {/* */}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8">
          {/* Contact and General Info */}
          <section className="mb-8 border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="material-icons mr-2 text-blue-500">info</span> Thông tin liên hệ & chung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <p className="flex items-center">
                <span className="material-icons mr-2 text-blue-500">location_on</span>
                <strong>Địa chỉ:</strong> {company.address || '—'} {/* */}
              </p>
              <p className="flex items-center">
                <span className="material-icons mr-2 text-blue-500">phone</span>
                <strong>Điện thoại:</strong> {company.phone_number || '—'} {/* */}
              </p>
              <p className="flex items-center">
                <span className="material-icons mr-2 text-blue-500">email</span>
                <strong>Email:</strong> {company.email || '—'} {/* */}
              </p>
              <p className="flex items-center">
                <span className="material-icons mr-2 text-blue-500">language</span>
                <strong>Website:</strong>{' '}
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website} {/* */}
                  </a>
                ) : '—'}
              </p>
              <p className="flex items-center">
                <span className="material-icons mr-2 text-blue-500">star</span>
                <strong>Đánh giá:</strong> {company.rating ?? 'Chưa có'} ⭐ {/* */}
              </p>
              <p className="flex items-center">
                <span className="material-icons mr-2 text-blue-500">smartphone</span>
                <strong>Ứng dụng di động:</strong> {company.has_mobile_app ? 'Có' : 'Không'} {/* */}
              </p>
            </div>
          </section>

          {/* Operating Hours */}
          <section className="mb-8 border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="material-icons mr-2 text-blue-500">schedule</span> Giờ hoạt động
            </h2>
            {Object.keys(hours).length === 0 ? (
              <p className="text-gray-600">Không có thông tin giờ hoạt động.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                {Object.entries(hours).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    <span className="material-icons mr-2 text-green-500">access_time</span>
                    <strong>{key === 'hotline_response_time' ? 'Phản hồi tổng đài' : key}:</strong> {value} {/* */}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Price Rates */}
          <section className="mb-8 border-b pb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="material-icons mr-2 text-blue-500">money</span> Giá cước
            </h2>
            {Object.keys(price).length === 0 ? (
              <p className="text-gray-600">Không có thông tin giá cước.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                {Object.entries(price).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    <span className="material-icons mr-2 text-green-500">attach_money</span>
                    <strong>{labelMapPrice[key] || key}:</strong> {Number(value).toLocaleString()} VND {/* */}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Payment Methods */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="material-icons mr-2 text-blue-500">credit_card</span> Phương thức thanh toán
            </h2>
            {methods.length === 0 ? (
              <p className="text-gray-600">Không có thông tin phương thức thanh toán.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                {methods.map((method, index) => (
                  <li key={index} className="flex items-center">
                    <span className="material-icons mr-2 text-green-500">check_circle</span>
                    {labelMapPayment[method] || method} {/* */}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TransportCompanyDetail;