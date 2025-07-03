import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const weekdayVN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const MiniCalendar = (props) => {
  const {
    value = new Date(),
    onChange = () => {}
  } = props || {};

  // T2 là cột đầu, CN là cột cuối
  const formatShortWeekday = (locale, date) => {
    return weekdayVN[(date.getDay() + 6) % 7];
  };

  // Chỉ hiển thị 'Tháng {số}'
  const formatMonthYear = (locale, date) => {
    const monthNumber = date.getMonth() + 1;
    return `Tháng ${monthNumber}`;
  };

  return (
    <Calendar
      onChange={onChange}
      value={value}
      locale="vi-VN"
      calendarType="iso8601"
      next2Label={null}
      prev2Label={null}
      formatShortWeekday={formatShortWeekday}
      formatMonthYear={formatMonthYear}
      tileClassName={({ date, view }) =>
        view === 'month' && date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()
          ? 'bg-blue-600 text-white rounded-full'
          : ''
      }
    />
  );
};

export default MiniCalendar; 