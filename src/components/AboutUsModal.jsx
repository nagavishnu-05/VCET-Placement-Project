import React from "react";
import {
    FaTimes, FaGithub, FaLinkedin, FaEnvelope,
    FaCode, FaChalkboardTeacher, FaServer, FaPalette,
    FaUserTie, FaLaptopCode, FaDatabase
} from "react-icons/fa";

const AboutUsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const frontend = [
        {
            name: "Nagavishnu Karthik B S",
            role: "Frontend Developer",
            contribution: "UI Design, Component Development",
            icon: <FaLaptopCode />,
            gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
            github: "https://github.com/nagavishnu-05",
            linkedin: "https://www.linkedin.com/in/naga-vishnu-karthik-b-s/",
            mail: "mailto:nagavishnukarthikbs@gmail.com",
        },
        {
            name: "Mukesh Kanna M",
            role: "Frontend Developer",
            contribution: "Component Styling",
            icon: <FaCode />,
            gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
            github: "https://github.com/Mukesh0307",
            linkedin: "https://www.linkedin.com/in/mukesh-kanna-m-62923a326/",
            mail: "mailto:24lcseb01mukeshkanna@gmail.com",
        },
        {
            name: "Manavendra Shailesh A",
            role: "Frontend Developer",
            contribution: "Optimization",
            icon: <FaPalette />,
            gradient: "linear-gradient(135deg, #818cf8, #4f46e5)",
            github: "https://github.com/manavendrashailesha",
            linkedin: "https://www.linkedin.com/in/a-manavendra-shailesh/",
            mail: "mailto:manavendrashailesa@gmail.com",
        },
    ];

    const backend = [
        {
            name: "Achuthan T B",
            role: "Backend Developer",
            contribution: "API Design & Database Schema",
            icon: <FaServer />,
            gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
            github: "https://github.com/achu1566",
            linkedin: "https://www.linkedin.com/in/achuthan-t-b-1522972a2/",
            mail: "mailto:achuthan1566@gmail.com",
        },
        {
            name: "Logesh Kumar M",
            role: "Backend Developer",
            contribution: "Authentication",
            icon: <FaDatabase />,
            gradient: "linear-gradient(135deg, #34d399, #059669)",
            github: "https://github.com/m-logeshkumar",
            linkedin: "https://www.linkedin.com/in/logesh-kumar-m-3304282a2",
            mail: "mailto:23cseb39.logeshkumar.m@gmail.com",
        },
        {
            name: "Priyadharshini M",
            role: "Backend Developer",
            contribution: "Security",
            icon: <FaServer />,
            gradient: "linear-gradient(135deg, #f472b6, #db2777)",
            github: "https://github.com/Dh513623",
            linkedin: "https://www.linkedin.com/in/priya-dharshini-m-684211301",
            mail: "mailto:dharshinipriya1810@gmail.com",
        },
        {
            name: "Rajadharshini R",
            role: "Backend Developer",
            contribution: "Testing & Documentation",
            icon: <FaUserTie />,
            gradient: "linear-gradient(135deg, #fb7185, #e11d48)",
            github: "https://github.com/Rajadharshini24",
            linkedin: "https://www.linkedin.com/in/rajadharshini-r-871606307/",
            mail: "mailto:23cseb22.rajadharshini.r@gmail.com",
        },
    ];

    /* Vertical card for team members */
    const MemberCard = ({ member }) => (
        <div className="about-member-card">
            <div className="about-member-avatar" style={{ background: member.gradient }}>
                {member.icon}
            </div>
            <div className="about-member-info">
                <div className="about-member-details">
                    <h3 className="about-member-name">{member.name}</h3>
                    <p className="about-member-role">
                        {member.role}
                    </p>
                </div>
                <p className="about-member-contribution">{member.contribution}</p>
                <div className="about-member-links">
                    <a href={member.github} target="_blank" rel="noreferrer" title="GitHub"><FaGithub /></a>
                    <a href={member.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><FaLinkedin /></a>
                    <a href={member.mail} title="Email"><FaEnvelope /></a>
                </div>
            </div>
        </div>
    );

    return (
        <div className="about-modal-overlay" onClick={onClose}>
            <div className="about-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="about-modal-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                {/* Header */}
                <div className="about-modal-header">
                    <div className="about-modal-header-icon"><FaCode /></div>
                    <h2>Meet Our Team</h2>
                    <p>The minds behind the VCET Placement Portal</p>
                </div>

                {/* Staff Coordinator */}
                <div className="about-mentor-section">
                    <div className="about-section-label">
                        <FaChalkboardTeacher />
                        <span>Project Mentor &amp; Coordinator</span>
                    </div>
                    <div className="about-mentor-card">
                        <div className="about-mentor-avatar"><FaChalkboardTeacher /></div>
                        <div>
                            <p className="about-mentor-name">Mr. G. Balamuralikrishnan</p>
                            <p className="about-mentor-title">Assistant Professor, CSE</p>
                        </div>
                    </div>
                </div>

                {/* Frontend Team */}
                <div className="about-team-section">
                    <div className="about-section-label about-label-frontend">
                        <span className="about-label-dot frontend-dot"></span>
                        Frontend
                    </div>
                    <div className="about-members-grid">
                        {frontend.map((m, i) => <MemberCard key={i} member={m} />)}
                    </div>
                </div>

                {/* Backend Team */}
                <div className="about-team-section">
                    <div className="about-section-label about-label-backend">
                        <span className="about-label-dot backend-dot"></span>
                        Backend
                    </div>
                    <div className="about-members-grid">
                        {backend.map((m, i) => <MemberCard key={i} member={m} />)}
                    </div>
                </div>

                <div className="about-modal-footer">
                    <p>© 2023 - 2027 VCET Placement Project — Department of CSE</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUsModal;

