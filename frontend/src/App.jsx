import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 👥 Public UI Pages
import TransportCompanyPage from './pages/ui/TransportCompany/TransportCompanyPage';
import CheckinPlacePage from './pages/ui/CheckinPlace/CheckinPlacePage';

// 🛠 Admin - TransportCompany
import AdminTransportCompanyList from './pages/admin/TransportCompany/index';
import AdminTransportCompanyCreate from './pages/admin/TransportCompany/create';
import AdminTransportCompanyEdit from './pages/admin/TransportCompany/edit';

// 🛠 Admin - CheckinPlace
import AdminCheckinPlaceList from './pages/admin/CheckinPlace/index';
import AdminCheckinPlaceCreate from './pages/admin/CheckinPlace/create';
import AdminCheckinPlaceEdit from './pages/admin/CheckinPlace/edit';

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC PAGES ===== */}
        <Route path="/" element={<CheckinPlacePage />} />
        <Route path="/transport-companies" element={<TransportCompanyPage />} />

        {/* ===== ADMIN - Transport Companies ===== */}
        <Route path="/admin/transport-companies" element={<AdminTransportCompanyList />} />
        <Route path="/admin/transport-companies/create" element={<AdminTransportCompanyCreate />} />
        <Route path="/admin/transport-companies/edit/:id" element={<AdminTransportCompanyEdit />} />

        {/* ===== ADMIN - Checkin Places ===== */}
        <Route path="/admin/checkin-places" element={<AdminCheckinPlaceList />} />
        <Route path="/admin/checkin-places/create" element={<AdminCheckinPlaceCreate />} />
        <Route path="/admin/checkin-places/edit/:id" element={<AdminCheckinPlaceEdit />} />
      </Routes>
    </Router>
  );
}

export default App;
