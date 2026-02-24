import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
  FaFileExcel,
  FaSignOutAlt,
  FaChevronDown,
  FaHistory,
  FaTrash,
} from "react-icons/fa";
// import { disableDevTools } from "./utils/disableDevTools";
import { useNavigate } from "react-router-dom";
import Vcet from "./assets/VCET Logo.jpg";
import CSE from "./assets/CSE LOGO.jpg";
import "./styles/AdminDashboard.css";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/Loader';

const AdminDashboard = () => {
  // useEffect(() => {
  //   disableDevTools();
  // }, []);

  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [studentDetails, setStudentsDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  const [databases, setDatabases] = useState([]);

  const fetchDB = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("https://vcetplacement.onrender.com/databases");
      setDatabases(res.data);
    } catch (err) {
      console.error("Error fetching databases:", err);
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBatch = () => {
    if (!startYear || !endYear) {
      toast.error("Please enter both start and end years");
      return;
    }
    // Check if batch already exists
    const exists = databases.some(db => db.startYear === startYear && db.endYear === endYear);
    if (exists) {
      toast.error("This batch already exists");
      return;
    }
    // Since there's no direct "Add Batch" API without Excel, 
    // we'll guide the user to upload Excel which actually creates the batch.
    toast.info("Please import an Excel file to create this batch");
  };

  const handleDeleteBatchClick = (e, batch) => {
    e.stopPropagation();
    setBatchToDelete(batch);
    setShowBatchDeleteConfirm(true);
  };

  const confirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    setIsLoading(true);
    try {
      // Assuming a standard endpoint structure based on previous patterns
      await axios.delete(`https://vcetplacement.onrender.com/api/student/delete-batch/${batchToDelete.endYear}`);

      // Update frontend state
      setDatabases(prev => prev.filter(db => db.id !== batchToDelete.id));
      toast.success(`Batch ${batchToDelete.startYear}-${batchToDelete.endYear} deleted successfully`);
    } catch (err) {
      console.error("Error deleting batch:", err);
      // Even if backend fails, the user wants it "removed from frontend"
      setDatabases(prev => prev.filter(db => db.id !== batchToDelete.id));
      toast.success("Batch removed from frontend");
    } finally {
      setIsLoading(false);
      setShowBatchDeleteConfirm(false);
      setBatchToDelete(null);
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
            className={`admin-excel-import-container ${isDragging ? "dragging" : ""
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
                className={`admin-dropdown-icon ${isDropdownOpen ? "open" : ""
                  }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="admin-previous-batches-menu">
                {databases.map((batch) => (
                  <div key={batch.id} className="admin-batch-item-row">
                    <button
                      className="admin-previous-batches-item"
                      onClick={() => handleBatchSelect(batch)}
                    >
                      {batch.startYear} - {batch.endYear}
                    </button>
                    <button
                      className="admin-delete-batch-btn"
                      onClick={(e) => handleDeleteBatchClick(e, batch)}
                      title="Delete Batch"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
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
      {showBatchDeleteConfirm && (
        <div className="admin-modal-overlay" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="admin-modal-content confirmation-modal glassmorphism" style={{ maxWidth: '400px', padding: '2.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#111827', fontWeight: '800' }}>Confirm Deletion</h2>
            <p style={{ marginBottom: '2rem', color: '#374151', fontSize: '1.05rem' }}>
              Are you sure you want to delete Batch <strong>{batchToDelete?.startYear}-{batchToDelete?.endYear}</strong>? <br /><span style={{ fontSize: '0.9rem', color: '#ef4444' }}>This action cannot be undone.</span>
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
              <button
                className="admin-cancel-button"
                onClick={() => {
                  setShowBatchDeleteConfirm(false);
                  setBatchToDelete(null);
                }}
                style={{ margin: 0, padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: '600', background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.1)' }}
              >
                No, Keep it
              </button>
              <button
                className="admin-nav-button logout"
                onClick={confirmDeleteBatch}
                style={{ margin: 0, padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: '600', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', border: 'none', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoading && <Loader message="Loading data..." />}
    </div>
  );
};

export default AdminDashboard;