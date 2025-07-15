import React, { useRef } from 'react';
import Sidebar from './Sidebar';
import CalendarFull from './CalendarFull';

export default function SchedulePage() {
  // Ref để gọi hàm mở modal ở CalendarFull
  const calendarRef = useRef();

  // Hàm nhận dữ liệu từ Sidebar và truyền sang CalendarFull
  const handleCreateEvent = (data) => {
    if (calendarRef.current && calendarRef.current.openAddModalWithData) {
      calendarRef.current.openAddModalWithData(data);
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-50">
      <Sidebar onCreateEvent={handleCreateEvent} />
      <div className="flex-1 flex flex-col">
        <CalendarFull ref={calendarRef} />
      </div>
    </div>
  );
} 