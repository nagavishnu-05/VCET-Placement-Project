import React from "react";
import { FaFileExcel, FaSearch } from "react-icons/fa";

const StudentTable = ({
  studentInformationsDetail,
  searchQuery,
  setSearchQuery,
  handleViewRounds,
  handleExportStudentRounds,
  handleExportAllStudents
}) => {
  return (
    <>
      <div className="manage-students-header">
        <h2 className="manage-students-title">Students</h2>
        <div className="student-header-right">
          <div className="student-search-container">
            <FaSearch className="student-search-icon" />
            <input
              type="text"
              placeholder="Search by Name or Reg. No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              .filter((student) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  student.studentName.toLowerCase().includes(query) ||
                  student.studentRegisterNumber
                    .toString()
                    .includes(query)
                );
              })
              .sort((a, b) => a.studentRegisterNumber - b.studentRegisterNumber)
              .map((student) => (
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
    </>
  );
};

export default StudentTable;
