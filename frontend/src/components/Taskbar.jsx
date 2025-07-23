import React from 'react';
import { PiChartLineUp, PiForkKnifeFill } from "react-icons/pi";
import { FaUser, FaCar, FaBed, FaBus, FaCamera, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Taskbar = () => {
    return (
        <div className="bg-[url('/public/img/background_taskbar.jpg')] bg-cover bg-center h-screen w-64 text-white shadow-lg">
            <div className="text-center mb-5">
                <img src="/public/img/logo.png" alt="Ipsumtravel Logo" className="w-24 h-24 mx-auto rounded-full" />
                <h1 className="text-2xl font-bold">IPSUMTRAVEL</h1>
            </div>
            <ul className="space-y-2">
                <Link to="/dashboard" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><PiChartLineUp className="mr-2" /> Dashboard</Link>
                <Link to="/users" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><FaUser className="mr-2" /> Quản lý người dùng</Link>
                <Link to="/restaurants" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><PiForkKnifeFill className="mr-2" /> Nhà hàng/quán ăn</Link>
                <Link to="/checkin-places" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><FaMapMarkerAlt className="mr-2" /> Điểm check-in</Link>
                <Link to="/cuisine" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><FaCamera className="mr-2" /> Ẩm thực</Link>
                <Link to="/transport" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><FaCar className="mr-2" /> Phương tiện</Link>
                <Link to="/hotels" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><FaBed className="mr-2" /> Khách sạn</Link>
                <Link to="/transport" className="flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer"><FaBus className="mr-2" /> Hàng phương tiện</Link>
            </ul>
        </div>
    );
};

export default Taskbar;