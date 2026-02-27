import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentLayout from "./StudentLayout";
import {
    FaBuilding,
    FaUsers,
    FaBriefcase,
    FaCalendarAlt,
    FaUserGraduate,
    FaTimes,
} from "react-icons/fa";

const API_BASE = "https://vcetplacement.onrender.com/api/student-portal";

const PlacementInsights = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("studentToken");
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE}/all-companies`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCompanies(res.data);
            } catch (err) {
                console.error("Insights fetch error:", err);
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
                    <p>Loading placement insights...</p>
                </div>
            </StudentLayout>
        );
    }

    const totalPlaced = companies.reduce((sum, c) => sum + c.placedCount, 0);

    return (
        <StudentLayout>
            {/* Summary Bar */}
            <div className="pi-summary-bar">
                <div className="pi-summary-item blue">
                    <FaBuilding className="pi-summary-icon" />
                    <div>
                        <span className="pi-summary-num">{companies.length}</span>
                        <span className="pi-summary-label">Companies Visited</span>
                    </div>
                </div>
                <div className="pi-summary-item green">
                    <FaUserGraduate className="pi-summary-icon green" />
                    <div>
                        <span className="pi-summary-num">{totalPlaced}</span>
                        <span className="pi-summary-label">Total Placements</span>
                    </div>
                </div>
            </div>

            {/* 3-column Companies Grid */}
            <div className="pi-companies-grid">
                {companies.map((company) => (
                    <div
                        key={company._id}
                        className="pi-company-card"
                        onClick={() => setSelectedCompany(company)}
                    >
                        <h4 className="pi-company-name">{company.name}</h4>
                        <span className="pi-company-position">{company.position}</span>

                        {company.interviewDate && (
                            <div className="pi-company-meta-row">
                                <FaCalendarAlt /> {company.interviewDate}
                            </div>
                        )}

                        <div className="pi-placed-badge">
                            <FaUsers /> {company.placedCount} placed
                        </div>
                    </div>
                ))}
            </div>

            {/* Popup Modal */}
            {selectedCompany && (
                <div
                    className="pi-modal-overlay"
                    onClick={() => setSelectedCompany(null)}
                >
                    <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pi-modal-header">
                            <div>
                                <h3>{selectedCompany.name}</h3>
                                <p>
                                    {selectedCompany.position}
                                    {selectedCompany.interviewDate &&
                                        ` • ${selectedCompany.interviewDate}`}
                                </p>
                            </div>
                            <button
                                className="pi-modal-close"
                                onClick={() => setSelectedCompany(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {selectedCompany.placedStudents.length > 0 ? (
                            <div className="pi-students-list">
                                {selectedCompany.placedStudents.map((student, idx) => (
                                    <div key={idx} className="pi-student-item">
                                        <div className="pi-student-info">
                                            <span className="pi-student-name">{student.name}</span>
                                            <span className="pi-student-reg">
                                                {student.registerNumber}
                                            </span>
                                        </div>
                                        <span className="pi-student-branch">{student.branch}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="pi-no-students">
                                No students placed in this company yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </StudentLayout>
    );
};

export default PlacementInsights;
