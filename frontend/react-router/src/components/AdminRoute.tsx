import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Route wrapper that restricts access to admin users
export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect unauthenticated users to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Redirect non-admin users to home
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
