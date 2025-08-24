# VCET Placement Management Portal

## Overview
This is a comprehensive web-based Placement Management Portal developed for Velammal College of Engineering and Technology (VCET). The portal facilitates the management of student placements, company interactions, and recruitment processes.

## Features

### Admin Dashboard
- Secure admin login system
- Year-wise batch management
- Excel file import functionality for student data
- Previous batch records access
- Company management interface

### Student Management
- View and manage student profiles
- Track student placement status
- Export individual student placement reports
- Monitor company-wise selection rounds
- Bulk export of student data

### Company Management
- Add and manage company profiles
- Track multiple recruitment rounds
- Real-time status updates for each round
- Company-wise student selection tracking
- Export company recruitment data

### Security Features
- Protected admin access
- Disabled browser developer tools
- Secure data handling
- Session management

## Tech Stack
- React.js (Frontend Framework)
- Vite (Build Tool)
- Axios (HTTP Client)
- React Icons
- React Router DOM
- React Toastify (Notifications)
- XLSX (Excel file handling)

## Project Structure
```
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── CSE LOGO.jpg
│   │   ├── react.svg
│   │   └── VCET Logo.jpg
│   ├── styles/
│   │   ├── AdminDashboard.css
│   │   ├── Dashboard.css
│   │   ├── ManageCompanies.css
│   │   └── ManageStudents.css
│   ├── utils/
│   │   └── disableDevTools.js
│   ├── AdminDashboard.jsx
│   ├── App.jsx
│   ├── Dashboard.jsx
│   ├── ManageCompanies.jsx
│   ├── ManageStudents.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository
   ```bash
   git clone [repository-url]
   ```

2. Navigate to the project directory
   ```bash
   cd Placement-Project
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Start the development server
   ```bash
   npm run dev
   ```
   The application will start on port 4000 by default.

## Usage

### Admin Login
1. Access the portal through the login page
2. Enter admin credentials
3. Navigate to the admin dashboard

### Managing Students
- Import student data using Excel files
- View and track student placement status
- Generate individual and bulk reports

### Managing Companies
- Add new companies
- Track recruitment rounds
- Update selection status
- Export company-wise reports

## Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is proprietary and confidential. Unauthorized copying of this file, via any medium is strictly prohibited.

## Contact
Department of Computer Science and Engineering  
Velammal College of Engineering and Technology
