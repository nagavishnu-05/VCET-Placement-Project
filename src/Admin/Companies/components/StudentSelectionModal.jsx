import React from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import axios from "axios";

const StudentSelectionModal = ({
  showStudentSelect,
  setShowStudentSelect,
  selectedStudents,
  setSelectedStudents,
  eligibleStudents,
  studentSearch,
  setStudentSearch,
  formData,
  year,
  setReloadTrigger,
  setShowForm
}) => {
  if (!showStudentSelect) return null;

  const filteredEligibleStudents = eligibleStudents
    .filter(student =>
      student.studentName && student.studentName.toLowerCase().includes(studentSearch.toLowerCase())
    )
    .sort((a, b) => {
      const regA = String(a.studentRegisterNumber || '');
      const regB = String(b.studentRegisterNumber || '');
      return regA.localeCompare(regB);
    });

  const handleAddCompany = async () => {
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
      try {
        const shortlistRes = await axios.post(
          "https://vcetplacement.onrender.com/api/shortlist/addshortlist",
          {
            year: year,
            companyId: companyId,
            studentIds: selectedStudents
          }
        );
        console.log("Shortlist added:", shortlistRes.data);

        // Initialize rounds with default false (rejected) for all rounds
        const totalRounds = formData.rounds;
        const updates = selectedStudents.map(studentId => {
          const roundBooleanMap = {};
          for (let i = 1; i <= totalRounds; i++) {
            roundBooleanMap[`round${i}`] = false;
          }
          return {
            studentId: studentId,
            companyId: companyId,
            rounds: roundBooleanMap,
            finalResult: false,
            role: null,
          };
        });

        try {
          await axios.put(
            "https://vcetplacement.onrender.com/api/shortlist/update-rounds",
            {
              year,
              updates,
            }
          );
          console.log("Rounds initialized successfully");
        } catch (updateError) {
          console.error("Error initializing rounds:", updateError);
        }

        setSelectedStudents(null);
      } catch (error) {
        console.error("Shortlist Error: ", error);
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2>Students</h2>
          <button className="admin-modal-close" onClick={() => setShowStudentSelect(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="admin-form-actions" style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="checkbox"
              id="selectAll"
              style={{ accentColor: 'blue' }}
              onChange={(e) => {
                const newSelected = e.target.checked ? eligibleStudents.map(s => s._id) : [];
                setSelectedStudents(newSelected);
              }}
            />
            <label htmlFor="selectAll">Select All ({selectedStudents.length})</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="admin-search-container" style={{ marginRight: '1rem' }}>
              <FaSearch className="admin-search-icon" />
              <input
                type="text"
                placeholder="Search students by name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                style={{
                  padding: '0.5rem 2.5rem 0.5rem 2rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  width: '200px'
                }}
              />
            </div>
            <button
              className="admin-submit-button"
              onClick={handleAddCompany}
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

        <div className="admin-students-table-container">
          <table className="admin-students-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Select</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Register No.</th>
                <th style={{ textAlign: 'center', width: '200px' }}>Name</th>
                <th style={{ textAlign: 'center' }}>10th %</th>
                <th style={{ textAlign: 'center' }}>12th %</th>
                <th style={{ textAlign: 'center' }}>Diploma %</th>
                <th style={{ textAlign: 'center' }}>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredEligibleStudents.map((student) => (
                <tr key={student._id}>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      style={{ accentColor: 'blue' }}
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
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>{student.studentRegisterNumber}</td>
                  <td style={{ textAlign: 'left' }}>{student.studentName}</td>
                  <td style={{ textAlign: 'center' }}>{student.studentTenthPercentage}</td>
                  <td style={{ textAlign: 'center' }}>{student.studentTwelthPercentage}</td>
                  <td style={{ textAlign: 'center' }}>{student.studentDiploma}</td>
                  <td style={{ textAlign: 'center' }}>{student.studentUGCGPA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentSelectionModal;
