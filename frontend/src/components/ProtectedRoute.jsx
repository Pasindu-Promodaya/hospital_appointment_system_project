import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    const userString = localStorage.getItem('user');

    // If no user session exists, redirect unauthorized users to login page
    if (!userString) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(userString);

    // If the user's role is not authorized for this specific route, block access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    // Render the requested component if authorization checks pass
    return children;
}