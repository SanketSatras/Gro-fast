import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null; // Don't redirect while loading auth state
    }

    if (!isAuthenticated) {
        // If user is not authenticated, redirect to the appropriate login page
        let loginPath = "/auth/customer";
        
        if (location.pathname.startsWith("/vendor")) {
            loginPath = "/auth/vendor";
        } else if (location.pathname.startsWith("/delivery")) {
            loginPath = "/auth/delivery";
        }
        
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user!.role)) {
        // Role not authorized, redirect to unauthorized or home
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
