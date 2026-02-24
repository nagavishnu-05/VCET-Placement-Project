import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ManageCompanies from './Admin/Companies/ManageCompanies';
import ManageStudents from './Admin/Students/ManageStudents';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Protected Admin Routes */}
        <Route path="/AdminDashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/companies" element={
          <ProtectedRoute>
            <ManageCompanies />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute>
            <ManageStudents />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
