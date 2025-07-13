import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function Sidebar() {
  const [date, setDate] = useState(new Date());
  return (
    <aside className="w-full md:w-[260px] min-w-[200px] max-w-[280px] bg-white rounded-xl shadow-md p-4 flex flex-col gap-4">
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
          <span className="text-3xl mb-2">🎉</span>
          <span>Không có sự kiện nổi bật</span>
        </div>
      </div>

      {/* Lên kế hoạch */}
      <div>
        <div className="font-semibold mb-1">Lên kế hoạch chuyến đi</div>
        <form className="flex flex-col gap-2">
          <select className="border rounded px-2 py-1 text-sm">
            <option>Địa chỉ</option>
            <option>Hà Nội</option>
            <option>Đà Nẵng</option>
          </select>
          <div className="flex gap-2">
            <input type="text" placeholder="Ngày đi" className="border rounded px-2 py-1 w-1/2 text-sm" />
            <input type="text" placeholder="Ngày về" className="border rounded px-2 py-1 w-1/2 text-sm" />
          </div>
          <input type="text" placeholder="Ngân sách (VND)" className="border rounded px-2 py-1 text-sm" />
          <button type="button" className="bg-blue-500 text-white rounded py-2 mt-2 font-semibold hover:bg-blue-600">
            Tạo lịch trình
          </button>
        </form>
      </div>

      {/* Gợi ý thông minh */}
      <div className="flex flex-col gap-2">
        <button className="bg-pink-100 text-pink-700 rounded py-2 font-semibold flex items-center justify-center gap-2">
          <span>🌤️</span> Theo thời tiết
        </button>
        <button className="bg-blue-100 text-blue-700 rounded py-2 font-semibold flex items-center justify-center gap-2">
          <span>💸</span> Tối ưu ngân sách
        </button>
        <button className="bg-green-500 text-white rounded py-2 font-semibold hover:bg-green-600">
          Lọc
        </button>
      </div>
    </aside>
  );
} 