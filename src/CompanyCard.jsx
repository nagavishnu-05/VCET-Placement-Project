import React from "react";
import { FaTrash, FaFileExcel } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";

const CompanyCard = ({ company, companyRoundStats, handleCompanyClick, handleDeleteCompany, year }) => {
  const exportRoundDetails = async (e) => {
    e.stopPropagation();
    try {
      const res = await axios.get(`https://vcetplacement.onrender.com/api/shortlist/getshortlist/${year}/${company._id}`);
      const shortlisted = res.data || [];

      // Number of rounds for this company
      const totalRounds = company.rounds || 0;

      // For each round, collect the list of students who were selected in that round
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

      // Header row: S. No., Round 1, Round 2, ...
      const header = ["S. No."];
      for (let i = 1; i <= totalRounds; i++) header.push(`Round ${i}`);

      // Build rows so that each row contains the k-th selected student for each round
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
    }
  };
  return (
    <div
      key={company._id}
      className="admin-company-card"
      onClick={() => handleCompanyClick(company)}
      style={{ cursor: "pointer" }}
    >
      <div className="admin-company-header">
        <h3 className="admin-company-black">{company.name.toUpperCase()}</h3>
        <button
          className="admin-delete-company-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteCompany(company._id);
          }}
          title="Delete Company"
        >
          <FaTrash className="admin-delete-icon-white" />
        </button>
      </div>
      <div className="admin-company-details">
        <p className="admin-company-black">
          <strong>Position:</strong> <span>{company.position}</span>
        </p>
        <p className="admin-company-black">
          <strong>Description:</strong> <span>{company.description}</span>
        </p>
        <p className="admin-company-black">
          <strong>Interview Date:</strong> <span>{company.interviewDate}</span>
        </p>
        <p className="admin-company-black">
          <strong>Rounds:</strong> <span>{company.rounds}</span>
        </p>
        <div className="admin-company-requirements">
          <h4 className="admin-company-black">Requirements</h4>
          <p className="admin-company-black">10th: <span>{company.tenth}%</span></p>
          <p className="admin-company-black">12th: <span>{company.twelfth}%</span></p>
          <p className="admin-company-black">Diploma: <span>{company.diploma}%</span></p>
          <p className="admin-company-black">CGPA: <span>{company.cgpa}</span></p>
          <p className="admin-company-black">History of Arrears: <span>{company.historyofArrears}</span></p>
          <p className="admin-company-black">Current Arrears: <span>{company.currentArrears}</span></p>
        </div>

        {companyRoundStats[company._id] && (
          <div className="admin-company-round-details">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 className="admin-company-black" style={{ margin: 0 }}>Round Details</h4>
              <div>
                <button
                  onClick={exportRoundDetails}
                  title="Export Round Details to Excel"
                  aria-label={`Export ${company.name} round details`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '6px',
                    cursor: 'pointer',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                    <FaFileExcel style={{ width: '18px', height: '18px', color: '#16a34a' }} />
                </button>
              </div>
            </div>
            <div className="admin-round-stats-grid">
              {Object.entries(companyRoundStats[company._id].rounds).map(([roundKey, roundStats]) => (
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
              <span className="admin-total-value">{companyRoundStats[company._id].totalStudents}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;