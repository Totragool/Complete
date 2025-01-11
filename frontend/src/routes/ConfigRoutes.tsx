import { useRoutes } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import AdminRoutes from './AdminRoutes';
import MainRoutes from './MainRoutes';
import UserRoutes from './UserRoutes';

const ConfigRoutes = () => {
    const isAuthenticated = AuthService.isAuthenticated();
    const role = AuthService.getRole();

    // If no token, return only public routes
    if (!isAuthenticated) {
        return useRoutes([MainRoutes()]);
    }

    // Set up routes based on user role
    let routes;
    switch (role) {
        case 'admin':
            routes = [AdminRoutes(true), MainRoutes()];
            break;
        case 'customer':
            routes = [UserRoutes(true), MainRoutes()];
            break;
        default:
            // Invalid role, clear auth and show public routes
            AuthService.logout();
            routes = [MainRoutes()];
    }

    return useRoutes(routes);
};

export default ConfigRoutes;