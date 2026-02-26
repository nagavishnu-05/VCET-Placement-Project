import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaUser, FaChartBar, FaGlobeAmericas } from "react-icons/fa";
import Vcet from "../../assets/VCET Logo.jpg";
import CSE from "../../assets/CSE LOGO.jpg";
import "../../styles/StudentDashboard.css";

const StudentLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentProfile");
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gradient-animation p-4 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-1"></div>
                <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-2"></div>
                <div className="absolute -bottom-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-3"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* College Header */}
                <div className="student-college-header">
                    <img src={Vcet} alt="VCET Logo" className="student-college-logo" />
                    <div className="student-college-info">
                        <h1 className="student-college-name">
                            Velammal College of Engineering and Technology
                        </h1>
                        <p className="student-college-subtitle">
                            Department of Computer Science and Engineering
                        </p>
                        <p className="student-subtitle">Student Portal</p>
                    </div>
                    <img src={CSE} alt="CSE Logo" className="student-college-logo" />
                </div>

                {/* Navigation Bar */}
                <div className="student-navbar">
                    <button
                        className={`student-nav-button ${isActive("/student/profile") ? "active" : ""}`}
                        onClick={() => navigate("/student/profile")}
                    >
                        <FaUser className="student-nav-icon" />
                        Profile
                    </button>

                    <button
                        className={`student-nav-button ${isActive("/student/journey") ? "active" : ""}`}
                        onClick={() => navigate("/student/journey")}
                    >
                        <FaChartBar className="student-nav-icon" />
                        My Stats
                    </button>

                    <button
                        className={`student-nav-button ${isActive("/student/insights") ? "active" : ""}`}
                        onClick={() => navigate("/student/insights")}
                    >
                        <FaGlobeAmericas className="student-nav-icon" />
                        Placement Insights
                    </button>

                    <button
                        className="student-nav-button logout"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt className="student-nav-icon" />
                        Logout
                    </button>
                </div>

                {/* Page Content */}
                <div className="student-content">{children}</div>
            </div>
        </div>
    );
};

export default StudentLayout;
