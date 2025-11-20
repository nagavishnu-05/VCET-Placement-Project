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
import Loader from "../../components/Loader";

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
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/student/getStudentInfo?year=${year}`
        );
        setStudentInformationDetail(res.data);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [year]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://vcetplacement.onrender.com/api/company/ShowAllcompanies?year=${year}`
        );
        setCompanies(res.data);
        console.log("✅ Companies fetched:", res.data);
      } catch (error) {
        console.error("❌ Error fetching companies:", error);
      } finally {
        setIsLoading(false);
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
      .filter(([key]) => key !== "role")
      .every(([, status]) => status === "selected");

    return allRoundsSelected ? "Selected" : "Rejected";
  };

  const handleViewRounds = async (student) => {
    if (!student?._id) {
      console.error("Invalid student data");
      toast.error("Invalid student data");
      return;
    }

    setIsLoading(true);
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
        companies: Array.isArray(res.data.companies) ? res.data.companies : [],
      };

      setStudentView(combinedData);

      try {
        const finalCompanyRes = await axios.get(
          `https://vcetplacement.onrender.com/api/finalcompany/getstudent-individual-final-company/${student._id}?year=${year}`
        );

        if (finalCompanyRes.data && finalCompanyRes.data.companyId) {
          setSelectedOffers((prev) => ({
            ...prev,
            [student._id]: finalCompanyRes.data.companyId._id,
          }));
        } else {
          setSelectedOffers((prev) => ({
            ...prev,
            [student._id]: "",
          }));
        }
      } catch (finalErr) {
        console.log("No final company set yet or error fetching:", finalErr);
        setSelectedOffers((prev) => ({
          ...prev,
          [student._id]: "",
        }));
      }

      setShowRoundDetails(true);
    } catch (err) {
      console.error("Error fetching student rounds:", err);
      toast.error("Failed to load student rounds. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedCompanies = (companiesData = []) => {
    if (!Array.isArray(companiesData)) return [];

    return companiesData
      .filter((companyData) => companyData && companyData.companyId)
      .map((companyData) => {
        const company = companies.find(
          (c) => c && c._id === companyData.companyId
        );
        if (!company || !company.name) return null;

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

  const handleOfferSelection = async (studentId, companyId) => {
    setIsLoading(true);
    try {
      const company = companies.find((c) => c._id === companyId);
      const companyName = company ? company.name : "the company";

      await axios.post(
        `https://vcetplacement.onrender.com/api/finalcompany/set-company-as-final?year=${year}`,
        {
          studentId: studentId,
          companyId: companyId,
        }
      );

      setSelectedOffers((prev) => ({
        ...prev,
        [studentId]: companyId,
      }));

      toast(`Offer Updated to ${companyName}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        type: "success",
      });
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
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED EXPORT FUNCTION START ---
  const handleExportStudentRounds = async (student) => {
    if (!student || !student._id) {
      toast.error("Invalid Student Selected");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(
        `https://vcetplacement.onrender.com/api/shortlist/${student._id}/companies-rounds?year=${year}`
      );

      const apiData = res.data;
      if (!apiData || !apiData.companies || apiData.companies.length === 0) {
        toast.warn("No company round details found for this student.");
        setIsLoading(false);
        return;
      }

      // 1. Calculate Maximum Rounds dynamically across all companies for this student
      let maxRounds = 0;
      apiData.companies.forEach((comp) => {
        if (comp.rounds) {
          const roundCount = Object.keys(comp.rounds).length;
          if (roundCount > maxRounds) maxRounds = roundCount;
        }
      });

      // 2. Build the Rows (One row per company)
      const exportRows = apiData.companies.map((comp) => {
        // NOTE: Removed "Student Name" and "Register Number" from the row object
        const row = {
          "Company Name": comp.companyName || "Unknown",
        };

        // Dynamic Columns for Rounds (1 to maxRounds)
        for (let i = 1; i <= maxRounds; i++) {
          const roundKey = `round${i}`;
          let status = ""; // Empty if round doesn't exist for this company

          if (comp.rounds && comp.rounds.hasOwnProperty(roundKey)) {
            status = comp.rounds[roundKey] === true ? "Selected" : "Rejected";
          }

          row[`Round ${i}`] = status;
        }

        // Final Status
        row["Final Status"] = comp.finalResult === true ? "Selected" : "Rejected";

        return row;
      });

      // 3. Generate Excel
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Companies Report");
      
      // NOTE: Set the Filename to include the Register Number
      XLSX.writeFile(wb, `${student.studentRegisterNumber}_${student.studentName}_Report.xlsx`);

      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Error exporting student rounds:", error);
      toast.error("Failed to export excel data.");
    } finally {
      setIsLoading(false);
    }
  };
  // --- UPDATED EXPORT FUNCTION END ---

  const handleExportAllStudents = async () => {
    if (!studentInformationsDetail || studentInformationsDetail.length === 0) {
      toast.warn("No students found to export.");
      return;
    }

    if (!companies || companies.length === 0) {
      toast.warn("No companies found to generate headers.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch details for ALL students in parallel
      const allStudentPromises = studentInformationsDetail.map(async (student) => {
        try {
          const res = await axios.get(
            `https://vcetplacement.onrender.com/api/shortlist/${student._id}/companies-rounds?year=${year}`
          );
          return {
            student: student,
            // If res.data.companies exists use it, otherwise empty array
            studentCompanyData: res.data && res.data.companies ? res.data.companies : [] 
          };
        } catch (err) {
          console.error(`Error fetching rounds for student ${student.studentRegisterNumber}`, err);
          // If fetch fails, return empty data so the student still appears in the Excel with "Not Eligible"
          return { student: student, studentCompanyData: [] };
        }
      });

      const results = await Promise.all(allStudentPromises);

      // 2. Construct the Rows
      const exportRows = results.map(({ student, studentCompanyData }) => {
        // Start with Student Details
        const row = {
          "Student Register Number": student.studentRegisterNumber,
          "Student Name": student.studentName,
        };

        // 3. Iterate through the GLOBAL list of companies to create columns
        companies.forEach((globalCompany) => {
          // Check if this student has data for this specific company
          const foundData = studentCompanyData.find(
            (sc) => sc.companyId === globalCompany._id
          );

          if (foundData) {
            // Data exists: Check Final Result
            row[globalCompany.name] = foundData.finalResult === true ? "Selected" : "Rejected";
          } else {
            // No data exists: Set as Not Eligible
            row[globalCompany.name] = "     -      ";
          }
        });

        return row;
      });

      // 4. Generate Excel
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Overall Placement Status");
      
      XLSX.writeFile(wb, "Overall_Student_Status_Report.xlsx");

      toast.success("Exported successfully!");

    } catch (error) {
      console.error("Error exporting all students:", error);
      toast.error("Failed to export data.");
    } finally {
      setIsLoading(false);
    }
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
          studentView={studentView}
        />
      </div>
      {isLoading && <Loader message="Processing..." />}
    </div>
  );
};

export default ManageStudents;