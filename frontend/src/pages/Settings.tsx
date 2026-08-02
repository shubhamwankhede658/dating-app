import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

type BlockedUser = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBlockedUsers() {
    try {
      const res = await api.get("/block");
      setBlockedUsers(res.data.blockedUsers);
    } catch (error) {
      console.error("Failed to fetch blocked users", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  async function handleUnblock(targetUserId: string) {
    try {
      await api.delete("/block", { data: { targetUserId } });
      setBlockedUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (error) {
      console.error("Failed to unblock", error);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px 20px 16px" }}>
        <Link to="/profile" style={{ color: "#1a1a1a" }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a1a" }}>Settings</h1>
      </div>

      <div style={{ padding: "8px 20px 24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>Blocked users</h3>

        {loading ? (
          <p style={{ color: "#666", fontSize: "14px" }}>Loading...</p>
        ) : blockedUsers.length === 0 ? (
          <p style={{ color: "#666", fontSize: "14px" }}>You haven't blocked anyone.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            {blockedUsers.map((blockedUser) => (
              <div
                key={blockedUser.id}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.4)" }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#f0f0f0", overflow: "hidden", flexShrink: 0 }}>
                  {blockedUser.photoUrl && (
                    <img src={blockedUser.photoUrl} alt={blockedUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <p style={{ flex: 1, fontWeight: 600, color: "#1a1a1a", fontSize: "14px" }}>{blockedUser.name}</p>
                <button
                  onClick={() => handleUnblock(blockedUser.id)}
                  style={{ padding: "8px 16px", backgroundColor: "white", border: "1.5px solid var(--primary)", color: "var(--primary)", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{ width: "100%", padding: "16px", backgroundColor: "white", color: "#e63946", border: "1.5px solid #e63946", borderRadius: "28px", fontSize: "15px", fontWeight: 600, marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}