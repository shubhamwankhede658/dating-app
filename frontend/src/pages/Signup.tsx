import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/logo";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
 
export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.user, res.data.token);
      navigate("/profile");
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="app-container">
      <div className="auth-bg">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
           <Logo size={220} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "14px 18px", border: "1.5px solid #333", borderRadius: "28px", outline: "none", fontSize: "14px" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "14px 18px", border: "1.5px solid #333", borderRadius: "28px", outline: "none", fontSize: "14px" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "14px 18px", border: "1.5px solid #333", borderRadius: "28px", outline: "none", fontSize: "14px" }}
              required
            />
          </div>

          {error && <p style={{ color: "#e63946", fontSize: "13px" }}>{error}</p>}

          <button
            type="submit"
            style={{ width: "100%", padding: "16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "28px", fontSize: "16px", fontWeight: 600, marginTop: "10px" }}
          >
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "30px", fontSize: "14px", color: "#444" }}>
          Already have an account? <Link to="/login" style={{ color: "#1a1a1a", fontWeight: 700, textDecoration: "none" }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}