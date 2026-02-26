import { Navigate, Outlet } from "react-router-dom";

/**
 * StudentRoute — Protected route wrapper for student pages.
 * Checks for a valid JWT token in localStorage.
 * If no token is found, redirects to the login page.
 */
const StudentRoute = () => {
    const token = localStorage.getItem("studentToken");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default StudentRoute;
