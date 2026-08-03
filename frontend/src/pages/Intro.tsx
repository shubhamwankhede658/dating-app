import { Link, Navigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Intro() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="app-container">
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "24px", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)", position: "relative" }}>
        <Logo size={220} />

        <p style={{ color: "#444", fontSize: "15px", textAlign: "center", marginTop: "12px", marginBottom: "48px" }}>
          Swipe, match, and start chatting.
        </p>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
          <Link to="/login" style={{ width: "100%" }}>
            <button style={{ width: "100%", padding: "16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "28px", fontSize: "16px", fontWeight: 600 }}>
              Login
            </button>
          </Link>

          <Link to="/signup" style={{ width: "100%" }}>
            <button style={{ width: "100%", padding: "16px", backgroundColor: "white", color: "var(--primary)", border: "1.5px solid var(--primary)", borderRadius: "28px", fontSize: "16px", fontWeight: 600 }}>
              Sign Up
            </button>
          </Link>
        </div>

        <p style={{ position: "absolute", bottom: "20px", color: "#666", fontSize: "12px", textAlign: "center" }}>
          © {new Date().getFullYear()} Twogether. Built by Shubham.
        </p>
      </div>
    </div>
  );
}