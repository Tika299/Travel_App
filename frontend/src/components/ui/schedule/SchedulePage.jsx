import React, { useRef } from 'react';
import Sidebar from './Sidebar';
import CalendarFull from './CalendarFull';
import Header from '../../Header';

export default function SchedulePage() {
  const calendarRef = useRef();

  // Khi Sidebar gọi, sẽ mở modal thêm lịch trình ở CalendarFull
  const handleCreateEvent = (data) => {
    if (calendarRef.current && calendarRef.current.openAddModalWithData) {
      calendarRef.current.openAddModalWithData(data);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-hidden">
      <Header />
      {/* Main content area */}
      <div className='flex w-full'>
        <Sidebar onCreateEvent={handleCreateEvent} />
        <div className="flex-1 flex flex-col min-h-screen">
          <CalendarFull ref={calendarRef} />
        </div>
      </div>
    </div>
  );
} 