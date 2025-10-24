import React from "react";
import { Bar } from 'react-chartjs-2';
import { FaArrowLeft } from "react-icons/fa";

const CompanyAnalyticsView = ({
  selectedAnalyticsCompany,
  setShowCompanyAnalytics,
  companyRoundStats
}) => {
  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <button
          className="back-arrow-btn"
          onClick={() => setShowCompanyAnalytics(false)}
          title="Back to Companies"
        >
          <FaArrowLeft />
        </button>
        <h2>{selectedAnalyticsCompany.name.toUpperCase()} Analytics</h2>
      </div>
      <div className="analytics-card">
        <h3>{selectedAnalyticsCompany.name.toUpperCase()} - Round-wise Performance</h3>
        <div className="analytics-stats">
          <div className="chart-container">
            <Bar
              data={{
                labels: Array.from({ length: selectedAnalyticsCompany.rounds }, (_, i) => `Round ${i + 1}`),
                datasets: [
                  {
                    label: 'Students Attended',
                    data: Array.from({ length: selectedAnalyticsCompany.rounds }, (_, i) => {
                      const stats = companyRoundStats[selectedAnalyticsCompany._id];
                      return stats?.rounds?.[i + 1]?.attended || 0;
                    }),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    order: 2
                  },
                  {
                    label: 'Students Selected',
                    data: Array.from({ length: selectedAnalyticsCompany.rounds }, (_, i) => {
                      const stats = companyRoundStats[selectedAnalyticsCompany._id];
                      return stats?.rounds?.[i + 1]?.selected || 0;
                    }),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    order: 1
                  },
                  {
                    label: 'Students Rejected',
                    data: Array.from({ length: selectedAnalyticsCompany.rounds }, (_, i) => {
                      const stats = companyRoundStats[selectedAnalyticsCompany._id];
                      const roundData = stats?.rounds?.[i + 1];
                      return (roundData?.attended || 0) - (roundData?.selected || 0);
                    }),
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    order: 3
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: '#333'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#333'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#333'
                    }
                  },
                  title: {
                    display: true,
                    text: `${selectedAnalyticsCompany.name} Round-wise Performance`,
                    color: '#333'
                  },
                  datalabels: {
                    display: true,
                    color: '#333',
                    font: {
                      weight: 'bold',
                      size: 12
                    },
                    formatter: (value) => value > 0 ? value : ''
                  }
                }
              }}
            />
          </div>
          <div className="chart-container">
            <Bar
              data={{
                labels: Array.from({ length: selectedAnalyticsCompany.rounds }, (_, i) => `Round ${i + 1}`),
                datasets: [{
                  label: 'Success Rate (%)',
                  data: Array.from({ length: selectedAnalyticsCompany.rounds }, (_, i) => {
                    const stats = companyRoundStats[selectedAnalyticsCompany._id];
                    const roundData = stats?.rounds?.[i + 1];
                    const attended = roundData?.attended || 0;
                    const selected = roundData?.selected || 0;
                    return attended > 0 ? (selected / attended) * 100 : 0;
                  }),
                  backgroundColor: 'rgba(255, 159, 64, 0.5)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: value => value + '%',
                      color: '#333'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#333'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#333'
                    }
                  },
                  title: {
                    display: true,
                    text: `${selectedAnalyticsCompany.name} Success Rate`,
                    color: '#333'
                  },
                  datalabels: {
                    display: true,
                    color: '#333',
                    font: {
                      weight: 'bold',
                      size: 12
                    },
                    formatter: (value) => value > 0 ? value.toFixed(1) + '%' : ''
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="analytics-card">
        <h3>Company Summary</h3>
        <div className="analytics-stats">
          <div className="stat-item">
            <p className="stat-label">Position</p>
            <p className="stat-value">{selectedAnalyticsCompany.position}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Interview Date</p>
            <p className="stat-value">{selectedAnalyticsCompany.interviewDate}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Total Students</p>
            <p className="stat-value">{companyRoundStats[selectedAnalyticsCompany._id]?.totalStudents || 0}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Final Selections</p>
            <p className="stat-value">
              {(() => {
                const stats = companyRoundStats[selectedAnalyticsCompany._id];
                const lastRound = stats?.rounds?.[selectedAnalyticsCompany.rounds];
                return lastRound?.selected || 0;
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalyticsView;
