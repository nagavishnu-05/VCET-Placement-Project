import React, { useEffect , useState } from "react";
import Head from "next/head";
import {
  FaFileExcel,
  FaSignOutAlt,
  FaChevronDown,
  FaHistory,
} from "react-icons/fa";
import { disableDevTools } from "./utils/disableDevTools";
import { useNavigate } from "react-router-dom";
import Vcet from "./assets/VCET Logo.jpg";
import CSE from "./assets/CSE LOGO.jpg";
import "./styles/AdminDashboard.css";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  useEffect(() => {
    disableDevTools();
  }, []);

  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studentDetails, setStudentsDetails] = useState([]);

  const [databases, setDatabases] = useState([]);

  const fetchDB = async () => {
      try {
        const res = await axios.get("https://vcetplacement.onrender.com/databases");
        setDatabases(res.data);
      } catch (err) {
        console.error("Error fetching databases:", err);
      }
    };

  useEffect(() => {
    fetchDB();
  }, []);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("excel", file);
    formData.append("year", endYear);

    try {
      const res = await axios.post(
        "https://vcetplacement.onrender.com/api/student/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setStudentsDetails(res.data.students);
      toast('Rounds Update Successfully', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              type: "success"
              });
      fetchDB();
    } catch (err) {
      console.error(err);
      toast('Excel Upload failed due to network error (or) File format error', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        type: "error",
      });

    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (
      file &&
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      navigate("/admin/companies");
    }
  };

  const handleBatchSelect = async (batch) => {
    try {
      const res = await axios.get(
        `https://vcetplacement.onrender.com/getdbprevious?year=${batch.endYear}`
      );
      const data = res.data;
      console.log(data.collections);
      localStorage.setItem("selectedYear", batch.endYear);
      navigate("/admin/companies", { state: { batch } });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animation p-4 relative overflow-hidden">
      <Head>
        <title>VCET Placement Portal | Admin Dashboard</title>
        <meta
          name="description"
          content="Admin dashboard for managing student placements, company details, and recruitment processes at VCET"
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
        <ToastContainer />

        {/* Navigation */}
        <div className="admin-navbar">
          <div className="batch-info">
            <span className="batch-label">Batch:</span>
            <div className="admin-year-inputs">
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="Start Year"
                className="admin-year-input"
              />
              <span className="admin-year-separator">-</span>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="End Year"
                className="admin-year-input"
              />
            </div>
          </div>

          <div
            className={`admin-excel-import-container ${
              isDragging ? "dragging" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="admin-excel-file-input"
              id="excel-file"
            />
            <label htmlFor="excel-file" className="excel-import-button">
              <FaFileExcel className="admin-excel-icon" />
              Import from Excel
            </label>
          </div>

          <div className="admin-previous-batches">
            <button
              className="admin-previous-batches-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FaHistory className="admin-nav-icon" />
              Previous Batches
              <FaChevronDown
                className={`admin-dropdown-icon ${
                  isDropdownOpen ? "open" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="admin-previous-batches-menu">
                {/* {databases.map((batch) => (
                  <button
                    key={batch.id}
                    className="admin-previous-batches-item"
                    onClick={() => handleBatchSelect(batch)}
                  >
                    {batch.startYear} - {batch.endYear}
                  </button>
                ))} */}

                {databases.map((batch) => (
                <button
                  key={batch.id}
                  className="admin-previous-batches-item"
                  onClick={() => handleBatchSelect(batch)}
                >
                  {batch.startYear} - {batch.endYear}
                </button>
              ))}
              </div>
            )}
          </div>

          <button className="admin-nav-button logout" onClick={handleLogout}>
            <FaSignOutAlt className="admin-nav-icon" />
            Logout
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="admin-dashboard-content">
          <div className="admin-welcome">
            <h2>Welcome to Admin Dashboard</h2>
            <p>
              Please import an Excel file to manage companies or select a
              previous batch to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;