import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaHeart, FaMapMarkerAlt, FaTrashAlt, FaBed } from "react-icons/fa";
import { PiForkKnife } from "react-icons/pi";
import Pagination from "../../components/Pagination";
import { favouriteService } from "../../services/ui/favouriteService.js";

const FavouritePage = () => {
    const [favourites, setFavourites] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("all"); // Track active filter
    const itemsPerPage = 10;

    // Fetch favourites with pagination and filter
    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                setLoading(true);
                const response = await favouriteService.getFavourites({
                    page: currentPage,
                    per_page: itemsPerPage,
                    filter: filter !== "all" ? filter : undefined
                });
                setFavourites(response.data);
                setTotalPages(Math.ceil(response.total / itemsPerPage));
            } catch (error) {
                console.error('Error fetching favourites:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [currentPage, filter]);

    // Handle individual checkbox toggle
    const handleCheckboxChange = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectedItems.length === favourites.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(favourites.map((fav) => fav.id));
        }
    };

    // Handle delete selected items
    const handleDeleteSelected = async () => {
        try {
            for (const id of selectedItems) {
                await favouriteService.deleteFavourite(id);
            }
            setFavourites((prev) =>
                prev.filter((fav) => !selectedItems.includes(fav.id))
            );
            setSelectedItems([]);
            // Refetch to update pagination
            const response = await favouriteService.getFavourites({
                page: currentPage,
                per_page: itemsPerPage,
                filter: filter !== "all" ? filter : undefined
            });
            setFavourites(response.data);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            alert("Selected favourites deleted successfully");
        } catch (error) {
            console.error('Error deleting favourites:', error);
            alert("Failed to delete selected favourites");
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSelectedItems([]);
    };

    // Handle filter change
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to first page when filter changes
        setSelectedItems([]);
    };

    // Determine detail page URL based on favouritable_type
    const getDetailPath = (fav) => {
        const typeMap = {
            'App\\Models\\CheckinPlace': '/checkin-places',
            'App\\Models\\Hotel': '/hotels',
            'App\\Models\\Cuisine': '/cuisine'
        };
        return `${typeMap[fav.favouritable_type]}/${fav.favouritable_id}`;
    };

    // Calculate counts for each category
    const getCategoryCount = (type) => {
        if (type === "all") return favourites.length;
        return favourites.filter(f => f.favouritable_type === type).length;
    };

    return (
        <div>
            <Header />
            <main>
                <div className="container mx-auto py-8">
                    <h1 className="text-5xl font-medium mb-4">Danh sách yêu thích</h1>
                    <p className="text-lg">Quản lý toàn bộ những địa điểm, trải nghiệm và đặc sản mà bạn đã thích</p>
                    <div className="w-full mt-8 bg-white shadow-xl rounded-lg p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleFilterChange("all")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "all" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <FaHeart className="text-2xl" />
                                <p>Tất cả ({getCategoryCount("all")})</p>
                            </button>
                            <button
                                onClick={() => handleFilterChange("App\\Models\\Cuisine")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "App\\Models\\Cuisine" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <PiForkKnife className="text-2xl" />
                                <p>Đặc sản ({getCategoryCount("App\\Models\\Cuisine")})</p>
                            </button>
                            <button
                                onClick={() => handleFilterChange("App\\Models\\CheckinPlace")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "App\\Models\\CheckinPlace" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <FaMapMarkerAlt className="text-2xl" />
                                <p>Địa điểm ({getCategoryCount("App\\Models\\CheckinPlace")})</p>
                            </button>
                            <button
                                onClick={() => handleFilterChange("App\\Models\\Hotel")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "App\\Models\\Hotel" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <FaBed className="text-2xl" />
                                <p>Khách sạn ({getCategoryCount("App\\Models\\Hotel")})</p>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === favourites.length && favourites.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Chọn tất cả</span>
                            <select name="sort" className="border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2">
                                <option value="default">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedItems.length === 0}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    selectedItems.length === 0
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-red-200 text-red-600 hover:text-red-400'
                                }`}
                            >
                                <FaTrashAlt className="text-2xl" />
                                <p>Xóa đã chọn ({selectedItems.length})</p>
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                            {favourites.map((fav) => (
                                <div key={fav.id} className="relative">
                                    <Link to={getDetailPath(fav)}>
                                        <div
                                            className="bg-white rounded-t-xl p-6 bg-cover w-full h-56 bg-center bg-no-repeat"
                                            style={{
                                                backgroundImage: `url(${fav.favouritable?.image_path ||
                                                    fav.favouritable?.image ||
                                                    "/img/default.jpg"})`,
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="absolute top-3 right-3 w-4 h-4"
                                                checked={selectedItems.includes(fav.id)}
                                                onChange={() => handleCheckboxChange(fav.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="bg-white shadow-xl rounded-b-xl p-6 pb-4">
                                            <h2 className="text-xl font-semibold mb-2">
                                                {fav.favouritable?.name || "Không rõ"}
                                            </h2>
                                            <div className="flex items-center space-x-2 my-3">
                                                <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                                                <span className="text-gray-600 text-xs">
                                                    {fav.favouritable?.address || ""}
                                                </span>
                                            </div>
                                            <p className="text-sm h-12 overflow-hidden">
                                                {fav.favouritable?.description || ""}
                                            </p>
                                            <div className="flex items-center justify-end">
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(fav.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FavouritePage;