import React from "react";
import { FaTimes, FaSearch, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const StudentRoundsPopup = ({
  showStudentPopup,
  selectedCompany,
  students,
  searchQuery,
  setSearchQuery,
  exportFilter,
  setExportFilter,
  selectedRoles,
  setSelectedRoles,
  isLoading,
  handleClosePopup,
  handleRoundStatusChange,
  handleFinalStatusToggle,
  handleFinalStatusChange,
  calculateFinalStatus
}) => {
  if (!showStudentPopup || !selectedCompany) return null;

  const filteredStudents = students.filter((student) =>
    student?.name?.toLowerCase?.().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
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
        return {
          "S.No": index + 1,
          "Name": student.name,
        };
      } else {
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
        row["Role"] = selectedRoles[student.id] || "";
        return row;
      }
    });

    if (exportData.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Rounds");
    XLSX.writeFile(wb, fileName);
  };

  return (
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
              onClick={handleExport}
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
          <table className="admin-students-table" style={{ margin: '0 auto' }}>
            <thead>
              <tr>
                <th>Reg. No.</th>
                <th>Name</th>
                {[...Array(selectedCompany.rounds)].map((_, i) => (
                  <th key={i}>Round {i + 1}</th>
                ))}
                <th>Final Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredStudents]
                .sort((a, b) => {
                  const roundsA = a.rounds[selectedCompany._id] || {};
                  const roundsB = b.rounds[selectedCompany._id] || {};

                  const finalA = calculateFinalStatus(roundsA, selectedCompany.rounds);
                  const finalB = calculateFinalStatus(roundsB, selectedCompany.rounds);

                  const statusOrder = { selected: 0, rejected: 1 };
                  if (statusOrder[finalA] !== statusOrder[finalB]) {
                    return statusOrder[finalA] - statusOrder[finalB];
                  }

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
                        {finalStatus === "selected" ? (
                          <select
                            value={selectedRoles[student.id]?.[selectedCompany._id] || ""}
                            onChange={(e) => {
                              setSelectedRoles(prev => ({
                                ...prev,
                                [student.id]: {
                                  ...(prev[student.id] || {}),
                                  [selectedCompany._id]: e.target.value
                                }
                              }));
                            }}
                            style={{
                              padding: '0.25rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem',
                              width: '150px'
                            }}
                          >
                            <option value="">Select Role</option>
                            <option value="Role Offered">Role Offered</option>
                            <option value="Internship">Internship</option>
                            <option value="Incubation">Incubation</option>
                          </select>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentRoundsPopup;