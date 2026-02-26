import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaBuilding
} from "react-icons/fa";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import CompanyCard from "../../CompanyCard";
import "../../styles/ManageCompanies.css";
import "../../styles/analytics.css";
import CollegeHeader from "./components/CollegeHeader";
import CompanyNavbar from "./components/CompanyNavbar";
import RoundInsightsModal from "./components/RoundInsightsModal";
import StudentRoundsPopup from "./components/StudentRoundsPopup";
import AddCompanyForm from "./components/AddCompanyForm";
import StudentSelectionModal from "./components/StudentSelectionModal";
import Loader from "../../components/Loader";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
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
  const [showCompanyAnalytics, setShowCompanyAnalytics] = useState(false);
  const [selectedAnalyticsCompany, setSelectedAnalyticsCompany] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);



  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, companyId: null, companyName: "" });

  console.log(year);
  console.log(batch);
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/";
  };
  const [reloadTrigger, setReloadTrigger] = useState(false);

  const [showStudentSelect, setShowStudentSelect] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [formData, setFormData] = useState(null);
  const [modalYear] = useState(year);
  const [studentSearch, setStudentSearch] = useState("");
  const [companyRoundStats, setCompanyRoundStats] = useState({});
  const [selectedRoles, setSelectedRoles] = useState({});
  // Analytics state variables
  const [totalRoundAttended, setTotalRoundAttended] = useState(Array(10).fill(0));
  const [totalRoundCleared, setTotalRoundCleared] = useState(Array(10).fill(0));
  const [totalRoundCompanies, setTotalRoundCompanies] = useState(Array(10).fill(0));
  const [companiesWithRound1, setCompaniesWithRound1] = useState(0);
  const [averageSuccessRate, setAverageSuccessRate] = useState(0);
  const [totalPlacedStudents, setTotalPlacedStudents] = useState({ count: 0, loading: true });
  const [maxRounds, setMaxRounds] = useState(5);

  // Debug log for totalPlacedStudents state changes
  useEffect(() => {
    console.log("🔔 totalPlacedStudents state changed:", totalPlacedStudents);
  }, [totalPlacedStudents]);

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
          attended = shortlistedData.filter(student => student.rounds && student.rounds[`round${i - 1}`] === true).length;
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
  //   axios.post(`https://vcetplacement.onrender.com/api/shortlist/addshortlist`, {
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
    setIsLoading(true);
    const formDataObj = new FormData(e.target);
    const newCompany = {
      name: formDataObj.get("name"),
      description: formDataObj.get("description"),
      position: formDataObj.get("position"),
      tenth: formDataObj.get("tenth"),
      twelfth: formDataObj.get("twelfth"),
      diploma: formDataObj.get("diploma"),
      cgpa: formDataObj.get("cgpa"),
      historyofArrears: formDataObj.get("historyArrears"),
      currentArrears: formDataObj.get("currentArrears"),
      interviewDate: formDataObj.get("interviewDate"),
      rounds: formDataObj.get("rounds"),
      includePlaced: formDataObj.get("includePlaced"),
      allowedCompanies: formDataObj.getAll("allowedCompanies")
    };
    setFormData(newCompany);

    try {
      const [studentsRes, finalPlacedList] = await Promise.all([
        axios.get(`https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`),
        fetchFinalSelectedStudents(year)
      ]);

      // Pre-parse criteria to handle empty strings/nulls
      const reqTenth = parseFloat(newCompany.tenth) || 0;
      const reqTwelfth = parseFloat(newCompany.twelfth) || 0;
      const reqDiploma = parseFloat(newCompany.diploma) || 0;
      const reqCGPA = parseFloat(newCompany.cgpa) || 0;
      const reqHOA = newCompany.historyofArrears !== "" && newCompany.historyofArrears !== null ? parseFloat(newCompany.historyofArrears) : Infinity;
      const reqArrear = newCompany.currentArrears !== "" && newCompany.currentArrears !== null ? parseFloat(newCompany.currentArrears) : Infinity;

      const processedStudents = studentsRes.data
        .filter(student => (student.studentPlacementInterest || "").trim().toLowerCase() === "yes")
        .map(student => {
          const sTenth = parseFloat(student.studentTenthPercentage) || 0;
          const sTwelfth = parseFloat(student.studentTwelthPercentage);
          const sDiploma = parseFloat(student.studentDiploma);
          const sCGPA = parseFloat(student.studentUGCGPA) || 0;
          const sArrear = parseFloat(student.studentCurrentArrears) || 0;
          const sHOA = parseFloat(student.studentHistoryOfArrears) || 0;

          // Academic eligibility
          const tenthOk = sTenth >= reqTenth;
          const cgpaOk = sCGPA >= reqCGPA;
          const twelfthOk = !isNaN(sTwelfth) && sTwelfth >= reqTwelfth;
          const diplomaOk = !isNaN(sDiploma) && sDiploma >= reqDiploma;
          const academicsOk = twelfthOk || diplomaOk;
          const arrearOk = sArrear <= reqArrear;
          const hoaOk = sHOA <= reqHOA;

          // Placement state filtering
          let placementStateOk = true;
          const studentPlacements = finalPlacedList.filter(p => {
            const pStudentId = p.studentId?._id || p.studentId;
            return pStudentId === student._id;
          });
          const isPlacedSomewhere = studentPlacements.length > 0;

          if (newCompany.includePlaced === "no") {
            placementStateOk = !isPlacedSomewhere;
          } else if (newCompany.includePlaced === "yes") {
            if (isPlacedSomewhere) {
              placementStateOk = studentPlacements.some(p => {
                const pCompanyId = p.companyId?._id || p.companyId;
                return newCompany.allowedCompanies.includes(pCompanyId);
              });
            }
          }

          const isEligible = tenthOk && academicsOk && cgpaOk && arrearOk && hoaOk && placementStateOk;
          return { ...student, isEligible };
        });

      setEligibleStudents(processedStudents);
      const initiallySelected = processedStudents.filter(s => s.isEligible).map(s => s._id);
      setSelectedStudents(initiallySelected);
      setShowStudentSelect(true);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsDataLoading(true);
      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/company/ShowAllcompanies?year=${year}`
        );
        setCompanies(res.data);
        console.log("User data fetched:", res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsDataLoading(false);
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

    // Update the first element of the arrays
    setTotalRoundAttended(prev => {
      const newArr = [...prev];
      newArr[0] = totalAttended;
      return newArr;
    });
    setTotalRoundCleared(prev => {
      const newArr = [...prev];
      newArr[0] = totalCleared;
      return newArr;
    });
    setCompaniesWithRound1(companiesCount);
    setAverageSuccessRate(companiesCount > 0 ? totalSuccessRate / companiesCount : 0);
  }, [companies, companyRoundStats]);

  // Automatically update analytics when round stats change
  useEffect(() => {
    if (!companies.length || !companyRoundStats) return;

    const maxRoundsValue = Math.max(...companies.map(c => c.rounds || 0));
    setMaxRounds(maxRoundsValue);

    const rounds = Array.from({ length: maxRoundsValue }, () => ({ attended: 0, cleared: 0, companies: 0 }));

    companies.forEach(company => {
      const stats = companyRoundStats[company._id];
      if (stats?.rounds) {
        // Process each round up to the company's rounds
        for (let round = 1; round <= company.rounds; round++) {
          const roundData = stats.rounds[round];
          if (roundData) {
            rounds[round - 1].attended += roundData.attended || 0;
            rounds[round - 1].cleared += roundData.selected || 0;
            rounds[round - 1].companies++;
          }
        }
      }
    });

    // Update state arrays
    setTotalRoundAttended(rounds.map(r => r.attended));
    setTotalRoundCleared(rounds.map(r => r.cleared));
    setTotalRoundCompanies(rounds.map(r => r.companies));
    setCompaniesWithRound1(rounds[0]?.companies || 0);

    // Calculate overall success rate across all rounds and companies
    const totalSelected = rounds.reduce((sum, r) => sum + r.cleared, 0);
    const totalAttended = rounds.reduce((sum, r) => sum + r.attended, 0);
    const overallSuccessRate = totalAttended > 0 ? (totalSelected / totalAttended) * 100 : 0;
    setAverageSuccessRate(overallSuccessRate);

    // The total placed students calculation is independent of per-company stats,
    // so it has been moved to its own useEffect hook to run on mount and year change.
  }, [companies, companyRoundStats, year]);

  // Fetch total placed students on mount and when year changes
  useEffect(() => {
    console.log("🚀 useEffect triggered for totalPlacedStudents");
    console.log("🚀 Year value:", year);
    // Reset loading state when year changes
    setTotalPlacedStudents({ count: 0, loading: true });
    calculateTotalPlacedStudents();
  }, [year]);

  // Function to fetch final selected students
  const fetchFinalSelectedStudents = async (year) => {
    try {
      console.log("🔍 Fetching final selected students for year:", year);
      const response = await axios.get(`https://vcetplacement.onrender.com/api/shortlist/final-selected-students/${year}`);
      console.log("✅ Final Selected Students Response:", response);
      console.log("✅ Final Selected Students Data:", response.data);
      // The API returns an object with a 'results' property containing the array
      const results = response.data.results || [];
      console.log("✅ Final Selected Students Array Length:", results.length);
      console.log("✅ Final Selected Students Array:", JSON.stringify(results, null, 2));
      return results;
    } catch (error) {
      console.error("❌ Error fetching final selected students:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      return [];
    }
  };

  // Function to calculate total unique placed students
  const calculateTotalPlacedStudents = async () => {
    console.log("📊 Starting calculateTotalPlacedStudents...");
    console.log("📊 Current year:", year);
    try {
      const finalSelectedStudents = await fetchFinalSelectedStudents(year);
      console.log("📊 Received finalSelectedStudents:", finalSelectedStudents);
      console.log("📊 Is array?", Array.isArray(finalSelectedStudents));

      // Get unique student IDs (a student may be placed in multiple companies)
      const uniqueStudentIds = new Set(finalSelectedStudents.map(student => {
        // Handle both object and string ID formats
        return student.studentId?._id || student.studentId;
      }).filter(id => id)); // Filter out null/undefined IDs
      const placedCount = uniqueStudentIds.size;

      console.log("📊 Total entries (including duplicates):", finalSelectedStudents.length);
      console.log("📊 Unique student IDs:", Array.from(uniqueStudentIds));
      console.log("📊 Total unique placed students count:", placedCount);
      console.log("📊 Setting state with count:", placedCount);
      setTotalPlacedStudents({ count: placedCount, loading: false });
      console.log("📊 State updated successfully");
    } catch (error) {
      console.error("❌ Error calculating placed students:", error);
      setTotalPlacedStudents({ count: 0, loading: false });
    }
  };

  // Function to get greeting based on current time
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning all";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon all";
    } else {
      return "Good evening all";
    }
  };

  // Function to generate WhatsApp message for placed students
  const generatePlacedStudentsMessage = async () => {
    try {
      // Fetch final companies for the year
      const response = await axios.get(`https://vcetplacement.onrender.com/api/finalcompany/get-final-company-for-a-student?year=${year}`);
      const finalSelectedStudents = response.data || [];
      const greeting = getGreeting();

      if (!finalSelectedStudents || finalSelectedStudents.length === 0) {
        return `${greeting}\n\nSo far placed students list\n\nNo placed students yet.`;
      }

      // Ensure studentInformationsDetail is available
      let studentDetails = studentInformationsDetail;
      if (!studentDetails || studentDetails.length === 0) {
        try {
          const res = await axios.get(`https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`);
          studentDetails = res.data;
          setStudentInformationDetail(studentDetails); // Optionally update state
        } catch (e) {
          console.error("Error fetching student info for message:", e);
          return `${greeting}\n\nSo far placed students list\n\nCould not fetch student details.`;
        }
      }

      // Group placements by role
      const placementsByRole = {};

      finalSelectedStudents.forEach(student => {
        if (!student.studentId || !student.companyId) return;
        // Handle both object and string ID formats
        const studentId = student.studentId._id || student.studentId;
        const companyId = student.companyId._id || student.companyId;

        // Try to get names from the populated objects if available, otherwise look up
        const studentName = student.studentId.studentName || studentDetails.find(s => s._id === studentId)?.studentName || "Unknown Student";
        const companyName = student.companyId.name || companies.find(c => c._id === companyId)?.name || "Unknown Company";

        // Use role from the API response if available, otherwise default
        // Note: The API might not return 'studentRole' directly in this endpoint. 
        // If it's not there, we default to "Placed".
        let role = student.studentRole || "Placed";

        // Rename "Role Offered" to "Placed"
        if (role === "Role Offered") {
          role = "Placed";
        }

        if (!placementsByRole[role]) {
          placementsByRole[role] = [];
        }

        placementsByRole[role].push({
          name: studentName,
          company: companyName,
          role: role
        });
      });

      // Calculate unique placed students count
      const uniquePlacedStudents = new Set();
      finalSelectedStudents.forEach(student => {
        if (student.studentId) {
          const sId = student.studentId._id || student.studentId;
          uniquePlacedStudents.add(sId);
        }
      });
      const totalPlaced = uniquePlacedStudents.size;

      // Calculate batch years from year (assuming year is end year)
      const startYear = year - 4;
      const batch = `${startYear}-${year}`;

      // Calculate placement statistics
      // Calculate placement statistics
      const totalStudents = studentDetails.length;

      // Calculate stats based on studentPlacementInterest
      // Assuming it is "Yes" or "No" (case-insensitive check)
      const placementInterested = studentDetails.filter(s => s.studentPlacementInterest && s.studentPlacementInterest.trim().toLowerCase() === 'yes').length;
      const placementEligible = placementInterested; // Consistent with user requirement

      const placedCount = totalPlaced;
      const yetToPlace = placementEligible - placedCount;
      const placementPercentage = placementEligible > 0 ? ((placedCount / placementEligible) * 100).toFixed(2) : "0.00";

      let message = `${greeting}\n\n`;
      message += `So far placed students :\n\n`;

      // List students by role in specific order: Placed, Internship, Incubation, Trainee
      const roleOrder = ["Placed", "Internship", "Incubation", "Trainee"];

      roleOrder.forEach(roleType => {
        if (placementsByRole[roleType] && placementsByRole[roleType].length > 0) {
          message += `${roleType}\n`;
          placementsByRole[roleType].forEach((placement, index) => {
            message += `${index + 1}. ${placement.name} - ${placement.company}\n`;
          });
          message += `\n`;
        }
      });

      // Also check if there are any other roles not in the standard list and append them
      Object.keys(placementsByRole).forEach(roleType => {
        if (!roleOrder.includes(roleType) && placementsByRole[roleType].length > 0) {
          message += `${roleType}\n`;
          placementsByRole[roleType].forEach((placement, index) => {
            message += `${index + 1}. ${placement.name} - ${placement.company}\n`;
          });
          message += `\n`;
        }
      });

      message += `Placement statistics\n${batch}\n\n`;
      message += `Total no of Students ${totalStudents}\n`;
      message += `No of placement interested ${placementInterested}\n`;
      message += `Placement Eligible ${placementEligible}\n`;
      message += `No of placed count ${placedCount}/${placementEligible}\n\n`;
      message += `Placement percentage\n${placedCount}/${placementEligible}= ${placementPercentage}%\n\n`;
      message += `Yet to place ${yetToPlace}\n\n`;
      message += "Thank you all";

      return message;
    } catch (error) {
      console.error("Error generating WhatsApp message:", error);
      return `${getGreeting()}\n\nSo far placed students list\n\nError generating list.`;
    }
  };

  // Function to generate WhatsApp message for overall stats using placed-students API
  const generateOverallStatsMessage = async () => {
    try {
      const greeting = getGreeting();

      // Fetch placed students from the API
      const response = await axios.get(`https://vcetplacement.onrender.com/api/shortlist/placed-students?year=${year}`);
      const placedStudentsData = response.data || [];

      if (!placedStudentsData || placedStudentsData.length === 0) {
        return `${greeting}\n\nSo far placed students list\n\nNo placed students yet.`;
      }

      // Ensure studentInformationsDetail is available
      let studentDetails = studentInformationsDetail;
      if (!studentDetails || studentDetails.length === 0) {
        try {
          const res = await axios.get(`https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`);
          studentDetails = res.data;
          setStudentInformationDetail(studentDetails);
        } catch (e) {
          console.error("Error fetching student info for message:", e);
          return `${greeting}\n\nSo far placed students list\n\nCould not fetch student details.`;
        }
      }

      // Separate students by role categories
      const placedStudents = []; // Role Offered or no role specified
      const internStudents = []; // Internship
      const incubationStudents = []; // Incubation
      const traineeStudents = []; // Trainee

      placedStudentsData.forEach(student => {
        const studentName = student.studentName;
        const companies = student.placedCompanies || [];

        // Group companies by role for this student
        const placedCompanyNames = [];
        const internCompanyNames = [];
        const incubationCompanyNames = [];
        const traineeCompanyNames = [];

        companies.forEach(company => {
          const companyName = company.companyName;
          const role = company.role || "Role Offered";

          if (role === "Internship") {
            internCompanyNames.push(companyName);
          } else if (role === "Incubation") {
            incubationCompanyNames.push(companyName);
          } else if (role === "Trainee") {
            traineeCompanyNames.push(companyName);
          } else {
            // "Role Offered" or any other role treated as Placed
            placedCompanyNames.push(companyName);
          }
        });

        // Add to respective arrays
        if (placedCompanyNames.length > 0) {
          placedStudents.push({
            name: studentName,
            companies: placedCompanyNames.join(", ")
          });
        }
        if (internCompanyNames.length > 0) {
          internStudents.push({
            name: studentName,
            companies: internCompanyNames
          });
        }
        if (incubationCompanyNames.length > 0) {
          incubationStudents.push({
            name: studentName,
            companies: incubationCompanyNames.join(", ")
          });
        }
        if (traineeCompanyNames.length > 0) {
          traineeStudents.push({
            name: studentName,
            companies: traineeCompanyNames.join(", ")
          });
        }
      });

      // Calculate batch years
      const startYear = year - 4;
      const batch = `${startYear}-${year}`;

      // Calculate placement statistics
      const totalStudents = studentDetails.length;
      const placementInterested = studentDetails.filter(s => s.studentPlacementInterest && s.studentPlacementInterest.trim().toLowerCase() === 'yes').length;
      const placementEligible = placementInterested; // As per user requirement
      const placedCount = placedStudentsData.length;
      const yetToPlace = placementEligible - placedCount;
      const placementPercentage = placementEligible > 0 ? ((placedCount / placementEligible) * 100).toFixed(2) : "0.00";

      // Build the message
      let message = `${greeting}\n\n`;
      message += `So far placed students list\n\n`;

      // List placed students
      placedStudents.forEach((student, index) => {
        message += `${index + 1}.${student.name}(${student.companies})\n`;
      });
      message += `\n`;

      // List intern students
      if (internStudents.length > 0) {
        const totalInterns = internStudents.length;
        message += `Students in Intern:${String(totalInterns).padStart(2, '0')}\n`;

        internStudents.forEach((student, index) => {
          const companiesStr = student.companies.join(", ");
          message += `${index + 1}.${student.name}(${companiesStr})\n`;
        });
        message += `\n`;
      }

      // List incubation students if any
      if (incubationStudents.length > 0) {
        message += `Students in Incubation:\n`;
        incubationStudents.forEach((student, index) => {
          message += `${index + 1}.${student.name}(${student.companies})\n`;
        });
        message += `\n`;
      }

      // List trainee students if any
      if (traineeStudents.length > 0) {
        message += `Students in Trainee:\n`;
        traineeStudents.forEach((student, index) => {
          message += `${index + 1}.${student.name}(${student.companies})\n`;
        });
        message += `\n`;
      }

      message += `\n\nPlacement statistics\n${batch}\n\n`;
      message += `Total no of Students ${totalStudents}\n`;
      message += `No of placement interested ${placementInterested}\n`;
      message += `Placement Eligible ${placementEligible}\n`;
      message += `No of placed count ${placedCount}/${placementEligible}\n\n\n`;
      message += `Placement percentage\n${placedCount}/${placementEligible}= ${placementPercentage}%\n\n`;
      message += `Yet to place ${yetToPlace}\n\n`;
      message += "Thank you all";

      return message;
    } catch (error) {
      console.error("Error generating Overall Stats WhatsApp message:", error);
      return `${getGreeting()}\n\nSo far placed students list\n\nError generating list.`;
    }
  };

  const handleDeleteCompany = async (companyId) => {
    const company = companies.find(c => c._id === companyId);
    setDeleteConfirm({ show: true, companyId, companyName: company?.name || "this company" });
  };

  const confirmDeleteCompany = async () => {
    const { companyId } = deleteConfirm;
    try {
      setIsLoading(true);
      const shortlistRes = await axios.delete(
        `https://vcetplacement.onrender.com/api/shortlist/deleteshortlist/${year}/${companyId}`
      );
      console.log("Shortlist delete:", shortlistRes.data);
      const companyRes = await axios.delete(
        `https://vcetplacement.onrender.com/api/company/deletecompany/${companyId}?year=${year}`
      );
      console.log("Company delete:", companyRes.data);
      toast.success("Company deleted successfully");
      setReloadTrigger((prev) => !prev);
    } catch (error) {
      console.error("Failed to delete company:", error.response?.data || error.message);
      toast.error("Failed to delete company");
    } finally {
      setIsLoading(false);
      setDeleteConfirm({ show: false, companyId: null, companyName: "" });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [studentInformationsDetail, setStudentInformationDetail] = useState([]);
  const [exportFilter, setExportFilter] = useState("all"); // all | selected | rejected

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`
        );
        setStudentInformationDetail(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [year]);

  console.log(studentInformationsDetail);

  // Fetch eligible students when modalYear changes
  useEffect(() => {
    if (showStudentSelect && formData && modalYear) {
      const fetchEligibleStudents = async () => {
        try {
          const [studentsRes, finalPlacedList] = await Promise.all([
            axios.get(`https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${modalYear}`),
            fetchFinalSelectedStudents(modalYear)
          ]);

          // Pre-parse criteria to handle empty strings/nulls
          const reqTenth = parseFloat(formData.tenth) || 0;
          const reqTwelfth = parseFloat(formData.twelfth) || 0;
          const reqDiploma = parseFloat(formData.diploma) || 0;
          const reqCGPA = parseFloat(formData.cgpa) || 0;
          const reqHOA = formData.historyofArrears !== "" && formData.historyofArrears !== null ? parseFloat(formData.historyofArrears) : Infinity;
          const reqArrear = formData.currentArrears !== "" && formData.currentArrears !== null ? parseFloat(formData.currentArrears) : Infinity;

          const processedStudents = studentsRes.data
            .filter(student => (student.studentPlacementInterest || "").trim().toLowerCase() === "yes")
            .map(student => {
              const sTenth = parseFloat(student.studentTenthPercentage) || 0;
              const sTwelfth = parseFloat(student.studentTwelthPercentage);
              const sDiploma = parseFloat(student.studentDiploma);
              const sCGPA = parseFloat(student.studentUGCGPA) || 0;
              const sArrear = parseFloat(student.studentCurrentArrears) || 0;
              const sHOA = parseFloat(student.studentHistoryOfArrears) || 0;

              // Academic eligibility
              const tenthOk = sTenth >= reqTenth;
              const cgpaOk = sCGPA >= reqCGPA;
              const twelfthOk = !isNaN(sTwelfth) && sTwelfth >= reqTwelfth;
              const diplomaOk = !isNaN(sDiploma) && sDiploma >= reqDiploma;
              const academicsOk = twelfthOk || diplomaOk;
              const arrearOk = sArrear <= reqArrear;
              const hoaOk = sHOA <= reqHOA;

              // Placement state filtering
              let placementStateOk = true;
              const studentPlacements = finalPlacedList.filter(p => {
                const pStudentId = p.studentId?._id || p.studentId;
                return pStudentId === student._id;
              });
              const isPlacedSomewhere = studentPlacements.length > 0;

              if (formData.includePlaced === "no") {
                placementStateOk = !isPlacedSomewhere;
              } else if (formData.includePlaced === "yes") {
                if (isPlacedSomewhere) {
                  placementStateOk = studentPlacements.some(p => {
                    const pCompanyId = p.companyId?._id || p.companyId;
                    return formData.allowedCompanies.includes(pCompanyId);
                  });
                }
              }

              const isEligible = tenthOk && academicsOk && cgpaOk && arrearOk && hoaOk && placementStateOk;
              return { ...student, isEligible };
            });

          setEligibleStudents(processedStudents);
          const initiallySelected = processedStudents.filter(s => s.isEligible).map(s => s._id);
          setSelectedStudents(initiallySelected);
        } catch (error) {
          console.error("Error fetching students:", error);
        }
      };
      fetchEligibleStudents();
    }
  }, [modalYear, showStudentSelect, formData]);

  // Calculate final status helper
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
    setIsLoading(true);
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
        const studentRole = entry.studentRole || null;

        return {
          id: student._id,
          regNo: student.studentRegisterNumber,
          name: student.studentName,
          rounds: {
            [company._id]: roundsData,
          },
          studentRole: studentRole
        };
      });
      console.log("🟦 NEW STUDENTS (Updated Data):", JSON.parse(JSON.stringify(newStudents)));
      // 🔹 Just replace the students list for that company
      setStudents(newStudents);

      // Populate selectedRoles with existing roles
      const initialRoles = {};
      newStudents.forEach((s) => {
        if (s.studentRole) {
          if (!initialRoles[s.id]) initialRoles[s.id] = {};
          initialRoles[s.id][company._id] = s.studentRole;
        }
      });
      setSelectedRoles((prev) => ({ ...prev, ...initialRoles }));

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
    } finally {
      setIsLoading(false);
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
          studentRole: selectedRoles[student.id || student._id]?.[selectedCompany._id] || null
        };
      });
      console.log("🟩 UPDATES (Final Payload to API):", JSON.parse(JSON.stringify(updates)));

      const response = await axios.put(
        "https://vcetplacement.onrender.com/api/shortlist/update-rounds",
        {
          year,
          updates,
        }
      );
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      await Promise.all(
        updates.map(async (update) => {
          // Only proceed if the student Passed (Final Result = true)
          if (update.finalResult === true) {
            const studentId = update.studentId;

            try {
              // A. Check if student is ALREADY placed
              let isAlreadyPlaced = false;
              try {
                const checkRes = await axios.get(
                  `https://vcetplacement.onrender.com/api/finalcompany/getstudent-individual-final-company/${studentId}?year=${year}`
                );
                if (checkRes.data && checkRes.data.companyId) {
                  isAlreadyPlaced = true;
                }
              } catch (checkErr) {
                // If 404/error, assume not placed
                console.log("Check placement error:", checkErr.message);
                isAlreadyPlaced = false;
              }

              // B. If NOT placed, set this company as final
              if (!isAlreadyPlaced) {
                console.log(`Auto-selecting student ${studentId} for ${selectedCompany.name}`);
                await axios.post(
                  `https://vcetplacement.onrender.com/api/finalcompany/set-company-as-final?year=${year}`,
                  {
                    studentId: studentId,
                    companyId: selectedCompany._id,
                  }
                );
              } else {
                console.log(`Student ${studentId} already placed. Skipping.`);
              }
            } catch (err) {
              console.error(`Error updating placement status for ${studentId}`, err);
            }
          }
        })
      );

      console.log("▶ Final Updates Sending", updates);
      toast("Rounds Update Successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        type: "success",
      });

      // Close popup immediately after showing toast
      handleClosePopup();

      // Refresh round stats for the current company
      const updatedStats = await fetchCompanyRoundStats(selectedCompany._id);
      setCompanyRoundStats(prev => ({
        ...prev,
        [selectedCompany._id]: updatedStats
      }));
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
    setSelectedRoles({});
  };

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
          <CollegeHeader />

          {/* Navigation */}
          <CompanyNavbar
            year={year}
            navigate={navigate}
            showStudentPopup={showStudentPopup}
            companySearchQuery={companySearchQuery}
            setCompanySearchQuery={setCompanySearchQuery}
            setShowForm={setShowForm}
            setShowRoundInsights={setShowRoundInsights}
            handleLogout={handleLogout}
          />
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
                  {companies
                    .filter(company =>
                      company.name.toLowerCase().includes(companySearchQuery.toLowerCase())
                    )
                    .map((company) => (
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

      <RoundInsightsModal
        showRoundInsights={showRoundInsights}
        setShowRoundInsights={setShowRoundInsights}
        showAnalytics={showAnalytics}
        setShowAnalytics={setShowAnalytics}
        showCompanyAnalytics={showCompanyAnalytics}
        setShowCompanyAnalytics={setShowCompanyAnalytics}
        selectedAnalyticsCompany={selectedAnalyticsCompany}
        setSelectedAnalyticsCompany={setSelectedAnalyticsCompany}
        companies={companies}
        companyRoundStats={companyRoundStats}
        maxRounds={maxRounds}
        totalRoundAttended={totalRoundAttended}
        totalRoundCleared={totalRoundCleared}
        studentInformationsDetail={studentInformationsDetail}
        totalPlacedStudents={totalPlacedStudents}
        generatePlacedStudentsMessage={generatePlacedStudentsMessage}
        generateOverallStatsMessage={generateOverallStatsMessage}
        year={year}
      />

      <StudentRoundsPopup
        showStudentPopup={showStudentPopup}
        selectedCompany={selectedCompany}
        students={students}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        exportFilter={exportFilter}
        setExportFilter={setExportFilter}
        selectedRoles={selectedRoles}
        setSelectedRoles={setSelectedRoles}
        isLoading={isLoading}
        handleClosePopup={handleClosePopup}
        handleRoundStatusChange={handleRoundStatusChange}
        handleFinalStatusToggle={handleFinalStatusToggle}
        handleFinalStatusChange={handleFinalStatusChange}
        calculateFinalStatus={calculateFinalStatus}
      />

      <AddCompanyForm
        showForm={showForm}
        setShowForm={setShowForm}
        handleSubmit={handleSubmit}
        companies={companies}
      />

      <StudentSelectionModal
        showStudentSelect={showStudentSelect}
        setShowStudentSelect={setShowStudentSelect}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        eligibleStudents={eligibleStudents}
        studentSearch={studentSearch}
        setStudentSearch={setStudentSearch}
        formData={formData}
        year={year}
        setReloadTrigger={setReloadTrigger}
        setShowForm={setShowForm}
      />

      {deleteConfirm.show && (
        <div className="admin-modal-overlay" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="admin-modal-content confirmation-modal glassmorphism" style={{ maxWidth: '400px', padding: '2.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#111827', fontWeight: '800' }}>Confirm Deletion</h2>
            <p style={{ marginBottom: '2rem', color: '#374151', fontSize: '1.05rem' }}>
              Are you sure you want to delete <strong>{deleteConfirm.companyName}</strong>? <br /><span style={{ fontSize: '0.9rem', color: '#ef4444' }}>This action cannot be undone.</span>
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
              <button
                className="admin-cancel-button"
                onClick={() => setDeleteConfirm({ show: false, companyId: null, companyName: "" })}
                style={{ margin: 0, padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: '600', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                No, Keep it
              </button>
              <button
                className="admin-nav-button logout"
                onClick={confirmDeleteCompany}
                style={{ margin: 0, padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', border: 'none', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {(isLoading || isDataLoading) && <Loader message="Loading data..." />}
    </>
  );
};

export default ManageCompanies;