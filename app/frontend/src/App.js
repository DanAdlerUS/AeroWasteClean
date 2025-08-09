import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; 
import DashboardPage from './pages/DashboardPage';
import DroneManagementPage from './pages/DroneManagementPage';
import BaseManagementPage from './pages/BaseManagementPage';
import MissionReportPage from './pages/MissionReportPage';
import AISettingsPage from './pages/AISettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/drones" element={<DroneManagementPage />} />
        <Route path="/bases" element={<BaseManagementPage />} />
        <Route path="/ai" element={<AISettingsPage />} /> {/* ✅ */}
        <Route path="/mission-report/:id" element={<MissionReportPage />} />
      </Routes>
    </Router>
  );
}

export default App;
