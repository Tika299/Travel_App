import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiGift, FiSun, FiDollarSign, FiFilter, FiMapPin, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // Khi nhập địa chỉ
  const handleAddressInput = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (value.trim()) {
      const filtered = locationSuggestions.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setShowDropdown(false);
    }
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
  return (
    <aside className="w-full md:w-[260px] min-w-[200px] max-w-[280px] bg-gray-50 rounded-xl shadow-md p-4 flex flex-col gap-4">
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
                onFocus={e => { if (address && filteredLocations.length > 0) setShowDropdown(true); }}
                autoComplete="off"
              />
              <FiMapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-40 overflow-y-auto">
                  {filteredLocations.map((loc, idx) => (
                    <div
                      key={loc.name + idx}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onMouseDown={() => handleSelectLocation(loc)}
                    >
                      <div className="font-medium">{loc.name}</div>
                      <div className="text-xs text-gray-500">{loc.detail}</div>
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
      <div className="flex flex-col gap-2">
        <button className="bg-pink-100 text-pink-700 rounded py-2 font-semibold flex items-center justify-center gap-2">
          <FiSun className="text-lg" /> Theo thời tiết
        </button>
        <button className="bg-blue-100 text-blue-700 rounded py-2 font-semibold flex items-center justify-center gap-2">
          <FiDollarSign className="text-lg" /> Tối ưu ngân sách
        </button>
        <button className="bg-green-500 text-white rounded py-2 font-semibold hover:bg-green-600 flex items-center justify-center gap-2">
          <FiFilter className="text-lg" /> Lọc
        </button>
      </div>
    </aside>
  );
} 