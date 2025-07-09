import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Cuisine from './pages/ui/Cuisine';
import FoodList from './pages/admin/FoodList';
import FoodCreate from './pages/admin/FoodCreate';
import FoodEdit from './pages/admin/FoodEdit';
import { Link } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';
import CuisineAll from './pages/ui/CuisineAll';
import CulinaryDetail from './pages/ui/CulinaryDetail';
import CategoryList from './pages/admin/CategoryList';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Trang chủ */}
        <Route path="/" element={<div>Trang chủ</div>} />
        {/* Trang ẩm thực */}
        <Route path="/cuisine" element={<Cuisine />} />
        {/* Trang xem tất cả món ăn */}
        <Route path="/cuisine/all" element={<CuisineAll />} />
        {/* Trang chi tiết món ăn */}
        <Route path="/cuisine/:id" element={<CulinaryDetail />} />
        {/* Trang admin - danh sách món ăn */}
        <Route path="/admin/foods" element={<FoodList />} />
        {/* Trang admin - thêm ẩm thực */}
        <Route path="/admin/foods/create" element={<FoodCreate />} />
        {/* Trang admin - sửa ẩm thực */}
        <Route path="/admin/foods/:id/edit" element={<FoodEdit />} />
        {/* Trang admin - danh mục */}
        <Route path="/admin/categories" element={<CategoryList />} />
      </Routes>
      
    </Router>
  );
}

export default App;