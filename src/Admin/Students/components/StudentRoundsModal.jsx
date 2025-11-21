import React, { useState, useEffect } from "react";
import { FaTimes, FaPencilAlt } from "react-icons/fa";

const StudentRoundsModal = ({
  showRoundDetails,
  setShowRoundDetails,
  companies = [],
  selectedOffers = {},
  handleOfferSelection = () => {},
  studentRoles = {},
  studentView = null,
}) => {
  // Local state for toggling between Text View and Dropdown
  const [isEditing, setIsEditing] = useState(false);

  // --- HELPER: Identify companies where the student is 'Selected' ---
  const getSelectedCompanies = (companiesData = []) => {
    if (!Array.isArray(companiesData)) return [];

    return companiesData
      .filter((companyData) => companyData && companyData.companyId)
      .map((companyData) => {
        const company = companies.find(
          (comp) => comp && comp._id === companyData.companyId
        );
        if (!company || !company.name) return null;

        // Check if the Final Status is strictly true or "Selected"
        const finalResult = companyData.finalResult;
        if (finalResult === true || finalResult === "Selected") {
          return {
            companyId: companyData.companyId,
            companyName: company.name,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // --- EFFECT: Auto-Update DB/Dropdown when Rounds Update ---
  useEffect(() => {
    // Ensure the modal is open and valid student data exists
    if (showRoundDetails && studentView && studentView.studentId) {
      
      // 1. Calculate eligible companies based on the LATEST studentView data
      const eligibleCompanies = getSelectedCompanies(studentView.companies);

      // 2. Logic: If there is EXACTLY ONE eligible company
      if (eligibleCompanies.length === 1) {
        const singleCompanyId = eligibleCompanies[0].companyId;
        
        // 3. Get the currently saved offer from the DB/State
        const currentSavedOffer = selectedOffers[studentView.studentId];

        // 4. If the saved offer is NOT this company, update it immediately.
        if (currentSavedOffer !== singleCompanyId) {
          console.log(
            `Final status updated to Selected for ${eligibleCompanies[0].companyName}. Auto-saving to DB.`
          );
          handleOfferSelection(studentView.studentId, singleCompanyId);
        }
      }
      
      // Always ensure we are in view mode when data refreshes
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoundDetails, studentView, selectedOffers]); 
  // ^ Dependency on 'studentView' ensures this runs immediately when rounds/final status change.

  if (!showRoundDetails || !studentView || !studentView.studentId) {
    return null;
  }

  // --- DISPLAY LOGIC ---
  const currentSelectedCompanyId = selectedOffers[studentView.studentId];
  const currentSelectedCompany = companies.find(
    (c) => c._id === currentSelectedCompanyId
  );
  const displayOfferName = currentSelectedCompany
    ? currentSelectedCompany.name
    : "None Selected";

  return (
    <div className="student-rounds-modal">
      <div className="student-rounds-content">
        <div className="student-rounds-header">
          <h2>
            {studentView.studentName || "N/A"}{" "}
            ({studentView.studentRegisterNumber || "N/A"}) - Company Rounds
          </h2>

          <div className="student-rounds-header-actions">
            {/* Show Selection Box if student is selected in at least 1 company */}
            {getSelectedCompanies(studentView.companies).length > 0 && (
              <div
                className="offer-selection-container"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <label
                  htmlFor="offer-select"
                  className="offer-label"
                  style={{ marginBottom: 0 }}
                >
                  Selected Offer:
                </label>

                {isEditing ? (
                  /* --- EDIT MODE --- */
                  <select
                    id="offer-select"
                    className="offer-dropdown"
                    value={selectedOffers[studentView.studentId] || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      handleOfferSelection(studentView.studentId, newValue);
                      setIsEditing(false);
                    }}
                    autoFocus
                    onBlur={() => setIsEditing(false)}
                    style={{ padding: "5px", borderRadius: "4px" }}
                  >
                    <option value="">Select Company</option>
                    {getSelectedCompanies(studentView.companies).map(
                      ({ companyId, companyName }) => (
                        <option key={companyId} value={companyId}>
                          {companyName}
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  /* --- VIEW MODE --- */
                  <>
                    <span
                      style={{
                        fontWeight: "bold",
                        marginRight: "5px",
                        color: "#374151",
                      }}
                    >
                      {displayOfferName}
                    </span>
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: "transparent",
                        color: "#3b82f6",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                      title="Edit Offer"
                    >
                      <FaPencilAlt />
                    </button>
                  </>
                )}
              </div>
            )}

            <button
              className="student-rounds-close"
              onClick={() => setShowRoundDetails(false)}
              style={{ marginLeft: "15px" }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="student-rounds-body">
          {Array.isArray(studentView.companies) &&
          studentView.companies.length > 0 ? (
            <div className="company-rounds-grid">
              {studentView.companies.map((companyData) => {
                if (!companyData || !companyData.companyId) return null;
                const company = companies.find(
                  (c) => c && c._id === companyData.companyId
                );
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
                        studentRoles[
                          `${studentView.studentId}_${companyId}`
                        ] && (
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
                            {
                              studentRoles[
                                `${studentView.studentId}_${companyId}`
                              ]
                            }
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