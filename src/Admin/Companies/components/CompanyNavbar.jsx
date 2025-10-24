import React from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaSignOutAlt,
  FaPlus,
  FaUsers,
  FaSearch
} from "react-icons/fa";

const CompanyNavbar = ({
  year,
  navigate,
  showStudentPopup,
  companySearchQuery,
  setCompanySearchQuery,
  setShowForm,
  setShowRoundInsights,
  handleLogout
}) => {
  return (
    <div className="admin-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="batch-info" onClick={() => navigate("/AdminDashboard")} style={{ cursor: "pointer" }}>
          <FaBuilding className="admin-nav-icon" />
          <span className="batch-label">
            {year ? `Batch ${year - 4}-${year}` : "Loading Batch..."}
          </span>
        </div>
        {!showStudentPopup && (
          <>
            <div className="admin-search-container" style={{ display: 'flex', alignItems: 'center' }}>
              <FaSearch className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search companies"
                value={companySearchQuery}
                onChange={(e) => setCompanySearchQuery(e.target.value)}
                style={{
                  padding: '0.8rem 2.5rem 0.8rem 2rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  width: '210px',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
            <button
              className="admin-nav-button add-company"
              onClick={() => setShowForm(true)}
            >
              <FaPlus className="admin-nav-icon" />
              Add Company
            </button>
          </>
        )}
        <Link
          to="/admin/students"
          className="admin-nav-button manage-students"
        >
          <FaUsers className="admin-nav-icon" />
          Manage Students
        </Link>
        <button
          className="admin-nav-button round-insights"
          onClick={() => setShowRoundInsights(true)}
          title="Round Insights"
        >
          Round Insights
        </button>
      </div>
      <button className="admin-nav-button logout" onClick={handleLogout}>
        <FaSignOutAlt className="admin-nav-icon" />
        Logout
      </button>
    </div>
  );
};

export default CompanyNavbar;
