import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllTransportCompanies,
    deleteTransportCompany,
    // Giả định có hàm lấy thống kê nếu bạn muốn số liệu chính xác
    // getTransportCompanyStatistics, 
} from '../../../services/ui/TransportCompany/transportCompanyService.js';

// Ensure Font Awesome is linked in your public/index.html or similar entry point:
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

const TransportCompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7; // Số mục trên mỗi trang (có thể điều chỉnh)

    const [isSelectionMode, setIsSelectionMode] = useState(false); // State để kiểm soát chế độ chọn
    const [selectedItems, setSelectedItems] = useState(new Set()); // Set để lưu trữ các ID đã chọn

    const navigate = useNavigate();

    // Placeholder for statistics data, replace with actual API call if available
    const [statistics, setStatistics] = useState({
        totalCompanies: 0, // Đặt mặc định là 0, sẽ được cập nhật sau
        totalRatingCount: 123456799, // Giá trị ví dụ từ ảnh (nếu không có API cụ thể)
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await getAllTransportCompanies();
                const dataToSet = res.data.data || [];
                setCompanies(dataToSet);

                // Cập nhật số lượng hãng xe thực tế
                setStatistics(prevStats => ({
                    ...prevStats,
                    totalCompanies: dataToSet.length,
                }));

                // Nếu có API thống kê, bạn có thể gọi ở đây
                // const statsRes = await getTransportCompanyStatistics();
                // if (statsRes.success) {
                //     setStatistics({
                //         totalCompanies: statsRes.data.totalCompanies,
                //         totalRatingCount: statsRes.data.totalRatingCount,
                //     });
                // }

            } catch (err) {
                console.error('Lỗi khi tải danh sách hãng vận chuyển:', err);
                setError('Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Hàm xử lý khi nhấn nút "Chọn xóa" / "Hủy"
    const toggleSelectionMode = () => {
        setIsSelectionMode(prev => !prev);
        setSelectedItems(new Set()); // Reset các lựa chọn khi chuyển đổi chế độ
    };

    // Hàm xử lý khi chọn/bỏ chọn một mục
    const handleSelectItem = (id) => {
        setSelectedItems(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };

    // Hàm xử lý khi chọn/bỏ chọn tất cả các mục
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(currentItems.map(item => item.id)); // Chỉ chọn các mục đang hiển thị trên trang hiện tại
            setSelectedItems(allIds);
        } else {
            setSelectedItems(new Set());
        }
    };

    // Hàm xử lý xóa nhiều mục đã chọn
    const handleDeleteSelected = async () => {
        if (selectedItems.size === 0) {
            alert('Vui lòng chọn ít nhất một mục để xóa.');
            return;
        }

        if (window.confirm(`Bạn có chắc muốn xoá ${selectedItems.size} hãng vận chuyển đã chọn không?`)) {
            try {
                const deletionPromises = Array.from(selectedItems).map(id => 
                    deleteTransportCompany(id)
                );
                await Promise.all(deletionPromises);
                
                // Cập nhật lại danh sách sau khi xóa
                setCompanies(prev => {
                    const newCompanies = prev.filter(item => !selectedItems.has(item.id));
                    // Cập nhật lại thống kê sau khi xóa
                    setStatistics(prevStats => ({
                        ...prevStats,
                        totalCompanies: newCompanies.length,
                    }));
                    return newCompanies;
                });
                setSelectedItems(new Set()); // Xóa lựa chọn
                setIsSelectionMode(false); // Thoát chế độ chọn
                alert('✅ Xoá thành công các mục đã chọn!');
            } catch (err) {
                console.error('❌ Xoá thất bại:', err);
                alert('❌ Xoá thất bại! Vui lòng thử lại.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xoá hãng vận chuyển này không?')) {
            try {
                await deleteTransportCompany(id);
                setCompanies((prev) => {
                    const newCompanies = prev.filter((c) => c.id !== id);
                    // Cập nhật lại thống kê sau khi xóa
                    setStatistics(prevStats => ({
                        ...prevStats,
                        totalCompanies: newCompanies.length,
                    }));
                    return newCompanies;
                });
            } catch (err) {
                console.error('❌ Xoá thất bại:', err);
                alert('❌ Xoá thất bại!');
            }
        }
    };

    // Lọc hãng vận chuyển dựa trên tìm kiếm (sử dụng useMemo để tối ưu)
    const filteredCompanies = useMemo(() => {
        return companies.filter(company =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.phone_number?.includes(searchTerm) || // Tìm kiếm cả số điện thoại
            (company.id && String(company.id).includes(searchTerm))
        );
    }, [companies, searchTerm]);

    // Logic phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

    const paginate = useCallback((pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const getPaginationNumbers = useCallback(() => {
        const delta = 2; // Số trang hiển thị xung quanh trang hiện tại
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1); // Luôn thêm trang đầu tiên

        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i < totalPages && i > 1) { // Đảm bảo không trùng với trang đầu/cuối
                range.push(i);
            }
        }
        range.push(totalPages); // Luôn thêm trang cuối cùng

        const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

        for (let i of uniqueRange) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    }, [currentPage, totalPages]);


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
            <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                {list.map((m, i) => (
                    <li key={i}>{map[m] || m}</li>
                ))}
            </ul>
        );
    };

    const renderStatus = (status) => {
        const colorMap = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-red-100 text-red-800',
            draft: 'bg-gray-100 text-gray-800',
        };
        const labelMap = {
            active: 'Hoạt động',
            inactive: 'Ngừng hoạt động',
            draft: 'Bản nháp',
        };
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}>
                {labelMap[status] || 'Không rõ'}
            </span>
        );
    };

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
            

            {/* Main Content */}
            <main className="p-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-500 mb-2">Tổng số hãng xe</span>
                        <span className="text-3xl font-bold text-gray-900">{statistics.totalCompanies.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-500 mb-2">Tổng lượt đánh giá</span>
                        <span className="text-3xl font-bold text-gray-900">{statistics.totalRatingCount.toLocaleString()}</span>
                    </div>
                    {/* Bạn có thể thêm các thẻ overview khác ở đây */}
                </div>

                {/* Search and Action Bar */}
                <div className="bg-white p-4 rounded-lg shadow mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Tìm kiếm hãng xe"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                            }}
                        />
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        {/* Nút "Chọn xóa" / "Hủy" */}
                        <button 
                            onClick={toggleSelectionMode} 
                            className={`py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors 
                                ${isSelectionMode ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                        >
                            <i className={`fas ${isSelectionMode ? 'fa-times' : 'fa-trash-alt'}`}></i>
                            <span>{isSelectionMode ? 'Hủy' : 'Chọn xóa'}</span>
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
                        <button onClick={() => navigate('/admin/transport-companies/create')} className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors">
                            <i className="fas fa-plus-circle"></i>
                            <span>Thêm hãng xe</span>
                        </button>
                    </div>
                </div>

                {/* Transport Companies List Table */}
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* Checkbox "Chọn tất cả" */}
                                {isSelectionMode && (
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            onChange={handleSelectAll}
                                            checked={selectedItems.size === currentItems.length && currentItems.length > 0}
                                            disabled={currentItems.length === 0}
                                        />
                                        <span className="ml-2">All</span>
                                    </th>
                                )}
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hãng xe
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Địa chỉ
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loại phương tiện
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số điện thoại
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tỉnh/Thành phố
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Đánh giá
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={isSelectionMode ? "10" : "9"} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                        Không có dữ liệu hãng vận chuyển nào.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((company) => (
                                    <tr key={company.id} className="hover:bg-gray-50">
                                        {/* Checkbox cho từng dòng */}
                                        {isSelectionMode && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                                    checked={selectedItems.has(company.id)}
                                                    onChange={() => handleSelectItem(company.id)}
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded-full object-cover" 
                                                        src={company.logo || 'https://placehold.co/40x40/E0F2F7/000000?text=Logo'} 
                                                        alt={`${company.name} logo`} 
                                                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/E0F2F7/000000?text=Logo'; }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {company.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {company.address || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Giả định transportation là một object có trường name */}
                                            {company.transportation?.name || company.transportation_id || '—'} 
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {company.phone_number || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatus(company.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Tỉnh/Thành phố không có trong schema, giả định từ address hoặc để trống */}
                                            {/* Nếu address có chứa thành phố, bạn có thể trích xuất ở đây */}
                                            {company.address?.split(', ').pop() || '—'} 
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {company.rating ?? '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Ẩn nút Sửa/Xóa đơn lẻ khi ở chế độ chọn */}
                                            {!isSelectionMode && (
                                                <>
                                                    <button 
                                                        onClick={() => navigate(`/admin/transport-companies/edit/${company.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(company.id)}
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

export default TransportCompanyList;