import React, { useState } from 'react';
import { 
    FiMapPin, 
    FiClock, 
    FiDollarSign, 
    FiStar,
    FiCoffee,
    FiCamera,
    FiShoppingBag,
    FiMusic,
    FiBook,
    FiActivity,
    FiHome,
    FiTruck,
    FiEdit2,
    FiTrash2,
    FiPlus
} from 'react-icons/fi';
import './timeline.css';

const InteractiveTimeline = ({ itinerary, onEditEvent, onDeleteEvent, onAddEvent }) => {
    const [expandedDay, setExpandedDay] = useState(null);
    const [hoveredEvent, setHoveredEvent] = useState(null);

    const getActivityIcon = (type) => {
        const icons = {
            'attraction': <FiCamera className="text-2xl text-blue-500" />,
            'restaurant': <FiCoffee className="text-2xl text-orange-500" />,
            'hotel': <FiHome className="text-2xl text-green-500" />,
            'transport': <FiTruck className="text-2xl text-purple-500" />,
            'shopping': <FiShoppingBag className="text-2xl text-pink-500" />,
            'culture': <FiBook className="text-2xl text-indigo-500" />,
            'nature': <FiActivity className="text-2xl text-emerald-500" />,
            'entertainment': <FiMusic className="text-2xl text-red-500" />
        };
        return icons[type] || <FiStar className="text-2xl text-gray-500" />;
    };

    const formatTime = (time) => {
        if (!time) return '';
        return time.replace(':', 'h') + 'm';
    };

    const formatCost = (cost) => {
        return new Intl.NumberFormat('vi-VN').format(cost) + ' VND';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const getDayColor = (dayIndex) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600'
        ];
        return colors[dayIndex % colors.length];
    };

    const toggleDayExpansion = (dayIndex) => {
        setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
    };

    return (
        <div className="interactive-timeline bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Lịch Trình Chi Tiết</h2>
                <p className="text-gray-600">
                    {itinerary?.summary?.destination} • {itinerary?.summary?.duration} • {formatCost(itinerary?.summary?.total_cost || 0)}
                </p>
            </div>

            <div className="space-y-6">
                {itinerary?.days?.map((day, dayIndex) => (
                    <div key={dayIndex} className="timeline-day">
                        {/* Day Header */}
                        <div 
                            className={`day-header bg-gradient-to-r ${getDayColor(dayIndex)} text-white rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg`}
                            onClick={() => toggleDayExpansion(dayIndex)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-lg">{day.day}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Ngày {day.day}</h3>
                                        <p className="text-sm opacity-90">{formatDate(day.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="text-sm opacity-90">{day.activities?.length || 0} hoạt động</p>
                                        <p className="text-xs opacity-75">
                                            {formatCost(day.activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0)}
                                        </p>
                                    </div>
                                    <div className={`transform transition-transform ${expandedDay === dayIndex ? 'rotate-180' : ''}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Day Activities */}
                        <div className={`activities-timeline mt-4 transition-all duration-300 overflow-hidden ${
                            expandedDay === dayIndex ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                                {day.activities?.map((activity, activityIndex) => (
                                    <div
                                        key={activityIndex}
                                        className={`activity-card bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:border-blue-300 ${
                                            hoveredEvent === `${dayIndex}-${activityIndex}` ? 'ring-2 ring-blue-200' : ''
                                        }`}
                                        onMouseEnter={() => setHoveredEvent(`${dayIndex}-${activityIndex}`)}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* Time Marker */}
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FiClock className="text-blue-600" />
                                                </div>
                                                <div className="text-center mt-1">
                                                    <p className="text-xs font-medium text-gray-700">
                                                        {formatTime(activity.time)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {activity.duration}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Activity Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        {getActivityIcon(activity.type)}
                                                        <h4 className="font-semibold text-gray-800 truncate">
                                                            {activity.name}
                                                        </h4>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                                            activity.type === 'attraction' ? 'bg-blue-100 text-blue-700' :
                                                            activity.type === 'restaurant' ? 'bg-orange-100 text-orange-700' :
                                                            activity.type === 'hotel' ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {activity.type}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Action Buttons */}
                                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => onEditEvent && onEditEvent(activity)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteEvent && onDeleteEvent(activity)}
                                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {activity.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        {activity.location && (
                                                            <div className="flex items-center space-x-1">
                                                                <FiMapPin className="w-4 h-4" />
                                                                <span className="truncate max-w-[200px]">{activity.location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-medium text-green-600">
                                                            {formatCost(activity.cost)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Event Button */}
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => onAddEvent && onAddEvent(day)}
                                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                        <span>Thêm hoạt động</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Tóm Tắt</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-gray-600">Tổng ngày</p>
                        <p className="font-semibold text-gray-800">{itinerary?.days?.length || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">Tổng hoạt động</p>
                        <p className="font-semibold text-gray-800">
                            {itinerary?.days?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">Trung bình/ngày</p>
                        <p className="font-semibold text-gray-800">
                            {itinerary?.days?.length > 0 
                                ? Math.round(itinerary.days.reduce((sum, day) => sum + (day.activities?.length || 0), 0) / itinerary.days.length)
                                : 0
                            }
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">Tổng chi phí</p>
                        <p className="font-semibold text-green-600">
                            {formatCost(itinerary?.summary?.total_cost || 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveTimeline;
