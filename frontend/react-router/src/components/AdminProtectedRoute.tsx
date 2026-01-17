import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Route guard that allows access only to authenticated admin users
export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redirect unauthenticated users to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Redirect non-admin users to home
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
