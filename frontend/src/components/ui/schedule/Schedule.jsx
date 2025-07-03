import React from 'react';

const days = [
  { label: 'Thứ 2', icon: '🥗' },
  { label: 'Thứ 3', icon: '🐮' },
  { label: 'Thứ 4', icon: '🐫' },
  { label: 'Thứ 5', icon: '💗' },
  { label: 'Thứ 6', icon: '🍸' },
  { label: 'Thứ 7', icon: '🎉' },
  { label: 'Chủ nhật', icon: '🐱' },
];

const Schedule = () => (
  <div className="flex-1 flex flex-col bg-white">
    {/* Thanh điều hướng lịch */}
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <div className="flex items-center gap-2">
        <button className="text-2xl">☰</button>
        <h2 className="text-2xl font-bold">Tháng 06 2025</h2>
        <select className="ml-2 border rounded px-2 py-1">
          <option>Tuần</option>
          <option>Ngày</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input className="border rounded px-2 py-1" placeholder="Tìm kiếm..." />
        <button className="bg-blue-600 text-white rounded px-3 py-1 flex items-center gap-1">
          Thêm sự kiện <span className="text-lg">➕</span>
        </button>
      </div>
    </div>
    {/* Bảng lịch trình */}
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-max border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="w-16 border-r"></th>
            {days.map((d) => (
              <th key={d.label} className="text-center py-2 border-r font-semibold">
                <span className="text-xl mr-1">{d.icon}</span> {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 24 }).map((_, hour) => (
            <tr key={hour}>
              <td className="text-xs text-gray-400 border-t border-r align-top px-1 py-2">{hour.toString().padStart(2, '0')}:00</td>
              {days.map((d, idx) => (
                <td key={idx} className={`border-t border-r h-12 ${idx === 6 ? 'bg-gray-100' : ''}`}></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Schedule; 