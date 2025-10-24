# Project Description
A web-based portal for managing student placements, company interactions, and recruitment processes at VCET.

# File Structure
```
VCET-Placement-Project/
├── public/
├── src/
│   ├── Admin/
│   │   ├── Companies/
│   │   │   ├── components/
│   │   │   │   ├── AddCompanyForm.jsx
│   │   │   │   ├── AnalyticsView.jsx
│   │   │   │   ├── CollegeHeader.jsx
│   │   │   │   ├── CompanyAnalyticsView.jsx
│   │   │   │   ├── CompanyInsightsList.jsx
│   │   │   │   ├── CompanyNavbar.jsx
│   │   │   │   ├── RoundInsightsModal.jsx
│   │   │   │   ├── StudentRoundsPopup.jsx
│   │   │   │   └── StudentSelectionModal.jsx
│   │   │   ├── ManageCompanies.jsx
│   │   └── Students/
│   │   │   ├── components/
│   │   │   │   ├── StudentNavbar.jsx
│   │   │   │   └── StudentRoundsModal.jsx
│   │   │   │   └── StudentTable.jsx
│   │   │   ├── ManageStudents.jsx
│   ├── assets/
│   ├── styles/
│   └── utils/
│   │   ├── AdminDashboard.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── CompanyCard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── index.css
│   │   ├── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

# Files & Uses
- src/App.jsx : Main application routing and bootstrapping
- src/Admin/Companies/ManageCompanies.jsx : Manage companies and recruitment rounds
- src/Admin/Students/ManageStudents.jsx : Manage student info and placement status
- src/styles/ : Page and component styles
- src/utils/disableDevTools.js : Disables browser dev tools in production

# Tech Stacks

## Frontend
- React + Vite
- React Router DOM
- Axios
- React Toastify
- React Icons
- Chart.js + chartjs-plugin-datalabels (analytics)

## Backend (External API)
- VCET Placement REST API (consumed by this frontend)
- Endpoints for Students, Companies, Shortlists, and Analytics
- Authentication and authorization handled by the backend
- Note: Backend is hosted externally (e.g., Render). This repo contains the frontend only.

# Installation

## Frontend (this repository)
1. Install dependencies
```bash
npm install
```
2. Start the development server
```bash
npm run dev
```
3. Build for production
```bash
npm run build
```
4. Preview production build
```bash
npm run preview
```

## Backend (external API, optional local setup)
If you maintain/run the backend locally, follow your backend repository’s README. Typical steps:
1. Clone the backend repository
```bash
git clone <backend-repo-url>
cd <backend-repo>
```
2. Install dependencies and set environment variables
```bash
npm install
# create .env and configure values like:
# MONGODB_URI=...
# JWT_SECRET=...
# PORT=4000
```
3. Run backend in development
```bash
npm run dev
```
4. Update frontend API base URL (if needed)
- Search for API base URLs in the code (e.g., `https://vcetplacement.onrender.com/...`) and point them to your local backend (e.g., `http://localhost:4000`).

# Developed & Maintained by

© 2023 - 2027 CSE of VCET

<div style="display: flex; gap: 32px; align-items: flex-start;">
  <div>
    <h4>Frontend</h4>
    <ul>
      <li>Nagavishnu Karthik B S</li>
      <li>Mukesh Kanna M</li>
      <li>Manavendra Sailesh A</li>
    </ul>
  </div>
  <div>
    <h4>Backend</h4>
    <ul>
      <li>Achuthan T B</li>
      <li>Logesh Kumar</li>
      <li>Priya Dharshini M</li>
      <li>Rajadharshini R</li>
    </ul>
  </div>
</div>