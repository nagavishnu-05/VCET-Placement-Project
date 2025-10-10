import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { 
  FaBuilding, 
  FaSignOutAlt, 
  FaPlus, 
  FaTimes, 
  FaUsers, 
  FaTrash, 
  FaArrowLeft, 
  FaSearch, 
  FaEdit, 
  FaEye,
  FaFileExcel 
} from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import CompanyCard from "./CompanyCard";
import Vcet from "./assets/VCET Logo.jpg";
import CSE from "./assets/CSE LOGO.jpg";
import "./styles/ManageCompanies.css";
import "./styles/analytics.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [showRoundInsights, setShowRoundInsights] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
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
  // Analytics state variables
  const [totalRound1Attended, setTotalRound1Attended] = useState(0);
  const [totalRound1Cleared, setTotalRound1Cleared] = useState(0);
  const [totalRound2Attended, setTotalRound2Attended] = useState(0);
  const [totalRound2Cleared, setTotalRound2Cleared] = useState(0);
  const [totalRound3Attended, setTotalRound3Attended] = useState(0);
  const [totalRound3Cleared, setTotalRound3Cleared] = useState(0);
  const [totalRound4Attended, setTotalRound4Attended] = useState(0);
  const [totalRound4Cleared, setTotalRound4Cleared] = useState(0);
  const [totalRound5Attended, setTotalRound5Attended] = useState(0);
  const [totalRound5Cleared, setTotalRound5Cleared] = useState(0);
  const [companiesWithRound1, setCompaniesWithRound1] = useState(0);
  const [averageSuccessRate, setAverageSuccessRate] = useState(0);
  // Per-card expanded state will be managed inside each CompanyCard to avoid
  // shared state issues where toggling one card could affect others.

  // Function to fetch round statistics for a company
  const fetchCompanyRoundStats = useCallback(async (companyId) => {
    console.log(`Fetching stats for company ${companyId}`); // Debug log
    try {
      const res = await axios.get(
        `https://vcetplacement.onrender.com/api/shortlist/getshortlist/${year}/${companyId}`
      );
      
      console.log(`Raw data for company ${companyId}:`, res.data); // Debug log
      const shortlistedData = res.data;
      console.log('Shortlisted data structure:', shortlistedData); // Debug log
      
      const stats = {
        totalStudents: shortlistedData.length,
        rounds: {}
      };

      // Calculate stats for each round
      const company = companies.find(c => c._id === companyId);
      const totalRounds = company?.rounds || 0;
      
      for (let i = 1; i <= totalRounds; i++) {
        let attended = 0;
        let selected = 0;

        if (i === 1) {
          attended = shortlistedData.length;
          selected = shortlistedData.filter(student => student.rounds && student.rounds[`round${i}`] === true).length;
        } else {
          attended = shortlistedData.filter(student => student.rounds && student.rounds[`round${i-1}`] === true).length;
          selected = shortlistedData.filter(student => student.rounds && student.rounds[`round${i}`] === true).length;
        }

        const rejected = attended - selected;

        stats.rounds[i] = {
          attended: attended,
          selected: selected,
          rejected: rejected,
          total: shortlistedData.length,
          successRate: attended > 0 ? (selected / attended) * 100 : 0
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
    console.log('Starting to fetch stats for all companies:', companies); // Debug log
    const statsPromises = companies.map(async (company) => {
      console.log(`Processing company: ${company.name}`); // Debug log
      const stats = await fetchCompanyRoundStats(company._id);
      return { companyId: company._id, stats };
    });
    
    const allStats = await Promise.all(statsPromises);
    const statsMap = {};
    allStats.forEach(({ companyId, stats }) => {
      statsMap[companyId] = stats;
    });
    
    console.log('Final stats map:', statsMap); // Debug log
    setCompanyRoundStats(statsMap);
  }, [companies, fetchCompanyRoundStats]);

  // Debug log when companyRoundStats changes
  useEffect(() => {
    console.log('Updated company round stats:', companyRoundStats);
  }, [companyRoundStats]);

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

  // Automatically update analytics when round stats change
  useEffect(() => {
    if (!companies.length || !companyRoundStats) return;

    let totalAttended = 0;
    let totalCleared = 0;
    let companiesCount = 0;
    let totalSuccessRate = 0;

    companies.forEach(company => {
      const stats = companyRoundStats[company._id];
      if (stats?.rounds?.['1']) {
        companiesCount++;
        const round1Data = stats.rounds['1'];
        const attended = round1Data.attended || 0;
        const selected = round1Data.selected || 0;
        
        totalAttended += attended;
        totalCleared += selected;
        
        if (attended > 0) {
          totalSuccessRate += (selected / attended) * 100;
        }
      }
    });

    setTotalRound1Attended(totalAttended);
    setTotalRound1Cleared(totalCleared);
    setCompaniesWithRound1(companiesCount);
    setAverageSuccessRate(companiesCount > 0 ? totalSuccessRate / companiesCount : 0);
  }, [companies, companyRoundStats]);

  // Automatically update analytics when round stats change
  useEffect(() => {
    if (!companies.length || !companyRoundStats) return;

    let rounds = {
      1: { attended: 0, cleared: 0, companies: 0 },
      2: { attended: 0, cleared: 0, companies: 0 },
      3: { attended: 0, cleared: 0, companies: 0 },
      4: { attended: 0, cleared: 0, companies: 0 },
      5: { attended: 0, cleared: 0, companies: 0 }
    };

    companies.forEach(company => {
      const stats = companyRoundStats[company._id];
      if (stats?.rounds) {
        // Process each round
        for (let round = 1; round <= 5; round++) {
          const roundData = stats.rounds[round];
          if (roundData) {
            rounds[round].attended += roundData.attended || 0;
            rounds[round].cleared += roundData.selected || 0;
            rounds[round].companies++;
          }
        }
      }
    });

    // Update state for all rounds
    setTotalRound1Attended(rounds[1].attended);
    setTotalRound1Cleared(rounds[1].cleared);
    setTotalRound2Attended(rounds[2].attended);
    setTotalRound2Cleared(rounds[2].cleared);
    setTotalRound3Attended(rounds[3].attended);
    setTotalRound3Cleared(rounds[3].cleared);
    setTotalRound4Attended(rounds[4].attended);
    setTotalRound4Cleared(rounds[4].cleared);
    setTotalRound5Attended(rounds[5].attended);
    setTotalRound5Cleared(rounds[5].cleared);
    setCompaniesWithRound1(rounds[1].companies);
    
    // Calculate overall average success rate
    const roundsWithStudents = Object.values(rounds).filter(r => r.attended > 0);
    const avgSuccess = roundsWithStudents.length > 0
      ? roundsWithStudents.reduce((sum, r) => sum + (r.cleared / r.attended * 100), 0) / roundsWithStudents.length
      : 0;
    setAverageSuccessRate(avgSuccess);
  }, [companies, companyRoundStats]);

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
  const [exportFilter, setExportFilter] = useState("all"); // all | selected | rejected

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
          if (nextStatus === "selected") {
            for (let i = 1; i <= roundNum; i++) {
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

  const handleFinalStatusToggle = (studentId, currentFinalStatus) => {
    setStudents((prevStudents) => {
      return prevStudents.map((student) => {
        if (student.id === studentId) {
          const currentRounds = student.rounds[selectedCompany._id] || {};
          const statusOrder = ["rejected", "selected"];
          const nextStatus =
            statusOrder[(statusOrder.indexOf(currentFinalStatus) + 1) % 2];

          const updatedRounds = { ...currentRounds };
          for (let i = 1; i <= selectedCompany.rounds; i++) {
            updatedRounds[`round${i}`] = nextStatus;
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
    <>
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
            {/* New Round Insights button near Logout as requested */}
            <button
              className="admin-nav-button round-insights"
              onClick={() => setShowRoundInsights(true)}
              title="Round Insights"
            >
              Round Insights
            </button>
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
                      handleCompanyClick={handleCompanyClick}
                      handleDeleteCompany={handleDeleteCompany}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Round Insights Modal */}
      {showRoundInsights && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>Round Insights</h2>
              <button className="admin-modal-close" onClick={() => setShowRoundInsights(false)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '1rem' }}>
              <div className="analytics-header">
                <button 
                  className="view-analytics-btn"
                  onClick={() => setShowAnalytics(prevState => !prevState)}
                >
                  {showAnalytics ? 'Show Companies' : 'View Analytics'}
                </button>
              </div>

              {showAnalytics ? (
                <div className="analytics-container">
                  {/* Round-wise Analytics with Charts */}
                  <div className="analytics-card">
                    <h3>Round-wise Performance</h3>
                    <div className="analytics-stats">
                      <div className="chart-container">
                        <Bar
                          data={{
                            labels: ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'],
                            datasets: [
                              {
                                label: 'Students Attended',
                                data: [
                                  totalRound1Attended || 0,
                                  totalRound2Attended || 0,
                                  totalRound3Attended || 0,
                                  totalRound4Attended || 0,
                                  totalRound5Attended || 0
                                ],
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                                order: 2
                              },
                              {
                                label: 'Students Selected',
                                data: [
                                  totalRound1Cleared || 0,
                                  totalRound2Cleared || 0,
                                  totalRound3Cleared || 0,
                                  totalRound4Cleared || 0,
                                  totalRound5Cleared || 0
                                ],
                                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                order: 1
                              },
                              {
                                label: 'Students Rejected',
                                data: [
                                  (totalRound1Attended || 0) - (totalRound1Cleared || 0),
                                  (totalRound2Attended || 0) - (totalRound2Cleared || 0),
                                  (totalRound3Attended || 0) - (totalRound3Cleared || 0),
                                  (totalRound4Attended || 0) - (totalRound4Cleared || 0),
                                  (totalRound5Attended || 0) - (totalRound5Cleared || 0)
                                ],
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1,
                                order: 3
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1,
                                  color: '#333'
                                }
                              },
                              x: {
                                ticks: {
                                  color: '#333'
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: '#333'
                                }
                              },
                              title: {
                                display: true,
                                text: 'Round-wise Student Performance',
                                color: '#333'
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {/* Success Rate Graph */}
                      <div className="chart-container">
                        <Bar
                          data={{
                            labels: ['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Round 5'],
                            datasets: [{
                              label: 'Success Rate (%)',
                              data: [
                                totalRound1Attended > 0 ? (totalRound1Cleared / totalRound1Attended) * 100 : 0,
                                totalRound2Attended > 0 ? (totalRound2Cleared / totalRound2Attended) * 100 : 0,
                                totalRound3Attended > 0 ? (totalRound3Cleared / totalRound3Attended) * 100 : 0,
                                totalRound4Attended > 0 ? (totalRound4Cleared / totalRound4Attended) * 100 : 0,
                                totalRound5Attended > 0 ? (totalRound5Cleared / totalRound5Attended) * 100 : 0,
                              ],
                              backgroundColor: 'rgba(255, 159, 64, 0.5)',
                              borderColor: 'rgba(255, 159, 64, 1)',
                              borderWidth: 1,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                  callback: value => value + '%',
                                  color: '#333'
                                }
                              },
                              x: {
                                ticks: {
                                  color: '#333'
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: '#333'
                                }
                              },
                              title: {
                                display: true,
                                text: 'Round-wise Success Rate',
                                color: '#333'
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="analytics-card">
                    <h3>Overall Performance</h3>
                    <div className="analytics-stats">
                      <div className="stat-item">
                        <p className="stat-label">Total Companies</p>
                        <p className="stat-value">{companies.length}</p>
                      </div>
                      <div className="stat-item">
                        <p className="stat-label">Total Selected</p>
                        <p className="stat-value">
                          {(totalRound1Cleared || 0) + 
                           (totalRound2Cleared || 0) + 
                           (totalRound3Cleared || 0) + 
                           (totalRound4Cleared || 0) + 
                           (totalRound5Cleared || 0)}
                        </p>
                      </div>
                      <div className="stat-item">
                        <p className="stat-label">Total Rejected</p>
                        <p className="stat-value">
                          {((totalRound1Attended || 0) - (totalRound1Cleared || 0)) +
                           ((totalRound2Attended || 0) - (totalRound2Cleared || 0)) +
                           ((totalRound3Attended || 0) - (totalRound3Cleared || 0)) +
                           ((totalRound4Attended || 0) - (totalRound4Cleared || 0)) +
                           ((totalRound5Attended || 0) - (totalRound5Cleared || 0))}
                        </p>
                      </div>
                      <div className="stat-item">
                        <p className="stat-label">Average Success Rate</p>
                        <p className="stat-value">
                          {companiesWithRound1 > 0
                            ? (averageSuccessRate).toFixed(1) + '%'
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="admin-companies-grid">
                  {companies.map((company) => {
                    const stats = companyRoundStats[company._id] || { rounds: {}, totalStudents: 0 };
                    return (
                    <div key={company._id} className="admin-company-card" style={{ cursor: 'default' }}>
                      <div className="admin-company-header">
                        <h3 className="admin-company-black">{company.name.toUpperCase()}</h3>
                        <div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              // export per-company round details (same behavior as previous CompanyCard.exportRoundDetails)
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
                              }
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
              </div>
            )}
          </div>
        </div>
      </div>
      )}

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
                <select
                  value={exportFilter}
                  onChange={(e) => setExportFilter(e.target.value)}
                  className="admin-export-filter"
                >
                  <option value="all">All students</option>
                  <option value="selected">Selected only</option>
                  <option value="rejected">Rejected only</option>
                  {[...Array(selectedCompany.rounds)].map((_, i) => (
                    <option key={i} value={`Round ${i + 1}`}>Round {i + 1}</option>
                  ))}
                </select>
                <button
                  className="admin-export-excel-button"
                  onClick={() => {
                    // Build export list based on exportFilter
                    if (!students || students.length === 0) return;

                    let exportSource = students;
                    let fileName = `${selectedCompany.name}_Student_Status.xlsx`;
                    let roundNumber = null;

                    if (exportFilter === 'selected') {
                      exportSource = students.filter(s => calculateFinalStatus(s.rounds[selectedCompany._id] || {}, selectedCompany.rounds) === 'selected');
                    } else if (exportFilter === 'rejected') {
                      exportSource = students.filter(s => calculateFinalStatus(s.rounds[selectedCompany._id] || {}, selectedCompany.rounds) === 'rejected');
                    } else if (exportFilter.startsWith('Round ')) {
                      roundNumber = parseInt(exportFilter.split(' ')[1]);
                      exportSource = students.filter(s => {
                        const rounds = s.rounds[selectedCompany._id] || {};
                        return rounds[`round${roundNumber}`] === 'selected';
                      });
                      fileName = `${selectedCompany.name}_Round_${roundNumber}.xlsx`;
                    }

                    const exportData = exportSource.map((student, index) => {
                      const rounds = student.rounds[selectedCompany._id] || {};
                      if (exportFilter.startsWith('Round ')) {
                        // For round-wise exports, only include S.No and Name
                        return {
                          "S.No": index + 1,
                          "Name": student.name,
                        };
                      } else {
                        // For other exports, include full details
                        const row = {
                          "S.No": index + 1,
                          "Reg. No.": student.regNo,
                          Name: student.name,
                        };
                        for (let i = 1; i <= selectedCompany.rounds; i++) {
                          const key = `round${i}`;
                          const val = rounds[key] || "rejected";
                          row[`Round ${i}`] = val.charAt(0).toUpperCase() + val.slice(1);
                        }
                        row["Final Status"] = calculateFinalStatus(rounds, selectedCompany.rounds).charAt(0).toUpperCase() + calculateFinalStatus(rounds, selectedCompany.rounds).slice(1);
                        return row;
                      }
                    });

                    if (exportData.length === 0) return;

                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Student Rounds");
                    XLSX.writeFile(wb, fileName);
                  }}
                >
                  <FaFileExcel className="admin-excel-icon" />
                  Export to Excel
                </button>
                <button
                  className="admin-submit-student-button"
                  onClick={handleFinalStatusChange}
                  disabled={isLoading}
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
                  {[...filteredStudents]
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
                        return progressB - progressA;
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
                            onClick={() => handleFinalStatusToggle(student.id, finalStatus)}
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
    </>
  );
};

export default ManageCompanies; 