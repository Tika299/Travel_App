import { useState } from "react";
import Sidebar from './components/ui/schedule/Sidebar';
import CalendarFull from './components/ui/schedule/CalendarFull';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        {isSidebarOpen && <Sidebar />}
        <div className={`transition-all duration-300 ${isSidebarOpen ? "flex-1" : "w-full"} p-2`}>
          {/* Đã xóa ScheduleHeader ở đây */}
          <CalendarFull />
        </div>
      </div>
    </div>
  );
}
export default App;

