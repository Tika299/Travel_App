import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';

const CalendarFull = () => {
  const [events, setEvents] = useState([
    { title: 'Sự kiện mẫu', start: '2025-06-24T10:00:00', end: '2025-06-24T12:00:00' }
  ]);

  const handleDateSelect = (selectInfo) => {
    let title = prompt('Nhập tên sự kiện:');
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
    if (title) {
      setEvents([...events, {
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr
      }]);
    }
  };

  const handleEventRemove = (clickInfo) => {
    if (window.confirm(`Xóa sự kiện "${clickInfo.event.title}"?`)) {
      setEvents(events.filter(e => e.title !== clickInfo.event.title || e.start !== clickInfo.event.startStr));
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        selectable={true}
        editable={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventRemove}
        height="auto"
        locale={viLocale}
        firstDay={1}
      />
    </div>
  );
};

export default CalendarFull; 