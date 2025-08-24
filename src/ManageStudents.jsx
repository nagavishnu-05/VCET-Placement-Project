import React, { useState, useEffect } from "react";
import {
  FaFileExcel,
  FaTrash,
  FaBuilding,
  FaSignOutAlt,
  FaUsers,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { disableDevTools } from "./utils/disableDevTools";
import Vcet from "./assets/VCET Logo.jpg";
import CSE from "./assets/CSE LOGO.jpg";
import "./styles/ManageStudents.css";
import * as XLSX from "xlsx";
import axios from "axios";


const ManageStudents = () => {
  useEffect(() => {
    disableDevTools();
  }, []);

  const location = useLocation();
  const batch = location.state?.batch;
  const year =
    localStorage.getItem("selectedYear") || location.state?.batch?.endYear;

  const [showRoundDetails, setShowRoundDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [studentInformationsDetail, setStudentInformationDetail] = useState([]);
  const [studentRounds, setStudentRounds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`
        );
        setStudentInformationDetail(res.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, []);

  console.log(studentInformationsDetail);

  useEffect(() => {
    const loadData = async () => {
      const savedStudents = localStorage.getItem("studentRounds");
      const savedCompanies = localStorage.getItem("companies");

      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/company/ShowAllcompanies?year=${year}`
        );
        setCompanies(res.data);
        console.log("User data fetched:", res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }

      if (savedCompanies) {
        const parsedCompanies = JSON.parse(savedCompanies);
        setCompanies(parsedCompanies);
      }

      if (savedStudents) {
          const parsed = JSON.parse(savedStudents);
      const converted = Array.isArray(parsed)
        ? parsed
        : Object.entries(parsed).map(([studentId, rounds]) => ({ studentId, rounds }));
      setStudentRounds(converted);
          }
    };

    loadData();

    const intervalId = setInterval(loadData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleViewRounds = (student) => {
    const found = studentRounds.find(s => s.studentId === student._id);
    const roundData = found?.rounds || {};

  setSelectedStudent({ ...student, rounds: roundData });
  console.log(selectedStudent);
  
  setShowRoundDetails(true);
  };

  const calculateFinalStatus = (rounds, company) => {
    if (!rounds || !company) return "Rejected";

    const companyRounds = rounds[company._id];
    if (!companyRounds) return "Rejected";

    // Check if all rounds are selected
    const allRoundsSelected = Object.entries(companyRounds).every(
      ([round, status]) => status === "selected"
    );

    return allRoundsSelected ? "Selected" : "Rejected";
  };

  const handleExportStudentRounds = (student) => {
    const found = studentRounds.find(s => s.studentId === student._id);
  const rounds = found?.rounds || {};
    const wb = XLSX.utils.book_new();

    const exportData = [
      {
        "Student ID": student.studentRegisterNumber,
        "Student Name": student.studentName,
      },
    ];

    Object.entries(rounds).forEach(([companyId, roundSet]) => {
      const company = companies.find((c) => c._id === companyId);

      if (company) {
        Object.entries(roundSet).forEach(([round, status]) => {
          exportData[0][
            `${company.name} - ${round.replace("round", "Round ")}`
          ] = status.charAt(0).toUpperCase() + status.slice(1);
        });

        exportData[0][`${company.name} - Final Status`] = calculateFinalStatus(
          { [companyId]: roundSet },
          company
        );
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, `${student.studentName}'s Rounds`);
    XLSX.writeFile(wb, `${student.studentName}_Rounds_Report.xlsx`);
  };

  const handleExportAllStudents = () => {
    // Create workbook and worksheet
    const exportData = studentInformationsDetail.map((student) => {
      const row = {
        "Student ID": student.studentRegisterNumber,
        "Student Name": student.studentName,
      };

      const found = studentRounds.find(s => s.studentId === student._id);
const rounds = found?.rounds || {};

      companies.forEach((company) => {
        const companyRounds = rounds[company._id] || {};
        for (let i = 1; i <= company.rounds; i++) {
          const roundKey = `round${i}`;
          row[`${company.name} - Round ${i}`] =
            (companyRounds[roundKey] || "rejected").charAt(0).toUpperCase() +
            (companyRounds[roundKey] || "rejected").slice(1);
        }

        row[`${company.name} - Final Status`] = calculateFinalStatus(
          { [company._id]: companyRounds },
          company
        );
      });

      return row;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-animation p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-1"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-2"></div>
        <div className="absolute -bottom-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-3"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* College Header */}
        <div className="admin-college-header">
          <img src={Vcet} alt="VCET Logo" className="admin-college-logo" />
          <div className="admin-college-info">
            <h1 className="admin-college-name">
              Velammal College of Engineering and Technology
            </h1>
            <p className="admin-college-subtitle">
              Department of Computer Science and Engineering
            </p>
            <p className="admin-subtitle">Admin Portal</p>
          </div>
          <img src={CSE} alt="CSE Logo" className="admin-college-logo" />
        </div>

        {/* Navigation */}
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

        {/* Content Area */}
        <div className="admin-dashboard-content">
          <div className="manage-students-header">
            <h2 className="manage-students-title">Students</h2>
            <div className="student-header-right">
              <button
                className="student-export-btn"
                onClick={handleExportAllStudents}
              >
                <FaFileExcel /> Export to Excel
              </button>
            </div>
          </div>

          <div className="student-table-container">
            <table className="student-table">
              <thead>
                <tr>
                  <th>S. No.</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...studentInformationsDetail]
                  .sort((a, b) => a.studentRegisterNumber - b.studentRegisterNumber)
                  .map((student, index) => (
                    <tr key={student._id}>
                      <td>{student.studentRegisterNumber}</td>
                      <td>{student.studentName}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="student-view-rounds-btn"
                            onClick={() => handleViewRounds(student)}
                          >
                            View Company Rounds
                          </button>
                          <button
                            className="student-export-btn"
                            onClick={() => handleExportStudentRounds(student)}
                          >
                            <FaFileExcel /> Export Rounds
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>

            </table>
          </div>
        </div>

        {/* Company Rounds Popup */}
        {showRoundDetails && selectedStudent && (
          <div className="student-rounds-modal">
            <div className="student-rounds-content">
              <div className="student-rounds-header">
                <h2>{selectedStudent.name} - Company Rounds</h2>
                <button
                  className="student-rounds-close"
                  onClick={() => setShowRoundDetails(false)}
                >
                  <FaTimes />
                </button>
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
                            <h3 className="company-name">{company.name}</h3>
                            <div className="rounds-container">
                              {Object.entries(rounds).map(([round, status]) => (
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
        )}
      </div>
    </div>
  );
};

export default ManageStudents;