//components/auth/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';

interface PrivateRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const isAuthenticated = AuthService.isAuthenticated();
    const userRole = AuthService.getRole();

    // Check if user is authenticated
    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if route requires specific roles
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        // Redirect based on role if user doesn't have required role
        if (userRole === 'admin') {
            return <Navigate to="/admin" replace />;
        } else if (userRole === 'customer') {
            return <Navigate to="/" replace />;
        }
        
        // Fallback to login if role is invalid
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;