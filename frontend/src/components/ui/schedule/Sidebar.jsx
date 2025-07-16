import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiGift, FiSun, FiDollarSign, FiFilter, FiMapPin, FiCalendar, FiCloud, FiAlertCircle } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAllCheckinPlaces } from '../../../services/ui/CheckinPlace/checkinPlaceService';
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

export default function Sidebar({ onCreateEvent }) {
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

  // Khi nhập địa chỉ
  const handleAddressInput = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setFilteredLocations([]);
      setShowDropdown(false);
      return;
    }
    setLoadingLocations(true);
    debounceRef.current = setTimeout(async () => {
      // 1. Lọc theo tên
      let filtered = allPlaces.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      // 2. Lọc theo ngân sách nếu bật
      if (suggestBudget) {
        const budgetInput = document.getElementById('sidebar-budget');
        let budget = 0;
        if (budgetInput && budgetInput.value) {
          budget = parseInt(budgetInput.value.replace(/\D/g, '')) || 0;
        }
        filtered = filtered.filter(loc =>
          (loc.is_free || loc.price === 0) ||
          (typeof loc.price === 'number' && loc.price <= budget)
        );
      }
      // 3. Lọc theo thời tiết nếu bật
      if (suggestWeather && startDate && endDate) {
        // Tạo danh sách các ngày trong khoảng
        const days = [];
        let d = new Date(startDate);
        const end = new Date(endDate);
        while (d <= end) {
          days.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        const apiKey = '5b7092dac0d0ce5ce7e629d006c78711';
        // Chỉ fetch thời tiết cho các địa điểm đã lọc
        const weatherResults = await Promise.allSettled(filtered.map(async loc => {
          if (!loc.latitude || !loc.longitude) return { loc, goodDays: 0, total: days.length };
          let goodDays = 0;
          for (let i = 0; i < days.length; i++) {
            const dateStr = days[i].toISOString().slice(0, 10);
            const cacheKey = loc.id + '-' + dateStr;
            let forecast = weatherCache[cacheKey];
            if (!forecast) {
              try {
                const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${loc.latitude}&lon=${loc.longitude}&appid=${apiKey}&units=metric`);
                const data = await resp.json();
                forecast = data.list.find(item => item.dt_txt.startsWith(dateStr));
                if (forecast) setWeatherCache(prev => ({ ...prev, [cacheKey]: forecast }));
              } catch {}
            }
            if (forecast) {
              const temp = forecast.main.temp;
              const rain = forecast.weather.some(w => w.main.toLowerCase().includes('rain'));
              if (temp >= 18 && temp <= 32 && !rain) goodDays++;
            }
          }
          return { loc, goodDays, total: days.length };
        }));
        // Lấy kết quả thành công
        filtered = weatherResults
          .filter(r => r.status === 'fulfilled')
          .map(r => r.value)
          .filter(({ goodDays, total }) => goodDays / total >= 0.7)
          .map(({ loc, goodDays, total }) => ({ ...loc, goodDays, total }));
      }
      setFilteredLocations(filtered);
      setShowDropdown(filtered.length > 0);
      setLoadingLocations(false);
    }, 100);
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
  return (
    <aside className="relative w-full md:w-[260px] min-w-[200px] max-w-[280px] h-full rounded-b-2xl shadow-lg p-4 pb-10 flex flex-col justify-between gap-4 custom-scrollbar overflow-visible">
      {/* Nền trắng đục kéo dài */}
      <div className="absolute inset-0 w-full h-full bg-white/90 rounded-b-2xl z-0"></div>
      <div className="relative z-10">
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
          <form className="flex flex-col gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-address">Địa chỉ</label>
              <div className="relative">
                <input
                  id="sidebar-address"
                  type="text"
                  className="border rounded px-2 py-1 text-sm w-full pr-8"
                  placeholder="Nhập địa điểm"
                  value={address}
                  onChange={handleAddressInput}
                  autoComplete="off"
                />
                <FiMapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
                    {loadingLocations ? (
                      <div className="px-3 py-2 text-gray-400">Đang tải...</div>
                    ) : (
                      filteredLocations.map((loc, idx) => {
                        // Lấy icon thời tiết nếu có
                        let weatherIcon = null;
                        let weatherBg = '';
                        let goodDayRatio = '';
                        let priceInfo = '';
                        if (suggestWeather && startDate && endDate && typeof loc.goodDays === 'number' && typeof loc.total === 'number') {
                          goodDayRatio = `(${loc.goodDays}/${loc.total} ngày đẹp)`;
                        }
                        if (suggestWeather && startDate && weatherCache[loc.id + '-' + startDate.toISOString().slice(0, 10)]) {
                          const w = weatherCache[loc.id + '-' + startDate.toISOString().slice(0, 10)];
                          if (w && w.weather && w.weather[0]) {
                            const icon = w.weather[0].icon;
                            const main = w.weather[0].main.toLowerCase();
                            // Chọn màu nền theo loại thời tiết
                            if (main.includes('clear')) weatherBg = 'bg-yellow-200';
                            else if (main.includes('cloud')) weatherBg = 'bg-blue-200';
                            else if (main.includes('rain')) weatherBg = 'bg-gray-300';
                            else if (main.includes('snow')) weatherBg = 'bg-blue-100';
                            else if (main.includes('thunder')) weatherBg = 'bg-purple-200';
                            else weatherBg = 'bg-gray-200';
                            weatherIcon = (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full mr-2 ${weatherBg}`}>
                                <img src={`https://openweathermap.org/img/wn/${icon}.png`} alt="weather" className="w-5 h-5" />
                              </span>
                            );
                          }
                        }
                        if (loc.is_free || loc.price === 0) {
                          priceInfo = 'Miễn phí';
                        } else if (typeof loc.price === 'number') {
                          priceInfo = loc.price.toLocaleString('vi-VN') + '₫';
                        }
                        return (
                          <div
                            key={loc.id || loc.name + idx}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                            onMouseDown={() => {
                              setAddress(loc.name);
                              setShowDropdown(false);
                            }}
                          >
                            {weatherIcon}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {loc.name} <span className="text-xs text-green-600 font-semibold ml-1">{goodDayRatio}</span>
                                {priceInfo && <span className="text-xs text-blue-600 font-semibold ml-2">{priceInfo}</span>}
                              </div>
                              <div className="text-xs text-gray-500">{loc.address || loc.detail}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
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
                if (onCreateEvent) {
                  onCreateEvent({
                    address,
                    startDate,
                    endDate,
                    budget: document.getElementById('sidebar-budget')?.value || ''
                  });
                  resetForm();
                }
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
            <label className="relative flex items-center p-3 rounded-lg cursor-pointer transition bg-gradient-to-r from-pink-300 to-pink-400 shadow-md">
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
            <label className="relative flex items-center p-3 rounded-lg cursor-pointer transition bg-gradient-to-r from-blue-400 to-blue-500 shadow-md">
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
        {/* Đặt nút Lọc vào một div flex-grow, flex-col, justify-end để luôn nằm sát đáy */}
        <div className="flex-1 flex flex-col justify-end">
          <button className="bg-green-500 text-white rounded py-2 font-semibold hover:bg-green-600 flex items-center justify-center gap-2 w-full mt-4">
            <FiFilter className="text-lg" /> Lọc
          </button>
        </div>
        {/* Message popup */}
        {showMessage && (
          <div className="fixed top-8 right-6 z-50 bg-gradient-to-r from-orange-400 to-red-500 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 font-semibold text-base animate-slideIn">
            <FiAlertCircle className="text-2xl text-white drop-shadow" />
            <span>{message}</span>
          </div>
        )}
      </div>
    </aside>
  );
} 