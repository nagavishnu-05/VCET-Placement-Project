import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentLayout from "./StudentLayout";
import {
    FaUser,
    FaGraduationCap,
    FaBriefcase,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendarAlt,
    FaBuilding,
    FaTrophy,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000/api/student-portal";

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("studentToken");
            if (!token) return;

            const headers = { Authorization: `Bearer ${token}` };

            try {
                const [profileRes, progressRes] = await Promise.all([
                    axios.get(`${API_BASE}/profile`, { headers }),
                    axios.get(`${API_BASE}/progress`, { headers }),
                ]);

                setProfile(profileRes.data);
                setProgress(progressRes.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem("studentToken");
                    window.location.href = "/";
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <StudentLayout>
                <div className="student-loading">
                    <div className="student-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <div className="student-dashboard-grid">
                {/* Final Selected Company — shown prominently if student is placed */}
                {progress?.finalSelectedCompany && (
                    <div className="student-card student-final-card">
                        <div className="student-card-header">
                            <FaTrophy className="student-card-icon trophy" />
                            <h3>🎉 Placement Confirmed!</h3>
                        </div>
                        <div className="student-final-details">
                            <h2 className="student-final-company-name">
                                {progress.finalSelectedCompany.companyName}
                            </h2>
                            <div className="student-final-meta">
                                <span className="student-final-position">
                                    {progress.finalSelectedCompany.position}
                                </span>
                                <span className="student-final-role-badge">
                                    {progress.finalSelectedCompany.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Card */}
                <div className="student-card student-profile-card">
                    <div className="student-card-header">
                        <FaUser className="student-card-icon" />
                        <h3>My Profile</h3>
                    </div>
                    {profile ? (
                        <div className="student-profile-details">
                            <div className="student-profile-avatar">
                                {profile.studentName?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="student-profile-name">{profile.studentName}</h2>
                            <div className="student-profile-info-grid">
                                <div className="student-info-item">
                                    <span className="student-info-label">Register No.</span>
                                    <span className="student-info-value">
                                        {profile.studentRegisterNumber}
                                    </span>
                                </div>
                                <div className="student-info-item">
                                    <span className="student-info-label">Degree</span>
                                    <span className="student-info-value">
                                        {profile.studentDegree}
                                    </span>
                                </div>
                                <div className="student-info-item">
                                    <span className="student-info-label">Branch</span>
                                    <span className="student-info-value">
                                        {profile.studentBranch}
                                    </span>
                                </div>
                                <div className="student-info-item">
                                    <span className="student-info-label">CGPA</span>
                                    <span className="student-info-value student-cgpa">
                                        {profile.studentUGCGPA}
                                    </span>
                                </div>
                                <div className="student-info-item">
                                    <span className="student-info-label">Email</span>
                                    <span className="student-info-value">
                                        {profile.studentEmailID}
                                    </span>
                                </div>
                                <div className="student-info-item">
                                    <span className="student-info-label">Mobile</span>
                                    <span className="student-info-value">
                                        {profile.studentMobileNumber}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="student-no-data">Profile data unavailable</p>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="student-stats-row">
                    <div className="student-stat-card">
                        <FaBuilding className="student-stat-icon companies" />
                        <div className="student-stat-info">
                            <span className="student-stat-number">
                                {progress?.summary?.totalCompanies || 0}
                            </span>
                            <span className="student-stat-label">Companies Attended</span>
                        </div>
                    </div>
                    <div className="student-stat-card">
                        <FaCheckCircle className="student-stat-icon selected" />
                        <div className="student-stat-info">
                            <span className="student-stat-number">
                                {progress?.summary?.selectedCount || 0}
                            </span>
                            <span className="student-stat-label">Final Selected</span>
                        </div>
                    </div>
                    <div className="student-stat-card">
                        <FaTrophy className="student-stat-icon cleared" />
                        <div className="student-stat-info">
                            <span className="student-stat-number">
                                {progress?.summary?.clearedCount || 0}
                            </span>
                            <span className="student-stat-label">Cleared All Rounds</span>
                        </div>
                    </div>
                    <div className="student-stat-card">
                        <FaClock className="student-stat-icon pending" />
                        <div className="student-stat-info">
                            <span className="student-stat-number">
                                {progress?.summary?.pendingCount || 0}
                            </span>
                            <span className="student-stat-label">In Progress</span>
                        </div>
                    </div>
                </div>

                {/* Placement Progress */}
                <div className="student-card student-progress-card">
                    <div className="student-card-header">
                        <FaBriefcase className="student-card-icon" />
                        <h3>Placement Progress</h3>
                    </div>
                    {progress?.progress?.length > 0 ? (
                        <div className="student-progress-list">
                            {progress.progress.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`student-progress-item ${item.isFinalSelected ? "final-selected" : ""
                                        }`}
                                >
                                    <div className="student-progress-company">
                                        <div className="student-progress-company-header">
                                            <h4>{item.companyName}</h4>
                                            {/* Final Status Badge */}
                                            <span
                                                className={`student-status-badge ${item.finalStatus === "Selected"
                                                        ? "status-selected"
                                                        : item.finalStatus === "Cleared All Rounds"
                                                            ? "status-cleared"
                                                            : "status-pending"
                                                    }`}
                                            >
                                                {item.finalStatus === "Selected" && <FaTrophy />}
                                                {item.finalStatus === "Cleared All Rounds" && (
                                                    <FaCheckCircle />
                                                )}
                                                {item.finalStatus === "In Progress" && <FaClock />}
                                                {item.finalStatus}
                                            </span>
                                        </div>
                                        <span className="student-progress-position">
                                            {item.position}
                                            {item.role && ` — ${item.role}`}
                                        </span>
                                    </div>

                                    {item.interviewDate && (
                                        <div className="student-progress-date">
                                            <FaCalendarAlt />
                                            <span>{item.interviewDate}</span>
                                        </div>
                                    )}

                                    {/* Rounds */}
                                    <div className="student-rounds-row">
                                        {item.totalRounds &&
                                            Array.from({ length: item.totalRounds }, (_, i) => {
                                                const roundKey = `round${i + 1}`;
                                                const status = item.rounds[roundKey];
                                                let statusClass = "pending";
                                                let icon = <FaClock />;
                                                if (status === true) {
                                                    statusClass = "selected";
                                                    icon = <FaCheckCircle />;
                                                } else if (status === false) {
                                                    statusClass = "rejected";
                                                    icon = <FaTimesCircle />;
                                                }
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`student-round-badge ${statusClass}`}
                                                    >
                                                        {icon}
                                                        <span>R{i + 1}</span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="student-empty-state">
                            <FaGraduationCap className="student-empty-icon" />
                            <p>No placement data available yet.</p>
                            <span>
                                Your placement progress will appear here once companies visit.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentDashboard;
