import React from "react";
import { FaTimes } from "react-icons/fa";

const StudentRoundsModal = ({
  showRoundDetails,
  setShowRoundDetails,
  companies = [],
  selectedOffers = {},
  handleOfferSelection = () => {},
  calculateFinalStatus = () => {},
  studentRoles = {},
  studentView = null,
}) => {
  if (!showRoundDetails || !studentView || !studentView.studentId) {
    return null;
  }

  const getSelectedCompanies = (companiesData = []) => {
    if (!Array.isArray(companiesData)) return [];

    return companiesData
      .filter(companyData => companyData && companyData.companyId)
      .map((companyData) => {
        const company = companies.find(comp => comp && comp._id === companyData.companyId);
        if (!company || !company.name) return null;
        
        const finalResult = companyData.finalResult;
        if (finalResult === true || finalResult === "Selected") {
          return { 
            companyId: companyData.companyId, 
            companyName: company.name 
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="student-rounds-modal">
      <div className="student-rounds-content">
        <div className="student-rounds-header">
          <h2>
            {studentView.studentName || 'N/A'} 
            ({studentView.studentRegisterNumber || 'N/A'}) - Company Rounds
          </h2>

          <div className="student-rounds-header-actions">
            {getSelectedCompanies(studentView.companies).length > 0 && (
              <div className="offer-selection-container">
                <label htmlFor="offer-select" className="offer-label">
                  Selected Offer:
                </label>
                <select
                  id="offer-select"
                  className="offer-dropdown"
                  value={selectedOffers[studentView.studentId] || ""}
                  onChange={(e) => handleOfferSelection(studentView.studentId, e.target.value)}
                >
                  <option value="">Select Company</option>
                  {getSelectedCompanies(studentView.companies).map(({ companyId, companyName }) => (
                    <option key={companyId} value={companyId}>
                      {companyName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              className="student-rounds-close"
              onClick={() => setShowRoundDetails(false)}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="student-rounds-body">
          {Array.isArray(studentView.companies) && studentView.companies.length > 0 ? (
            <div className="company-rounds-grid">
              {studentView.companies.map((companyData) => {
                if (!companyData || !companyData.companyId) return null;
                const company = companies.find((c) => c && c._id === companyData.companyId);
                if (!company) return null;

                const companyId = companyData.companyId;
                const rounds = companyData.rounds || {};
                const finalResult = companyData.finalResult;

                return (
                  <div key={companyId} className="company-round-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 className="company-name">{company.name}</h3>

                      {finalResult === true &&
                        studentRoles[`${studentView.studentId}_${companyId}`] && (
                          <div
                            className="role-badge"
                            style={{
                              backgroundColor: "#10b981",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.875rem",
                              fontWeight: "600",
                            }}
                          >
                            {studentRoles[`${studentView.studentId}_${companyId}`]}
                          </div>
                        )}
                    </div>

                    <div className="rounds-container">
                      {Object.entries(rounds)
                        .filter(([round]) => round !== "role")
                        .map(([round, status]) => (
                          <div key={round} className="round-item">
                            <span className="round-label">
                              {round.replace("round", "Round ")}
                            </span>
                            <span
                              className={`round-status ${
                                status === true
                                  ? "selected"
                                  : status === false
                                  ? "rejected"
                                  : "pending"
                              }`}
                            >
                              {status === true
                                ? "Selected"
                                : status === false
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </div>
                        ))}

                      <div className="round-item final-status">
                        <span className="round-label">Final Status</span>
                        <span
                          className={`round-status ${
                            finalResult === true
                              ? "selected"
                              : finalResult === false
                              ? "rejected"
                              : "pending"
                          }`}
                        >
                          {finalResult === true
                            ? "Selected"
                            : finalResult === false
                            ? "Rejected"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-rounds-message">No company rounds data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRoundsModal;