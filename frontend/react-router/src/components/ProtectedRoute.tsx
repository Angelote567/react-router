import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: ReactElement;
  requireAdmin?: boolean;
};

// Generic protected route component (supports optional admin restriction)
export function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Redirect non-admin users when admin access is required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
