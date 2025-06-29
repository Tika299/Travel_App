import React, { useState, useEffect } from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { PiStarThin } from "react-icons/pi"; // Icon Star
import { IoMdHeartEmpty } from "react-icons/io"; // Icon Heart
import { FaMapMarkerAlt } from "react-icons/fa"; // Icon Map-Pin
import { FaHeart } from "react-icons/fa"; // Icon Heart bold

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
        {
            id: 5,
            name: "Vịnh Hạ Long",
            location: "Quảng Ninh - Việt Nam",
            description: "Di sản thế giới với hàng nghìn đảo đá vôi kỳ thú nổi trên mặt nước xanh biếc.",
            image: "/public/img/VinhHaLong.jpg",
            rating: 5.0,
            likes: "4.7k",
            isPaid: true,
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
        <div>
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
                                    <span className="font-bold">Điểm đến</span>
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
                                    <span className="font-bold">Ngày khởi hành</span>
                                    <input
                                        type="date"
                                        name="startDate"
                                        id="startDate"
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="space-y-3 flex flex-col">
                                    <span className="font-bold">Số ngày</span>
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
                                                    <PiStarThin key={index} className="h-6 w-6 text-yellow-500" />
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
                                        <span className="text-gray-600 text-xs">{destination.location}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-6">{destination.description}</p>
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
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;