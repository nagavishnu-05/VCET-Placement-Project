import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import axios from "axios";

// Import components
import CollegeHeader from "../Companies/components/CollegeHeader";
import StudentNavbar from "./components/StudentNavbar";
import StudentTable from "./components/StudentTable";
import StudentRoundsModal from "./components/StudentRoundsModal";

import "../../styles/ManageStudents.css";

const ManageStudents = () => {
  const location = useLocation();
  const batch = location.state?.batch;
  const year =
    localStorage.getItem("selectedYear") || location.state?.batch?.endYear;

  const [showRoundDetails, setShowRoundDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [studentInformationsDetail, setStudentInformationDetail] = useState([]);
  const [studentRounds, setStudentRounds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffers, setSelectedOffers] = useState({});
  const [studentRoles, setStudentRoles] = useState({});
  const [studentView, setStudentView] = useState({
              studentId: "",
              companies: [],
            });
  const handleLogout = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    try {
      const savedRoles = localStorage.getItem("studentRoles");
      if (savedRoles) {
        setStudentRoles(JSON.parse(savedRoles));
      }
    } catch (e) {
      console.log("Error loading roles from localStorage:", e);
    }
  }, []);

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

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       const res = await axios.get(
  //         `https://vcetplacement.onrender.com/api/company/ShowAllcompanies?year=${year}`
  //       );
  //       setCompanies(res.data);
  //       console.log("Companies fetched:", res.data);

  //       const studentRoundsMap = {};
  //       for (const company of res.data) {
  //         try {
  //           const shortlistRes = await axios.get(
  //             `https://vcetplacement.onrender.com/api/shortlist/getshortlist/${year}/${company._id}`
  //           );
  //           const shortlisted = shortlistRes.data;
  //           shortlisted.forEach((entry) => {
  //             const studentId = entry.studentId._id;
  //             if (!studentRoundsMap[studentId]) studentRoundsMap[studentId] = {};
  //             const roundsData = {};
  //             for (let i = 1; i <= company.rounds; i++) {
  //               const key = `round${i}`;
  //               roundsData[key] = entry.rounds?.[key] === true ? "selected" : "rejected";
  //             }
  //             let role = entry.role;
  //             if (!role) {
  //               try {
  //                 const localRounds = JSON.parse(localStorage.getItem("studentRounds") || "[]");
  //                 const studentRound = localRounds.find(sr => sr.studentId === studentId);
  //                 if (studentRound?.rounds?.[company._id]?.role) {
  //                   role = studentRound.rounds[company._id].role;
  //                 }
  //               } catch (e) {
  //                 console.log("Error reading from localStorage:", e);
  //               }
  //             }

  //             roundsData.role = role || null;

  //             if (role) {
  //               setStudentRoles(prev => ({
  //                 ...prev,
  //                 [`${studentId}_${company._id}`]: role
  //               }));
  //             }
  //             studentRoundsMap[studentId][company._id] = roundsData;
  //           });
  //         } catch (e) {
  //           console.log(`Error fetching shortlist for company ${company._id}:`, e);
  //         }
  //       }


  //       const studentRoundsArray = Object.entries(studentRoundsMap).map(([studentId, rounds]) => ({ studentId, rounds }));
  //       setStudentRounds(studentRoundsArray);
  //       console.log("Student round" , studentRounds);
  //       console.log("Student rounds fetched:", studentRoundsArray);
  //     } catch (error) {
  //       console.error("Error fetching companies:", error);
  //     }
  //   };

  //   loadData();

  //   const intervalId = setInterval(loadData, 10000);

  //   return () => clearInterval(intervalId);
  // }, [year]);

  useEffect(() => {
  const loadData = async () => {
    try {
      const res = await axios.get(
        `https://vcetplacement.onrender.com/api/company/ShowAllcompanies?year=${year}`
      );
      setCompanies(res.data);
      console.log("✅ Companies fetched:", res.data);
    } catch (error) {
      console.error("❌ Error fetching companies:", error);
    }
  };

  loadData();
}, [year]);


  useEffect(() => {
  if (studentView && Object.keys(studentView).length > 0) {
    console.log("✅ Updated studentView:", studentView);
  }
}, [studentView]);

const calculateFinalStatus = (rounds, company) => {
  if (!rounds || !company) return "Rejected";

  const companyRounds = rounds[company._id];
  if (!companyRounds) return "Rejected";

  const allRoundsSelected = Object.entries(companyRounds)
    .filter(([key]) => key !== 'role')
    .every(([, status]) => status === "selected");

  return allRoundsSelected ? "Selected" : "Rejected";
};

const handleViewRounds = async (student) => {
  if (!student?._id) {
    console.error("Invalid student data");
    toast.error("Invalid student data");
    return;
  }

  try {
    const res = await axios.get(
      `https://vcetplacement.onrender.com/api/shortlist/${student._id}/companies-rounds?year=${year}`
    );

    if (!res.data) {
      throw new Error("No data received from server");
    }

    const combinedData = {
      ...res.data,
      studentName: student.studentName || "",
      studentRegisterNumber: student.studentRegisterNumber || "",
      studentId: student._id,
      companies: Array.isArray(res.data.companies) ? res.data.companies : []
    };

    setStudentView(combinedData);
    setShowRoundDetails(true);

    const selectedList = getSelectedCompanies(combinedData.companies);
    if (selectedList.length === 1) {
      setSelectedOffers(prev => ({
        ...prev,
        [student._id]: selectedList[0].companyId,
      }));
    }
  } catch (err) {
    console.error("Error fetching student rounds:", err);
    toast.error("Failed to load student rounds. Please try again.");
  }
};

const getSelectedCompanies = (companiesData = []) => {
  if (!Array.isArray(companiesData)) return [];
  
  return companiesData
    .filter(companyData => companyData && companyData.companyId)
    .map(companyData => {
      const company = companies.find(c => c && c._id === companyData.companyId);
      if (!company || !company.name) return null;
      
      const finalResult = companyData.finalResult;
      if (finalResult === true || finalResult === "Selected") {
        return { 
          companyId: companyData.companyId, 
          companyName: company.name 
        };
      }
      return null;
    })
    .filter(Boolean);
};

  const handleOfferSelection = async (studentId, companyId) => {
    try {
      setSelectedOffers(prev => ({
        ...prev,
        [studentId]: companyId
      }));
      
      const company = companies.find(c => c._id === companyId);
      const companyName = company ? company.name : "the company";

      toast("Offer Updated", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        type: "success",
      });

      setShowRoundDetails(false);

      console.log(`Student ${studentId} selected offer from company ${companyId} (${companyName})`);
    } catch (error) {
      console.error("Error saving offer selection:", error);
      toast("Failed to save offer selection.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        type: "error",
      });
    }
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
          if (round === 'role') {
            const roleKey = `${student._id}_${companyId}`;
            if (studentRoles[roleKey]) {
              exportData[0][`${company.name} - Role`] = studentRoles[roleKey];
            }
          } else {
            exportData[0][
              `${company.name} - ${round.replace("round", "Round ")}`
            ] = status.charAt(0).toUpperCase() + status.slice(1);
          }
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

        const roleKey = `${student._id}_${company._id}`;
        if (studentRoles[roleKey]) {
          row[`${company.name} - Role`] = studentRoles[roleKey];
        }
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Students Rounds");
    XLSX.writeFile(wb, "All_Students_Rounds_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-animation p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-1"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-2"></div>
        <div className="absolute -bottom-40 left-40 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 blob-3"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <CollegeHeader />

        <StudentNavbar
          batch={batch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleExportAllStudents={handleExportAllStudents}
          handleLogout={handleLogout}
        />

        <div className="admin-dashboard-content">
          <ToastContainer />
          <StudentTable
            studentInformationsDetail={studentInformationsDetail}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleViewRounds={handleViewRounds}
            handleExportStudentRounds={handleExportStudentRounds}
            handleExportAllStudents={handleExportAllStudents}
          />
        </div>

        <StudentRoundsModal
          showRoundDetails={showRoundDetails}
          setShowRoundDetails={setShowRoundDetails}
          selectedStudent={selectedStudent}
          companies={companies}
          selectedOffers={selectedOffers}
          handleOfferSelection={handleOfferSelection}
          calculateFinalStatus={calculateFinalStatus}
          studentRoles={studentRoles}
          studentView = {studentView}
        />
      </div>
    </div>
  );
};

export default ManageStudents;