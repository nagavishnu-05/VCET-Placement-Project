import React from "react";
import Vcet from "../../../assets/VCET Logo.jpg";
import CSE from "../../../assets/CSE LOGO.jpg";

const CollegeHeader = () => {
  return (
    <div className="admin-college-header">
      <img src={Vcet} alt="VCET Logo" className="admin-college-logo" />
      <div className="admin-college-info">
        <h1 className="admin-college-name">
          Velammal College of Engineering and Technology
        </h1>
        <p className="admin-college-subtitle">
          Department of Computer Science and Engineering
        </p>
        <p className="admin-subtitle">Admin Portal</p>
      </div>
      <img src={CSE} alt="CSE Logo" className="admin-college-logo" />
    </div>
  );
};

export default CollegeHeader;
