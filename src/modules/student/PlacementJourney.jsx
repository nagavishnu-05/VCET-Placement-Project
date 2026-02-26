import React, { useEffect, useState } from "react";
import axios from "axios";
import { Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";
import StudentLayout from "./StudentLayout";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendarAlt,
    FaTrophy,
    FaChartPie,
    FaBuilding,
    FaTimes,
    FaChartBar,
} from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_BASE = "http://localhost:5000/api/student-portal";

const PlacementJourney = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStats, setShowStats] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("studentToken");
            if (!token) return;
            try {
                const res = await axios.get(`${API_BASE}/progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProgress(res.data);
            } catch (err) {
                console.error("Journey fetch error:", err);
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
                    <p>Loading your journey...</p>
                </div>
            </StudentLayout>
        );
    }

    const summary = progress?.summary || {};
    const companies = progress?.progress || [];

    // Helper to determine definitive status (Selected/Rejected)
    const getStatusInfo = (item) => {
        if (item.finalStatus === "Selected" || item.finalStatus === "Cleared All Rounds") {
            return { text: "Selected", class: "status-selected", color: "#059669" };
        }

        const rounds = item.rounds || {};
        const roundValues = Object.values(rounds);
        const hasRejection = roundValues.some((v) => v === false);
        const allPassed = roundValues.length > 0 && roundValues.every((v) => v === true);

        if (hasRejection) {
            return { text: "Rejected", class: "status-rejected", color: "#dc2626" };
        } else if (allPassed) {
            return { text: "Selected", class: "status-selected", color: "#059669" };
        } else {
            // Default to Rejected if not explicitly selected/passed (per user request to avoid In Progress)
            return { text: "Rejected", class: "status-rejected", color: "#dc2626" };
        }
    };

    // Doughnut chart data
    const doughnutData = {
        labels: ["Selected", "Cleared All Rounds", "Rejected"],
        datasets: [
            {
                data: [summary.selectedCount || 0, summary.clearedCount || 0, summary.pendingCount || 0],
                backgroundColor: ["#34d399", "#a78bfa", "#f87171"],
                borderColor: ["#059669", "#7c3aed", "#dc2626"],
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: { color: "#334155", font: { size: 13, weight: "600" }, padding: 20 },
            },
        },
        cutout: "65%",
    };

    // Bar chart — rounds cleared per company
    const barData = {
        labels: companies.map((c) => c.companyName?.substring(0, 15) || "—"),
        datasets: [
            {
                label: "Rounds Cleared",
                data: companies.map((c) => {
                    const rounds = c.rounds || {};
                    return Object.values(rounds).filter((v) => v === true).length;
                }),
                backgroundColor: "rgba(96, 165, 250, 0.7)",
                borderColor: "#3b82f6",
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: "Total Rounds",
                data: companies.map((c) => c.totalRounds || 0),
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: "#334155", font: { size: 12 } },
            },
        },
        scales: {
            x: {
                ticks: { color: "#64748b", font: { size: 11 } },
                grid: { color: "rgba(0,0,0,0.06)" },
            },
            y: {
                ticks: { color: "#64748b", stepSize: 1 },
                grid: { color: "rgba(0,0,0,0.06)" },
            },
        },
    };

    return (
        <StudentLayout>
            {/* Final Selected Banner */}
            {progress?.finalSelectedCompany && (
                <div className="sj-banner">
                    <FaTrophy className="sj-banner-icon" />
                    <div className="sj-banner-content">
                        <span className="sj-congrats-badge">Congratulations</span>
                        <h3>Placed at {progress.finalSelectedCompany.companyName}</h3>
                        <p>{progress.finalSelectedCompany.position} — {progress.finalSelectedCompany.role}</p>
                    </div>
                </div>
            )}

            {/* Charts Row moved to Popup */}

            {/* Companies List */}
            <div className="sj-companies">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h3 className="sj-companies-title" style={{ margin: 0, fontSize: '1.5rem' }}>Companies Attended ({companies.length})</h3>
                    <button className="sj-stats-btn" onClick={() => setShowStats(true)}>
                        <FaChartBar /> View Performance Stats
                    </button>
                </div>
                {companies.length > 0 ? (
                    <div className="sj-companies-grid">
                        {companies.map((item, idx) => {
                            const statusInfo = getStatusInfo(item);
                            return (
                                <div
                                    key={idx}
                                    className={`sj-company-card ${item.isFinalSelected ? "final-selected" : ""}`}
                                    onClick={() => setSelectedCompany(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="sj-company-header-row">
                                        <h4 className="sj-company-name">{item.companyName}</h4>
                                    </div>
                                    <span className="sj-company-pos">
                                        {item.position}
                                        {item.role && ` — ${item.role}`}
                                    </span>

                                    {item.interviewDate && (
                                        <div className="sj-company-date">
                                            <FaCalendarAlt /> {item.interviewDate}
                                        </div>
                                    )}

                                    <div className="sj-card-status-text" style={{ color: statusInfo.color }}>
                                        {statusInfo.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="sj-empty-state">
                        <FaBuilding className="sj-empty-icon" />
                        <p>No placement activity yet.</p>
                    </div>
                )}
            </div>

            {/* Stats Popup Modal */}
            {showStats && (
                <div className="sj-stats-overlay" onClick={() => setShowStats(false)}>
                    <div className="sj-stats-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sj-stats-modal-header">
                            <h3>📊 Placement Statistics</h3>
                            <button className="sj-stats-close" onClick={() => setShowStats(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="sj-modal-body">
                            <div className="sj-stats-grid">
                                <div className="sj-stat-item blue">
                                    <span className="sj-stat-num">{summary.totalCompanies || 0}</span>
                                    <span className="sj-stat-label">Total Companies</span>
                                </div>
                                <div className="sj-stat-item green">
                                    <span className="sj-stat-num">{summary.selectedCount || 0}</span>
                                    <span className="sj-stat-label">Selected</span>
                                </div>
                                <div className="sj-stat-item purple">
                                    <span className="sj-stat-num">{summary.clearedCount || 0}</span>
                                    <span className="sj-stat-label">Cleared All</span>
                                </div>
                                <div className="sj-stat-item yellow">
                                    <span className="sj-stat-num">{summary.pendingCount || 0}</span>
                                    <span className="sj-stat-label">Rejected</span>
                                </div>
                            </div>

                            <div className="sj-charts-row" style={{ marginTop: '2rem' }}>
                                <div className="sj-chart-card">
                                    <h3><FaChartPie /> Placement Summary</h3>
                                    <div className="sj-chart-wrapper">
                                        {summary.totalCompanies > 0 ? (
                                            <Doughnut data={doughnutData} options={doughnutOptions} />
                                        ) : (
                                            <p className="sj-empty">No data yet</p>
                                        )}
                                    </div>
                                </div>

                                <div className="sj-chart-card">
                                    <h3><FaBuilding /> Rounds Progress</h3>
                                    <div className="sj-chart-wrapper bar">
                                        {companies.length > 0 ? (
                                            <Bar data={barData} options={barOptions} />
                                        ) : (
                                            <p className="sj-empty">No data yet</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Rounds Detail Modal */}
            {selectedCompany && (
                <div className="sj-stats-overlay" onClick={() => setSelectedCompany(null)}>
                    <div className="sj-rounds-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="sj-stats-modal-header">
                            <div>
                                <h3 style={{ fontSize: '1.4rem' }}>{selectedCompany.companyName}</h3>
                                <p style={{ color: '#93c5fd', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                                    {selectedCompany.position} {selectedCompany.role && ` — ${selectedCompany.role}`}
                                </p>
                            </div>
                            <button className="sj-stats-close" onClick={() => setSelectedCompany(null)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="sj-modal-body">
                            <div className="sj-detail-info">
                                <div className="sj-detail-item">
                                    <span className="sj-detail-label">Interview Date</span>
                                    <span className="sj-detail-value">{selectedCompany.interviewDate || "Not Scheduled"}</span>
                                </div>
                                <div className="sj-detail-item">
                                    <span className="sj-detail-label">Current Status</span>
                                    <span className={`sj-status-badge ${getStatusInfo(selectedCompany).class}`}>
                                        {getStatusInfo(selectedCompany).text}
                                    </span>
                                </div>
                            </div>

                            <div className="sj-rounds-section" style={{ marginTop: '1rem' }}>
                                <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCheckCircle style={{ color: '#10b981' }} /> Round-wise Progress
                                </h4>
                                <div className="sj-rounds-detailed-grid">
                                    {selectedCompany.totalRounds &&
                                        Array.from({ length: selectedCompany.totalRounds }, (_, i) => {
                                            const roundKey = `round${i + 1}`;
                                            const status = selectedCompany.rounds[roundKey];
                                            let cls = "pending";
                                            let label = "Pending";
                                            let icon = <FaClock />;

                                            if (status === true) {
                                                cls = "selected";
                                                label = "Cleared";
                                                icon = <FaCheckCircle />;
                                            } else if (status === false) {
                                                cls = "rejected";
                                                label = "Rejected";
                                                icon = <FaTimesCircle />;
                                            }

                                            return (
                                                <div key={i} className={`sj-detailed-round-card ${cls}`}>
                                                    <div className="sj-round-number">Round {i + 1}</div>
                                                    <div className={`sj-round-status-badge ${cls}`}>
                                                        {icon} {label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StudentLayout>
    );
};

export default PlacementJourney;
