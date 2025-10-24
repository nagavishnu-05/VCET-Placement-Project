import React from "react";
import { FaTimes } from "react-icons/fa";

const AddCompanyForm = ({ showForm, setShowForm, handleSubmit }) => {
  if (!showForm) return null;

  return (
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
  );
};

export default AddCompanyForm;
