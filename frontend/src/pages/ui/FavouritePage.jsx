import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { FaHeart, FaMapMarkerAlt, FaTrashAlt } from "react-icons/fa";
import { PiForkKnife } from "react-icons/pi";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import {favouriteService} from "../../services/ui/favouriteService.js";// Giả sử bạn có một service để lấy dữ liệu yêu thích

const FavouritePage = () => {
    const [favourites, setFavourites] = useState([]);

    // Lấy danh sách yêu thích khi component mount
    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const data = await favouriteService.getFavourites();
                setFavourites(data);
            } catch (error) {
                console.error('Lỗi khi tải danh sách yêu thích:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, []); useEffect(() => {
        fetch("http://localhost:8000/api/favourites")
            .then((res) => res.json())
            .then((data) => setFavourites(data));
    }, []);

    return (
        <div>
            <Header />
            <main>
                <div className="container mx-auto py-8">
                    <h1 className="text-5xl font-medium mb-4">Danh sách yêu thích</h1>
                    <p className="text-lg">Quản lý toàn bộ những địa điểm, trải nghiệm và đặc sản mà bạn đã thích</p>
                    {/* ...filter and controls... */}
                    <div className="w-full mt-8 bg-white shadow-xl rounded-lg p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-4 text-white hover:text-red-400 bg-sky-600 p-3 rounded-lg">
                                <FaHeart className="text-2xl" />
                                <p>Tất cả {"(10)"}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-black hover:text-red-400 bg-gray-300 p-3 rounded-lg">
                                <PiForkKnife className="text-2xl" />
                                <p>Đặc sản {"(10)"}</p>
                            </div>
                            <div className="flex items-center space-x-4 text-black hover:text-red-400 bg-gray-300 p-3 rounded-lg">
                                <FaMapMarkerAlt className="text-2xl" />
                                <p>Địa điểm {"(10)"}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select name="" id="" className="border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2">
                                <option value="default">Mới nhất</option>
                            </select>
                            <div className="flex items-center space-x-4 hover:text-red-400 bg-red-200 p-3 rounded-lg text-red-600">
                                <FaTrashAlt className="text-2xl" />
                                <p>Xóa tất cả</p>
                            </div>
                        </div>
                    </div>
                    {/* List items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                        {favourites.map((fav) => (
                            <div key={fav.id}>
                                <div
                                    className="relative bg-white rounded-t-xl p-6 bg-cover w-full h-56 bg-center bg-no-repeat"
                                    style={{
                                        backgroundImage: `url(${fav.favouritable?.image_path ||
                                            fav.favouritable?.image ||
                                            "public/img/default.jpg"
                                            })`,
                                    }}
                                >
                                    <input type="checkbox" className="absolute top-3 right-3 w-4 h-4" />
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
                            </div>
                        ))}
                    </div>
                </div>
                {/* ...pagination... */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <a
                            href="#"
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Previous
                        </a>
                        <a
                            href="#"
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Next
                        </a>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
                        <div>
                            <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-xs">
                                <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    <span className="sr-only">Previous</span>
                                    <FaChevronLeft aria-hidden="true" className="size-3" />
                                </a>
                                {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
                                <a
                                    href="#"
                                    aria-current="page"
                                    className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    1
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    2
                                </a>
                                <a
                                    href="#"
                                    className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                                >
                                    3
                                </a>
                                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset focus:outline-offset-0">
                                    ...
                                </span>
                                <a
                                    href="#"
                                    className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
                                >
                                    8
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    9
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    10
                                </a>
                                <a
                                    href="#"
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    <span className="sr-only">Next</span>
                                    <FaChevronRight aria-hidden="true" className="size-3" />
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FavouritePage;