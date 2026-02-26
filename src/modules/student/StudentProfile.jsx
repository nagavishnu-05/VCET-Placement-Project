import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentLayout from "./StudentLayout";
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaIdCard, FaBirthdayCake, FaBookOpen, FaCodeBranch } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api/student-portal";

const StudentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("studentToken");
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE}/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(res.data);
            } catch (err) {
                console.error("Profile fetch error:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem("studentToken");
                    window.location.href = "/";
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <StudentLayout>
                <div className="student-loading">
                    <div className="student-spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </StudentLayout>
        );
    }

    const formatDOB = (dob) => {
        if (!dob) return "N/A";
        const d = new Date(dob);
        return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    };

    return (
        <StudentLayout>
            {/* Hero Header */}
            <div className="sp-hero">
                <div className="sp-hero-avatar">
                    {profile?.studentName?.charAt(0).toUpperCase()}
                </div>
                <div className="sp-hero-info">
                    <h1 className="sp-hero-name">{profile?.studentName}</h1>
                    <p className="sp-hero-subtitle">
                        {profile?.studentDegree} — {profile?.studentBranch}
                    </p>
                    <span className="sp-hero-reg">Reg. No: {profile?.studentRegisterNumber}</span>
                </div>
            </div>

            {/* Sections */}
            <div className="sp-sections">
                {/* Personal Information */}
                <div className="sp-section">
                    <h3 className="sp-section-title">
                        <FaUser className="sp-section-icon" /> Personal Information
                    </h3>
                    <div className="sp-section-grid">
                        <div className="sp-field">
                            <FaIdCard className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Register Number</span>
                                <span className="sp-field-value">{profile?.studentRegisterNumber}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaUser className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Full Name</span>
                                <span className="sp-field-value">{profile?.studentName}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaBirthdayCake className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Date of Birth</span>
                                <span className="sp-field-value">{formatDOB(profile?.studentDOB)}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaUser className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Gender</span>
                                <span className="sp-field-value">{profile?.studentGender || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Information */}
                <div className="sp-section">
                    <h3 className="sp-section-title">
                        <FaGraduationCap className="sp-section-icon" /> Academic Information
                    </h3>
                    <div className="sp-section-grid">
                        <div className="sp-field">
                            <FaBookOpen className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Degree</span>
                                <span className="sp-field-value">{profile?.studentDegree}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaCodeBranch className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Branch</span>
                                <span className="sp-field-value">{profile?.studentBranch}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaGraduationCap className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Graduation Year</span>
                                <span className="sp-field-value">{profile?.studentGraduationYear}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaGraduationCap className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">College</span>
                                <span className="sp-field-value">{profile?.studentCollegeName || "VCET"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Performance */}
                <div className="sp-section">
                    <h3 className="sp-section-title">
                        <FaBookOpen className="sp-section-icon" /> Academic Performance
                    </h3>
                    <div className="sp-section-grid sp-perf-grid">
                        <div className="sp-perf-card">
                            <span className="sp-perf-label">10th %</span>
                            <span className="sp-perf-value">{profile?.studentTenthPercentage}%</span>
                        </div>
                        <div className="sp-perf-card">
                            <span className="sp-perf-label">12th %</span>
                            <span className="sp-perf-value">{profile?.studentTwelthPercentage || "N/A"}</span>
                        </div>
                        <div className="sp-perf-card">
                            <span className="sp-perf-label">Diploma</span>
                            <span className="sp-perf-value">{profile?.studentDiploma || "N/A"}</span>
                        </div>
                        <div className="sp-perf-card highlight">
                            <span className="sp-perf-label">UG CGPA</span>
                            <span className="sp-perf-value cgpa">{profile?.studentUGCGPA}</span>
                        </div>
                        <div className="sp-perf-card">
                            <span className="sp-perf-label">Current Arrears</span>
                            <span className="sp-perf-value">{profile?.studentCurrentArrears ?? 0}</span>
                        </div>
                        <div className="sp-perf-card">
                            <span className="sp-perf-label">History of Arrears</span>
                            <span className="sp-perf-value">{profile?.studentHistoryOfArrears ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="sp-section">
                    <h3 className="sp-section-title">
                        <FaEnvelope className="sp-section-icon" /> Contact Details
                    </h3>
                    <div className="sp-contact-grid">
                        <div className="sp-field sp-field-wide">
                            <FaEnvelope className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Email</span>
                                <span className="sp-field-value">{profile?.studentEmailID}</span>
                            </div>
                        </div>
                        <div className="sp-field">
                            <FaPhone className="sp-field-icon" />
                            <div>
                                <span className="sp-field-label">Mobile</span>
                                <span className="sp-field-value">{profile?.studentMobileNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentProfile;
