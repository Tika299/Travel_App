import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PiChartLineUp, PiForkKnifeFill } from "react-icons/pi";
import { FaUser, FaCar, FaBed, FaBus, FaCamera, FaMapMarkerAlt, FaEdit, FaTrash, FaCog } from "react-icons/fa";
import { Link } from 'react-router-dom';
import Taskbar from "../../../components/Taskbar";
import { de, tr } from 'date-fns/locale';


function HotelList() {

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);


    // Gọi API khi component được mount
    useEffect(() => {
        fetchHotels();
    }, []);
    // Hàm gọi API để lấy danh sách khách sạn
    const fetchHotels = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/hotels");
            setHotels(response.data.data);
        } catch (error) {
            console.error("Lỗi khi tải khách sạn", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý sự kiện xóa khách sạn
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khách sạn này?")) return;

        try {
            await axios.delete(`/api/hotels/${id}`);
            setHotels(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            console.error("Lỗi khi xóa khách sạn", error);
            alert("Không thể xóa khách sạn.");
        }
    };

    // Hàm xử lý sự kiện chỉnh sửa khách sạn
    const handleEdit = async (hotel) => {
        const updatedName = prompt("Tên mới:", hotel.name);
        if (!updatedName) return;

        try {
            const response = await axios.put(`http://localhost:8000/api/hotels/${hotel.id}`, {
                name: updatedName
            });
            setHotels(prev =>
                prev.map(h => h.id === hotel.id ? response.data.data : h)
            );
        } catch (error) {
            console.error("Lỗi khi cập nhật khách sạn", error);
        }
    };

    // Ham xử lý sự kiện thêm khách sạn
    const handleAddHotel = async () => {
        const newHotel = {
            name: "Khách sạn mẫu",
            description: "Mô tả khách sạn mẫu",
            address: "Hà Nội",
            latitude: 21.0285,
            longitude: 105.8542,
            rating: 4.3,
            review_count: 80,
            phone: "0909090909"
        };

        try {
            const response = await axios.post('http://localhost:8000/api/hotels', newHotel);
            setHotels(prev => [...prev, response.data.data]);
        } catch (error) {
            console.error("Lỗi khi thêm khách sạn", error);
        }
    };


    return (
        <div className="flex h-screen">
            <Taskbar />
            <div className="flex-1 p-6 bg-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Quản lý khách sạn</h2>
                        <p>Tổng số khách sạn: 12,789</p>
                    </div>
                    <div className="flex space-x-2">
                        <button className="bg-orange-500 text-white px-4 py-2 rounded flex items-center">
                            <FaTrash className="mr-1" /> Chọn xóa
                        </button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
                            <FaBed className="mr-1" /> Thêm khách sạn
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm khách sạn..."
                        className="w-full p-2 border rounded"
                    />
                </div>
                <table className="w-full bg-white shadow-md rounded">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2">Khách sạn</th>
                            <th className="p-2">Đánh giá</th>
                            <th className="p-2">Số điện thoại</th>
                            <th className="p-2">Ngày tạo</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">Đang tải...</td></tr>
                        ) : hotels.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-4">Không có khách sạn</td></tr>
                        ) : hotels.map((hotel) => (
                            <tr key={hotel.id} className="border-b">
                                <td className="p-2 flex items-center">
                                    <img src="https://via.placeholder.com/40" alt="Hotel" className="mr-2 rounded-full" />
                                    <span>{hotel.name} - ID: {hotel.id}</span>
                                </td>
                                <td className="p-2">{hotel.rating}</td>
                                <td className="p-2">{hotel.phone}</td>
                                <td className="p-2">{new Date(hotel.created_at).toLocaleDateString()}</td>
                                <td className="p-2">
                                    <button onClick={() => handleEdit(hotel)} className="text-blue-500 mr-2"><FaEdit /></button>
                                    <button onClick={() => handleDelete(hotel.id)} className="text-red-500"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-6 flex justify-around">
                    <button className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                        <FaUser className="text-2xl" /><br />Thêm người dùng
                    </button>
                    <button className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                        <FaMapMarkerAlt className="text-2xl" /><br />Thêm điểm lịch
                    </button>
                    <button className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                        <PiForkKnifeFill className="text-2xl" /><br />Thêm quán ăn
                    </button>
                    <button
                        onClick={handleAddHotel}
                        className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                        <FaBed className="text-2xl" /><br />Thêm khách sạn
                    </button>
                    <button className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                        <FaCog className="text-2xl" /><br />Cài đặt
                    </button>
                </div>
            </div>
        </div>
    );
}
export default HotelList;