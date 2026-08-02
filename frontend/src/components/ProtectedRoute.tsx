import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
    //replace means "replace this page in browser history" so pressing "Back" doesn't bring them back to the protected page.
  }

  return <>{children}</>;
}