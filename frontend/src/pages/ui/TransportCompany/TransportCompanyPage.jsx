import React, { useEffect, useState } from "react";
import { getAllTransportCompanies } from "../../../services/ui/TransportCompany/transportCompanyService";
import { getSuggestedTransportations } from "../../../services/ui/Transportation/transportationService";
import { Link, useLocation } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

const TransportCompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [transportType, setTransportType] = useState(null);
  const location = useLocation();

  // Tìm kiếm, lọc, sắp xếp, phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc"); // rating_desc, name_asc, price_asc, price_desc
  const [filterPrice, setFilterPrice] = useState("all"); // all, low, medium, high
  const [currentPage, setCurrentPage] = useState(1);

  const query = new URLSearchParams(location.search);
  const filterType = query.get("type");

  // Khi input searchTerm rỗng thì tự động reset currentSearchTerm để load lại tất cả dữ liệu
  useEffect(() => {
    if (searchTerm === "") {
      setCurrentSearchTerm("");
      setCurrentPage(1); // reset trang về 1
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, transportRes] = await Promise.all([
          getAllTransportCompanies(),
          getSuggestedTransportations(),
        ]);

        const allCompanies = companyRes.data.data || [];
        const activeCompanies = allCompanies.filter(
          (c) => c.status === "active"
        );

        // Lọc theo loại phương tiện (nếu có)
        let processedCompanies = filterType
          ? activeCompanies.filter(
              (c) => String(c.transportation_id) === filterType
            )
          : activeCompanies;

        // Tìm kiếm theo tên
        if (currentSearchTerm) {
          processedCompanies = processedCompanies.filter((company) =>
            company.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
          );
        }

        // Lọc theo giá
        if (filterPrice !== "all") {
          processedCompanies = processedCompanies.filter((company) => {
            let priceRange = {};
            if (typeof company.price_range === "string") {
              try {
                priceRange = JSON.parse(company.price_range || "{}");
              } catch {
                priceRange = {};
              }
            } else {
              priceRange = company.price_range || {};
            }
            const basePrice = Number(priceRange.base_km) || 0;

            if (filterPrice === "low")
              return basePrice > 0 && basePrice < 13000;
            if (filterPrice === "medium")
              return basePrice >= 13000 && basePrice <= 17000;
            if (filterPrice === "high") return basePrice > 20000;
            return true;
          });
        }

        // Sắp xếp
        processedCompanies.sort((a, b) => {
          if (sortBy === "rating_desc") {
            return (b.rating || 0) - (a.rating || 0);
          } else if (sortBy === "name_asc") {
            return a.name.localeCompare(b.name);
          } else if (sortBy === "price_asc") {
            const priceA = getBasePrice(a);
            const priceB = getBasePrice(b);
            return priceA - priceB;
          } else if (sortBy === "price_desc") {
            const priceA = getBasePrice(a);
            const priceB = getBasePrice(b);
            return priceB - priceA;
          }
          return 0;
        });

        // Giả định thêm các trường dữ liệu để hiển thị "Mới", "Thời gian hoạt động", "Khuyến mãi", "Tích điểm"
        // VÀ XỬ LÝ TAGS
        const companiesWithDisplayData = processedCompanies.map((c) => {
          let tags = [];
          if (typeof c.tags === "string") {
            try {
              tags = JSON.parse(c.tags);
            } catch {
              tags = [];
            }
          } else if (Array.isArray(c.tags)) {
            tags = c.tags;
          }

          return {
            ...c,
            is_new: c.id % 2 === 1, // Ví dụ: hãng có ID lẻ là "Mới"
            operating_hours: "5:00 - 23:00", // Giả định thời gian hoạt động cố định hoặc lấy từ c.operating_hours
            has_promotion: c.id % 3 === 0, // Giả định: hãng có ID chia hết cho 3 có khuyến mãi
            has_loyalty_program: c.id % 4 === 0, // Giả định: hãng có ID chia hết cho 4 có tích điểm
            // transportation_type_name giả định được lấy từ object transportation liên quan
            transportation_type_name:
              c.transportation?.name || "Không xác định",
            tags: tags, // Đảm bảo tags đã được parse
          };
        });

        setCompanies(companiesWithDisplayData);

        const allTransportTypes = transportRes.data.data || [];
        const matchedType = allTransportTypes.find(
          (t) => String(t.id) === filterType
        );

        setTransportType(matchedType || null);
        setCurrentPage(1); // reset trang mỗi lần dữ liệu thay đổi
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, [filterType, currentSearchTerm, sortBy, filterPrice]);

  // Hàm lấy base price để sort
  const getBasePrice = (company) => {
    let priceRange = {};
    if (typeof company.price_range === "string") {
      try {
        priceRange = JSON.parse(company.price_range || "{}");
      } catch {
        priceRange = {};
      }
    } else {
      priceRange = company.price_range || {};
    }
    return Number(priceRange.base_km) || 0;
  };

  // Hàm xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    setCurrentSearchTerm(searchTerm);
    setCurrentPage(1); // reset trang về 1
  };

  // Phân trang: tính toán items hiện tại theo trang
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCompanies = companies.slice(startIndex, endIndex);
  const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);

  // Điều khiển trang
  const goPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Đường dẫn banner
  const bannerPath = transportType?.banner
    ? transportType.banner.startsWith("http")
      ? transportType.banner
      : `http://localhost:8000/storage/${transportType.banner}`
    : "/default-banner.jpg"; // fallback banner mặc định

  const ASSET_BASE_URL = "http://localhost:8000/storage/"; // Định nghĩa ASSET_BASE_URL cho logo

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Banner */}
      <div className="relative w-full mb-10 overflow-hidden">
        <div className="relative w-full h-[360px] overflow-hidden">
          {transportType?.banner ? (
            <img
              src={bannerPath}
              alt={transportType?.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = "/default-banner.jpg")}
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white">
              Không có banner
            </div>
          )}
          {/* Đã chỉnh sửa các class ở đây để căn trái */}
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-start text-white text-left pl-8 md:pl-16 pr-4">
            {" "}
            {/* <-- Thay đổi justify-center thành justify-start, items-center thành items-start */}
            <h1 className="text-4xl font-bold mb-2">
              {transportType?.name || "Phương tiện"}
            </h1>
            <p className="text-lg mb-6">
              {transportType?.description ||
                "Khám phá các hãng vận chuyển phù hợp với bạn"}
            </p>
            {/* Tìm kiếm */}
            <div className="w-full max-w-xl relative flex rounded-lg overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Tìm kiếm hãng xe phù hợp..."
                className="flex-grow pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 transition-colors duration-200"
              >
                Tìm kiếm
              </button>
            </div>
            <div className="text-sm mt-4 text-gray-200">
              {/* Giả định số lượng đánh giá và trạng thái hoạt động */}
              4.6 đánh giá - {companies.length} hãng xe - 24/7 hoạt động
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc & Sắp xếp */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {/* Sắp xếp */}
          <div className="relative">
            <label htmlFor="sortBy" className="sr-only">
              Sắp xếp
            </label>
            <select
              id="sortBy"
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating_desc">Phổ biến nhất (Đánh giá cao)</option>
              <option value="name_asc">Tên (A-Z)</option>
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
              </svg>
            </div>
          </div>

          {/* Lọc giá */}
          <div className="relative">
            <label htmlFor="filterPrice" className="sr-only">
              Giá
            </label>
            <select
              id="filterPrice"
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
            >
              <option value="all">Tất cả giá</option>
              <option value="low">Giá thấp (&lt; 13.000đ)</option>
              <option value="medium">Giá trung bình (13.000đ - 17.000đ)</option>
              <option value="high">Giá cao (&gt; 20.000đ)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách hãng */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Danh sách hãng vận chuyển
        </h2>

        {paginatedCompanies.length === 0 ? (
          <p className="text-center text-gray-600">
            ⚠️ Không có hãng vận chuyển nào đang hoạt động hoặc phù hợp với tiêu
            chí tìm kiếm.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {paginatedCompanies.map((c) => {
              const priceRange =
                typeof c.price_range === "string"
                  ? JSON.parse(c.price_range || "{}")
                  : c.price_range || {};

              // Logic cho logo: ưu tiên c.logo, sau đó đến c.transportation.icon, cuối cùng là placeholder
              const logoDisplayUrl = c.logo
                ? c.logo.startsWith("http")
                  ? c.logo
                  : ASSET_BASE_URL + c.logo
                : c.transportation?.icon
                ? c.transportation.icon.startsWith("http")
                  ? c.transportation.icon
                  : ASSET_BASE_URL + c.transportation.icon
                : "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Logo";

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition"
                >
                  {/* Logo và nhãn */}
                  <div className="relative">
                    <img
                      src={logoDisplayUrl} // Sử dụng logic logo mới
                      alt={c.name}
                      className="w-full h-40 object-contain bg-gray-100 p-4"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Logo")
                      }
                    />
                    <div className="absolute top-2 left-2 flex flex-col items-start space-y-1">
                      {c.is_new && ( // Dựa trên trường `is_new` giả định
                        <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Mới
                        </span>
                      )}
                      {c.transportation_type_name && ( // Hiển thị loại phương tiện (từ dữ liệu đã xử lý)
                        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          {c.transportation_type_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nội dung chi tiết */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {c.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {c.description || "Không có mô tả."}
                      </p>

                      {/* Hiển thị tags */}
                      {c.tags && c.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {c.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full"
                            >
                              {tag.replace(/_/g, " ")}{" "}
                              {/* Thay thế dấu gạch dưới bằng khoảng trắng */}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center mb-2">
                        {/* Icon sao */}
                        <svg
                          className="w-4 h-4 text-yellow-500 mr-1 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="text-sm text-gray-700">
                          {c.rating ? c.rating.toFixed(1) : "Chưa có"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Giá khởi điểm:</strong>{" "}
                        {priceRange.base_km
                          ? `${Number(priceRange.base_km).toLocaleString()}đ`
                          : "Không rõ"}
                      </p>
                      {priceRange.additional_km && (
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Giá/km:</strong>{" "}
                          {Number(priceRange.additional_km).toLocaleString()}đ
                        </p>
                      )}
                      {c.operating_hours && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Thời gian hoạt động:</strong>{" "}
                          {c.operating_hours}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {c.has_promotion && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-200 text-red-700 rounded-full">
                            Khuyến mãi
                          </span>
                        )}
                        {c.has_loyalty_program && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-blue-200 text-blue-700 rounded-full">
                            Tích điểm
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        to={`/transport-companies/${c.id}`}
                        className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={goPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              Prev
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={goNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportCompanyPage;