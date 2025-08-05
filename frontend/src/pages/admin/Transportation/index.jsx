import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTransportations,
  deleteTransportation,
} from "../../../services/ui/Transportation/transportationService";

// Ensure Font Awesome is linked in your public/index.html or similar entry point:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

const TransportationList = () => {
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransportations = async () => {
      try {
        setLoading(true);
        const res = await getAllTransportations();
        const dataToSet = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        const mappedData = dataToSet.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          icon:
            item.icon || "https://placehold.co/40x40/E0F2F7/000000?text=Icon",
          description: item.description || "—",
          average_price: parseFloat(item.average_price || 0),
          is_visible: item.is_visible,
          tags:
            Array.isArray(item.tags) && item.tags.length > 0
              ? item.tags.join(", ")
              : "—",
        }));
        setTransportations(mappedData);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phương tiện:", err);
        setError("Không thể tải dữ liệu phương tiện. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransportations();
  }, []);

  const filteredTransportations = useMemo(() => {
    return transportations.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id && String(item.id).includes(searchTerm))
    );
  }, [transportations, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransportations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTransportations.length / itemsPerPage);

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
      const allIds = new Set(currentItems.map((item) => item.id));
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
        `Bạn có chắc muốn xoá ${selectedItems.size} mục đã chọn không?`
      )
    ) {
      try {
        const deletionPromises = Array.from(selectedItems).map((id) =>
          deleteTransportation(id)
        );
        await Promise.all(deletionPromises);

        setTransportations((prev) =>
          prev.filter((item) => !selectedItems.has(item.id))
        );
        setSelectedItems(new Set());
        setIsSelectionMode(false);
        alert("✅ Xoá thành công các mục đã chọn!");
      } catch (err) {
        console.error("❌ Xoá thất bại:", err);
        alert("❌ Xoá thất bại! Vui lòng thử lại.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xoá loại phương tiện này không?")) {
      try {
        await deleteTransportation(id);
        setTransportations((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        console.error("❌ Xoá thất bại:", err);
        alert("❌ Xoá thất bại!");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/transportations/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate("/admin/transportations/create");
  };

  const renderStatus = (isVisible) => (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isVisible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {isVisible ? "Hoạt động" : "Ngừng hoạt động"}
    </span>
  );

  const formatCurrency = (x) =>
    x != null ? `${Number(x).toLocaleString("vi-VN")} ₫` : "—";

  const totalVehicles = transportations.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <p className="text-gray-700 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">
          Quản lý phương tiện
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <i className="fas fa-bell text-gray-600 text-lg"></i>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
              2
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <img
              src="https://placehold.co/32x32/E0F2F7/000000?text=AD"
              alt="Admin Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700 font-medium">Admin</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-start">
            <span className="text-sm font-medium text-gray-500 mb-2">
              Tổng số phương tiện
            </span>
            <span className="text-3xl font-bold text-gray-900">
              {totalVehicles}
            </span>
          </div>
          {/* Bạn có thể thêm các thẻ overview khác ở đây */}
        </div>

        {/* Search and Action Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow w-full sm:w-auto">
            <input
              type="text"
              placeholder="Tìm kiếm phương tiện"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {/* Nút "Chọn xóa" / "Hủy" */}
            <button
              onClick={toggleSelectionMode}
              className={`py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors 
                                ${
                                  isSelectionMode
                                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                }`}
            >
              <i
                className={`fas ${
                  isSelectionMode ? "fa-times" : "fa-trash-alt"
                }`}
              ></i>
              <span>{isSelectionMode ? "Hủy" : "Chọn xóa"}</span>
            </button>
            {/* Nút "Xóa đã chọn" chỉ hiện khi đang ở chế độ chọn và có mục được chọn */}
            {isSelectionMode && selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors"
              >
                <i className="fas fa-trash"></i>
                <span>Xóa ({selectedItems.size})</span>
              </button>
            )}
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-plus-circle"></i>
              <span>Thêm phương tiện</span>
            </button>
          </div>
        </div>

        {/* Transportation List Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                      checked={
                        selectedItems.size === currentItems.length &&
                        currentItems.length > 0
                      }
                      disabled={currentItems.length === 0}
                    />
                    <span className="ml-2">All</span>
                  </th>
                )}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phương tiện
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mô tả
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Giá trung bình (VND)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tags
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSelectionMode ? "7" : "6"}
                    className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                  >
                    Không có dữ liệu phương tiện nào.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {/* Checkbox cho từng dòng */}
                    {isSelectionMode && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 rounded"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                     src={`http://localhost:8000/storage/${item.icon}`}


                            alt={`${item.name} icon`}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/40x40/E0F2F7/000000?text=N/A";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.average_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatus(item.is_visible)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.tags}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Ẩn nút Sửa/Xóa đơn lẻ khi ở chế độ chọn */}
                      {!isSelectionMode && (
                        <>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
        </div>
      </main>
    </div>
  );
};

export default TransportationList;