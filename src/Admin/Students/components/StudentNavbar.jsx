import React from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaSignOutAlt,
  FaUsers,
  FaSearch,
  FaFileExcel
} from "react-icons/fa";

const StudentNavbar = ({
  batch,
  searchQuery,
  setSearchQuery,
  handleExportAllStudents,
  handleLogout
}) => {
  return (
    <div className="admin-navbar">
      <div className="batch-info">
        <FaUsers className="admin-nav-icon" />
        <span className="batch-label">
          {batch
            ? `Batch ${batch.startYear}-${batch.endYear}`
            : "Students Management"}
        </span>
      </div>
      <Link
        to="/admin/companies"
        className="admin-nav-button manage-companies"
      >
        <FaBuilding className="admin-nav-icon" />
        Manage Companies
      </Link>
      <button className="admin-nav-button logout" onClick={handleLogout}>
        <FaSignOutAlt className="admin-nav-icon" />
        Logout
      </button>
    </div>
  );
};

export default StudentNavbar;
