import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAILS = (import.meta.env.VITE_PLATFORM_ADMIN_EMAILS || "jacobasuquo199@gmail.com")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export const SuperadminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm text-gray-500">Loading admin session…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const emailAllowed = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email.toLowerCase());
  if (!user.is_superuser || !emailAllowed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default SuperadminRoute;
