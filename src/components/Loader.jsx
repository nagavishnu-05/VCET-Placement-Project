import React from 'react';
import '../styles/Loader.css';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner">
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
        <div className="loader-circle"></div>
      </div>
    </div>
  );
};

export default Loader;