# VCET Placement Management Portal

The **VCET Placement Management Portal** is a responsive web application developed exclusively for the Department of Computer Science and Engineering (CSE), Velammal College of Engineering and Technology (VCET). It simplifies and manages the complete placement workflow including student data management, company drives, recruitment rounds, shortlists, and placement analytics.

## 📌 Features

* Manage academic batches and student placement data  
* Add and manage company drives with round-wise details  
* Track student progress across recruitment rounds  
* Company-wise shortlisting and final selection process  
* Round-wise analytics and export support  
* Individual placement history for each student  
* Secured REST API integration for all operations

## 🗂 File Structure

```
VCET-Placement-Project/
├── public/
├── src/
│   ├── Admin/
│   │   ├── Companies/
│   │   │   ├── components/
│   │   │   ├── ManageCompanies.jsx
│   │   └── Students/
│   │       ├── components/
│   │       ├── ManageStudents.jsx
│   ├── assets/
│   ├── styles/
│   └── utils/
│       ├── AdminDashboard.jsx
│       ├── App.css
│       ├── App.jsx
│       ├── CompanyCard.jsx
│       ├── Dashboard.jsx
│       ├── index.css
│       ├── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## ⚙️ Tech Stack

### Frontend

* React + Vite  
* React Router DOM  
* Axios for API requests  
* React Toastify for notifications  
* React Icons  
* Chart.js + chartjs-plugin-datalabels for analytics

### Backend (External API)

* VCET Placement REST API  
* Endpoints for Students, Companies, Shortlists, and Analytics  
* Authentication and authorization handled by backend

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## 👨‍💻 Developed & Maintained By

### Frontend Team

* Nagavishnu Karthik B S  
* Mukesh Kanna M  
* Manavendra Sailesh A

### Backend Team

* Achuthan T B  
* Logesh Kumar  
* Priya Dharshini M  
* Rajadharshini R

---

## 📜 License

This project is intended for academic and internal use by the Department of Computer Science and Engineering, VCET. Redistribution or commercial use is not permitted without prior permission.

## 🛠 Badges

![React](https://img.shields.io/badge/React-18.0-blue) 
![Vite](https://img.shields.io/badge/Vite-Frontend-purple) 
![License](https://img.shields.io/badge/License-Academic-orange) 
![PRs](https://img.shields.io/badge/PRs-Welcome-brightgreen)

## 🤝 Contributing

1. Fork the repository  
2. Create a new branch (`feature-name`)  
3. Commit your changes  
4. Push to the branch  
5. Submit a pull request

## 🚀 Future Enhancements

* Role-based access for faculty and placement coordinators  
* Automated resume generation for students  
* AI-based placement prediction and insights  
* Email & SMS notifications for drive updates

---

<h4 align="center">© 2023 – 2027 Department of CSE, VCET</h4>
