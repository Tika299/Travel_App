import React, { useState, useEffect } from 'react';
import { aiTravelService } from '../../../services/aiTravelService';
import { 
    FiCalendar, 
    FiClock, 
    FiMapPin, 
    FiDollarSign, 
    FiUsers, 
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiTarget,
    FiCoffee,
    FiTruck,
    FiHome,
    FiMap
} from 'react-icons/fi';

const ItineraryDetail = ({ scheduleId, onClose, onUpdate }) => {
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadItineraryDetail();
    }, [scheduleId]);

    const loadItineraryDetail = async () => {
        try {
            setLoading(true);
            const response = await aiTravelService.getItineraryDetail(scheduleId);
            if (response.success) {
                setItinerary(response.data);
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError('Có lỗi xảy ra khi tải chi tiết lịch trình');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEditForm({
            title: event.title,
            description: event.description || '',
            start_time: event.start_time || '',
            end_time: event.end_time || '',
            cost: event.cost || 0,
            location: event.location || ''
        });
    };

    const handleSaveEvent = async () => {
        try {
            const response = await aiTravelService.updateItineraryEvent(editingEvent.id, editForm);
            if (response.success) {
                setEditingEvent(null);
                setEditForm({});
                loadItineraryDetail(); // Reload data
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            // Silent error handling
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa event này?')) {
            try {
                const response = await aiTravelService.deleteItineraryEvent(eventId);
                if (response.success) {
                    loadItineraryDetail(); // Reload data
                    if (onUpdate) onUpdate();
                }
                    } catch (error) {
            // Silent error handling
        }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const date = new Date(timeString);
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getEventColor = (eventType) => {
        switch (eventType) {
            case 'activity':
                return 'bg-blue-500';
            case 'restaurant':
                return 'bg-green-500';
            case 'transport':
                return 'bg-purple-500';
            case 'hotel':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'activity':
                return <FiTarget className="w-4 h-4" />;
            case 'restaurant':
                return <FiCoffee className="w-4 h-4" />;
            case 'transport':
                return <FiTruck className="w-4 h-4" />;
            case 'hotel':
                return <FiHome className="w-4 h-4" />;
            default:
                return <FiMap className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải chi tiết lịch trình...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md">
                    <div className="flex items-center text-red-600 mb-4">
                        <FiAlertCircle className="mr-2" />
                        <h3 className="font-semibold">Lỗi</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={loadItineraryDetail}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Thử lại
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!itinerary) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{itinerary.schedule.name}</h2>
                        <p className="text-gray-600 mt-1">{itinerary.schedule.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX className="text-gray-500" />
                    </button>
                </div>

                {/* Summary */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                <FiCalendar className="inline mr-2" />
                                {itinerary.schedule.duration} ngày
                            </div>
                            <div className="text-sm text-gray-600">Thời gian</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                <FiUsers className="inline mr-2" />
                                {itinerary.schedule.travelers}
                            </div>
                            <div className="text-sm text-gray-600">Số người</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                <FiDollarSign className="inline mr-2" />
                                {aiTravelService.formatCostDisplay(itinerary.schedule.total_cost)}
                            </div>
                            <div className="text-sm text-gray-600">Tổng chi phí</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {itinerary.summary.total_events}
                            </div>
                            <div className="text-sm text-gray-600">Số hoạt động</div>
                        </div>
                    </div>
                </div>

                {/* Timeline View */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch trình chi tiết</h3>
                    


                    {/* Timeline for each day */}
                    {Object.entries(itinerary.events_by_date || {}).map(([date, events]) => {
                        // Sort events by time
                        const sortedEvents = events.sort((a, b) => {
                            const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
                            const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
                            return timeA - timeB;
                        });

                        return (
                            <div key={date} className="mb-8">
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <FiCalendar className="mr-2 text-blue-500" />
                                    {formatDate(date)}
                                </h4>
                                
                                {/* Timeline Container */}
                                <div className="relative bg-gray-50 rounded-lg p-4 min-h-[400px]">
                                    {/* Time markers */}
                                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-white border-r border-gray-200">
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <div key={i} className="h-16 border-b border-gray-100 flex items-center justify-center text-xs text-gray-500">
                                                {i.toString().padStart(2, '0')}:00
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Events Grid */}
                                    <div className="ml-16 relative">
                                        {/* Grid lines */}
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <div key={i} className="h-16 border-b border-gray-100"></div>
                                        ))}
                                        
                                        {/* Event Blocks */}
                                        {sortedEvents.map((event) => {
                                            // Calculate position and height based on time
                                            const startTime = event.start_time ? new Date(event.start_time) : new Date();
                                            const endTime = event.end_time ? new Date(event.end_time) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
                                            
                                            const startHour = startTime.getHours();
                                            const startMinute = startTime.getMinutes();
                                            const endHour = endTime.getHours();
                                            const endMinute = endTime.getMinutes();
                                            
                                            // Position: top = (hour * 64) + (minute * 64/60)
                                            const topPosition = (startHour * 64) + (startMinute * 64 / 60);
                                            
                                            // Height based on actual duration
                                            const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
                                            const height = Math.max(80, durationMinutes * 64 / 60); // Minimum 80px height
                                            
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`absolute left-0 right-0 mx-2 rounded-lg shadow-md border-l-4 ${getEventColor(event.type)} text-white p-3 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden`}
                                                    style={{
                                                        top: `${topPosition}px`,
                                                        height: `${height}px`,
                                                        minHeight: '80px'
                                                    }}
                                                    onClick={() => handleEditEvent(event)}
                                                >
                                                    <div className="flex items-start justify-between h-full">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="text-white">
                                                                    {getEventIcon(event.type)}
                                                                </div>
                                                                <h5 className="font-semibold text-sm truncate">{event.title}</h5>
                                                            </div>
                                                            
                                                            {event.description && (
                                                                <p className="text-xs opacity-90 mb-2 line-clamp-2 overflow-hidden">{event.description}</p>
                                                            )}
                                                            
                                                            <div className="flex items-center gap-3 text-xs opacity-90 flex-wrap">
                                                                <span className="flex items-center whitespace-nowrap">
                                                                    <FiClock className="mr-1 flex-shrink-0" />
                                                                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                                                </span>
                                                                {event.cost > 0 && (
                                                                    <span className="flex items-center whitespace-nowrap">
                                                                        <FiDollarSign className="mr-1 flex-shrink-0" />
                                                                        {aiTravelService.formatCostDisplay(event.cost)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditEvent(event);
                                                                }}
                                                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded text-xs"
                                                            >
                                                                <FiEdit2 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteEvent(event.id);
                                                                }}
                                                                className="p-1 hover:bg-white hover:bg-opacity-20 rounded text-xs"
                                                            >
                                                                <FiTrash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Edit Modal */}
                {editingEvent && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa sự kiện</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Tiêu đề"
                                />
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    rows="3"
                                    placeholder="Mô tả"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="time"
                                        value={editForm.start_time}
                                        onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="number"
                                        value={editForm.cost}
                                        onChange={(e) => setEditForm({...editForm, cost: parseInt(e.target.value)})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Chi phí"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSaveEvent}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        <FiCheck className="inline mr-1" />
                                        Lưu
                                    </button>
                                    <button
                                        onClick={() => setEditingEvent(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItineraryDetail;
