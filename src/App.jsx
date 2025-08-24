import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ManageCompanies from './ManageCompanies';
import ManageStudents from './ManageStudents';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/admin/companies" element={<ManageCompanies />} />
        <Route path="/admin/students" element={<ManageStudents />} />
      </Routes>
    </Router>
  );
}

export default App;
