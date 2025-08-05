import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaBed, FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import HotelEdit from './HotelEditForm';
import HotelCreate from './HotelCreateForm';
import HotelCreateRoom from './HotelCreateRoom';
import HotelEditRoom from './HotelEditRoom';
import { deleteHotel } from '../../../services/ui/Hotel/hotelService';

const API_BASE_URL = 'http://localhost:8000';

function HotelList() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('HotelList');
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [expandedHotelId, setExpandedHotelId] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [isRoomsLoading, setIsRoomsLoading] = useState(false);

    const fetchHotels = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/hotels`);
            setHotels(res.data.data);
        } catch (e) {
            console.error("Lỗi khi tải khách sạn", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    const handleToggleExpand = useCallback(async (hotelId) => {
        const newExpandedId = expandedHotelId === hotelId ? null : hotelId;
        setExpandedHotelId(newExpandedId);

        if (newExpandedId !== null) {
            setIsRoomsLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/hotels/${newExpandedId}/rooms`);
                setRooms(res.data.data);
            } catch (error) {
                console.error(`Lỗi khi tải phòng cho khách sạn ${newExpandedId}:`, error);
                setRooms([]);
            } finally {
                setIsRoomsLoading(false);
            }
        }
    }, [expandedHotelId]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khách sạn này?")) return;

        try {
            await deleteHotel(id);
            setHotels(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            console.error("Lỗi khi xóa khách sạn", error);
            alert("Không thể xóa khách sạn.");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/hotel-rooms/${roomId}`);
            alert('Xóa phòng thành công!');
            setRooms(prev => prev.filter(r => r.id !== roomId));
        } catch (e) {
            alert("Không thể xóa phòng.");
            console.error("Lỗi xóa phòng:", e);
        }
    };

    const navigateTo = (pageName, params = {}) => {
        setSelectedHotel(params.hotel || null);
        setSelectedRoomId(params.roomId || null);
        setPage(pageName);
    };

    const submitCreateHotel = async (data) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/hotels`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setHotels(prev => [...prev, res.data.data]);
            navigateTo("HotelList");
        } catch (e) {
            alert("Thêm thất bại");
        }
    };

    const submitCreateRoom = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/api/hotel-rooms`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Thêm phòng thành công!");
            await handleToggleExpand(data.get('hotel_id'));
            navigateTo("HotelList");
        } catch (e) {
            console.error("Lỗi khi thêm phòng:", e.response?.data);
            throw e;
        }
    };

    const submitEditRoom = async (roomId, data) => {
        try {
            await axios.post(`${API_BASE_URL}/api/hotel-rooms/${roomId}`, data);
            alert("Cập nhật phòng thành công!");
            await handleToggleExpand(data.get('hotel_id'));
            navigateTo("HotelList");
        } catch (e) {
            console.error("Lỗi khi cập nhật phòng:", e.response?.data);
            throw e;
        }
    };

    const renderContent = () => {
        switch (page) {
            case 'HotelCreate':
                return <HotelCreate onSubmit={submitCreateHotel} onCancel={() => navigateTo('HotelList')} />;
            case 'HotelCreateRoom':
                return <HotelCreateRoom onSubmit={submitCreateRoom} onCancel={() => navigateTo('HotelList')} hotelId={selectedHotel?.id} />;
            case 'HotelEditRoom':
                return <HotelEditRoom roomId={selectedRoomId} onSubmit={submitEditRoom} onCancel={() => navigateTo('HotelList')} />;
            case 'HotelEdit':
                return <HotelEdit hotelData={selectedHotel} onSubmit={() => navigateTo('HotelList')} onCancel={() => navigateTo('HotelList')} />;
            default:
                return <HotelTableView />;
        }
    };

    const HotelTableView = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý khách sạn</h2>
                <button onClick={() => navigateTo('HotelCreate')} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
                    <FaPlus className="mr-2" /> Thêm khách sạn
                </button>
            </div>
            <div className="bg-white shadow-md rounded overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 w-8"></th>
                            <th className="p-3 text-left">Tên khách sạn</th>
                            <th className="p-3 text-left">Điện thoại</th>
                            <th className="p-3 text-left">Ngày tạo</th>
                            <th className="p-3 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">Đang tải...</td></tr>
                        ) : hotels.map(hotel => (
                            <React.Fragment key={hotel.id}>
                                <tr className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleToggleExpand(hotel.id)} className="text-blue-500">
                                            {expandedHotelId === hotel.id ? <FaChevronDown /> : <FaChevronRight />}
                                        </button>
                                    </td>
                                    <td className="p-3 flex items-center">
                                        {hotel.images && hotel.images.length > 0 ? (
                                            <img 
                                                src={`${API_BASE_URL}/${hotel.images[0]}`} 
                                                alt="Hotel" 
                                                className="w-12 h-12 rounded-md object-cover mr-4"
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/100x100?text=Image+Not+Found"; }}
                                            />
                                        ) : (
                                            <img 
                                                src="https://via.placeholder.com/100x100?text=No+Image" 
                                                alt="No Image" 
                                                className="w-12 h-12 rounded-md object-cover mr-4"
                                            />
                                        )}
                                        <span>{hotel.name}</span>
                                    </td>
                                    <td className="p-3">{hotel.phone}</td>
                                    <td className="p-3">{new Date(hotel.created_at).toLocaleDateString()}</td>
                                    <td className="p-3">
                                        <button onClick={() => navigateTo('HotelEdit', { hotel })} className="text-blue-500 mr-4"><FaEdit /></button>
                                        <button onClick={() => handleDelete(hotel.id)} className="text-red-500"><FaTrash /></button>
                                    </td>
                                </tr>
                                {expandedHotelId === hotel.id && (
                                    <tr>
                                        <td colSpan="5" className="p-4 bg-gray-50">
                                            <RoomsTableView hotel={hotel} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const RoomsTableView = ({ hotel }) => (
        <div className="pl-8">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-700">Danh sách phòng</h4>
                <button onClick={() => navigateTo('HotelCreateRoom', { hotel })} className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center">
                    <FaPlus className="mr-1" /> Thêm phòng
                </button>
            </div>
            {isRoomsLoading ? <p>Đang tải danh sách phòng...</p> : (
                <table className="w-full bg-white rounded shadow-inner">
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className="p-2 text-left">Loại phòng</th>
                            <th className="p-2 text-left">Giá / đêm</th>
                            <th className="p-2 text-left">Sức chứa</th>
                            <th className="p-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length > 0 ? rooms.map(room => (
                            <tr key={room.id} className="border-b">
                                <td className="p-2">{room.room_type}</td>
                                <td className="p-2">{room.price_per_night}</td>
                                <td className="p-2">{room.max_occupancy}</td>
                                <td className="p-2">
                                    <button onClick={() => navigateTo('HotelEditRoom', { roomId: room.id })} className="text-blue-500 mr-3"><FaEdit /></button>
                                    <button onClick={() => handleDeleteRoom(room.id)} className="text-red-500"><FaTrash /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">Khách sạn này chưa có phòng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 p-6 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default HotelList;