import React, { useState } from 'react';
import MiniCalendar from './MiniCalendar';

const Sidebar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <aside className="w-full md:w-72 bg-white border-r h-full flex flex-col p-4 gap-6">
      {/* Lịch tháng */}
      <div>
        <div className="rounded-2xl bg-white">
          <MiniCalendar value={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>
      {/* Hoạt động nổi bật */}
      <div>
        <h3 className="font-semibold text-base mb-1">Hoạt động nổi bật</h3>
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-3xl mb-1">🎉</span>
          <span>Không có sự kiện nổi bật</span>
        </div>
      </div>
      {/* Lên kế hoạch chuyến đi */}
      <div>
        <h3 className="font-semibold text-base mb-1">Lên kế hoạch chuyến đi</h3>
        <form className="flex flex-col gap-2">
          <input className="border rounded px-2 py-1" placeholder="Địa chỉ" />
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 w-1/2" placeholder="Ngày đi" type="date" />
            <input className="border rounded px-2 py-1 w-1/2" placeholder="Ngày về" type="date" />
          </div>
          <input className="border rounded px-2 py-1" placeholder="Ngân sách (VND)" type="number" />
          <button type="submit" className="bg-blue-600 text-white rounded py-1 mt-2">Tạo lịch trình</button>
        </form>
      </div>
      {/* Gợi ý thông minh */}
      <div>
        <h3 className="font-semibold text-base mb-1">Thêm gợi ý thông minh</h3>
        <div className="flex flex-col gap-2">
          <button className="bg-pink-200 text-pink-800 rounded px-2 py-1 text-left">Theo thời tiết</button>
          <button className="bg-green-200 text-green-800 rounded px-2 py-1 text-left">Tối ưu ngân sách</button>
          <button className="bg-emerald-500 text-white rounded px-2 py-1 text-left">Lọc</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 