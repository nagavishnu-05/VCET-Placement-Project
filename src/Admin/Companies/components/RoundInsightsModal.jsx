import React from "react";
import { FaTimes } from "react-icons/fa";
import AnalyticsView from "./AnalyticsView";
import CompanyAnalyticsView from "./CompanyAnalyticsView";
import CompanyInsightsList from "./CompanyInsightsList";

const RoundInsightsModal = ({
  showRoundInsights,
  setShowRoundInsights,
  showAnalytics,
  setShowAnalytics,
  showCompanyAnalytics,
  setShowCompanyAnalytics,
  selectedAnalyticsCompany,
  setSelectedAnalyticsCompany,
  companies,
  companyRoundStats,
  maxRounds,
  totalRoundAttended,
  totalRoundCleared,
  studentInformationsDetail,
  totalPlacedStudents,
  generatePlacedStudentsMessage,
  year
}) => {
  if (!showRoundInsights) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content">
        <div className="admin-modal-header">
          <h2>Round Insights</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="view-analytics-btn"
              onClick={() => setShowAnalytics(prevState => !prevState)}
            >
              {showAnalytics ? 'Show Companies' : 'View Analytics'}
            </button>
            <button className="admin-modal-close" onClick={() => setShowRoundInsights(false)}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div style={{ padding: '1rem' }}>
          {showAnalytics ? (
            <AnalyticsView
              maxRounds={maxRounds}
              totalRoundAttended={totalRoundAttended}
              totalRoundCleared={totalRoundCleared}
              companies={companies}
              studentInformationsDetail={studentInformationsDetail}
              totalPlacedStudents={totalPlacedStudents}
              generatePlacedStudentsMessage={generatePlacedStudentsMessage}
            />
          ) : showCompanyAnalytics && selectedAnalyticsCompany ? (
            <CompanyAnalyticsView
              selectedAnalyticsCompany={selectedAnalyticsCompany}
              setShowCompanyAnalytics={setShowCompanyAnalytics}
              companyRoundStats={companyRoundStats}
            />
          ) : (
            <CompanyInsightsList
              companies={companies}
              companyRoundStats={companyRoundStats}
              setSelectedAnalyticsCompany={setSelectedAnalyticsCompany}
              setShowCompanyAnalytics={setShowCompanyAnalytics}
              year={year}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundInsightsModal;
