import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiGift, FiSun, FiDollarSign, FiFilter, FiMapPin, FiCalendar, FiCloud, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAllCheckinPlaces } from '../../../services/ui/CheckinPlace/checkinPlaceService';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
// Danh sách địa điểm mẫu để gợi ý
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

export default function Sidebar({ onCreateEvent, onAIGenerateEvents }) {
  const [date, setDate] = useState(new Date());
  const [address, setAddress] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const debounceRef = useRef();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [suggestWeather, setSuggestWeather] = useState(false);
  const [allPlaces, setAllPlaces] = useState([]);
  const [weatherCache, setWeatherCache] = useState({}); // {placeId: weatherObj}
  const [suggestBudget, setSuggestBudget] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [events, setEvents] = useState([]); // New: store created events
  const [showToast, setShowToast] = useState(false);
  const [toastEvent, setToastEvent] = useState(null);
  const [toastProgress, setToastProgress] = useState(0);
  const toastTimerRef = useRef();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEventData, setAddEventData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });
  const calendarRef = useRef();
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIConfirmModal, setShowAIConfirmModal] = useState(false);
  const [aiResultData, setAiResultData] = useState(null);
  const [isWeatherAILoading, setIsWeatherAILoading] = useState(false);
  const [isBudgetAILoading, setIsBudgetAILoading] = useState(false);

  const showPopupMessage = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  // Fetch toàn bộ địa điểm 1 lần khi mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingLocations(true);
        const res = await getAllCheckinPlaces();
        const places = res.data?.data || [];
        if (mounted) setAllPlaces(places);
      } catch (e) {
        if (mounted) setAllPlaces([]);
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Google Places Autocomplete setup
  const {
    ready,
    value: placesValue,
    setValue: setPlacesValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      // Optionally restrict to Vietnam
      componentRestrictions: { country: "vn" },
    },
    debounce: 300,
    googleMapsApiKey: "AIzaSyAs3hEfbNoQPBdI2q8Tvi5QlhetKEoKa_o",
  });

  // Khi chọn địa điểm từ Google
  const handleSelectPlace = async (description) => {
    setPlacesValue(description, false);
    setAddress(description);
    clearSuggestions();
    // Nếu muốn lấy lat/lng:
    // const results = await getGeocode({ address: description });
    // const { lat, lng } = await getLatLng(results[0]);
    // setLatLng({ lat, lng });
  };
  // Khi chọn địa điểm từ dropdown
  const handleSelectLocation = (loc) => {
    setAddress(loc.name);
    setShowDropdown(false);
  };
  // Hàm reset form
  const resetForm = () => {
    setAddress('');
    setStartDate(null);
    setEndDate(null);
    const budgetInput = document.getElementById('sidebar-budget');
    if (budgetInput) budgetInput.value = '';
  };
  const handleSuggestWeatherChange = (e) => {
    if (e.target.checked && (!startDate || !endDate)) {
      showPopupMessage('Vui lòng chọn ngày đi và ngày về trước khi lọc theo thời tiết!');
      return;
    }
    setSuggestWeather(e.target.checked);
  };
  const handleSuggestBudgetChange = (e) => {
    if (e.target.checked) {
      const budgetInput = document.getElementById('sidebar-budget');
      let budget = 0;
      if (budgetInput && budgetInput.value) {
        budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
      }
      if (!budget) {
        showPopupMessage('Vui lòng nhập ngân sách trước khi lọc theo chi phí!');
        return;
      }
    }
    setSuggestBudget(e.target.checked);
  };
  // Toast tự động ẩn sau 4s
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => setShowToast(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  // Hàm gọi AI để gợi ý theo thời tiết
  const handleWeatherAIGenerate = async () => {
    if (!address || !startDate || !endDate) {
      alert('Vui lòng chọn đầy đủ địa điểm, ngày đi, ngày về!');
      return;
    }
    
    setIsWeatherAILoading(true);
    
    try {
      const budgetInput = document.getElementById('sidebar-budget');
      let budget = 0;
      if (budgetInput && budgetInput.value) {
        budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
      }
      
      const checkin_place_id = 1;
      const user_id = 1;
      const participants = 1;
      const name = `Lịch trình AI theo thời tiết: ${address}`;
      
      // Tạo prompt đặc biệt cho thời tiết
      const weatherPrompt = `Tôi sẽ đi du lịch ${address} từ ngày ${startDate?.toISOString?.().slice(0,10) || startDate} đến ${endDate?.toISOString?.().slice(0,10) || endDate}. Hãy tạo lịch trình phù hợp với thời tiết tại địa điểm này, bao gồm các hoạt động trong nhà khi trời mưa và hoạt động ngoài trời khi trời đẹp. Trả về JSON array các event với trường: title, start, end, location, description.`;
      
      const openaiRes = await fetch('http://localhost:8000/api/ai-suggest-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: weatherPrompt, name, start_date: startDate.toISOString().slice(0,10), end_date: endDate.toISOString().slice(0,10), checkin_place_id, participants, user_id, budget }),
      });
      
      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        throw new Error('Lỗi AI API: ' + errText);
      }
      
      let aiResult;
      try {
        aiResult = await openaiRes.json();
      } catch (e) {
        throw new Error('Phản hồi AI không phải JSON hợp lệ!');
      }
      
      if (aiResult && Array.isArray(aiResult.ai_events)) {
        setAiResultData(aiResult.ai_events);
        setShowAIConfirmModal(true);
      } else if (onAIGenerateEvents) {
        onAIGenerateEvents(aiResult);
        showPopupMessage('Đã thêm thành công các sự kiện AI theo thời tiết vào lịch!');
      }
    } catch (err) {
      showPopupMessage(err.message || 'Đã xảy ra lỗi khi gợi ý lịch trình AI theo thời tiết!');
    } finally {
      setIsWeatherAILoading(false);
    }
  };

  // Hàm gọi AI để gợi ý theo ngân sách
  const handleBudgetAIGenerate = async () => {
    if (!address || !startDate || !endDate) {
      alert('Vui lòng chọn đầy đủ địa điểm, ngày đi, ngày về!');
      return;
    }
    
    const budgetInput = document.getElementById('sidebar-budget');
    let budget = 0;
    if (budgetInput && budgetInput.value) {
      budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
    }
    
    if (!budget) {
      alert('Vui lòng nhập ngân sách trước khi tạo gợi ý theo ngân sách!');
      return;
    }
    
    setIsBudgetAILoading(true);
    
    try {
      const checkin_place_id = 1;
      const user_id = 1;
      const participants = 1;
      const name = `Lịch trình AI theo ngân sách: ${address}`;
      
      // Tạo prompt đặc biệt cho ngân sách
      const budgetPrompt = `Tôi sẽ đi du lịch ${address} từ ngày ${startDate?.toISOString?.().slice(0,10) || startDate} đến ${endDate?.toISOString?.().slice(0,10) || endDate} với ngân sách ${budget.toLocaleString('vi-VN')} VND. Hãy tạo lịch trình tiết kiệm chi phí, bao gồm các địa điểm miễn phí, ẩm thực giá rẻ, và hoạt động tiết kiệm. Trả về JSON array các event với trường: title, start, end, location, description.`;
      
      const openaiRes = await fetch('http://localhost:8000/api/ai-suggest-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: budgetPrompt, name, start_date: startDate.toISOString().slice(0,10), end_date: endDate.toISOString().slice(0,10), checkin_place_id, participants, user_id, budget }),
      });
      
      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        throw new Error('Lỗi AI API: ' + errText);
      }
      
      let aiResult;
      try {
        aiResult = await openaiRes.json();
      } catch (e) {
        throw new Error('Phản hồi AI không phải JSON hợp lệ!');
      }
      
      if (aiResult && Array.isArray(aiResult.ai_events)) {
        setAiResultData(aiResult.ai_events);
        setShowAIConfirmModal(true);
      } else if (onAIGenerateEvents) {
        onAIGenerateEvents(aiResult);
        showPopupMessage('Đã thêm thành công các sự kiện AI theo ngân sách vào lịch!');
      }
    } catch (err) {
      showPopupMessage(err.message || 'Đã xảy ra lỗi khi gợi ý lịch trình AI theo ngân sách!');
    } finally {
      setIsBudgetAILoading(false);
    }
  };

  // Hàm gọi Google Places API và OpenAI để gợi ý lịch trình
  const handleAIGenerateSchedule = async () => {
    if (!address || !startDate || !endDate) {
      alert('Vui lòng chọn đầy đủ địa điểm, ngày đi, ngày về!');
      return;
    }
    
    // Bắt đầu loading
    setIsAILoading(true);
    
    try {
      // Lấy ngân sách
      const budgetInput = document.getElementById('sidebar-budget');
      let budget = 0;
      if (budgetInput && budgetInput.value) {
        budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
      }
      // Lấy checkin_place_id và user_id mẫu (cần sửa lại nếu có user thực)
      const checkin_place_id = 1; // TODO: lấy đúng id từ địa điểm thực tế
      const user_id = 1; // TODO: lấy đúng id user đăng nhập
      const participants = 1; // hoặc cho người dùng nhập
      const name = `Lịch trình AI: ${address}`;
      
      // 1. Gọi Google Places API qua backend để lấy địa điểm nổi bật
      const res = await fetch(`http://localhost:8000/api/google-places?query=địa điểm du lịch tại ${encodeURIComponent(address)}`);
      if (!res.ok) throw new Error('Không lấy được danh sách địa điểm từ Google Places!');
      const data = await res.json();
      const places = data.results.slice(0, 10).map(p => `${p.name} - ${p.formatted_address}`);
      
      // 2. Tạo prompt cho AI với các gợi ý thông minh
      let prompt = `Tôi sẽ đi du lịch ${address} từ ngày ${startDate?.toISOString?.().slice(0,10) || startDate} đến ${endDate?.toISOString?.().slice(0,10) || endDate}. Đây là các địa điểm nổi bật: ${places.join(', ')}. Hãy giúp tôi lên lịch trình chi tiết từng ngày, phân bổ các địa điểm hợp lý, thời gian tham quan, mô tả ngắn cho từng hoạt động.`;
      
      // Xác định loại lọc dựa trên checkbox
      let filterType = 'general'; // Mặc định lọc tổng quát
      
      if (suggestWeather && !suggestBudget) {
        filterType = 'weather_only';
        prompt += ` QUAN TRỌNG: Hãy tạo lịch trình phù hợp với thời tiết tại địa điểm này, bao gồm các hoạt động trong nhà khi trời mưa và hoạt động ngoài trời khi trời đẹp. KHÔNG hiển thị thông tin chi phí trong kết quả.`;
      } else if (suggestBudget && !suggestWeather) {
        filterType = 'budget_only';
        prompt += ` QUAN TRỌNG: Hãy tạo lịch trình tiết kiệm chi phí với ngân sách ${budget.toLocaleString('vi-VN')} VND, bao gồm các địa điểm miễn phí, ẩm thực giá rẻ, và hoạt động tiết kiệm. KHÔNG hiển thị thông tin thời tiết trong kết quả.`;
      } else if (suggestWeather && suggestBudget) {
        filterType = 'both';
        prompt += ` QUAN TRỌNG: Hãy tạo lịch trình phù hợp với thời tiết tại địa điểm này và tiết kiệm chi phí với ngân sách ${budget.toLocaleString('vi-VN')} VND, bao gồm các hoạt động trong nhà khi trời mưa, hoạt động ngoài trời khi trời đẹp, các địa điểm miễn phí, ẩm thực giá rẻ, và hoạt động tiết kiệm.`;
      } else {
        filterType = 'general';
        prompt += ` Hãy tạo lịch trình tổng quát với đầy đủ thông tin thời tiết và chi phí.`;
      }
      
      prompt += ` Trả về JSON array các event với trường: title, start, end, location, description.`;
      
      // 3. Gọi OpenAI API (hoặc backend AI của bạn) bằng POST
      const openaiRes = await fetch('http://localhost:8000/api/ai-suggest-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, name, start_date: startDate.toISOString().slice(0,10), end_date: endDate.toISOString().slice(0,10), checkin_place_id, participants, user_id, budget, filterType }),
      });
      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        throw new Error('Lỗi AI API: ' + errText);
      }
      let aiResult;
      try {
        aiResult = await openaiRes.json();
      } catch (e) {
        throw new Error('Phản hồi AI không phải JSON hợp lệ!');
      }
      
      // Hiển thị modal xác nhận với người dùng
      if (aiResult && Array.isArray(aiResult.ai_events)) {
        setAiResultData(aiResult.ai_events);
        setShowAIConfirmModal(true);
      } else if (onAIGenerateEvents) {
        onAIGenerateEvents(aiResult);
        showPopupMessage('Đã thêm thành công các sự kiện AI vào lịch!');
      }
    } catch (err) {
      showPopupMessage(err.message || 'Đã xảy ra lỗi khi gợi ý lịch trình AI!');
    } finally {
      // Kết thúc loading
      setIsAILoading(false);
    }
  };
  return (
    <aside className="relative w-full md:w-[260px] min-w-[200px] max-w-[280px] min-h-screen rounded-b-2xl shadow-lg p-4 pb-10 flex flex-col custom-scrollbar overflow-visible">
      {/* Nền trắng đục kéo dài */}
      <div className="absolute inset-0 w-full h-full bg-white/90 rounded-b-2xl z-0"></div>
      <div className="relative z-10 flex flex-col flex-1">
        {/* Mini Calendar */}
        <div className="w-full min-w-[200px] max-w-[280px] mx-auto flex justify-center">
          <Calendar
            onChange={setDate}
            value={date}
            locale="vi-VN"
            className="border-none rounded-xl"
            formatMonthYear={(_, date) => `Tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`}
            prev2Label={null}
            next2Label={null}
            formatShortWeekday={(locale, date) => {
              const day = date.getDay();
              if (day === 0) return "CN";
              return `T${day + 1}`;
            }}
            tileClassName={({ date, view, activeStartDate }) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isOtherMonth = date.getMonth() !== activeStartDate.getMonth();
              let classes = "flex items-center justify-center w-8 h-8 aspect-square rounded-full";
              if (isToday) classes += " bg-blue-500 text-white";
              if (isOtherMonth) classes += " text-gray-300";
              return classes;
            }}
          />
        </div>

        {/* Hoạt động nổi bật */}
        <div>
          <div className="font-semibold mb-1">Hoạt động nổi bật</div>
          <div className="flex flex-col items-center text-gray-500">
            <FiGift className="text-3xl mb-2" />
            <span>Không có sự kiện nổi bật</span>
          </div>
        </div>

        {/* Lên kế hoạch */}
        <div>
          <div className="font-semibold mb-1">Lên kế hoạch chuyến đi</div>
          <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); }}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-address">Địa chỉ</label>
              <div className="relative">
                <input
                  id="sidebar-address"
                  type="text"
                  className="border rounded px-2 py-1 text-sm w-full pr-8"
                  placeholder="Nhập địa điểm (Google Maps)"
                  value={placesValue}
                  onChange={e => {
                    setPlacesValue(e.target.value);
                    setAddress(e.target.value);
                  }}
                  autoComplete="off"
                  // disabled={!ready} // Luôn cho phép nhập, chỉ disable nếu thực sự không thể nhập
                />
                <FiMapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                {status === "OK" && data.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
                    {data.map(({ place_id, description }, idx) => (
                      <div
                        key={place_id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={() => handleSelectPlace(description)}
                      >
                        {description}
                              </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-start-date">Ngày đi</label>
                <div className="relative">
                  <DatePicker
                    id="sidebar-start-date"
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="border rounded px-2 py-1 w-full text-sm text-left pr-7 focus:outline-none"
                    calendarClassName="rounded-xl shadow-lg border border-gray-200"
                    popperPlacement="bottom"
                    maxDate={endDate}
                  />
                  <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base" />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-end-date">Ngày về</label>
                <div className="relative">
                  <DatePicker
                    id="sidebar-end-date"
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/mm/yyyy"
                    className="border rounded px-2 py-1 w-full text-sm text-left pr-7 focus:outline-none"
                    calendarClassName="rounded-xl shadow-lg border border-gray-200"
                    popperPlacement="bottom"
                    minDate={startDate}
                  />
                  <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-base" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-budget">Ngân sách (VND)</label>
              <input
                id="sidebar-budget"
                type="text"
                placeholder="30.000.000"
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white rounded py-2 mt-2 font-semibold hover:bg-blue-600"
              onClick={() => {
                onCreateEvent({
                  location: address,
                  startDate: startDate ? startDate.toISOString().slice(0, 10) : '',
                  endDate: endDate ? endDate.toISOString().slice(0, 10) : '',
                });
              }}
            >
              Tạo lịch trình
            </button>
          </form>
        </div>

        {/* Gợi ý thông minh */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg text-yellow-400"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="5" stroke="#facc15" strokeWidth="2"/></svg></span>
            <span className="text-base font-bold text-gray-700">Thêm gợi ý thông minh</span>
          </div>
          <div className="flex flex-col gap-4">
            {/* Card: Theo thời tiết */}
            <label className="relative flex items-center p-3 rounded-lg cursor-pointer transition bg-gradient-to-r from-pink-300 to-pink-400 shadow-md hover:from-pink-400 hover:to-pink-500">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <FiCloud className="text-white text-xl drop-shadow" />
                  <span className="text-base font-bold text-white">Theo thời tiết</span>
                  <input type="checkbox" checked={suggestWeather} onChange={handleSuggestWeatherChange} className="ml-auto w-4 h-4 accent-pink-500" />
                </div>
                <span className="text-white text-xs opacity-90 mt-1">Tạo gợi ý hoạt động phù hợp cho thời tiết hôm nay</span>
              </div>
            </label>
            {/* Card: Tối ưu ngân sách */}
            <label className="relative flex items-center p-3 rounded-lg cursor-pointer transition bg-gradient-to-r from-blue-400 to-blue-500 shadow-md hover:from-blue-500 hover:to-blue-600">
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <FiDollarSign className="text-white text-xl drop-shadow" />
                  <span className="text-base font-bold text-white">Tối ưu ngân sách</span>
                  <input type="checkbox" checked={suggestBudget} onChange={handleSuggestBudgetChange} className="ml-auto w-4 h-4 accent-blue-500" />
                </div>
                <span className="text-white text-xs opacity-90 mt-1">Tạo gợi ý hoạt động tiết kiệm chi phí</span>
              </div>
            </label>
          </div>
        </div>
        {/* Nút Gợi ý lịch trình AI luôn sát đáy sidebar */}
        <div className="mt-auto">
          <button 
            className={`rounded py-2 font-semibold flex items-center justify-center gap-2 w-full mt-4 ${
              isAILoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
            onClick={handleAIGenerateSchedule}
            disabled={isAILoading}
          >
            {isAILoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý AI...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Gợi ý lịch trình AI
              </>
            )}
          </button>
        </div>
        {/* Message popup */}
        {showMessage && (
          <div className="fixed top-8 right-6 z-50 bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-semibold text-base animate-slideIn">
            <FiAlertCircle className="text-2xl text-white drop-shadow" />
            <span>{message}</span>
          </div>
        )}
        
        {/* AI Loading Overlay */}
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
        
        {/* AI Confirm Modal */}
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
                <p className="text-gray-600">Bạn có muốn thêm {aiResultData.length} sự kiện AI gợi ý này vào lịch không?</p>
              </div>
              
              <div className="max-h-40 overflow-y-auto mb-6 bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Danh sách sự kiện:</p>
                {aiResultData.map((event, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1 flex items-start gap-2">
                    <span className="text-green-600 font-medium">•</span>
                    <span className="flex-1">
                      <span className="font-medium">{event.activity || event.title}</span>
                      {event.location && (
                        <span className="text-gray-500 ml-1">- {event.location}</span>
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
                    showPopupMessage('Bạn đã hủy thêm sự kiện AI vào lịch.');
                  }}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    if (onAIGenerateEvents) {
                      onAIGenerateEvents(aiResultData);
                    }
                    setShowAIConfirmModal(false);
                    setAiResultData(null);
                    showPopupMessage('Đã thêm thành công các sự kiện AI vào lịch!');
                  }}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Thêm vào lịch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal thêm lịch trình */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              <FiX />
            </button>
            <div className="text-xl font-bold mb-4 text-center">Thêm lịch trình mới</div>
            <div className="flex flex-col gap-3">
              <input
                className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                placeholder="Tiêu đề lịch trình *"
                value={addEventData.title}
                onChange={e => setAddEventData({ ...addEventData, title: e.target.value })}
                autoFocus
              />
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Ngày đi:</label>
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
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm text-gray-600">Ngày về:</label>
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
              </div>
              <input
                className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:border-blue-400"
                placeholder="Địa điểm"
                value={addEventData.location}
                onChange={e => setAddEventData({ ...addEventData, location: e.target.value })}
              />
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
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={() => {
                    if (!addEventData.title.trim()) return;
                    if (onCreateEvent) onCreateEvent(addEventData);
                    setShowAddModal(false);
                    setShowToast(true);
                    setToastEvent(addEventData);
                    setToastProgress(0);
                    // Reset form
                    setAddEventData({ title: '', startDate: '', endDate: '', location: '', description: '' });
                  }}
                  disabled={!addEventData.title.trim()}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast notification */}
      {showToast && toastEvent && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
          <FiCheckCircle className="text-2xl text-white drop-shadow" />
          <div>
            <div className="font-bold">Tạo lịch trình thành công!</div>
            <div className="text-sm">{toastEvent.title}</div>
          </div>
        </div>
      )}
    </aside>
  );
} 