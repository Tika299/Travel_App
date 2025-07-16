import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { PiStarThin } from "react-icons/pi";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaTag } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { FaCompass } from "react-icons/fa";
import { PiTriangleFill } from "react-icons/pi";

const HomePage = () => {
    // Dữ liệu giả lập (sẽ thay bằng API)
    const [destinations, setDestinations] = useState([
        {
            id: 1,
            name: "Vịnh Hạ Long",
            location: "Quảng Ninh - Việt Nam",
            description: "Di sản thế giới với hàng nghìn đảo đá vôi kỳ thú nổi trên mặt nước xanh biếc.",
            image: "/public/img/VinhHaLong.jpg",
            rating: 5.0,
            likes: "4.7k",
            isPaid: false,
        },
        {
            id: 2,
            name: "Vịnh Hạ Long",
            location: "Quảng Ninh - Việt Nam",
            description: "Di sản thế giới với hàng nghìn đảo đá vôi kỳ thú nổi trên mặt nước xanh biếc.",
            image: "/public/img/VinhHaLong.jpg",
            rating: 5.0,
            likes: "4.7k",
            isPaid: true,
        },
        {
            id: 3,
            name: "Vịnh Hạ Long",
            location: "Quảng Ninh - Việt Nam",
            description: "Di sản thế giới với hàng nghìn đảo đá vôi kỳ thú nổi trên mặt nước xanh biếc.",
            image: "/public/img/VinhHaLong.jpg",
            rating: 5.0,
            likes: "4.7k",
            isPaid: true,
        },
        {
            id: 4,
            name: "Vịnh Hạ Long",
            location: "Quảng Ninh - Việt Nam",
            description: "Di sản thế giới với hàng nghìn đảo đá vôi kỳ thú nổi trên mặt nước xanh biếc.",
            image: "/public/img/VinhHaLong.jpg",
            rating: 5.0,
            likes: "4.7k",
            isPaid: true,
        },
    ]);

    const [cuisines, setCuisines] = useState([
        {
            id: 1,
            name: "Phở Hà Nội",
            location: "Hà Nội - Việt Nam",
            description: "Món ăn truyền thống nổi tiếng với nước dùng thơm ngon và bánh phở mềm mại.",
            image: "/public/img/PhoHaNoi.jpg",
            priceRange: "40.000đ - 70.000đ",
        },
        {
            id: 2,
            name: "Phở Hà Nội",
            location: "Hà Nội - Việt Nam",
            description: "Món ăn truyền thống nổi tiếng với nước dùng thơm ngon và bánh phở mềm mại.",
            image: "/public/img/PhoHaNoi.jpg",
            priceRange: "40.000đ - 70.000đ",
        },
        {
            id: 3,
            name: "Phở Hà Nội",
            location: "Hà Nội - Việt Nam",
            description: "Món ăn truyền thống nổi tiếng với nước dùng thơm ngon và bánh phở mềm mại.",
            image: "/public/img/PhoHaNoi.jpg",
            priceRange: "40.000đ - 70.000đ",
        },
        {
            id: 4,
            name: "Phở Hà Nội",
            location: "Hà Nội - Việt Nam",
            description: "Món ăn truyền thống nổi tiếng với nước dùng thơm ngon và bánh phở mềm mại.",
            image: "/public/img/PhoHaNoi.jpg",
            priceRange: "40.000đ - 70.000đ",
        },
    ]);

    const [hotels, setHotels] = useState([
        {
            id: 1,
            name: "Khách sạn Vinpearl",
            location: "Hà Nội - Việt Nam",
            description: "Khu nghĩ dưỡng sang trọng với tầm nhìn ra biển, hồ bơi vô cực và Spa đẳng cấp",
            image: "/public/img/VinpearlResort$Spa.jpg",
            price: "2.500.000đ",
            type: "Khách sạn",
            note: "Đã bao gồm thuế và phí",
        },
        {
            id: 2,
            name: "Mộc Homestay",
            location: "Đà Lạt - Việt Nam",
            description: "Homestay ấm cúng với không gian xanh, gần trung tâm thành phố và các điểm tham quan",
            image: "/public/img/MocHomestay.jpg",
            price: "650.000đ",
            type: "Homestay",
            note: "Đã bao gồm thuế và phí",
        },
    ]);

    // Hàm lấy dữ liệu từ API (giả lập, thay bằng API thực tế)
    useEffect(() => {
        // Ví dụ gọi API
        /*
        fetch('https://api.example.com/destinations')
          .then(response => response.json())
          .then(data => setDestinations(data))
          .catch(error => console.error('Error fetching destinations:', error));
        */
    }, []);

    return (
        <div className="">
            <Header />
            <main className="mx-auto">
                <div className="slider bg-[url('/public/img/SliderHomePage.jpg')] bg-cover h-[500px] shadow-lg">
                    <div className="container mx-auto flex flex-col justify-center h-full">
                        <h1
                            className="text-6xl font-bold text-white"
                            style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                        >
                            Khám phá Việt Nam tuyệt vời
                        </h1>
                        <p
                            className="text-lg text-white mt-4 font-bold"
                            style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}
                        >
                            Trải nghiệm những địa điểm tuyệt vời, ẩm thực đặc sắc và văn hóa độc đáo
                        </p>
                        <div className="w-fit bg-gray-400 bg-opacity-20 mt-6 p-8">
                            <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-3 flex flex-col">
                                    <label htmlFor="destination" className="font-bold">
                                        Điểm đến
                                    </label>
                                    <select
                                        name="destination"
                                        id="destination"
                                        className="w-full p-2 pb-3 border border-gray-300 rounded"
                                    >
                                        <option value="default">Chọn điểm đến</option>
                                        <option value="1">Đà Nẵng</option>
                                        <option value="2">Hồ Chí Minh</option>
                                    </select>
                                </div>
                                <div className="space-y-3 flex flex-col">
                                    <label htmlFor="startDate" className="font-bold">
                                        Ngày khởi hành
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        id="startDate"
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="space-y-3 flex flex-col">
                                    <label htmlFor="numDays" className="font-bold">
                                        Số ngày
                                    </label>
                                    <input
                                        type="number"
                                        name="numDays"
                                        id="numDays"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="Nhập số ngày"
                                    />
                                </div>
                            </div>
                            <button className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300">
                                Bắt đầu khám phá
                            </button>
                        </div>
                    </div>
                </div>
                {/* Popular Destinations Section */}
                <div className="container mx-auto mt-10">
                    <h1 className="text-3xl font-bold mb-3">Điểm đến du lịch phổ biến</h1>
                    <p className="text-lg mb-6">Khám phá những địa điểm du lịch nổi tiếng ở Việt Nam</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {destinations.map((destination) => (
                            <div key={destination.id} className="space-y-4 bg-white shadow-lg rounded mb-4">
                                <div
                                    className="bg-[url('/public/img/VinhHaLong.jpg')] bg-cover bg-center bg-no-repeat h-64 rounded-t"
                                    style={{ backgroundImage: `url(${destination.image})` }}
                                >
                                    <div className="flex items-center justify-between w-full p-4">
                                        <div className="flex bg-white items-center space-x-4 rounded-full p-1">
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, index) => (
                                                    <PiStarThin
                                                        key={index}
                                                        className="h-6 w-6 text-yellow-500"
                                                    />
                                                ))}
                                            </div>
                                            <p className="pr-3">{destination.rating}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-full p-1">
                                            <IoMdHeartEmpty className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full p-4 bg-white shadow-lg rounded">
                                    <h3 className="text-lg font-bold mb-2">{destination.name}</h3>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                                        <span className="text-gray-600 text-xs">
                                            {destination.location}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-6">
                                        {destination.description}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-bold text-green-600">
                                            {destination.isPaid ? "Có phí" : "Miễn phí"}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <FaHeart className="h-5 w-5 text-red-600" />
                                            <p className="italic">{destination.likes}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Cuisines Section */}
                <div className="container mx-auto mt-10">
                    <h1 className="text-3xl font-bold mb-3">Ẩm thực đặc sản</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-lg mb-6">
                            Cùng khám phá những món ăn đặc trung tại các địa phương
                        </p>
                        <a href="" className="text-blue-600 flex items-center">
                            Xem tất cả
                            <FaArrowRight className="ml-1 mt-1" />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {cuisines.map((cuisine) => (
                            <div key={cuisine.id} className="space-y-4 bg-white shadow-lg rounded mb-4">
                                <div
                                    className="bg-[url('/public/img/VinhHaLong.jpg')] bg-cover bg-center bg-no-repeat h-64 rounded-t"
                                    style={{ backgroundImage: `url(${cuisine.image})` }}
                                />
                                <div className="w-full p-4 bg-white shadow-lg rounded">
                                    <h3 className="text-lg font-bold mb-2">{cuisine.name}</h3>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                                        <span className="text-gray-600 text-xs">{cuisine.location}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-6">{cuisine.description}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="flex items-center text-lg text-black-600 tracking-widest">
                                            <FaTag className="w-4 h-4 text-black-600 mr-1" />
                                            {cuisine.priceRange}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <FaHeart className="h-5 w-5 text-red-600" />
                                            <p className="italic" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Hotels Section */}
                <div className="container mx-auto mt-10">
                    <h1 className="text-3xl font-bold mb-3">Khách sạn</h1>
                    <div className="flex items-center justify-between">
                        <p className="text-lg mb-6">
                            Cùng khám phá những món ăn đặc trung tại các địa phương
                        </p>
                        <a href="" className="text-blue-600 flex items-center">
                            Xem tất cả
                            <FaArrowRight className="ml-1 mt-1" />
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {hotels.map((hotel) => (
                            <div key={hotel.id} className="space-y-4 bg-white shadow-lg rounded mb-4">
                                <div className="flex p-3 rounded-lg shadow-xl">
                                    <div
                                        className="bg-cover bg-center w-48 h-64 rounded-xl"
                                        style={{ backgroundImage: `url(${hotel.image})` }}
                                    />
                                    <div className="px-4">
                                        <div className="bg-blue-400 text-white px-4 rounded text-lg w-fit my-2">
                                            {hotel.type}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                                        <div className="flex items-center space-x-2 my-4">
                                            <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                                            <span className="text-gray-600">{hotel.location}</span>
                                        </div>
                                        <p className="text-black-600 text-sm h-12 overflow-hidden">
                                            {hotel.description}
                                        </p>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <p className="text-blue-500 font-bold text-sm">{hotel.price}</p>
                                            <p className="text-gray-400 italic text-sm">/đêm</p>
                                        </div>
                                        <div className="flex items-center justify-between space-x-2">
                                            <p className="text-gray-400 text-sm">{hotel.note}</p>
                                            <button className="bg-blue-500 text-white px-4 py-2 rounded-xl">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Member IPSUM Travel */}
                <div className="container mx-auto mt-10 mb-10">
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-3xl font-bold mb-1">
                            Trở thành thành viên của IPSUM Travel
                        </h1>
                        <p className="text-gray-500">
                            Tham gia cộng đồng du lịch và nhận nhiều đặc quyền với các cấp độ thành viên
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                        <div className="bg-white shadow-lg rounded p-6 rounded-2xl overflow-hidden border-t-4 border-gray-400 border-solid mt-6 h-fit">
                            <div className="flex items-center justify-between mb-4 mt-3">
                                <h2 className="text-xl font-bold">Người mới</h2>
                                <div className="bg-gray-200 px-2 py-3 rounded-full">
                                    <FaUser className="h-5 w-5" />
                                </div>
                            </div>
                            <p>Dành cho người dùng mới bắt đầu hành trình khám phá</p>
                            <div className="my-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaCheck className="text-green-500" />
                                    <p className="text-sm text-gray-500">Được hỗ trợ 24/7</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="bg-gray-500 text-white px-6 py-2 rounded-3xl">
                                    Tham gia ngay
                                </button>
                            </div>
                        </div>
                        <div className="bg-white shadow-lg rounded p-6 rounded-2xl overflow-hidden border-t-4 border-sky-400 border-solid h-fit relative">
                            <div className="absolute -top-1 right-0 p-1 bg-sky-400 text-white rounded-bl-2xl overflow-hidden">
                                Phổ biến
                            </div>
                            <div className="flex items-center justify-between mb-4 mt-3">
                                <h2 className="text-xl text-sky-500 font-bold">Lữ khách</h2>
                                <div className="bg-sky-200 px-2 py-3 rounded-full">
                                    <FaCompass className="h-5 w-5 text-sky-500" />
                                </div>
                            </div>
                            <p>Dành cho người dùng mới bắt đầu hành trình khám phá</p>
                            <div className="my-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaCheck className="text-green-500" />
                                    <p className="text-sm text-gray-500">Được hỗ trợ 24/7</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="bg-sky-500 text-white px-6 py-2 rounded-3xl">
                                    Nâng cấp ngay
                                </button>
                            </div>
                        </div>
                        <div className="bg-white shadow-lg rounded p-6 rounded-2xl overflow-hidden border-t-4 border-orange-400 border-solid mt-6 h-fit">
                            <div className="flex items-center justify-between mb-4 mt-3">
                                <h2 className="text-xl text-orange-500 font-bold">Du mục</h2>
                                <div className="bg-orange-200 px-2 py-3 rounded-full">
                                    <PiTriangleFill className="h-5 w-5 text-orange-500" />
                                </div>
                            </div>
                            <p>Dành cho người dùng mới bắt đầu hành trình khám phá</p>
                            <div className="my-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaCheck className="text-green-500" />
                                    <p className="text-sm text-gray-500">Được hỗ trợ 24/7</p>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaCheck className="text-green-500" />
                                    <p className="text-sm text-gray-500">Được hỗ trợ 24/7</p>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaCheck className="text-green-500" />
                                    <p className="text-sm text-gray-500">Được hỗ trợ 24/7</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <button className="bg-orange-500 text-white px-6 py-2 rounded-3xl">
                                    Nâng cấp ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Plan Section */}
                <div className="w-full bg-sky-600 p-10">
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="text-3xl text-white font-bold">
                            Lên kế hoạch cho chuyến đi của bạn
                        </h1>
                        <p className="text-white opacity-80 text-lg">
                            Tạo lịch trình du lịch chi tiết với các gợi ý phù hợp cho từng ngày
                        </p>
                    </div>
                    <div className="container mx-auto mt-6 bg-white w-full rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-black-600">Tạo lịch trình</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-4">
                            <div>
                                <label
                                    htmlFor="destination"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Điểm đến
                                </label>
                                <select
                                    id="location"
                                    name="destination"
                                    className="w-full p-2 pb-3 border border-gray-300 rounded"
                                >
                                    <option value="default">Chọn điểm đến</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Ngày đi
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="number-date"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Số ngày
                                </label>
                                <input
                                    type="number"
                                    id="number-date"
                                    name="number-date"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Nhập số ngày"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="budget"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Ngân sách
                                </label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Nhập ngân sách"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-center mt-6">
                            <button className="bg-sky-600 text-white px-6 py-2 rounded-3xl">
                                Tạo lịch trình
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;