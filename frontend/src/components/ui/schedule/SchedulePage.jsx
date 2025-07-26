import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import CalendarFull from './CalendarFull';

export default function SchedulePage() {
  const calendarRef = useRef();
  const [aiEvents, setAiEvents] = useState([]);

  // Khi Sidebar gọi, sẽ mở modal thêm lịch trình ở CalendarFull
  const handleCreateEvent = (data) => {
    if (calendarRef.current && calendarRef.current.openAddModalWithData) {
      calendarRef.current.openAddModalWithData(data);
    }
  };

  // Nhận event AI từ Sidebar và truyền xuống CalendarFull
  const handleAIGenerateEvents = (events) => {
    setAiEvents(events);
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar onCreateEvent={handleCreateEvent} onAIGenerateEvents={handleAIGenerateEvents} />
      <div className="flex-1 flex flex-col min-h-screen">
        <CalendarFull ref={calendarRef} aiEvents={aiEvents} />
      </div>
    </div>
  );
} 