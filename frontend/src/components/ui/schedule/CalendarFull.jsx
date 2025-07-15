import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';
import { FiX, FiClock, FiChevronLeft, FiChevronRight, FiSearch, FiEdit2, FiTrash2, FiMail, FiUser, FiMapPin, FiMoreHorizontal, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './schedule.css';
// Thu nhỏ label 'Cả ngày' và border dòng allDay bằng CSS custom
import './calendarfull-custom.css';
// Đã xóa: import ScheduleHeader from './ScheduleHeader';

// TimePicker component
function TimePicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  // Tạo danh sách giờ 15 phút/lần
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const date = new Date(0, 0, 0, h, m);
      let label = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        .replace(' ', '').toUpperCase(); // 2:15PM
      const value24 = date.toTimeString().slice(0, 5); // 'HH:mm'
      timeOptions.push({ label, value: value24 });
    }
  }
  // Lấy label từ value
  const selectedLabel = timeOptions.find(opt => opt.value === value)?.label || '';
  // Đóng popup khi click ngoài
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

// Box nhỏ nhập tiêu đề event (mở rộng thêm các trường)
function QuickTitleBox({ start, end, position, onSave, onClose, locationSuggestions }) {
  const [title, setTitle] = useState('');
  const [boxPos, setBoxPos] = useState(position);
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(start.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(start.toTimeString().slice(0, 5));
  const [endDate, setEndDate] = useState(end.toISOString().slice(0, 10));
  const [endTime, setEndTime] = useState(end.toTimeString().slice(0, 5));
  const [repeat, setRepeat] = useState('none');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const inputRef = useRef();
  const boxRef = useRef();
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  // Reposition after render to ensure correct width
  useLayoutEffect(() => {
    if (boxRef.current) {
      const box = boxRef.current;
      let { x, y, left, right } = position;
      const padding = 16;
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      let newX = x;
      if (right !== undefined && left !== undefined) {
        const colWidth = window.innerWidth / 7;
        const colIdx = Math.round(left / colWidth);
        if (colIdx >= 5 || colIdx === 0) {
          if (left - w - 10 > padding) {
            newX = left - w - 10;
          } else {
            newX = Math.max(window.innerWidth - w - padding, padding);
          }
        } else {
          newX = right + 10;
          if (newX + w + padding > window.innerWidth || (newX < right && newX + w > left)) {
            if (left - w - 10 > padding) {
              newX = left - w - 10;
            } else {
              newX = Math.max(window.innerWidth - w - padding, padding);
            }
          }
        }
      } else {
        if (x + w + padding > window.innerWidth) {
          if (x - w - 10 > padding) {
            newX = x - w - 26;
          } else {
            newX = Math.max(window.innerWidth - w - padding, padding);
          }
        }
      }
      if (y + h + padding > window.innerHeight) y = Math.max(window.innerHeight - h - padding, padding);
      if (newX < padding) newX = padding;
      if (y < padding) y = padding;
      setBoxPos({ x: newX, y });
    }
  }, [position, title]);
  // Reset state when start/end change
  useEffect(() => {
    setStartDate(start.toISOString().slice(0, 10));
    setStartTime(start.toTimeString().slice(0, 5));
    setEndDate(end.toISOString().slice(0, 10));
    setEndTime(end.toTimeString().slice(0, 5));
  }, [start, end]);
  // Lấy locationSuggestions từ scope ngoài
  // const locationSuggestions = window.locationSuggestions || []; // Đã xóa
  // Khi nhập địa điểm
  const handleLocationInput = (e) => {
    const value = e.target.value;
    setLocation(value);
    if (value.trim() && locationSuggestions.length > 0) {
      const filtered = locationSuggestions.filter(loc =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowLocationDropdown(filtered.length > 0);
    } else {
      setShowLocationDropdown(false);
    }
  };
  // Khi chọn địa điểm từ dropdown
  const handleSelectLocation = (loc) => {
    setLocation(loc.name);
    setShowLocationDropdown(false);
  };
  const formatTime = d => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  // Tạo danh sách giờ 15 phút/lần cho dropdown
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const date = new Date(0, 0, 0, h, m);
      const label = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '').toLowerCase();
      const value = date.toTimeString().slice(0, 5); // 'HH:mm'
      timeOptions.push({ label, value });
    }
  }
  return (
    <div
      ref={boxRef}
      className="fixed z-50 bg-white rounded-xl shadow-lg p-4 border border-blue-200 min-w-[260px] max-w-[95vw] flex flex-col gap-2"
      style={{ left: boxPos.x, top: boxPos.y }}
    >
      <button className="absolute top-2 right-2 text-lg text-gray-400 hover:text-gray-600" onClick={onClose}><FiX /></button>
      <div className="flex items-center gap-2 text-gray-600 mb-1"><FiClock />
        {allDay
          ? `${startDate} (s)`
          : `${startDate} ${startTime} - ${endDate} ${endTime}`}
      </div>
      <input
        ref={inputRef}
        className="border-b outline-none py-1 text-base font-semibold mb-2"
        placeholder="Nhập tiêu đề..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { onSave({ title, startDate, startTime, endDate, endTime, allDay, repeat, location, description }); } }}
      />
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-500">Bắt đầu:</label>
        <div className="relative flex items-center">
          <DatePicker
            selected={new Date(startDate)}
            onChange={date => setStartDate(date.toISOString().slice(0, 10))}
            dateFormat="dd/MM/yyyy"
            className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28 h-8 text-center pr-7 focus:outline-none"
            calendarClassName="rounded-xl shadow-lg border border-gray-200"
            popperPlacement="bottom"
          />
          <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {!allDay && (
          <TimePicker value={startTime} onChange={setStartTime} />
        )}
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-500">Kết thúc:</label>
        <div className="relative flex items-center">
          <DatePicker
            selected={new Date(endDate)}
            onChange={date => setEndDate(date.toISOString().slice(0, 10))}
            dateFormat="dd/MM/yyyy"
            className="border border-gray-300 rounded px-2 py-0.5 text-sm w-28 h-8 text-center pr-7 focus:outline-none"
            calendarClassName="rounded-xl shadow-lg border border-gray-200"
            popperPlacement="bottom"
          />
          <FiCalendar className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {!allDay && (
          <TimePicker value={endTime} onChange={setEndTime} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} id="quickAllDay" />
        <label htmlFor="quickAllDay" className="text-xs text-gray-500">Cả ngày</label>
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-500">Lặp lại:</label>
        <select className="border rounded px-1 text-xs" value={repeat} onChange={e => setRepeat(e.target.value)}>
          <option value="none">Không lặp</option>
          <option value="daily">Hàng ngày</option>
          <option value="weekly">Hàng tuần</option>
          <option value="monthly">Hàng tháng</option>
          <option value="yearly">Hàng năm</option>
        </select>
      </div>
      <div className="relative">
        <input
          className="border-b outline-none py-1 text-xs mb-1 w-full"
          placeholder="Địa điểm"
          value={location}
          onChange={handleLocationInput}
          onFocus={e => { if (location && filteredLocations.length > 0) setShowLocationDropdown(true); }}
          autoComplete="off"
        />
        {showLocationDropdown && (
          <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-32 overflow-y-auto">
            {filteredLocations.map((loc, idx) => (
              <div
                key={loc.name + idx}
                className="px-3 py-1 cursor-pointer hover:bg-gray-100"
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
        className="border-b outline-none py-1 text-xs mb-1"
        placeholder="Mô tả"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={1}
      />
      <div className="flex gap-2 justify-end mt-2">
        <button className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={onClose}>Hủy</button>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
          onClick={() => onSave({ title, startDate, startTime, endDate, endTime, allDay, repeat, location, description })}
          disabled={!title.trim()}
        >Lưu</button>
      </div>
    </div>
  );
}

const CalendarFull = forwardRef(({ isSidebarOpen }, ref) => {
  const [allEvents, setAllEvents] = useState([
    {
      id: 'event-1',
      title: 'Sự kiện mẫu',
      start: '2025-06-24T10:00:00',
      end: '2025-06-24T11:00:00',
      location: 'Hà Nội',
      weather: { icon: '☀️', color: '#facc15', text: 'Nắng đẹp' },
      price: 500000,
      description: 'Tham quan Văn Miếu Quốc Tử Giám.'
    }
  ]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [quickBox, setQuickBox] = useState({ open: false, position: { x: 0, y: 0 }, start: null, end: null });
  const [messageBox, setMessageBox] = useState({ event: null, position: { x: 0, y: 0 } });
  const [tempEventId, setTempEventId] = useState(null);
  const [conflictBox, setConflictBox] = useState({ open: false, title: '', newEvent: null });
  const calendarRef = useRef();
  // Thêm state để kiểm soát view năm
  const [showYearView, setShowYearView] = useState(false);
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedEventIds, setHighlightedEventIds] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);
  // State cho modal thêm sự kiện
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
  // State cho popup chi tiết sự kiện ở giữa màn hình
  const [centerEventBox, setCenterEventBox] = useState({ open: false, event: null });
  // State cho dropdown gợi ý địa điểm
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);

  const filterEvents = (view, date) => {
    let start, end;
    if (view === 'dayGridMonth') {
      start = new Date(date.getFullYear(), date.getMonth(), 1);
      end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    } else if (view === 'timeGridWeek') {
      const day = date.getDay();
      start = new Date(date);
      start.setDate(date.getDate() - ((day + 6) % 7)); // Bắt đầu từ thứ 2, CN vẫn thuộc tuần hiện tại
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'timeGridDay') {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'yearGrid') {
      start = new Date(date.getFullYear(), 0, 1);
      end = new Date(date.getFullYear(), 11, 31, 23, 59, 59);
    }
    // Debug log
    // console.log('filterEvents', {view, date, start, end, allEvents: allEvents.map(e => ({...e}))});
    setFilteredEvents(
      allEvents.filter(e => {
        const eventStart = new Date(e.start);
        const eventEnd = new Date(e.end || e.start);
        // Uncomment to debug:
        // console.log('event', e.title, e.start, eventStart, '->', e.end, eventEnd, 'in range', eventEnd >= start && eventStart <= end);
        return eventEnd >= start && eventStart <= end;
      })
    );
  };

  useEffect(() => {
    filterEvents(currentView, currentDate);
  }, [currentView, currentDate, allEvents]);

  // Khi đổi view từ ScheduleHeader
  const handleChangeView = (view) => {
    setCurrentView(view);
    if (view === 'yearGrid') {
      setShowYearView(true);
    } else {
      setShowYearView(false);
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(view);
      }
    }
  };

  // Khi chuyển ngày/tháng/năm (nếu có navigation)
  const handleDateChange = (date) => {
    setCurrentDate(date);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(date);
    }
  };

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.getApi().updateSize();
    }
  }, [isSidebarOpen]);

  const handleDateSelect = (selectInfo) => {
    // Luôn xóa mọi event tạm thời trước khi tạo mới
    setAllEvents(allEvents => allEvents.filter(e => !e.id || !e.id.startsWith('temp-')));
    const slotEl = document.elementFromPoint(selectInfo.jsEvent.clientX, selectInfo.jsEvent.clientY);
    const rect = slotEl ? slotEl.getBoundingClientRect() : { right: selectInfo.jsEvent.clientX, top: selectInfo.jsEvent.clientY };
    let start = new Date(selectInfo.startStr);
    let end = new Date(selectInfo.endStr);
    const minDuration = 60 * 60 * 1000; // 1 tiếng
    if (end.getTime() - start.getTime() < minDuration) {
      end = new Date(start.getTime() + minDuration);
    }
    const id = 'temp-' + Date.now();
    // Tạo local datetime string (YYYY-MM-DDTHH:mm)
    const pad = n => n.toString().padStart(2, '0');
    const toLocalDateTime = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setCurrentDate(start);
    setAllEvents(allEvents => ([
      ...allEvents.filter(e => !e.id || !e.id.startsWith('temp-')),
      {
        id,
        title: 'Chưa có tiêu đề',
        start: toLocalDateTime(start),
        end: toLocalDateTime(end),
        allDay: false
      }
    ]));
    setTempEventId(id);
    setQuickBox({
      open: true,
      position: { x: rect.right + 10, y: rect.top, left: rect.left, right: rect.right },
      start: start.toISOString(),
      end: end.toISOString()
    });
    // KHÔNG gọi filterEvents ở đây nữa!
    selectInfo.view.calendar.unselect();
  };

  const checkConflict = (start, end) => {
    const s1 = new Date(start).getTime();
    const e1 = new Date(end).getTime();
    return allEvents.some(e => {
      if (!e.start || !e.end || e.id === tempEventId) return false;
      const s2 = new Date(e.start).getTime();
      const e2 = new Date(e.end).getTime();
      return Math.max(s1, s2) < Math.min(e1, e2);
    });
  };

  // Trong handleSaveQuickTitle, nhận object eventData thay vì chỉ title
  const handleSaveQuickTitle = (eventData) => {
    if (!eventData.title.trim()) {
      setAllEvents(allEvents => allEvents.filter(e => e.id !== tempEventId));
      setQuickBox({ open: false, position: { x: 0, y: 0 }, start: null, end: null });
      setTempEventId(null);
      return;
    }
    // Kiểm tra trùng lịch
    const tempEvent = allEvents.find(e => e.id === tempEventId);
    if (tempEvent && checkConflict(tempEvent.start, tempEvent.end)) {
      setConflictBox({ open: true, title: eventData.title, newEvent: { ...tempEvent, ...eventData, title: eventData.title } });
      return;
    }
    // Đổi id cho event đã lưu để không bị xóa nhầm
    const newId = 'event-' + Date.now();
    setAllEvents(allEvents => allEvents.map(e =>
      e.id === tempEventId ? {
        ...e,
        title: eventData.title,
        id: newId,
        start: eventData.allDay ? eventData.startDate : `${eventData.startDate}T${eventData.startTime}`,
        end: eventData.allDay ? eventData.endDate : `${eventData.endDate}T${eventData.endTime}`,
        location: eventData.location,
        description: eventData.description
      } : e
    ));
    setQuickBox({ open: false, position: { x: 0, y: 0 }, start: null, end: null });
    setTempEventId(null);
  };

  // Xử lý tiếp tục lưu khi trùng lịch
  const handleContinueConflict = () => {
    if (conflictBox.newEvent) {
      const newId = 'event-' + Date.now();
      setAllEvents(allEvents => allEvents.map(e =>
        e.id === tempEventId ? { ...conflictBox.newEvent, id: newId } : e
      ));
    }
    setQuickBox({ open: false, position: { x: 0, y: 0 }, start: null, end: null });
    setTempEventId(null);
    setConflictBox({ open: false, title: '', newEvent: null });
  };

  // Hủy lưu khi trùng lịch
  const handleCancelConflict = () => {
    setAllEvents(allEvents => allEvents.filter(e => e.id !== tempEventId));
    setQuickBox({ open: false, position: { x: 0, y: 0 }, start: null, end: null });
    setTempEventId(null);
    setConflictBox({ open: false, title: '', newEvent: null });
  };

  // Khi đóng box mà không nhập tiêu đề, xóa event tạm thời
  const handleCloseQuickBox = () => {
    setAllEvents(allEvents => allEvents.filter(e => e.id !== tempEventId));
    setQuickBox({ open: false, position: { x: 0, y: 0 }, start: null, end: null });
    setTempEventId(null);
  };

  const handleEventClick = (clickInfo) => {
    // Lấy thông tin event
    setCenterEventBox({
      open: true,
      event: {
        ...clickInfo.event.extendedProps,
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end
      }
    });
  };

  const handleEventRemove = (clickInfo) => {
    if (window.confirm(`Xóa sự kiện "${clickInfo.event.title}"?`)) {
      setAllEvents(allEvents.filter(e => e.title !== clickInfo.event.title || e.start !== clickInfo.event.startStr));
    }
  };

  // Danh sách ngày lễ cố định trong năm (có thể bổ sung thêm)
  const holidays = [
    { month: 0, day: 1, name: 'Tết Dương lịch' },      // 1/1
    { month: 3, day: 30, name: 'Giỗ tổ Hùng Vương' },  // 30/4
    { month: 4, day: 1, name: 'Quốc tế Lao động' },    // 1/5
    { month: 8, day: 2, name: 'Quốc khánh' },          // 2/9
    // ... thêm các ngày lễ khác nếu muốn
  ];

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
    { name: 'Bà Nà Hills', detail: 'Da Nang, Vietnam' },
    { name: 'Bình Thuận', detail: 'Binh Thuan, Vietnam' },
    { name: 'Hồ Tràm', detail: 'Ba Ria - Vung Tau, Vietnam' },
    { name: 'Hồ Tây', detail: 'Tây Hồ, Hanoi, Vietnam' },
    { name: 'Hồ Hoàn Kiếm', detail: 'Hang Trong, Hoàn Kiếm, Hanoi, Vietnam' },
    { name: 'Hồ Đồng Đò', detail: 'Minh Trí, Soc Son, Hanoi, Vietnam' },
    { name: 'Bãi Cháy', detail: 'Ha Long, Quang Ninh, Vietnam' },
    { name: 'Bãi Dài', detail: 'Phu Quoc, Kien Giang, Vietnam' },
    { name: 'Mũi Né', detail: 'Phan Thiet, Binh Thuan, Vietnam' },
    { name: 'Cát Bà', detail: 'Hai Phong, Vietnam' },
    { name: 'Tràng An', detail: 'Ninh Binh, Vietnam' },
    { name: 'Tam Đảo', detail: 'Vinh Phuc, Vietnam' },
    { name: 'Bắc Ninh', detail: 'Bac Ninh, Vietnam' },
    { name: 'Chùa Hương', detail: 'My Duc, Hanoi, Vietnam' },
    { name: 'Bến Tre', detail: 'Ben Tre, Vietnam' },
    { name: 'Long An', detail: 'Long An, Vietnam' },
    { name: 'Quy Nhơn', detail: 'Binh Dinh, Vietnam' },
    { name: 'Pleiku', detail: 'Gia Lai, Vietnam' },
    { name: 'Buôn Ma Thuột', detail: 'Dak Lak, Vietnam' },
    { name: 'Phan Rang', detail: 'Ninh Thuan, Vietnam' },
    { name: 'Phan Thiết', detail: 'Binh Thuan, Vietnam' },
    { name: 'Vinh', detail: 'Nghe An, Vietnam' },
    { name: 'Thanh Hóa', detail: 'Thanh Hoa, Vietnam' },
    { name: 'Nam Định', detail: 'Nam Dinh, Vietnam' },
    { name: 'Ninh Bình', detail: 'Ninh Binh, Vietnam' },
    { name: 'Hà Giang', detail: 'Ha Giang, Vietnam' },
    { name: 'Lạng Sơn', detail: 'Lang Son, Vietnam' },
    { name: 'Sơn La', detail: 'Son La, Vietnam' },
    { name: 'Điện Biên', detail: 'Dien Bien, Vietnam' },
    { name: 'Lào Cai', detail: 'Lao Cai, Vietnam' },
    { name: 'Yên Bái', detail: 'Yen Bai, Vietnam' },
    { name: 'Tuyên Quang', detail: 'Tuyen Quang, Vietnam' },
    { name: 'Cao Bằng', detail: 'Cao Bang, Vietnam' },
    { name: 'Bắc Kạn', detail: 'Bac Kan, Vietnam' },
    { name: 'Thái Nguyên', detail: 'Thai Nguyen, Vietnam' },
    { name: 'Quảng Bình', detail: 'Quang Binh, Vietnam' },
    { name: 'Quảng Trị', detail: 'Quang Tri, Vietnam' },
    { name: 'Quảng Nam', detail: 'Quang Nam, Vietnam' },
    { name: 'Quảng Ngãi', detail: 'Quang Ngai, Vietnam' },
    { name: 'Kon Tum', detail: 'Kon Tum, Vietnam' },
    { name: 'Gia Lai', detail: 'Gia Lai, Vietnam' },
    { name: 'Đắk Lắk', detail: 'Dak Lak, Vietnam' },
    { name: 'Đắk Nông', detail: 'Dak Nong, Vietnam' },
    { name: 'Bình Dương', detail: 'Binh Duong, Vietnam' },
    { name: 'Bình Phước', detail: 'Binh Phuoc, Vietnam' },
    { name: 'Tây Ninh', detail: 'Tay Ninh, Vietnam' },
    { name: 'An Giang', detail: 'An Giang, Vietnam' },
    { name: 'Kiên Giang', detail: 'Kien Giang, Vietnam' },
    { name: 'Sóc Trăng', detail: 'Soc Trang, Vietnam' },
    { name: 'Trà Vinh', detail: 'Tra Vinh, Vietnam' },
    { name: 'Vĩnh Long', detail: 'Vinh Long, Vietnam' },
    { name: 'Cà Mau', detail: 'Ca Mau, Vietnam' },
    { name: 'Bạc Liêu', detail: 'Bac Lieu, Vietnam' },
    { name: 'Hậu Giang', detail: 'Hau Giang, Vietnam' },
    { name: 'Tiền Giang', detail: 'Tien Giang, Vietnam' },
    { name: 'Đồng Tháp', detail: 'Dong Thap, Vietnam' },
    { name: 'Đồng Nai', detail: 'Dong Nai, Vietnam' },
    { name: 'Bình Định', detail: 'Binh Dinh, Vietnam' },
    { name: 'Phú Yên', detail: 'Phu Yen, Vietnam' },
    { name: 'Khánh Hòa', detail: 'Khanh Hoa, Vietnam' },
    { name: 'Ninh Thuận', detail: 'Ninh Thuan, Vietnam' },
    { name: 'Quảng Ninh', detail: 'Quang Ninh, Vietnam' },
    { name: 'Hải Phòng', detail: 'Hai Phong, Vietnam' },
    { name: 'Hải Dương', detail: 'Hai Duong, Vietnam' },
    { name: 'Hưng Yên', detail: 'Hung Yen, Vietnam' },
    { name: 'Thái Bình', detail: 'Thai Binh, Vietnam' },
    { name: 'Hòa Bình', detail: 'Hoa Binh, Vietnam' },
    { name: 'Bắc Giang', detail: 'Bac Giang, Vietnam' },
    { name: 'Bắc Ninh', detail: 'Bac Ninh, Vietnam' },
    { name: 'Vĩnh Phúc', detail: 'Vinh Phuc, Vietnam' },
    { name: 'Phú Thọ', detail: 'Phu Tho, Vietnam' },
    { name: 'Hà Nam', detail: 'Ha Nam, Vietnam' },
    { name: 'Nam Định', detail: 'Nam Dinh, Vietnam' },
    { name: 'Ninh Bình', detail: 'Ninh Binh, Vietnam' },
    { name: 'Thanh Hóa', detail: 'Thanh Hoa, Vietnam' },
    { name: 'Nghệ An', detail: 'Nghe An, Vietnam' },
    { name: 'Hà Tĩnh', detail: 'Ha Tinh, Vietnam' },
    { name: 'Quảng Bình', detail: 'Quang Binh, Vietnam' },
    { name: 'Quảng Trị', detail: 'Quang Tri, Vietnam' },
    { name: 'Thừa Thiên Huế', detail: 'Thua Thien Hue, Vietnam' },
    { name: 'Quảng Nam', detail: 'Quang Nam, Vietnam' },
    { name: 'Quảng Ngãi', detail: 'Quang Ngai, Vietnam' },
    { name: 'Bình Thuận', detail: 'Binh Thuan, Vietnam' },
    { name: 'Bình Phước', detail: 'Binh Phuoc, Vietnam' },
    { name: 'Bình Dương', detail: 'Binh Duong, Vietnam' },
    { name: 'Đồng Nai', detail: 'Dong Nai, Vietnam' },
    { name: 'Tây Ninh', detail: 'Tay Ninh, Vietnam' },
    { name: 'Bà Rịa - Vũng Tàu', detail: 'Ba Ria - Vung Tau, Vietnam' },
    { name: 'TP. Hồ Chí Minh', detail: 'Ho Chi Minh City, Vietnam' },
    { name: 'Cần Thơ', detail: 'Can Tho, Vietnam' },
    { name: 'Hà Nội', detail: 'Hanoi, Vietnam' },
    { name: 'Đà Nẵng', detail: 'Da Nang, Vietnam' },
    { name: 'Hải Phòng', detail: 'Hai Phong, Vietnam' },
    { name: 'Nha Trang', detail: 'Khanh Hoa, Vietnam' },
    { name: 'Vũng Tàu', detail: 'Ba Ria - Vung Tau, Vietnam' },
    { name: 'Phan Thiết', detail: 'Binh Thuan, Vietnam' },
    { name: 'Long An', detail: 'Long An, Vietnam' },
    { name: 'Tiền Giang', detail: 'Tien Giang, Vietnam' },
    { name: 'Bến Tre', detail: 'Ben Tre, Vietnam' },
    { name: 'Trà Vinh', detail: 'Tra Vinh, Vietnam' },
    { name: 'Vĩnh Long', detail: 'Vinh Long, Vietnam' },
    { name: 'Đồng Tháp', detail: 'Dong Thap, Vietnam' },
    { name: 'An Giang', detail: 'An Giang, Vietnam' },
    { name: 'Kiên Giang', detail: 'Kien Giang, Vietnam' },
    { name: 'Cà Mau', detail: 'Ca Mau, Vietnam' },
    { name: 'Bạc Liêu', detail: 'Bac Lieu, Vietnam' },
    { name: 'Sóc Trăng', detail: 'Soc Trang, Vietnam' },
    { name: 'Hậu Giang', detail: 'Hau Giang, Vietnam' },
    { name: 'Bình Dương', detail: 'Binh Duong, Vietnam' },
    { name: 'Bình Phước', detail: 'Binh Phuoc, Vietnam' },
    { name: 'Tây Ninh', detail: 'Tay Ninh, Vietnam' },
    { name: 'Bà Rịa - Vũng Tàu', detail: 'Ba Ria - Vung Tau, Vietnam' },
  ];

  // Hàm render 1 tháng nhỏ
  function renderMiniMonth(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const weeks = [];
    let days = [];
    // Ngày tháng trước
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startDay; i++) {
      days.push({
        day: prevMonthLastDay - startDay + i + 1,
        outside: true
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        outside: false
      });
      if (days.length === 7) {
        weeks.push(days);
        days = [];
      }
    }
    // Ngày tháng sau
    if (days.length) {
      let nextDay = 1;
      while (days.length < 7) {
        days.push({
          day: nextDay++,
          outside: true
        });
      }
      weeks.push(days);
    }
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const isHoliday = (month, day) =>
      holidays.some(h => h.month === month && h.day === day);
    return (
      <div key={month} className="p-3 bg-white flex flex-col min-w-[180px] max-w-[220px]">
        <div className="font-bold mb-2 text-lg text-gray-500">{monthNames[month]}</div>
        <div className="grid grid-cols-7 text-sm text-gray-400 mb-1 gap-x-3">
          {weekDays.map((d, i) => <div key={i} className="w-9 h-9 flex items-center justify-center text-center">{d}</div>)}
        </div>
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 text-sm gap-x-3 gap-y-3">
            {week.map((obj, j) => {
              const isToday =
                !obj.outside &&
                obj.day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isHolidayCell = isHoliday(month, obj.day) && !obj.outside;
              return (
                <div
                  key={j}
                  className={`w-9 h-9 flex items-center justify-center text-center
                    ${obj.outside ? 'text-gray-300' : 'text-gray-700'}
                    ${isToday ? 'bg-blue-600 text-white rounded-full font-bold' : ''}
                    ${isHolidayCell ? 'bg-green-500 text-white rounded-full font-bold' : ''}`}
                  title={isHolidayCell ? holidays.find(h => h.month === month && h.day === obj.day)?.name : ''}
                >
                  {obj.day}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Khi nhập vào ô tìm kiếm
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setHighlightedEventIds([]);
      setSearchIndex(0);
      return;
    }
    // Lọc các sự kiện có tiêu đề chứa từ khóa
    const matchedEvents = allEvents
      .filter(ev => ev.title && ev.title.toLowerCase().includes(value.toLowerCase()));
    const ids = matchedEvents.map(ev => ev.id);
    setHighlightedEventIds(ids);
    setSearchIndex(0);
    // Nếu có kết quả, chuyển đến ngày bắt đầu của sự kiện đầu tiên
    if (matchedEvents.length > 0 && matchedEvents[0].start) {
      const gotoDate = new Date(matchedEvents[0].start);
      handleDateChange(gotoDate);
    }
  };

  // Điều hướng kết quả tìm kiếm
  const handleNextResult = () => {
    if (highlightedEventIds.length === 0) return;
    const nextIndex = (searchIndex + 1) % highlightedEventIds.length;
    setSearchIndex(nextIndex);
    const matchedEvents = allEvents.filter(ev => highlightedEventIds.includes(ev.id));
    if (matchedEvents[nextIndex] && matchedEvents[nextIndex].start) {
      handleDateChange(new Date(matchedEvents[nextIndex].start));
    }
  };
  const handlePrevResult = () => {
    if (highlightedEventIds.length === 0) return;
    const prevIndex = (searchIndex - 1 + highlightedEventIds.length) % highlightedEventIds.length;
    setSearchIndex(prevIndex);
    const matchedEvents = allEvents.filter(ev => highlightedEventIds.includes(ev.id));
    if (matchedEvents[prevIndex] && matchedEvents[prevIndex].start) {
      handleDateChange(new Date(matchedEvents[prevIndex].start));
    }
  };

  // Hàm mở modal
  const openAddModal = () => {
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    // Mặc định 1 ngày tròn: 00:00 - 23:45
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
  // Hàm đóng modal
  const closeAddModal = () => setShowAddModal(false);

  // Hàm lưu sự kiện mới
  const handleAddEvent = () => {
    if (!addEventData.title.trim()) return;
    // Xác định nếu là sự kiện nhiều ngày thì set allDay: true
    const isMultiDay = addEventData.startDate !== addEventData.endDate;
    const allDay = isMultiDay ? true : addEventData.allDay;
    // Nếu allDay, start/end phải là YYYY-MM-DD (không có giờ)
    const start = allDay
      ? addEventData.startDate
      : `${addEventData.startDate}T${addEventData.startTime}`;
    // end phải cộng thêm 1 ngày nếu là allDay multi-day để FullCalendar hiển thị đúng
    let end = allDay
      ? addEventData.endDate
      : `${addEventData.endDate}T${addEventData.endTime}`;
    if (allDay && isMultiDay) {
      // Tăng end lên 1 ngày (YYYY-MM-DD)
      const endDateObj = new Date(addEventData.endDate);
      endDateObj.setDate(endDateObj.getDate() + 1);
      end = endDateObj.toISOString().slice(0, 10);
    }
    const newEvent = {
      id: 'event-' + Date.now(),
      title: addEventData.title,
      start,
      end,
      allDay,
      location: addEventData.location,
      description: addEventData.description
    };
    setAllEvents(events => [...events, newEvent]);
    setShowAddModal(false);

    // Chuyển view sang tháng/ngày của sự kiện vừa thêm
    const gotoDate = new Date(start);
    handleDateChange(gotoDate);
    // KHÔNG gọi filterEvents ở đây nữa!
  };

  // Khi nhập địa điểm
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
  // Khi chọn địa điểm từ dropdown
  const handleSelectLocation = (loc) => {
    setAddEventData({ ...addEventData, location: loc.name });
    setShowLocationDropdown(false);
  };

  // Cho phép cha mở modal thêm sự kiện với dữ liệu từ Sidebar
  useImperativeHandle(ref, () => ({
    openAddModalWithData: (data) => {
      setAddEventData(prev => ({
        ...prev,
        location: data.address || '',
        startDate: data.startDate ? (data.startDate instanceof Date ? data.startDate.toISOString().slice(0,10) : data.startDate) : '',
        endDate: data.endDate ? (data.endDate instanceof Date ? data.endDate.toISOString().slice(0,10) : data.endDate) : '',
        title: '',
        startTime: '00:00',
        endTime: '23:45',
        allDay: false,
        repeat: 'none',
        description: '',
        budget: data.budget || ''
      }));
      setShowAddModal(true);
    }
  }));

  return (
    <div className="flex-1 h-full bg-white rounded-b-xl shadow-none p-4 calendar-sticky-header overflow-y-auto flex flex-col custom-scrollbar">
      <div className="w-full bg-white flex items-center px-6 py-3 gap-4 mb-2 border-none shadow-none">
        <button className="p-2 text-2xl mr-2">
          <span style={{fontWeight: 'bold', fontSize: '20px'}}>≡</span>
        </button>
        <div className="flex items-center gap-2 mr-4">
          <button
            className="p-1 rounded hover:bg-gray-100 text-gray-500 text-xl"
            onClick={() => {
              const prev = new Date(currentDate);
              if (currentView === 'timeGridWeek') {
                prev.setDate(currentDate.getDate() - 7); // Lùi 1 tuần
              } else {
                prev.setMonth(currentDate.getMonth() - 1); // Lùi 1 tháng
              }
              handleDateChange(prev);
            }}
            aria-label="Trước"
          >
            <FiChevronLeft />
          </button>
          <span className="text-2xl md:text-3xl font-bold">
            Tháng {String(currentDate.getMonth() + 1).padStart(2, '0')} {currentDate.getFullYear()}
          </span>
          <button
            className="p-1 rounded hover:bg-gray-100 text-gray-500 text-xl"
            onClick={() => {
              const next = new Date(currentDate);
              if (currentView === 'timeGridWeek') {
                next.setDate(currentDate.getDate() + 7); // Tiến 1 tuần
              } else {
                next.setMonth(currentDate.getMonth() + 1); // Tiến 1 tháng
              }
              handleDateChange(next);
            }}
            aria-label="Sau"
          >
            <FiChevronRight />
          </button>
        </div>
        <select
          className="border border-gray-300 rounded px-3 py-1 text-gray-500 font-medium focus:outline-none mr-auto"
          value={currentView}
          onChange={e => handleChangeView(e.target.value)}
        >
          <option value="timeGridDay">Ngày</option>
          <option value="timeGridWeek">Tuần</option>
          <option value="dayGridMonth">Tháng</option>
          <option value="yearGrid">Năm</option>
        </select>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded px-3 py-1 pr-9 text-gray-500 focus:outline-none focus:border-blue-400 bg-white text-sm"
              style={{ minWidth: 140 }}
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none" />
            {/* Dropdown danh sách kết quả tìm kiếm */}
            {searchTerm.trim() && highlightedEventIds.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 max-h-60 overflow-y-auto min-w-[260px]">
                {allEvents.filter(ev => highlightedEventIds.includes(ev.id)).map((ev, idx) => (
                  <div
                    key={ev.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex flex-col ${searchIndex === idx ? 'bg-blue-100' : ''}`}
                    onMouseDown={() => {
                      setSearchIndex(idx);
                      handleDateChange(new Date(ev.start));
                    }}
                  >
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      {ev.title}
                      <span className="text-xs text-gray-500">{ev.location ? `- ${ev.location}` : ''}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ev.start).toLocaleString('vi-VN', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold flex items-center gap-1 shadow hover:bg-blue-700 transition"
            onClick={openAddModal}
          >
            Thêm lịch trình <span style={{fontWeight: 'bold', fontSize: '16px'}}>＋</span>
          </button>
        </div>
      </div>
      {showYearView ? (
        <div className="w-full overflow-y-auto max-h-[700px] year-scrollbar">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => renderMiniMonth(currentDate.getFullYear(), i))}
          </div>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={currentView}
          headerToolbar={false}
          allDaySlot={true}
          dayHeaderContent={info => {
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            if (currentView === 'dayGridMonth') {
              return (
                <span className="uppercase text-xs font-normal text-gray-500">{days[info.date.getDay()]}</span>
              );
            } else {
              const isToday = info.date.toDateString() === new Date().toDateString();
              return (
                <div className="flex flex-col items-center">
                  <span className="uppercase text-xs font-normal text-gray-500">{days[info.date.getDay()]}</span>
                  <span className={`mt-1 text-xl font-normal ${isToday ? 'bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center' : 'text-gray-700'}`}>{info.date.getDate()}</span>
                </div>
              );
            }
          }}
          selectable={true}
          editable={true}
          events={filteredEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="100%"
          locale={viLocale}
          firstDay={1}
          dayHeaderClassNames="bg-white border-none shadow-none rounded-b-xl"
          slotLabelClassNames="text-xs text-gray-400"
          eventClassNames={arg => {
            let base = 'rounded-md px-2 py-0.5 text-xs font-semibold';
            if (highlightedEventIds.includes(arg.event.id)) {
              base += ' border-2 border-blue-500';
            }
            // Nếu là event nhiều ngày (allDay true và start != end)
            const isMultiDay = arg.event.allDay && arg.event.startStr !== arg.event.endStr;
            if (isMultiDay) {
              base += ' bg-blue-500/80 text-white rounded-md';
            } else {
              base += ' shadow';
            }
            return base;
          }}
          slotDuration="01:00:00"
          slotLabelInterval="01:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          snapDuration="00:15:00"
        />
      )}
      {quickBox.open && (
        <QuickTitleBox
          start={new Date(quickBox.start)}
          end={new Date(quickBox.end)}
          position={quickBox.position}
          onSave={handleSaveQuickTitle}
          onClose={handleCloseQuickBox}
          locationSuggestions={locationSuggestions}
        />
      )}
      {centerEventBox.open && centerEventBox.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-2xl text-gray-400 hover:text-gray-600"
              onClick={() => setCenterEventBox({ open: false, event: null })}
            >
              <FiX />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <div className="text-xl font-bold flex-1">{centerEventBox.event.title}</div>
              <button className="p-1 hover:bg-gray-200 rounded" title="Sửa"><FiEdit2 /></button>
              <button className="p-1 hover:bg-gray-200 rounded" title="Gửi mail"><FiMail /></button>
              <button className="p-1 hover:bg-gray-200 rounded" title="Xóa"><FiTrash2 /></button>
              <button className="p-1 hover:bg-gray-200 rounded" title="Khác"><FiMoreHorizontal /></button>
            </div>
            <div className="text-gray-500 mb-3">
              {centerEventBox.event.start && (
                <span>{new Date(centerEventBox.event.start).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              )}
            </div>
            {centerEventBox.event.location && (
              <div className="flex items-center gap-2 mb-2 text-gray-700">
                <FiMapPin />
                <span>{centerEventBox.event.location}</span>
              </div>
            )}
            {centerEventBox.event.description && (
              <div className="flex items-center gap-2 mb-2 text-gray-700">
                <FiUser />
                <span>{centerEventBox.event.description}</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-gray-700">
              <FiUser />
              <span>Đài Nguyễn Văn</span>
            </div>
          </div>
        </div>
      )}
      {conflictBox.open && (
        <div className="fixed z-50 bg-white rounded-xl shadow-lg p-4 border border-red-300 min-w-[260px] max-w-[90vw] flex flex-col gap-2" style={{ left: '50%', top: '30%', transform: 'translate(-50%, 0)' }}>
          <div className="font-bold text-red-600 mb-2">Trùng lịch!</div>
          <div className="mb-2">Sự kiện này bị trùng với một sự kiện khác. Bạn có muốn tiếp tục kế hoạch không?</div>
          <div className="flex gap-2 justify-end">
            <button className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300" onClick={handleCancelConflict}>Hủy</button>
            <button className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700" onClick={handleContinueConflict}>Tiếp tục</button>
          </div>
        </div>
      )}
      {/* Modal thêm sự kiện */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">
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
                {!addEventData.allDay && (
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
                {!addEventData.allDay && (
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
                <button
                  className="px-4 py-1 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  onClick={handleAddEvent}
                  disabled={!addEventData.title.trim()}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default CalendarFull; 