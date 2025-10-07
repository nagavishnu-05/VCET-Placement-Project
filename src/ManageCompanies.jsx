import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  FaBuilding,
  FaSignOutAlt,
  FaPlus,
  FaTimes,
  FaUsers,
  FaTrash,
  FaArrowLeft,
  FaFileExcel,
  FaSearch,
} from "react-icons/fa";
import { Link, Navigate, useLocation } from "react-router-dom";
import Vcet from "./assets/VCET Logo.jpg";
import CSE from "./assets/CSE LOGO.jpg";
import "./styles/ManageCompanies.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompanyCard from "./CompanyCard";

const ManageCompanies = () => {
  // useEffect(() => {
  //   disableDevTools();
  // }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const batch =
    localStorage.getItem("seleteBatch") || location.state?.batch?.startYear;
  const year =
    localStorage.getItem("selectedYear") || location.state?.batch?.endYear;
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log(year);
  console.log(batch);
  const handleLogout = () => {
    window.location.href = "/";
  };
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const [showStudentSelect, setShowStudentSelect] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [formData, setFormData] = useState(null);
  const [companyRoundStats, setCompanyRoundStats] = useState({});
  // Per-card expanded state will be managed inside each CompanyCard to avoid
  // shared state issues where toggling one card could affect others.

  // Function to fetch round statistics for a company
  const fetchCompanyRoundStats = useCallback(async (companyId) => {
    try {
      const res = await axios.get(
        `https://vcetplacement.onrender.com/api/shortlist/getshortlist/${year}/${companyId}`
      );
      
      const shortlistedData = res.data;
      const stats = {
        totalStudents: shortlistedData.length,
        rounds: {}
      };

      // Calculate stats for each round
      for (let i = 1; i <= companies.find(c => c._id === companyId)?.rounds || 0; i++) {
        const roundKey = `round${i}`;
        const selectedCount = shortlistedData.filter(entry => 
          entry.rounds?.[roundKey] === true
        ).length;
        const rejectedCount = shortlistedData.filter(entry => 
          entry.rounds?.[roundKey] === false
        ).length;
        
        stats.rounds[roundKey] = {
          selected: selectedCount,
          rejected: rejectedCount,
          total: shortlistedData.length
        };
      }

      return stats;
    } catch (error) {
      console.error("Error fetching round stats:", error);
      return {
        totalStudents: 0,
        rounds: {}
      };
    }
  }, [year, companies]);

  // Function to fetch round stats for all companies
  const fetchAllCompanyRoundStats = useCallback(async () => {
    const statsPromises = companies.map(async (company) => {
      const stats = await fetchCompanyRoundStats(company._id);
      return { companyId: company._id, stats };
    });
    
    const allStats = await Promise.all(statsPromises);
    const statsMap = {};
    allStats.forEach(({ companyId, stats }) => {
      statsMap[companyId] = stats;
    });
    
    setCompanyRoundStats(statsMap);
  }, [companies, fetchCompanyRoundStats]);

  // ...existing code...

  // const addingSortlist = () => {
  //   axios.post(`http://localhost:5000/api/shortlist/addshortlist`, {
  //     year: year,
  //     selectedStudents: selectedStudents,
  //     companyId : company  
  //   })
  //   .then((res) => {
  //     console.log("Shortlist added:", res.data);
  //   })
  //   .catch((err) => {
  //     console.error("Error adding shortlist:", err);
  //   });
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newCompany = {
      name: form[0].value,
      description: form[1].value,
      position: form[2].value,
      tenth: form[3].value,
      twelfth: form[4].value,
      diploma: form[5].value,
      cgpa: form[6].value,
      historyofArrears: form[7].value,
      currentArrears: form[8].value,
      interviewDate: form[9].value,
      rounds: form[10].value,
    };
    setFormData(newCompany);
   
    try {
      const studentsRes = await axios.get(
        `https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`
      );
      const eligible = studentsRes.data.filter(student => {
            const tenth = parseFloat(student.studentTenthPercentage) || 0;
            const twelfth = parseFloat(student.studentTwelthPercentage);
            const diploma = parseFloat(student.studentDiploma);
            const cgpa = parseFloat(student.studentUGCGPA) || 0;
            const arrear = parseFloat(student.studentCurrentArrears) || 0 ;
            const hoa = parseFloat(student.studentHistoryOfArrears) || 0;

            const twelfthValid = !isNaN(twelfth) && twelfth >= parseFloat(newCompany.twelfth);
            const diplomaValid = !isNaN(diploma) && diploma >= parseFloat(newCompany.diploma);
            console.log(student.studentName, arrear, newCompany.currentArrears, arrear <= newCompany.currentArrears);

            return (
              tenth >= parseFloat(newCompany.tenth) &&
              (twelfthValid || diplomaValid) &&
              cgpa >= parseFloat(newCompany.cgpa) &&
              arrear <= parseFloat(newCompany.currentArrears) &&
              hoa <= parseFloat(newCompany.historyofArrears)
            );
          });
      setEligibleStudents(eligible);
      setShowStudentSelect(true);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/company/ShowAllcompanies?year=${year}`
        );
        setCompanies(res.data);
        console.log("User data fetched:", res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [reloadTrigger, year]);

  // Fetch round stats when companies change
  useEffect(() => {
    if (companies.length > 0) {
      fetchAllCompanyRoundStats();
    }
  }, [companies, year, fetchAllCompanyRoundStats]);

  const handleDeleteCompany = async(companyId) => {
    try {
      await axios.delete(`https://vcetplacement.onrender.com/api/company/deletecompany/${companyId}?year=${year}`);
      setReloadTrigger((prev) => !prev);
    } catch (error) {
      console.error("Failed to delete company:", error);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [studentInformationsDetail, setStudentInformationDetail] = useState([]);

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
  }, [year]);

  console.log(studentInformationsDetail);

  useEffect(() => {
    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  const calculateFinalStatus = (roundData, totalRounds) => {
    if (!roundData) return "rejected";

    for (let i = 1; i <= totalRounds; i++) {
      if (roundData[`round${i}`] !== "selected") {
        return "rejected";
      }
    }
    return "selected";
  };
  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);

    try {
      const year =
        localStorage.getItem("selectedYear") ||
        location.state?.batch?.endYear ||
        new Date().getFullYear();

      const res = await axios.get(
        `https://vcetplacement.onrender.com/api/shortlist/getshortlist/${year}/${company._id}`
      );

      const shortlistedData = res.data;

      const newStudents = shortlistedData.map((entry) => {
        const student = entry.studentId;
        const roundsData = {};

        for (let i = 1; i <= company.rounds; i++) {
          const key = `round${i}`;
          roundsData[key] =
            entry.rounds?.[key] === true ? "selected" : "rejected";
        }

        return {
          id: student._id,
          regNo: student.studentRegisterNumber,
          name: student.studentName,
          rounds: {
            [company._id]: roundsData,
          },
        };
      });

      // 🔹 Just replace the students list for that company
      setStudents(newStudents);

      setShowStudentPopup(true);
    } catch (error) {
      console.error("Error handling company click:", error);
      toast("Failed to load shortlisted students.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        type: "error",
      });
    }
  };
  const handleRoundStatusChange = (studentId, round, currentStatus) => {
    setStudents((prevStudents) => {
      return prevStudents.map((student) => {
        if (student.id === studentId) {
          const currentRounds = student.rounds[selectedCompany._id] || {};
          const roundNum = parseInt(round.replace("round", ""));
          const statusOrder = ["rejected", "selected"];
          const nextStatus =
            statusOrder[(statusOrder.indexOf(currentStatus) + 1) % 2];

          const updatedRounds = { ...currentRounds, [round]: nextStatus };
          if (nextStatus === "rejected") {
            for (let i = roundNum + 1; i <= selectedCompany.rounds; i++) {
              updatedRounds[`round${i}`] = "rejected";
            }
          }
          if (
            round === `round${selectedCompany.rounds}` &&
            nextStatus === "selected"
          ) {
            for (let i = 1; i <= selectedCompany.rounds; i++) {
              updatedRounds[`round${i}`] = "selected";
            }
          }
          return {
            ...student,
            rounds: {
              ...student.rounds,
              [selectedCompany._id]: updatedRounds,
            },
          };
        }
        return student;
      });
    });
  };
  const handleFinalStatusChange = async () => {
    try {
      setIsLoading(true);
      const year =
        localStorage.getItem("selectedYear") ||
        location.state?.batch?.endYear ||
        new Date().getFullYear();
      const updates = students.map((student) => {
        const roundData = student.rounds?.[selectedCompany._id] || {};
        const roundBooleanMap = {};
        for (const [key, value] of Object.entries(roundData)) {
          roundBooleanMap[key] = value === "selected";
        }
        const finalResult = Object.values(roundBooleanMap).every(
          (v) => v === true
        );
        return {
          studentId: student.id || student._id,
          companyId: selectedCompany._id,
          rounds: roundBooleanMap,
          finalResult,
        };
      });
      console.log("Sending updates", updates);

      await axios.put(
        "https://vcetplacement.onrender.com/api/shortlist/update-rounds",
        {
          year,
          updates,
        }
      );
      console.log("▶ Final Updates Sending", updates);
      toast("Rounds Update Successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        type: "success",
      });

      // Get previous data from localStorage
      const existingRounds =
        JSON.parse(localStorage.getItem("studentRounds")) || [];

      // Convert to a map for easier merging
      const existingMap = {};
      existingRounds.forEach((s) => {
        existingMap[s.studentId] = s.rounds;
      });

      // Merge new updates into existing
      students.forEach((student) => {
        const id = student.id || student._id;
        const newRounds = student.rounds;

        existingMap[id] = {
          ...(existingMap[id] || {}),
          ...newRounds,
        };
      });

      // Convert back to array
      const mergedRounds = Object.entries(existingMap).map(
        ([studentId, rounds]) => ({
          studentId,
          rounds,
        })
      );

      // Save merged data
      localStorage.setItem("studentRounds", JSON.stringify(mergedRounds));

      // Refresh round stats for the current company
      const updatedStats = await fetchCompanyRoundStats(selectedCompany._id);
      setCompanyRoundStats(prev => ({
        ...prev,
        [selectedCompany._id]: updatedStats
      }));

      handleClosePopup();
    } catch (error) {
      console.error("Error updating rounds:", error?.response?.data || error);
      toast("Failed to update student rounds.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        type: "error",
      });
    } finally {
      setIsLoading(false); // ✅ end loading
    }
  };
  const handleClosePopup = () => {
    setShowStudentPopup(false);
    setSelectedCompany(null);
    setSearchQuery("");
  };
  const handleDeleteStudent = (studentId) => {
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== studentId)
    );
  };
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gradient-animation p-4 relative overflow-hidden">
      <Head>
        <title>VCET Placement Portal | Manage Companies</title>
        <meta
          name="description"
          content="Manage company details and recruitment processes at VCET"
        />
      </Head>
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
          <div className="batch-info"  onClick={() => navigate("/AdminDashboard")} style={{ cursor: "pointer" }}>
            <FaBuilding className="admin-nav-icon" />
            <span className="batch-label">
              {year ? `Batch ${year - 4}-${year}` : "Loading Batch..."}
            </span>
          </div>
          {!showStudentPopup && (
            <button
              className="admin-nav-button add-company"
              onClick={() => setShowForm(true)}
            >
              <FaPlus className="admin-nav-icon" />
              Add Company
            </button>
          )}
          <Link
            to="/admin/students"
            className="admin-nav-button manage-students"
          >
            <FaUsers className="admin-nav-icon" />
            Manage Students
          </Link>
          <button className="admin-nav-button logout" onClick={handleLogout}>
            <FaSignOutAlt className="admin-nav-icon" />
            Logout
          </button>
        </div>
        <ToastContainer />

        {/* Content Area */}
        <div className="admin-dashboard-content">
          <div className="admin-companies-list">
            {companies.length === 0 ? (
              <div className="admin-no-data">
                <FaBuilding className="admin-excel-icon large" />
                <h3>No Companies Added</h3>
                <p>Click "Add Company" to add new companies</p>
              </div>
            ) : (
              <div className="admin-companies-grid">
                {companies.map((company) => (
                  <CompanyCard
                    key={company._id}
                    company={company}
                    companyRoundStats={companyRoundStats}
                    handleCompanyClick={handleCompanyClick}
                    handleDeleteCompany={handleDeleteCompany}
                    year={year}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student Rounds Popup */}
        {showStudentPopup && selectedCompany && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2>{selectedCompany.name.toUpperCase()} - Student Rounds</h2>
                <button
                  className="admin-modal-close"
                  onClick={handleClosePopup}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="admin-export-container">
                <div className="admin-search-container">
                  <FaSearch className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="admin-export-actions">
                  <button
                    className="admin-export-excel-button"
                    onClick={() => {
                      // Here you would typically export the data to Excel
                      const exportData = filteredStudents.map(
                        (student, index) => {
                          const rounds =
                            student.rounds[selectedCompany._id] || {};
                          return {
                            "S.No": index + 1,
                            Name: student.name,
                            ...Object.fromEntries(
                              Object.entries(rounds).map(([round, status]) => [
                                round.charAt(0).toUpperCase() + round.slice(1),
                                status.charAt(0).toUpperCase() +
                                  status.slice(1),
                              ])
                            ),
                            "Final Status":
                              calculateFinalStatus(
                                rounds,
                                selectedCompany.rounds
                              )
                                .charAt(0)
                                .toUpperCase() +
                              calculateFinalStatus(
                                rounds,
                                selectedCompany.rounds
                              ).slice(1),
                          };
                        }
                      );

                      // Create CSV content
                      const headers = Object.keys(exportData[0]);
                      const csvContent = [
                        headers.join(","),
                        ...exportData.map((row) =>
                          headers.map((header) => row[header]).join(",")
                        ),
                      ].join("\n");

                      // Create and download file
                      const blob = new Blob([csvContent], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `${selectedCompany.name}_Student_Status.csv`;
                      link.click();
                    }}
                  >
                    <FaFileExcel className="admin-excel-icon" />
                    Export to Excel
                  </button>
                  <button
                    className="admin-submit-student-button"
                    onClick={handleFinalStatusChange}
                    disabled={isLoading} // optional
                  >
                    {isLoading ? "Saving..." : "Submit Updates"}
                  </button>
                </div>
              </div>
              <div className="admin-students-table-container">
                <table className="admin-students-table">
                  <thead>
                    <tr>
                      <th>Reg. No.</th>
                      <th>Name</th>
                      {[...Array(selectedCompany.rounds)].map((_, i) => (
                        <th key={i}>Round {i + 1}</th>
                      ))}
                      <th>Final Status</th>
                      <th>Remove</th>
                    </tr>
                  </thead>
                 <tbody>
 
{[...students]
  .sort((a, b) => {
    const roundsA = a.rounds[selectedCompany._id] || {};
    const roundsB = b.rounds[selectedCompany._id] || {};

    const finalA = calculateFinalStatus(roundsA, selectedCompany.rounds);
    const finalB = calculateFinalStatus(roundsB, selectedCompany.rounds);

    // 1. Prioritize by final status first
    const statusOrder = { selected: 0, rejected: 1 };
    if (statusOrder[finalA] !== statusOrder[finalB]) {
      return statusOrder[finalA] - statusOrder[finalB];
    }

    // 2. If both are rejected, check how far they reached
    const getProgress = (rounds) => {
      let progress = 0;
      for (let i = 1; i <= selectedCompany.rounds; i++) {
        if (rounds[`round${i}`] === "selected") {
          progress = i;
        } else {
          break;
        }
      }
      return progress;
    };

    const progressA = getProgress(roundsA);
    const progressB = getProgress(roundsB);

    if (progressA !== progressB) {
      return progressB - progressA; // higher progress comes first
    }

    // 3. If still same, fallback to regNo
    return a.regNo - b.regNo;
  })
  .map((student) => {
    const rounds = student.rounds[selectedCompany._id] || {};
    const finalStatus = calculateFinalStatus(rounds, selectedCompany.rounds);

    return (
      <tr key={student.id}>
        <td>{student.regNo}</td>
        <td>{student.name}</td>
        {[...Array(selectedCompany.rounds)].map((_, i) => (
          <td
            key={`round-${student.id}-${i + 1}`}
            onClick={() =>
              handleRoundStatusChange(
                student.id,
                `round${i + 1}`,
                rounds[`round${i + 1}`] || "rejected"
              )
            }
            style={{ cursor: "pointer" }}
          >
            <span
              className={`round-status ${
                rounds[`round${i + 1}`] || "rejected"
              }`}
            >
              {rounds[`round${i + 1}`] || "rejected"}
            </span>
          </td>
        ))}
        <td
          key={`final-status-${student.id}`}
          onClick={() => handleFinalStatusChange()}
          style={{ cursor: "pointer" }}
        >
          <span className={`round-status ${finalStatus}`}>
            {finalStatus}
          </span>
        </td>
        <td>
          <button
            className="admin-action-btn delete"
            onClick={() => handleDeleteStudent(student.id)}
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Company Form Modal */}
        {showForm && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h2>Add New Company</h2>
                <button
                  className="admin-modal-close"
                  onClick={() => setShowForm(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="admin-company-form">
                <div className="admin-form-section">
                  <div className="admin-form-group">
                    <label htmlFor="name">Company Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="admin-form-input"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label htmlFor="description">Description</label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        required
                        className="admin-form-input"
                        placeholder="Enter job description"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label htmlFor="position">Position Recruiting</label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        required
                        className="admin-form-input"
                        placeholder="Enter position"
                      />
                    </div>
                  </div>

                  <div className="admin-form-section">
                    <h3>Academic Requirements</h3>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label htmlFor="tenth">10th Percentage</label>
                        <input
                          type="number"
                          id="tenth"
                          name="tenth"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                          className="admin-form-input"
                          placeholder="Enter 10th percentage"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="twelfth">12th Percentage</label>
                        <input
                          type="number"
                          id="twelfth"
                          name="twelfth"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                          className="admin-form-input"
                          placeholder="Enter 12th percentage"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label htmlFor="diploma">Diploma Percentage</label>
                        <input
                          type="number"
                          id="diploma"
                          name="diploma"
                          min="0"
                          max="100"
                          step="0.01"
                          className="admin-form-input"
                          placeholder="Enter diploma percentage"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="cgpa">CGPA</label>
                        <input
                          type="number"
                          id="cgpa"
                          name="cgpa"
                          min="0"
                          max="10"
                          step="0.01"
                          required
                          className="admin-form-input"
                          placeholder="Enter CGPA"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label htmlFor="historyArrears">
                          History of Arrears
                        </label>
                        <input
                          type="text"
                          id="historyArrears"
                          name="historyArrears"
                          required
                          className="admin-form-input"
                          placeholder="Enter history of arrears"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="currentArrears">Current Arrears</label>
                        <input
                          type="text"
                          id="currentArrears"
                          name="currentArrears"
                          required
                          className="admin-form-input"
                          placeholder="Enter current arrears"
                        />
                      </div>
                    </div>

                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label htmlFor="interviewDate">Date of Interview</label>
                        <input
                          type="date"
                          id="interviewDate"
                          name="interviewDate"
                          required
                          className="admin-form-input"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label htmlFor="rounds">Number of Rounds</label>
                        <input
                          type="number"
                          id="rounds"
                          name="rounds"
                          min="1"
                          max="10"
                          required
                          className="admin-form-input"
                          placeholder="Enter number of rounds"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="admin-form-actions">
                    <button type="submit" className="admin-submit-button">
                      Next
                    </button>
                    <button
                      type="button"
                      className="admin-cancel-button"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {showStudentSelect && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-content">
                <div className="student-selection-header flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Students</h2>
                  <div className="student-selection-controls">
                  <div className="select-all-container flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="selectAll"
                      onChange={(e) => {
                        const newSelected = e.target.checked ? eligibleStudents.map(s => s._id) : [];
                        setSelectedStudents(newSelected);
                      }}
                      className="w-4 h-4 accent-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="selectAll" className="text-md font-medium text-gray-700 cursor-pointer">Select All ({selectedStudents.length})</label>
                  </div>
                </div>
              </div>
             
              <table className="min-w-full border border-gray-200 rounded-xl shadow-md overflow-hidden">
                <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">Select</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">Register Number</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">10</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">12</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">Diploma</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold tracking-wide uppercase">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eligibleStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-white hover:bg-indigo-50" : "bg-gray-50 hover:bg-purple-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student._id]);
                            } else {
                              setSelectedStudents(
                                selectedStudents.filter((id) => id !== student._id)
                              );
                            }
                          }}
                          className="w-5 h-5 accent-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-300 font-medium text-gray-700">{student.studentRegisterNumber}</td>
                      <td className="px-6 py-4 text-300 font-medium text-gray-700">{student.studentName}</td>
                      <td className="px-6 py-4 text-300 font-medium text-gray-700">{student.studentTenthPercentage}</td>
                      <td className="px-6 py-4 text-300 font-medium text-gray-700">{student.studentTwelthPercentage}</td>
                      <td className="px-6 py-4 text-300 font-medium text-gray-700">{student.studentDiploma}</td>
                      <td className="px-6 py-4 text-300 font-medium text-gray-700">{student.studentUGCGPA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>


             

             
              <div className="admin-form-actions" style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <button
                  className="admin-submit-button"
                   onClick={async () => {
                      try {
                        const companyRes = await axios.post(
                          `https://vcetplacement.onrender.com/api/company/addcompany?year=${year}`,
                          formData
                        );

                        console.log("Company added successfully:", companyRes.data);

                        setReloadTrigger(prev => !prev);
                        setShowStudentSelect(false);
                        setShowForm(false);

                        const companyId = companyRes.data._id;
                        console.log(selectedStudents);
                        try{
                            const shortlistRes = await axios.post(
                            "https://vcetplacement.onrender.com/api/shortlist/addshortlist",
                            {
                              year: year,
                              companyId: companyId,
                              studentIds: selectedStudents
                            }
                          );
                          setSelectedStudents(null);
                          console.log("Shortlist added:", shortlistRes.data);
                        }catch (error) {
                          console.error("Shortlist Error: " , error);
                        }

                      } catch (error) {
                        console.error("Error:", error);
                      }
                    }}

                >
                  Add Company
                </button>
                <button
                  className="admin-cancel-button"
                  onClick={() => {
                    setShowStudentSelect(false);
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}
       
      </div>
    </div>
  );
};

export default ManageCompanies;