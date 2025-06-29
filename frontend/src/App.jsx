import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 👥 Public UI Pages
import HomePage from './pages/ui/index';
import TransportCompanyPage from './pages/ui/TransportCompany/TransportCompanyPage';
import CheckinPlacePage from './pages/ui/CheckinPlace/CheckinPlacePage';
import CheckinPlaceDetail from './pages/ui/CheckinPlace/CheckinPlaceDetail';
import TransportCompanyDetail from './pages/ui/TransportCompany/TransportCompanyDetail';
import YeuthichPage from './pages/ui/yeuthich/yeuthich.jsx';

// 🛠 Admin - TransportCompany
import AdminTransportCompanyList from './pages/admin/TransportCompany/index';
import AdminTransportCompanyCreate from './pages/admin/TransportCompany/create';
import AdminTransportCompanyEdit from './pages/admin/TransportCompany/edit';

// 🛠 Admin - CheckinPlace
import AdminCheckinPlaceList from './pages/admin/CheckinPlace/index';
import AdminCheckinPlaceCreate from './pages/admin/CheckinPlace/create';
import AdminCheckinPlaceEdit from './pages/admin/CheckinPlace/edit';

// 🛠 Admin - Transportation (New)
import AdminTransportationList from './pages/admin/Transportation/index.jsx'; // Import component danh sách
import AdminTransportationCreate from './pages/admin/Transportation/create.jsx'; // Giả định có file create.jsx
import AdminTransportationEdit from './pages/admin/Transportation/edit.jsx'; // Giả định có file edit.jsx


function App() {
  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC PAGES ===== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/checkin-places" element={<CheckinPlacePage />} />
        <Route path="/checkin-places/:id" element={<CheckinPlaceDetail />} /> {/* ✅ Trang chi tiết */}
        <Route path="/transport-companies" element={<TransportCompanyPage />} />
        <Route path="/transport-companies/:id" element={<TransportCompanyDetail />} />
        <Route path="/favorites" element={<YeuthichPage />} />


        {/* ===== ADMIN - Transport Companies ===== */}
        <Route path="/admin/transport-companies" element={<AdminTransportCompanyList />} />
        <Route path="/admin/transport-companies/create" element={<AdminTransportCompanyCreate />} />
        <Route path="/admin/transport-companies/edit/:id" element={<AdminTransportCompanyEdit />} />

        {/* ===== ADMIN - Checkin Places ===== */}
        <Route path="/admin/checkin-places" element={<AdminCheckinPlaceList />} />
        <Route path="/admin/checkin-places/create" element={<AdminCheckinPlaceCreate />} />
        <Route path="/admin/checkin-places/edit/:id" element={<AdminCheckinPlaceEdit />} />

        {/* ===== ADMIN - Transportation (New Routes) ===== */}
        <Route path="/admin/transportations" element={<AdminTransportationList />} />
        <Route path="/admin/transportations/create" element={<AdminTransportationCreate />} />
        <Route path="/admin/transportations/edit/:id" element={<AdminTransportationEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
