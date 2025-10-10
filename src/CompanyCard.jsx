import React from "react";
import { FaTrash } from "react-icons/fa";

const CompanyCard = ({ company, handleCompanyClick, handleDeleteCompany }) => {
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
        {/* rounds info and per-company round export moved to centralized Round Insights modal */}
        <div className="admin-company-requirements">
          <h4 className="admin-company-black">Requirements</h4>
          <p className="admin-company-black">10th: <span>{company.tenth}%</span></p>
          <p className="admin-company-black">12th: <span>{company.twelfth}%</span></p>
          <p className="admin-company-black">Diploma: <span>{company.diploma}%</span></p>
          <p className="admin-company-black">CGPA: <span>{company.cgpa}</span></p>
          <p className="admin-company-black">History of Arrears: <span>{company.historyofArrears}</span></p>
          <p className="admin-company-black">Current Arrears: <span>{company.currentArrears}</span></p>
        </div>

        {/* Round details intentionally removed from company card */}
      </div>
    </div>
  );
};

export default CompanyCard;