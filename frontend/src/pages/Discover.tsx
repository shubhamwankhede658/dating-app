import { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";
import api from "../lib/axios";

type Profile = {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
  age: number | null;
};

export default function Discover() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchMessage, setMatchMessage] = useState("");

  async function fetchProfiles() {
    try {
      const res = await api.get("/match/profiles");
      setProfiles(res.data.profiles);
    } catch (error) {
      console.error("Failed to fetch profiles", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function handleLike() {
    const currentProfile = profiles[0];
    try {
      const res = await api.post("/match/like", { targetUserId: currentProfile.id });
      if (res.data.matched) {
        setMatchMessage(`You matched with ${currentProfile.name}!`);
        setTimeout(() => setMatchMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to like", error);
    } finally {
      setProfiles((prev) => prev.slice(1));
    }
  }

  async function handlePass() {
    const currentProfile = profiles[0];
    try {
      await api.post("/match/pass", { targetUserId: currentProfile.id });
    } catch (error) {
      console.error("Failed to pass", error);
    } finally {
      setProfiles((prev) => prev.slice(1));
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>Discover</h1>
      </div>

      <div style={{ flex: 1, padding: "12px 20px 20px", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {matchMessage && (
          <div style={{ backgroundColor: "var(--primary)", color: "white", padding: "10px", borderRadius: "10px", textAlign: "center", marginBottom: "12px", fontWeight: 600 }}>
            {matchMessage}
          </div>
        )}

        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>
        ) : profiles.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", textAlign: "center", padding: "0 24px" }}>
            No more profiles right now — check back later!
          </div>
        ) : (
          <div style={{ position: "relative", flex: 1, borderRadius: "24px", overflow: "hidden" }}>
            <img
              src={profiles[0].photoUrl || undefined}
              alt={profiles[0].name}
              style={{ width: "100%", height: "100%", objectFit: "cover", backgroundColor: "#ddd" }}
            />

            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
              <h2 style={{ color: "white", fontSize: "24px", fontWeight: 700, display: "flex", alignItems: "baseline", gap: "8px" }}>
                {profiles[0].name}
                {profiles[0].age && <span style={{ fontSize: "18px", fontWeight: 400 }}>{profiles[0].age}</span>}
              </h2>
              {profiles[0].bio && <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", marginTop: "6px" }}>{profiles[0].bio}</p>}

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  onClick={handleLike}
                  style={{ flex: 1, padding: "14px", backgroundColor: "var(--primary)", border: "none", borderRadius: "28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Heart size={20} color="white" fill="white" />
                </button>
                <button
                  onClick={handlePass}
                  style={{ width: "50px", height: "50px", backgroundColor: "white", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >
                  <X size={22} color="#333" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}