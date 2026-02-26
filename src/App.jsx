import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import AdminDashboard from './AdminDashboard';
import ManageCompanies from './Admin/Companies/ManageCompanies';
import ManageStudents from './Admin/Students/ManageStudents';
import ProtectedRoute from './components/ProtectedRoute';
import StudentRoute from './modules/student/StudentRoute';
import StudentProfile from './modules/student/StudentProfile';
import PlacementJourney from './modules/student/PlacementJourney';
import PlacementInsights from './modules/student/PlacementInsights';
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

        {/* Protected Student Routes */}
        <Route element={<StudentRoute />}>
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/journey" element={<PlacementJourney />} />
          <Route path="/student/insights" element={<PlacementInsights />} />
          <Route path="/student/dashboard" element={<Navigate to="/student/profile" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


