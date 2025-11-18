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

  // Save selectedRoles to localStorage whenever it changes
  useEffect(() => {
    if (selectedCompany && Object.keys(selectedRoles).length > 0) {
      const existing = localStorage.getItem("studentRoles");
      let rolesMap = {};
      if (existing) {
        try {
          rolesMap = JSON.parse(existing);
        } catch (e) {
          console.error("Error parsing existing roles:", e);
        }
      }
      Object.entries(selectedRoles).forEach(([studentId, role]) => {
        rolesMap[`${studentId}_${selectedCompany._id}`] = role;
      });
      localStorage.setItem("studentRoles", JSON.stringify(rolesMap));
    }
  }, [selectedRoles, selectedCompany]);

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
    setIsLoading(true);
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
            const arrear = parseFloat(student.studentCurrentArrears) || 0;
            const hoa = parseFloat(student.studentHistoryOfArrears) || 0;

            const twelfthValid = !isNaN(twelfth) && twelfth >= parseFloat(newCompany.twelfth);
            const diplomaValid = !isNaN(diploma) && diploma >= parseFloat(newCompany.diploma);

            // If historyofArrears or currentArrears is empty/null, don't filter by it (allow all students)
            const historyArrearCheck = newCompany.historyofArrears === '' || newCompany.historyofArrears === null
              ? true
              : hoa <= parseFloat(newCompany.historyofArrears);

            const currentArrearCheck = newCompany.currentArrears === '' || newCompany.currentArrears === null
              ? true
              : arrear <= parseFloat(newCompany.currentArrears);

            return (
              tenth >= parseFloat(newCompany.tenth) &&
              (twelfthValid || diplomaValid) &&
              cgpa >= parseFloat(newCompany.cgpa) &&
              currentArrearCheck &&
              historyArrearCheck
            );
          });
      setEligibleStudents(eligible);
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
      const uniqueStudentIds = new Set(finalSelectedStudents.map(student => student.studentId));
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
      const finalSelectedStudents = await fetchFinalSelectedStudents(year);
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

      // Load roles from localStorage
      const storedRoles = localStorage.getItem("studentRoles");
      let rolesMap = {};
      if (storedRoles) {
        try {
          rolesMap = JSON.parse(storedRoles);
        } catch (e) {
          console.error("Error parsing roles from localStorage:", e);
        }
      }

      // Group students by role
      const roleGroups = {
        "Placed": [],
        "Internship": [],
        "Incubation": [],
        "Type": []
      };

      finalSelectedStudents.forEach(student => {
        const studentInfo = studentDetails.find(s => s._id === student.studentId);
        const companyInfo = companies.find(c => c._id === student.companyId);
        if (studentInfo) {
          const roleKey = `${student.studentId}_${student.companyId}`;
          const role = rolesMap[roleKey] || "Type"; // Default to "Type" if no role
          const studentData = {
            name: studentInfo.studentName,
            company: companyInfo?.name || 'Unknown Company'
          };
          if (role === "Placed" || role === "Full-time" || role === "Role Offered") {
            roleGroups["Placed"].push(studentData);
          } else if (role === "Internship") {
            roleGroups["Internship"].push(studentData);
          } else if (role === "Incubation") {
            roleGroups["Incubation"].push(studentData);
          } else {
            roleGroups["Type"].push(studentData);
          }
        }
      });

      // Remove duplicates within each group
      Object.keys(roleGroups).forEach(role => {
        const unique = new Map();
        roleGroups[role].forEach(student => {
          if (!unique.has(student.name)) {
            unique.set(student.name, student);
          }
        });
        roleGroups[role] = Array.from(unique.values());
      });

      const totalPlaced = Object.values(roleGroups).reduce((sum, group) => sum + group.length, 0);

      if (totalPlaced === 0) {
        return `${greeting}\n\nSo far placed students list\n\nNo placed students yet.`;
      }

      // Calculate batch years from year (assuming year is end year)
      const startYear = year - 4;
      const batch = `${startYear}-${year}`;

      // Calculate placement statistics
      const totalStudents = studentDetails.length;
      const placementInterested = Math.round(totalStudents * 0.93); // Approximate based on example
      const placementEligible = Math.round(totalStudents * 0.81); // Approximate based on example
      const placedCount = totalPlaced;
      const yetToPlace = placementEligible - placedCount;
      const placementPercentage = ((placedCount / placementEligible) * 100).toFixed(2);

      let message = `${greeting}\n\nSo far placed students list\n\n`;

      // Add each role section
      Object.keys(roleGroups).forEach(role => {
        const students = roleGroups[role];
        if (students.length > 0) {
          message += `${role}:\n`;
          students.forEach((student, index) => {
            message += `${index + 1}. ${student.name} - ${student.company}\n`;
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

  const handleDeleteCompany = async (companyId) => {
  try {
    const shortlistRes = await axios.delete(
      `https://vcetplacement.onrender.com/api/shortlist/deleteshortlist/${year}/${companyId}`
    );
    console.log("Shortlist delete:", shortlistRes.data);
    const companyRes = await axios.delete(
      `https://vcetplacement.onrender.com/api/company/deletecompany/${companyId}?year=${year}`
    );
    console.log("Company delete:", companyRes.data);
    setReloadTrigger((prev) => !prev);
  } catch (error) {
    console.error("Failed to delete company:", error.response?.data || error.message);
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

  useEffect(() => {
    const savedCompanies = localStorage.getItem("companies");
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  // Fetch eligible students when modalYear changes
  useEffect(() => {
    if (showStudentSelect && formData && modalYear) {
      const fetchEligibleStudents = async () => {
        try {
          const studentsRes = await axios.get(
            `https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${modalYear}`
          );
          const eligible = studentsRes.data.filter(student => {
            const tenth = parseFloat(student.studentTenthPercentage) || 0;
            const twelfth = parseFloat(student.studentTwelthPercentage);
            const diploma = parseFloat(student.studentDiploma);
            const cgpa = parseFloat(student.studentUGCGPA) || 0;
            const arrear = parseFloat(student.studentCurrentArrears) || 0;
            const hoa = parseFloat(student.studentHistoryOfArrears) || 0;

            const twelfthValid = !isNaN(twelfth) && twelfth >= parseFloat(formData.twelfth);
            const diplomaValid = !isNaN(diploma) && diploma >= parseFloat(formData.diploma);
            
            // If historyofArrears or currentArrears is empty/null, don't filter by it (allow all students)
            const historyArrearCheck = formData.historyofArrears === '' || formData.historyofArrears === null 
              ? true 
              : hoa <= parseFloat(formData.historyofArrears);
            
            const currentArrearCheck = formData.currentArrears === '' || formData.currentArrears === null 
              ? true 
              : arrear <= parseFloat(formData.currentArrears);

            return (
              tenth >= parseFloat(formData.tenth) &&
              (twelfthValid || diplomaValid) &&
              cgpa >= parseFloat(formData.cgpa) &&
              currentArrearCheck &&
              historyArrearCheck
            );
          });
          setEligibleStudents(eligible);
          setSelectedStudents([]); // Reset selection
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

      // Load roles from localStorage
      const storedRoles = localStorage.getItem("studentRoles");
      if (storedRoles) {
        try {
          const rolesMap = JSON.parse(storedRoles);
          const loadedRoles = {};
          newStudents.forEach(student => {
            const key = `${student.id}_${company._id}`;
            if (rolesMap[key]) {
              loadedRoles[student.id] = rolesMap[key];
            }
          });
          setSelectedRoles(loadedRoles);
        } catch (e) {
          console.error("Error loading roles from localStorage:", e);
        }
      }

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
          role: selectedRoles[student.id] || null,
        };
      });
      console.log("Sending updates", updates);

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

      // Handle localStorage merging safely
      try {
        const existingRoundsData = localStorage.getItem("studentRounds");
        let existingRounds = [];
        if (existingRoundsData) {
          const parsed = JSON.parse(existingRoundsData);
          if (Array.isArray(parsed)) {
            existingRounds = parsed;
          } else {
            console.warn("Invalid studentRounds data in localStorage, starting fresh.");
          }
        }

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

        // Also save roles separately for ManageStudents
        const rolesMap = {};
        students.forEach((student) => {
          const studentId = student.id || student._id;
          const role = selectedRoles[studentId];
          if (role) {
            rolesMap[`${studentId}_${selectedCompany._id}`] = role;
          }
        });
        localStorage.setItem("studentRoles", JSON.stringify(rolesMap));
      } catch (localError) {
        console.error("Failed to update localStorage:", localError);
        // Don't throw - API succeeded, localStorage is secondary
      }

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
      {(isLoading || isDataLoading) && <Loader message="Loading data..." />}
    </>
  );
};

export default ManageCompanies;