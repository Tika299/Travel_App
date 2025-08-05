import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllCheckinPlaces,
  deleteCheckinPlace,
  getCheckinPlaceStatistics,
} from "../../../services/ui/CheckinPlace/checkinPlaceService.js";

const CheckinPlaceList = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [statistics, setStatistics] = useState({
    totalCheckinPlaces: 0,
    totalReviews: 0, // This will be removed from display, but keeping in state for now in case other parts of the app use it.
    totalCheckins: 0, // This will be removed from display, but keeping in state for now in case other parts of the app use it.
    activeCheckinPlaces: 0,
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const navigate = useNavigate();

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await getCheckinPlaceStatistics();
      if (res.success) {
        setStatistics(res.data);
      } else {
        console.error("❌ Lỗi khi tải số liệu thống kê:", res.message);
      }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API thống kê:", err);
    }
  }, []);

  const loadPlaces = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllCheckinPlaces();
      const allPlaces = res.data.data || [];
      setPlaces(allPlaces);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách địa điểm:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaces();
    fetchStatistics();
  }, [loadPlaces, fetchStatistics]);

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedItems(new Set());
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(filteredPlaces.map((place) => place.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      alert("Vui lòng chọn ít nhất một mục để xóa.");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc muốn xóa ${selectedItems.size} địa điểm đã chọn không? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        const deletionPromises = Array.from(selectedItems).map((id) =>
          deleteCheckinPlace(id)
        );
        await Promise.all(deletionPromises);

        alert(`✅ Đã xóa thành công ${selectedItems.size} địa điểm đã chọn!`);
        setSelectedItems(new Set());
        setIsSelectionMode(false);
        loadPlaces();
        fetchStatistics();
      } catch (err) {
        console.error("❌ Xóa thất bại:", err);
        alert("❌ Xóa thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa địa điểm này không? Hành động này không thể hoàn tác!`
      )
    ) {
      try {
        await deleteCheckinPlace(id);
        alert(`✅ Đã xóa thành công địa điểm!`);
        loadPlaces();
        fetchStatistics();
      } catch (err) {
        alert("❌ Xóa thất bại. Vui lòng thử lại sau.");
        console.error("Lỗi khi xóa địa điểm:", err);
      }
    }
  };

  const renderPlaceImage = useCallback((imagePath, altText) => {
    if (imagePath) {
      return (
        <img
          src={`http://localhost:8000/storage/${imagePath}`}
          alt={altText}
          className="w-10 h-10 rounded-md object-cover mr-3"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/40x40?text=No";
          }}
        />
      );
    }
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 mr-3">
        No
      </div>
    );
  }, []);

  const getStatusLabel = useCallback((status) => {
    switch (status) {
      case "active":
        return "Mở cửa";
      case "inactive":
        return "Đóng cửa";
      case "draft":
        return "Bản nháp";
      default:
        return "Không rõ";
    }
  }, []);

  const filteredPlaces = useMemo(() => {
    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (place.id && String(place.id).includes(searchTerm))
    );
  }, [places, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPlaces.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage);

  const paginate = useCallback(
    (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setCurrentPage(pageNumber);
    },
    [totalPages]
  );

  const getPaginationNumbers = useCallback(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    for (let i of uniqueRange) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header and User Profile */}
      {/* <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Quản lý điểm check-in
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src="https://i.pravatar.cc/40?img=1"
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
          </div>
          <span className="text-gray-700">Admin</span>
          <img
            src="https://i.pravatar.cc/40?img=2"
            alt="Admin Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </header> */}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">
              Tổng số địa điểm check-in
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {statistics.totalCheckinPlaces.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <i className="fas fa-map-marker-alt"></i>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">
              Tổng địa điểm đang hoạt động
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {statistics.activeCheckinPlaces.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 text-red-600">
            <i className="fas fa-running"></i>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-4">
          {/* Search and Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow flex items-center border border-gray-300 rounded-md py-2 px-3 shadow-sm focus-within:ring-blue-500 focus-within:border-blue-500">
              <i className="fas fa-search text-gray-400 mr-2"></i>
              <input
                type="text"
                placeholder="Tìm địa điểm check-in (id & tên)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="outline-none w-full text-gray-700"
              />
            </div>
            <div className="flex space-x-3">
              {/* Nút "Chọn xóa" / "Hủy" */}
              <button
                onClick={toggleSelectionMode}
                className={`px-4 py-2 rounded-md shadow-md transition duration-200 flex items-center
                                ${
                                  isSelectionMode
                                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                }`}
              >
                <i
                  className={`fas ${
                    isSelectionMode ? "fa-times" : "fa-trash-alt"
                  } mr-2`}
                ></i>
                <span>{isSelectionMode ? "Hủy" : "Chọn xóa"}</span>
              </button>
              {/* Nút "Xóa đã chọn" */}
              {isSelectionMode && selectedItems.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition duration-200 flex items-center"
                >
                  <i className="fas fa-trash mr-2"></i> Xóa (
                  {selectedItems.size})
                </button>
              )}
              {/* Nút "Thêm điểm check in" (ẩn khi đang ở chế độ chọn) */}
              {!isSelectionMode && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200 flex items-center"
                  onClick={() => navigate("/admin/checkin-places/create")}
                >
                  <i className="fas fa-plus mr-2"></i> Thêm điểm check in
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <p className="text-center text-lg text-gray-600 py-10">
              🔄 Đang tải dữ liệu, vui lòng chờ...
            </p>
          ) : filteredPlaces.length === 0 ? (
            <p className="text-center text-lg text-gray-600 py-10">
              ⚠️ Không tìm thấy địa điểm nào phù hợp.
            </p>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* Checkbox "Chọn tất cả" */}
                      {isSelectionMode && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                            onChange={handleSelectAll}
                            ref={(el) => {
                              if (el) {
                                const allFilteredSelected =
                                  selectedItems.size ===
                                    filteredPlaces.length &&
                                  filteredPlaces.length > 0;
                                const someFilteredSelected =
                                  selectedItems.size > 0 &&
                                  selectedItems.size < filteredPlaces.length;
                                el.checked = allFilteredSelected;
                                el.indeterminate = someFilteredSelected;
                              }
                            }}
                            disabled={filteredPlaces.length === 0}
                          />{" "}
                          <span className="ml-2">All</span>
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa điểm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Địa chỉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá(VND)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((place) => (
                      <tr key={place.id}>
                        {/* Checkbox cho từng dòng */}
                        {isSelectionMode && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 rounded"
                              checked={selectedItems.has(place.id)}
                              onChange={() => handleSelectItem(place.id)}
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {renderPlaceImage(place.image, place.name)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {place.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {place.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {place.address || "Đang cập nhật"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {place.is_free ? (
                            <span className="text-green-600 font-semibold">
                              Miễn phí
                            </span>
                          ) : place.price ? (
                            `${place.price.toLocaleString()} đ`
                          ) : (
                            "Có phí"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getStatusLabel(place.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          {/* Ẩn nút Sửa/Xóa đơn lẻ khi ở chế độ chọn */}
                          {!isSelectionMode && (
                            <>
                              <button
                                className="text-blue-600 hover:underline mr-4"
                                onClick={() =>
                                  navigate(
                                    `/admin/checkin-places/edit/${place.id}`
                                  )
                                }
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleDelete(place.id)}
                              >
                                <i className="fas fa-times-circle"></i>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center space-x-1 mt-4">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm text-gray-500 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {getPaginationNumbers().map((number, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof number === "number" && paginate(number)
                      }
                      className={`px-3 py-1 text-sm rounded-md ${
                        currentPage === number
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      } ${number === "..." ? "cursor-default" : ""}`}
                      disabled={number === "..."}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm text-gray-500 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckinPlaceList;