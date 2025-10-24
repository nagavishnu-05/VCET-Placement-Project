import React from "react";
import { FaTimes } from "react-icons/fa";

const StudentRoundsModal = ({
  showRoundDetails,
  setShowRoundDetails,
  selectedStudent,
  companies,
  selectedOffers,
  handleOfferSelection,
  calculateFinalStatus,
  studentRoles
}) => {
  if (!showRoundDetails || !selectedStudent) return null;

  const getSelectedCompanies = (rounds) => {
    if (!rounds) return [];
    
    return Object.entries(rounds)
      .map(([companyId, roundSet]) => {
        const company = companies.find((c) => c._id === companyId);
        if (!company) return null;
        
        const finalStatus = calculateFinalStatus({ [companyId]: roundSet }, company);
        if (finalStatus === "Selected") {
          return { companyId, companyName: company.name };
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="student-rounds-modal">
      <div className="student-rounds-content">
        <div className="student-rounds-header">
          <h2>{selectedStudent.studentName} ({selectedStudent.studentRegisterNumber}) - Company Rounds</h2>
          <div className="student-rounds-header-actions">
            {getSelectedCompanies(selectedStudent.rounds).length > 0 && (
              <div className="offer-selection-container">
                <label htmlFor="offer-select" className="offer-label">Selected Offer:</label>
                <select
                  id="offer-select"
                  className="offer-dropdown"
                  value={selectedOffers[selectedStudent._id] || ""}
                  onChange={(e) => handleOfferSelection(selectedStudent._id, e.target.value)}
                >
                  <option value="">Select Company</option>
                  {getSelectedCompanies(selectedStudent.rounds).map(({ companyId, companyName }) => (
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
          {Object.entries(selectedStudent.rounds).length > 0 ? (
            <div className="company-rounds-grid">
              {Object.entries(selectedStudent.rounds).map(
                ([companyId, rounds]) => {
                  const company = companies.find((c) => c._id === companyId);
                 
                  if (!company) return null;
                  return (
                    <div key={companyId} className="company-round-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="company-name">{company.name}</h3>
                        {calculateFinalStatus(selectedStudent.rounds, company) === "Selected" && studentRoles[`${selectedStudent._id}_${companyId}`] && (
                          <div className="role-badge" style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {studentRoles[`${selectedStudent._id}_${companyId}`]}
                          </div>
                        )}
                      </div>
                      <div className="rounds-container">
                        {Object.entries(rounds).filter(([round]) => round !== 'role').map(([round, status]) => (
                          <div key={round} className="round-item">
                            <span className="round-label">
                              {round.replace("round", "Round ")}
                            </span>
                            <span className={`round-status ${status}`}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </span>
                          </div>
                        ))}
                        <div className="round-item final-status">
                          <span className="round-label">
                            Final Status
                          </span>
                          <span
                            className={`round-status ${calculateFinalStatus(
                              selectedStudent.rounds,
                              company
                            ).toLowerCase()}`}
                          >
                            {calculateFinalStatus(
                              selectedStudent.rounds,
                              company
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <p className="no-rounds-message">
              No company rounds data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRoundsModal;
