import React, { useRef, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import CalendarFull from './CalendarFull';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { FiAlertCircle, FiCheckCircle, FiX, FiCalendar, FiClock } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { eventService } from '../../../services/eventService';

export default function SchedulePage() {
  console.log('SchedulePage component mounted');
  
  const calendarRef = useRef();
  const [aiEvents, setAiEvents] = useState([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIConfirmModal, setShowAIConfirmModal] = useState(false);
  const [aiResultData, setAiResultData] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const [toastProgress, setToastProgress] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEventData, setAddEventData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    repeat: 'none',
    location: '',
    description: ''
  });
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  // Khi Sidebar gọi, sẽ mở modal thêm lịch trình ở CalendarFull
  const handleCreateEvent = (data) => {
    // Open modal with data from Sidebar
    setAddEventData({
      title: '',
      startDate: data.startDate || '',
      startTime: '00:00',
      endDate: data.endDate || '',
      endTime: '23:45',
      allDay: false,
      repeat: 'none',
      location: data.location || '',
      description: ''
    });
    setShowAddModal(true);
  };

  // Nhận event AI từ Sidebar và truyền xuống CalendarFull
  const handleAIGenerateEvents = (events) => {
    setAiEvents(events);
  };

  // Handle AI loading state
  const handleAILoadingChange = (loading) => {
    setIsAILoading(loading);
  };

  // Handle AI confirm modal
  const handleAIConfirmModal = (show, data) => {
    setShowAIConfirmModal(show);
    setAiResultData(data);
  };

  // Handle toast notifications
  const handleShowToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setToastProgress(0);
    
    // Progress bar animation
    const startTime = Date.now();
    const duration = 4000; // 4 seconds
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setToastProgress(progress);
      
      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setShowToast(false);
      setToastProgress(0);
    }, 4000);
  };

  // Modal functions
  const openAddModal = () => {
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const startTime = '00:00';
    const endDate = startDate;
    const endTime = '23:45';
    setAddEventData({
      title: '',
      startDate,
      startTime,
      endDate,
      endTime,
      allDay: false,
      repeat: 'none',
      location: '',
      description: ''
    });
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleAddEvent = async () => {
    if (!addEventData.title.trim()) return;
    
    // Kiểm tra đăng nhập
    if (!eventService.isLoggedIn()) {
      setShowAddModal(false);
      handleShowToast('Vui lòng đăng nhập để lưu event! Bạn có thể đăng nhập ở góc trên bên phải.', 'error');
      // Có thể redirect đến trang đăng nhập ở đây
      return;
    }
    
    const isMultiDay = addEventData.startDate !== addEventData.endDate;
    
    // Format dates properly for FullCalendar
    let start, end;
    if (isMultiDay) {
      start = addEventData.startDate; // YYYY-MM-DD format
      end = addEventData.endDate; // YYYY-MM-DD format
    } else {
      start = `${addEventData.startDate}T${addEventData.startTime}:00`; // YYYY-MM-DDTHH:mm:ss
      end = `${addEventData.endDate}T${addEventData.endTime}:00`; // YYYY-MM-DDTHH:mm:ss
    }
    
    const eventData = {
      title: addEventData.title,
      start,
      end,
      allDay: isMultiDay ? true : addEventData.allDay,
      location: addEventData.location,
      description: addEventData.description,
      repeat: addEventData.repeat
    };
    
    try {
      // Lưu event vào database
      const response = await eventService.createEvent(eventData);
      
      // Kiểm tra response có đúng format không
      if (!response || !response.id) {
        throw new Error('Response không đúng format từ server');
      }
      
      // Thêm event vào calendar với ID từ database
      const calendarEvent = {
        id: response.id,
        title: addEventData.title,
        start,
        end,
        allDay: isMultiDay ? true : addEventData.allDay,
        location: addEventData.location,
        description: addEventData.description
      };
      
      if (calendarRef.current) {
        calendarRef.current.addEvent(calendarEvent);
      }
      
      setShowAddModal(false);
      handleShowToast('Đã lưu sự kiện thành công!');
    } catch (error) {
      console.error('Error saving event:', error);
      handleShowToast(error.message || 'Có lỗi xảy ra khi lưu sự kiện!', 'error');
    }
  };

  const handleLocationInput = (e) => {
    const value = e.target.value;
    setAddEventData({ ...addEventData, location: value });
    if (value.trim()) {
      const filtered = locationSuggestions.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setShowLocationDropdown(false);
    }
  };

  const handleSelectLocation = (loc) => {
    setAddEventData({ ...addEventData, location: loc.name });
    setShowLocationDropdown(false);
  };

  // Location suggestions
  const locationSuggestions = [
    { name: 'Hồ Chí Minh', detail: 'Ho Chi Minh City, Vietnam' },
    { name: 'Hà Nội', detail: 'Hanoi, Vietnam' },
    { name: 'Đà Nẵng', detail: 'Da Nang, Vietnam' },
    { name: 'Nha Trang', detail: 'Khanh Hoa, Vietnam' },
    { name: 'Hạ Long', detail: 'Quang Ninh, Vietnam' },
    { name: 'Phú Quốc', detail: 'Kien Giang, Vietnam' },
    { name: 'Sa Pa', detail: 'Lao Cai, Vietnam' },
    { name: 'Hội An', detail: 'Quang Nam, Vietnam' },
    { name: 'Huế', detail: 'Thua Thien Hue, Vietnam' },
    { name: 'Vũng Tàu', detail: 'Ba Ria - Vung Tau, Vietnam' },
    { name: 'Cần Thơ', detail: 'Can Tho, Vietnam' },
    { name: 'Đà Lạt', detail: 'Lam Dong, Vietnam' },
  ];

  // No need to expose functions from SchedulePage to CalendarFull

  // Auto set allDay when dates are different
  useEffect(() => {
    if (addEventData.startDate && addEventData.endDate && addEventData.startDate !== addEventData.endDate) {
      setAddEventData(prev => ({ ...prev, allDay: true }));
    }
  }, [addEventData.startDate, addEventData.endDate]);

  // Load events from database when component mounts
  useEffect(() => {
    const loadUserEvents = async () => {
      console.log('loadUserEvents called');
      console.log('isLoggedIn:', eventService.isLoggedIn());
      
      if (eventService.isLoggedIn()) {
        try {
          console.log('Calling getUserEvents API...');
          const events = await eventService.getUserEvents();
          console.log('API response:', events);
          
          // Convert events to calendar format and set to CalendarFull state
          if (events && Array.isArray(events) && events.length > 0) {
            console.log('Loading events from database:', events);
            console.log('Events length:', events.length);
            console.log('First event:', events[0]);
            console.log('First event keys:', Object.keys(events[0]));
            
            const calendarEvents = events.map((event, index) => {
              console.log(`Processing event ${index}:`, event);
              console.log(`event ${index} id:`, event.id, 'type:', typeof event.id);
              console.log(`event ${index} properties:`, Object.keys(event));
              
              // Kiểm tra xem có id không
              if (!event.id) {
                console.error(`Event ${index} has no id! Event:`, event);
              }
              
              return {
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                description: event.description || '',
                location: event.location || '',
                user: typeof event.user === 'string' ? event.user : (event.user?.name || ''),
                allDay: event.allDay || false
              };
            });
            
            console.log('Converted calendar events:', calendarEvents);
            console.log('calendarRef.current:', calendarRef.current);
            
            // Set events to CalendarFull state instead of using addEvent
            if (calendarRef.current && calendarRef.current.setAllEvents) {
              console.log('Setting events to CalendarFull');
              calendarRef.current.setAllEvents(calendarEvents);
            } else {
              console.log('calendarRef.current.setAllEvents not available');
            }
          } else {
            console.log('No events found or events is not array');
          }
        } catch (error) {
          console.error('Error loading events:', error);
        }
      } else {
        console.log('User not logged in');
      }
    };

    loadUserEvents();
  }, []);

  // TimePicker component
  function TimePicker({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const date = new Date(0, 0, 0, h, m);
        let label = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          .replace(' ', '').toUpperCase();
        const value24 = date.toTimeString().slice(0, 5);
        timeOptions.push({ label, value: value24 });
      }
    }
    const selectedLabel = timeOptions.find(opt => opt.value === value)?.label || '';
    
    useEffect(() => {
      const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      if (open) document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);
    
    return (
      <div ref={ref} className="relative" style={{ minWidth: 112, maxWidth: 112 }}>
        <div
          className={`flex items-center border border-gray-300 rounded px-2 py-0.5 text-sm cursor-pointer bg-white w-28 h-8 text-center pr-7 focus:outline-none ${disabled ? 'bg-gray-100 text-gray-400' : 'hover:border-blue-400'}`}
          onClick={() => !disabled && setOpen(v => !v)}
          tabIndex={0}
          style={{ minWidth: 112, maxWidth: 112, height: 32 }}
        >
          <span className="font-mono text-sm text-center w-full select-none">{selectedLabel}</span>
          <FiClock className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" />
        </div>
        {open && !disabled && (
          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-30 max-h-60 overflow-y-auto w-28 animate-fadeIn">
            {timeOptions.map(opt => (
              <div
                key={opt.value}
                className={`px-2 py-1 text-sm text-center cursor-pointer select-none ${opt.value === value ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50'}`}
                onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header Navigation */}
        <Header />
        
        {/* Banner Section với ảnh từ Unsplash */}
        <div 
          className="relative bg-cover bg-center h-[400px] flex items-center justify-start"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="relative text-white z-10 px-4 max-w-3xl ml-20">
            <h1 className="text-5xl md:text-4xl font-bold mb-4 text-left" style={{
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              fontWeight: "700"
            }}>
              TẠO LỊCH TRÌNH CHO BẠN
            </h1>
            <p className="text-lg mb-6 text-left" style={{
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
              textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
              fontWeight: "400"
            }}>
              Lên kế hoạch chi tiết cho chuyến du lịch hoàn hảo
            </p>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            onCreateEvent={handleCreateEvent} 
            onAIGenerateEvents={handleAIGenerateEvents}
            onAILoadingChange={handleAILoadingChange}
            onAIConfirmModal={handleAIConfirmModal}
            onShowToast={handleShowToast}
          />
          <div className="flex-1 flex flex-col min-h-screen">
            <CalendarFull ref={calendarRef} aiEvents={aiEvents} onShowToast={handleShowToast} onOpenAddModal={openAddModal} />
          </div>
        </div>

        {/* Global Modals - Outside CalendarFull */}
        {/* Modal thêm sự kiện */}
        {showAddModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn mx-4">
              <button
                className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600"
                onClick={closeAddModal}
              >
                <FiX />
              </button>
              <div className="text-xl font-bold mb-4 text-center">Thêm sự lịch trình mới</div>
              <div className="flex flex-col gap-3">
                <input
                  className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                  placeholder="Tiêu đề lịch trình *"
                  value={addEventData.title}
                  onChange={e => setAddEventData({ ...addEventData, title: e.target.value })}
                  autoFocus
                />
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600">Bắt đầu:</label>
                  <div className="relative flex items-center">
                    <DatePicker
                      selected={addEventData.startDate ? new Date(addEventData.startDate) : null}
                      onChange={date => setAddEventData({ ...addEventData, startDate: date.toISOString().slice(0, 10) })}
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28 h-8 text-center pr-7 focus:outline-none"
                      calendarClassName="rounded-xl shadow-lg border border-gray-200"
                      popperPlacement="bottom"
                    />
                    <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {!addEventData.allDay && addEventData.startDate === addEventData.endDate && (
                    <TimePicker
                      value={addEventData.startTime}
                      onChange={v => setAddEventData({ ...addEventData, startTime: v })}
                    />
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600">Kết thúc:</label>
                  <div className="relative flex items-center">
                    <DatePicker
                      selected={addEventData.endDate ? new Date(addEventData.endDate) : null}
                      onChange={date => setAddEventData({ ...addEventData, endDate: date.toISOString().slice(0, 10) })}
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28 h-8 text-center pr-7 focus:outline-none"
                      calendarClassName="rounded-xl shadow-lg border border-gray-200"
                      popperPlacement="bottom"
                    />
                    <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {!addEventData.allDay && addEventData.startDate === addEventData.endDate && (
                    <TimePicker
                      value={addEventData.endTime}
                      onChange={v => setAddEventData({ ...addEventData, endTime: v })}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addEventData.allDay}
                    onChange={e => setAddEventData({ ...addEventData, allDay: e.target.checked })}
                    id="allDayCheckbox"
                    disabled={addEventData.startDate !== addEventData.endDate}
                  />
                  <label htmlFor="allDayCheckbox" className="text-sm text-gray-600">Cả ngày</label>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-gray-600">Lặp lại:</label>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={addEventData.repeat}
                    onChange={e => setAddEventData({ ...addEventData, repeat: e.target.value })}
                  >
                    <option value="none">Không lặp</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                    <option value="yearly">Hàng năm</option>
                  </select>
                </div>
                <div className="relative">
                  <input
                    className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400 w-full"
                    placeholder="Địa điểm"
                    value={addEventData.location}
                    onChange={handleLocationInput}
                    onFocus={e => { if (addEventData.location && filteredLocations.length > 0) setShowLocationDropdown(true); }}
                    autoComplete="off"
                  />
                  {showLocationDropdown && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredLocations.map((loc, idx) => (
                        <div
                          key={loc.name + idx}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onMouseDown={() => handleSelectLocation(loc)}
                        >
                          <div className="font-medium">{loc.name}</div>
                          <div className="text-xs text-gray-500">{loc.detail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                  placeholder="Mô tả"
                  value={addEventData.description}
                  onChange={e => setAddEventData({ ...addEventData, description: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                    onClick={closeAddModal}
                  >
                    Hủy
                  </button>
                  {eventService.isLoggedIn() ? (
                    <button
                      className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                      onClick={handleAddEvent}
                      disabled={!addEventData.title.trim()}
                    >
                      Lưu
                    </button>
                  ) : (
                    <button
                      className="px-4 py-1 rounded bg-orange-600 text-white font-semibold hover:bg-orange-700"
                      onClick={() => {
                        setShowAddModal(false);
                        handleShowToast('Vui lòng đăng nhập trước khi tạo event!', 'error');
                      }}
                    >
                      Đăng nhập để lưu
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Loading Overlay - Covers entire screen */}
        {isAILoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Đang xử lý AI</h3>
                <p className="text-gray-600 text-sm">Vui lòng chờ trong giây lát...</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Confirm Modal - Covers entire screen */}
        {showAIConfirmModal && aiResultData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI đã tạo xong!</h3>
                <p className="text-gray-600">Bạn có muốn thêm {aiResultData.length} sự kiện gợi ý này vào lịch không?</p>
              </div>
              
              <div className="max-h-40 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Danh sách sự kiện:</p>
                {aiResultData.map((event, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1 flex items-start gap-2">
                    <span className="text-green-600 font-medium">•</span>
                    <span className="flex-1">
                      <span className="font-medium">{event.title}</span>
                      {event.location && (
                        <span className="text-gray-500 ml-1">- {event.location}</span>
                      )}
                      {event.cost && (
                        <span className="text-blue-500 ml-1">({event.cost})</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAIConfirmModal(false);
                    setAiResultData(null);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (aiResultData) {
                      handleAIGenerateEvents(aiResultData);
                    }
                    setShowAIConfirmModal(false);
                    setAiResultData(null);
                  }}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Thêm vào lịch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification - Top right corner with slide-in animation */}
        {showToast && (
          <div 
            className="fixed top-4 right-4 z-50"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md transform transition-all duration-300 ${
              toastType === 'success' 
                ? 'bg-white border border-green-200' 
                : 'bg-white border border-red-200'
            }`}>
              <div className={`rounded-full p-1 ${
                toastType === 'success' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {toastType === 'success' ? (
                  <FiCheckCircle className="w-5 h-5" />
                ) : (
                  <FiAlertCircle className="w-5 h-5" />
                )}
              </div>
              <span className={`font-medium ${
                toastType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {toastMessage}
              </span>
              <button
                onClick={() => setShowToast(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${
                  toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${toastProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
} 