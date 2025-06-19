import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cuisine from './pages/ui/Cuisine';
import { Link } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Trang chủ */}
        <Route path="/" element={<div>Trang chủ</div>} />
        {/* Trang ẩm thực */}
        <Route path="/cuisine" element={<Cuisine />} />
      </Routes>
    </Router>
  );
}

export default App;