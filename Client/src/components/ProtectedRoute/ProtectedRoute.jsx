import { Navigate,Outlet} from "react-router-dom"
import useAuthStore from "@/store/useAuthStore";



const ProtectedRoute = ({ children, requiredRole }) => {
    const { token, isAuthenticated, role } = useAuthStore();

    // Validación de autenticación global
    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Validación de rol
    if (requiredRole && role !== requiredRole) {
        switch (role) {
            case "ADMINISTRADOR":
                return <Navigate to="/enRuta/admin/dashboard" replace />;
            case "VENDEDOR":
                return <Navigate to="/enRuta/vendedor/dashboard" replace />;
            default:
                return <Navigate to="/enRuta/" replace />;
        }
    }

    // Acceso permitido
    return children ? children : <Outlet />;
};

export default ProtectedRoute;