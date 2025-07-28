import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUser, FaMapMarkerAlt, FaEdit, FaTrash, FaBed, FaCog } from 'react-icons/fa';
import { PiForkKnifeFill } from 'react-icons/pi';
import Taskbar from "../../../components/Taskbar";
import HotelEditForm from './HotelEditForm';
import HotelCreateForm from './HotelCreateForm';

function HotelList() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('HotelList'); // 'HotelList' | 'HotelEdit' | 'HotelCreate'
    const [selectedHotel, setSelectedHotel] = useState(null);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/hotels");
            setHotels(res.data.data);
        } catch (e) {
            console.error("Lỗi khi tải khách sạn", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khách sạn này?")) return;
        try {
            await axios.delete(`/api/hotels/${id}`);
            setHotels(prev => prev.filter(h => h.id !== id));
        } catch (e) {
            alert("Không thể xóa khách sạn.");
        }
    };

    const handleEdit = (hotel) => {
        setSelectedHotel(hotel);
        setPage("HotelEdit");
    };

    const handleCreate = () => {
        setPage("HotelCreate");
    };

    const submitEdit = async (data) => {
        try {
            const res = await axios.put(`http://localhost:8000/api/hotels/${data.data.id}`, data.data);
            setHotels(prev => prev.map(h => h.id === data.id ? res.data.data : h));
            setPage("HotelList");
        } catch (e) {
            alert("Cập nhật thất bại");
        }
    };

    const submitCreate = async (data) => {
        try {
            const res = await axios.post("http://localhost:8000/api/hotels", data);
            setHotels(prev => [...prev, res.data.data]);
            setPage("HotelList");
        } catch (e) {
            alert("Thêm thất bại");
        }
    };

    return (
        <div className="flex h-screen">
            <Taskbar />
            <div className="flex-1 p-6 bg-gray-100">
                {page === 'HotelList' && (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Quản lý khách sạn</h2>
                            <button onClick={handleCreate} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
                                <FaBed className="mr-1" /> Thêm khách sạn
                            </button>
                        </div>
                        <table className="w-full bg-white shadow-md rounded">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 text-start">Tên</th>
                                    <th className="p-2 text-start">Đánh giá</th>
                                    <th className="p-2 text-start">Điện thoại</th>
                                    <th className="p-2 text-start">Ngày tạo</th>
                                    <th className="p-2 text-start">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center p-4">Đang tải...</td></tr>
                                ) : hotels.map(hotel => (
                                    <tr key={hotel.id}>
                                        <td className="p-2 flex items-center">
                                            <img src={`${hotel.images}`} alt="Hotel" className="w-10 h-10 rounded-md object-cover mr-3" />
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
                                className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                                <FaBed className="text-2xl" /><br />Thêm khách sạn
                            </button>
                            <button className="bg-gray-200 p-4 rounded-full flex flex-col items-center">
                                <FaCog className="text-2xl" /><br />Cài đặt
                            </button>
                        </div>
                    </>
                )}

                {page === 'HotelEdit' && (
                    <HotelEditForm
                        hotelData={selectedHotel}
                        onCancel={() => setPage("HotelList")}
                        onSubmit={submitEdit}
                    />
                )}

                {page === 'HotelCreate' && (
                    <HotelCreateForm
                        onCancel={() => setPage("HotelList")}
                        onSubmit={submitCreate}
                    />
                )}
            </div>
        </div>
    );
}

export default HotelList;
