import React from "react";
import { Bar } from 'react-chartjs-2';
import { FaWhatsapp } from "react-icons/fa";

const AnalyticsView = ({
  maxRounds,
  totalRoundAttended,
  totalRoundCleared,
  companies,
  studentInformationsDetail,
  totalPlacedStudents,
  generatePlacedStudentsMessage
}) => {
  return (
    <div className="analytics-container">
      {/* Round-wise Analytics with Charts */}
      <div className="analytics-card">
        <h3>Round-wise Performance</h3>
        <div className="analytics-stats">
          <div className="chart-container">
            <Bar
              data={{
                labels: Array.from({ length: maxRounds }, (_, i) => `Round ${i + 1}`),
                datasets: [
                  {
                    label: 'Students Attended',
                    data: totalRoundAttended.slice(0, maxRounds),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    order: 2
                  },
                  {
                    label: 'Students Selected',
                    data: totalRoundCleared.slice(0, maxRounds),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    order: 1
                  },
                  {
                    label: 'Students Rejected',
                    data: totalRoundAttended.slice(0, maxRounds).map((attended, i) => attended - totalRoundCleared[i]),
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
                    text: 'Round-wise Student Performance',
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
          
          {/* Success Rate Graph */}
          <div className="chart-container">
            <Bar
              data={{
                labels: Array.from({ length: maxRounds }, (_, i) => `Round ${i + 1}`),
                datasets: [{
                  label: 'Success Rate (%)',
                  data: totalRoundAttended.slice(0, maxRounds).map((attended, i) => attended > 0 ? (totalRoundCleared[i] / attended) * 100 : 0),
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
                    text: 'Round-wise Success Rate',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Overall Performance</h3>
          <button
            className="admin-submit-button"
            onClick={async () => {
              const message = await generatePlacedStudentsMessage();
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
            style={{
              backgroundColor: '#25D366',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaWhatsapp style={{ width: '16px', height: '16px' }} />
            Share on WhatsApp
          </button>
        </div>
        <div className="analytics-stats">
          <div className="stat-item">
            <p className="stat-label">Total Companies</p>
            <p className="stat-value">{companies.length}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Total Students</p>
            <p className="stat-value">{studentInformationsDetail.length}</p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Total Placed Students</p>
            <p className="stat-value">
              {totalPlacedStudents.loading ? 'Loading...' : totalPlacedStudents.count}
            </p>
          </div>
          <div className="stat-item">
            <p className="stat-label">Placement Percentage</p>
            <p className="stat-value">
              {totalPlacedStudents.loading
                ? '...'
                : studentInformationsDetail.length > 0
                  ? ((totalPlacedStudents.count / studentInformationsDetail.length) * 100).toFixed(1) + '%'
                  : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
