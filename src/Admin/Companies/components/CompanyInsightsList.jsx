import React, { useState } from "react";
import { FaEye, FaFileExcel } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import Loader from "../../../components/Loader";

const CompanyInsightsList = ({
  companies,
  companyRoundStats,
  setSelectedAnalyticsCompany,
  setShowCompanyAnalytics,
  year
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleExportRoundDetails = async (company) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`https://vcetplacement.onrender.com/api/shortlist/getshortlist/${year}/${company._id}`);
      const shortlisted = res.data || [];
      const totalRounds = company.rounds || 0;

      const roundsStudentNames = [];
      for (let i = 1; i <= totalRounds; i++) {
        const key = `round${i}`;
        const names = (shortlisted
          .filter((entry) => entry.rounds?.[key] === true || entry.rounds?.[key] === "selected" || entry.rounds?.[key] === "Accepted" || entry.rounds?.[key] === "accepted")
          .map((entry) => {
            const student = entry.studentId || {};
            return student.studentName || student.studentRegisterNumber || "Unknown";
          })
        );
        roundsStudentNames.push(names);
      }

      const header = ["S. No."];
      for (let i = 1; i <= totalRounds; i++) header.push(`Round ${i}`);

      const maxLen = roundsStudentNames.reduce((m, arr) => Math.max(m, arr.length), 0);
      const rows = [];
      for (let r = 0; r < maxLen; r++) {
        const row = [r + 1];
        for (let c = 0; c < roundsStudentNames.length; c++) {
          row.push(roundsStudentNames[c][r] || "");
        }
        rows.push(row);
      }

      const aoa = [header, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Round Details");
      const fileName = `${company.name} - Round Details.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Failed to export round details:", err);
      alert("Failed to export round details. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-companies-grid">
      {companies.map((company) => {
        const stats = companyRoundStats[company._id] || { rounds: {}, totalStudents: 0 };
        return (
          <div key={company._id} className="admin-company-card" style={{ cursor: 'default' }}>
            <div className="admin-company-header">
              <h3 className="admin-company-black">{company.name.toUpperCase()}</h3>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnalyticsCompany(company);
                    setShowCompanyAnalytics(true);
                  }}
                  title="View Company Analytics"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
                >
                  <FaEye style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportRoundDetails(company);
                  }}
                  title="Export Round Details to Excel"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}
                >
                  <FaFileExcel style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                </button>
              </div>
            </div>
            <div className="admin-company-details">
              <p className="admin-company-black"><strong>Position:</strong> <span>{company.position}</span></p>
              <p className="admin-company-black"><strong>Interview Date:</strong> <span>{company.interviewDate}</span></p>
              <div className="admin-round-stats-grid">
                {Object.entries(stats.rounds).map(([roundKey, roundStats]) => (
                  <div key={roundKey} className="admin-round-stat-item">
                    <div className="admin-round-stat-header">
                      <span className="admin-round-name">{roundKey.charAt(0).toUpperCase() + roundKey.slice(1)}</span>
                    </div>
                    <div className="admin-round-stat-numbers">
                      <div className="admin-stat-item selected">
                        <span className="admin-stat-label">Selected:</span>
                        <span className="admin-stat-value">{roundStats.selected}</span>
                      </div>
                      <div className="admin-stat-item rejected">
                        <span className="admin-stat-label">Rejected:</span>
                        <span className="admin-stat-value">{roundStats.rejected}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-total-students">
                <span className="admin-total-label">Total Students:</span>
                <span className="admin-total-value">{stats.totalStudents}</span>
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && <Loader message="Exporting data..." />}
    </div>
  );
};

export default CompanyInsightsList;
