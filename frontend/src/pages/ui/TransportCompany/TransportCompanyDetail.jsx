import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTransportCompanyById } from "../../../services/ui/TransportCompany/transportCompanyService";

const labelMapPrice = {
  base_km: "Giá khởi điểm (2km đầu)",
  additional_km: "Giá mỗi km thêm",
  waiting_hour: "Phí thời gian muộn mỗi giờ",
  waiting_minute_fee: "Phụ phí chờ mỗi phút",
  night_fee: "Phụ phí 22h - 5h",
  daily_rate: "Giá thuê theo ngày",
  hourly_rate: "Giá thuê theo giờ",
  base_fare: "Giá vé cơ bản (xe buýt)",
};

const labelMapPayment = {
  cash: "Tiền mặt",
  bank_card: "Thanh toán thẻ",
  insurance: "Bảo hiểm",
  momo: "MoMo",
  zalopay: "ZaloPay",
};

const TransportCompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const ASSET_BASE_URL = "http://localhost:8000/storage/";

  useEffect(() => {
    getTransportCompanyById(id)
      .then((res) => setCompany(res.data?.data))
      .catch((err) => console.error("Lỗi khi tải dữ liệu:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const parseJSON = (value) => {
    if (typeof value === "string") {
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

  const logoUrl = company.transportation?.icon
    ? company.transportation.icon.startsWith("http")
      ? company.transportation.icon
      : ASSET_BASE_URL + company.transportation.icon
    : "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Icon";

  let bannerUrl = "/default-banner.jpg";
  if (company.transportation?.banner) {
    bannerUrl = company.transportation.banner.startsWith("http")
      ? company.transportation.banner
      : ASSET_BASE_URL + company.transportation.banner;
  }

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
            onError={(e) =>
              (e.target.src =
                "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Icon")
            }
            className="w-20 h-20 object-contain rounded-full border-4 border-white shadow-lg bg-white p-2"
          />
          <div>
            <h1 className="text-3xl font-extrabold">{company.name}</h1>
            <p className="text-base font-light">
              Hãng xe uy tín hàng đầu Việt Nam
            </p>
            <p className="text-sm mt-1">
              ⭐ {company.rating ? company.rating.toFixed(1) : "Chưa có"} đánh
              giá - {company.coverage_area || "Toàn quốc"} -{" "}
              {company.is_24_7 ? "24/7 hoạt động" : "Giờ giới hạn"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Thông tin chi tiết
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="col-span-7 text-left">
            <h3 className="text-lg font-semibold mb-2">Giới thiệu</h3>
            <p className="text-sm text-gray-700">
              {company.description || "Không có mô tả."}
            </p>

            <div className="mt-4">
              <h3 className="font-semibold">Bảng giá dịch vụ</h3>
              <ul className="text-sm mt-2 space-y-1">
                {Object.entries(price).length > 0 ? (
                  Object.entries(price).map(([k, v]) => (
                    <li key={k}>
                      {labelMapPrice[k] || k}: {Number(v).toLocaleString()} VND
                    </li>
                  ))
                ) : (
                  <li>Không có thông tin giá.</li>
                )}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Thời gian hoạt động</h3>
              <ul className="text-sm mt-2 space-y-1">
                {Object.entries(hours).length > 0 ? (
                  Object.entries(hours).map(([k, v]) => (
                    <li key={k}>
                      {k === "hotline_response_time" ? "Thời gian phản hồi" : k}
                      : {v}
                    </li>
                  ))
                ) : (
                  <li>Không có thông tin giờ hoạt động.</li>
                )}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Phương thức thanh toán</h3>
              <ul className="text-sm mt-2 space-y-1">
                {methods.length > 0 ? (
                  methods.map((m, i) => (
                    <li key={i}>{labelMapPayment[m] || m}</li>
                  ))
                ) : (
                  <li>Không có thông tin phương thức thanh toán.</li>
                )}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Dịch vụ nổi bật</h3>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Ứng dụng di động
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Thanh toán online
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  Bảo hiểm
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3 text-right">
            <h3 className="font-semibold mb-3">Thông tin liên hệ</h3>
            <ul className="text-sm space-y-2">
              <li>
                <strong>📍 Địa chỉ:</strong>{" "}
                {company.address || "Đang cập nhật"}
              </li>
              <li>
                <strong>📞 Hotline:</strong> {company.phone_number || "—"}
              </li>
              <li>
                <strong>📧 Email:</strong> {company.email || "—"}
              </li>
              <li>
                <strong>🌐 Website:</strong>{" "}
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {company.website}
                  </a>
                ) : (
                  "—"
                )}
              </li>
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
                Gọi ngay
              </button>
              <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md">
                Nhắn tin quản lý
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">
          Vị trí trên bản đồ
        </h3>
        <div className="w-full h-64 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center text-gray-500">
          <p>Bản đồ sẽ hiển thị ở đây</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Cột bên trái - chiếm 70% */}
        <div className="flex-[7] bg-blue-100 p-4 rounded-lg">
          {/* Nội dung cột trái */}
          <h2 className="text-xl font-bold mb-2">Giới thiệu</h2>
          <p className="text-gray-700">Nội dung phần giới thiệu ở đây...</p>
        </div>

        {/* Cột bên phải - chiếm 30% */}
        <div className="flex-[3] bg-green-100 p-4 rounded-lg">
          {/* Nội dung cột phải */}
          <h2 className="text-xl font-bold mb-2">Thông tin liên hệ</h2>
          <p className="text-gray-700">Số điện thoại, email,...</p>
        </div>
      </div>
    </div>
  );
};

export default TransportCompanyDetail;
