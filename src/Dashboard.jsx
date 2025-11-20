import React, { useState, useEffect } from "react";
import Head from 'next/head';
import Vcet from "./assets/VCET Logo.jpg";
import { disableDevTools } from "./utils/disableDevTools";
import CSE from "./assets/CSE LOGO.jpg";
import { FaUser, FaLock, FaUserShield } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./components/Loader";
import "./styles/Dashboard.css";

function Dashboard() {
  useEffect(() => {
    disableDevTools();
  }, []);

  const [isStudentLogin, setIsStudentLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const adminId = e.target.elements.adminId.value;
    const password = e.target.elements.password.value;
    try {
      const res = await fetch('https://vcetplacement.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        navigate("/AdminDashboard");
      } else {
        alert(data?.error || 'Invalid Admin ID or Password');
      }
    } catch (error) {
      alert('Unable to reach server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>VCET Placement Portal | Dashboard</title>
        <meta name="description" content="Login to VCET Placement Portal - Access student and admin features for placement management" />
      </Head>
      <div className="min-h-screen bg-gradient-animation p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-1"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-2"></div>
          <div className="absolute -bottom-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-3"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="college-header">
            <img src={Vcet} alt="VCET Logo" className="college-logo" />
            <div className="college-info">
              <h1 className="college-name">Velammal College of Engineering and Technology</h1>
              <p className="college-subtitle">Department of Computer Science and Engineering</p>
            </div>
            <img src={CSE} alt="CSE Logo" className="college-logo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* About Section */}
            <div className="about-section">
              <h2 className="text-3xl font-bold text-white mb-6">Placement Portal</h2>
              <p className="text-white leading-relaxed mb-6">
              At Velammal College of Engineering and Technology (VCET), Madurai, the Placement Portal is a digital initiative 
              aimed at transforming the campus recruitment process. This project efficiently manages student and company data, 
              ensuring smooth tracking of placement status and facilitating effective coordination between students, recruiters, 
              and the placement cell.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="feature-card">
                  <h3>Vision</h3>
                  <p>To bridge academia and industry through innovative placement solutions.</p>
                </div>
                <div className="feature-card">
                  <h3>Mission</h3>
                  <p>To revolutionize campus placements with transparent and efficient processes.</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-white mb-4">Key Achievements</h3>
                <ul className="achievement-list">
                  <li>
                    <span>✓</span>
                    Centralized Database for Students & Companies
                  </li>
                  <li>
                    <span>✓</span>
                    Real-Time Placement Status Updates
                  </li>
                  <li>
                    <span>✓</span>
                    Eligibility Criteria Matching System
                  </li>
                  <li>
                    <span>✓</span>
                    Company-Wise and Student-Wise Report Generation
                  </li>
                </ul>
              </div>
            </div>

            {/* Login Form Section */}
            <div className="login-form-container">
              <div className="toggle-container">
                <button
                  className={`toggle-button ${isStudentLogin ? 'active' : ''}`}
                  onClick={() => setIsStudentLogin(true)}
                >
                  Student Login
                </button>
                <button
                  className={`toggle-button ${!isStudentLogin ? 'active' : ''}`}
                  onClick={() => setIsStudentLogin(false)}
                >
                  Admin Login
                </button>
              </div>

              {/* Student Login */}
              <div className={`login-form student ${isStudentLogin ? 'active' : ''}`}>
                <h2>Student Portal</h2>
                <form>
                  <div className="form-group">
                    <span className="input-icon"><FaUser /></span>
                    <input
                      type="text"
                      placeholder="Student ID"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <span className="input-icon"><FaLock /></span>
                    <input
                      type="password"
                      placeholder="Password"
                      className="input-field"
                    />
                  </div>
                  <button
                    type="submit"
                    className="login-button"
                  >
                    Login
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-white">
                    New student? <Link to="/register" className="register-link">Register here</Link>
                  </p>
                </div>
              </div>

              {/* Admin Login */}
              <div className={`login-form admin ${!isStudentLogin ? 'active' : ''}`}>
                <h2>Admin Portal</h2>
                <form onSubmit={handleAdminLogin}>
                  <div className="form-group">
                    <span className="input-icon"><FaUserShield /></span>
                    <input
                      type="text"
                      name="adminId"
                      placeholder="Admin ID"
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <span className="input-icon"><FaLock /></span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="input-field"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="login-button"
                  >
                    Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Loader message="Logging in..." />}
    </>
  );
}

export default Dashboard;