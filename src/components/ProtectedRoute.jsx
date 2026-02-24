import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if the admin is logged in by looking for the flag in localStorage
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

    if (!isAdminLoggedIn) {
        // If not logged in, redirect to the login page (Dashboard)
        return <Navigate to="/" replace />;
    }

    // If logged in, render the requested component
    return children;
};

export default ProtectedRoute;
