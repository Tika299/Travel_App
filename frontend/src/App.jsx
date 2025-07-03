import Header from './components/ui/schedule/Header';
import Sidebar from './components/ui/schedule/Sidebar';
import CalendarFull from './components/ui/schedule/CalendarFull';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-2">
          <CalendarFull />
        </div>
      </div>
    </div>
  );
}

export default App;
