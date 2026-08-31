import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import api from "../lib/axios";

type Profile = {
  id: string;
  name: string;
  bio: string | null;
  photoUrl: string | null;
};

export default function Likes() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchMessage, setMatchMessage] = useState("");

  async function fetchLikedMe() {
    try {
      const res = await api.get("/match/liked-me");
      setProfiles(res.data.profiles);
    } catch (error) {
      console.error("Failed to fetch likes", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLikedMe();
  }, []);

  async function handleLikeBack(targetId: string, targetName: string) {
    try {
      const res = await api.post("/match/like", { targetUserId: targetId });
      if (res.data.matched) {
        setMatchMessage(`You matched with ${targetName}!`);
        setTimeout(() => setMatchMessage(""), 3000);
      }
      setProfiles((prev) => prev.filter((p) => p.id !== targetId));
    } catch (error) {
      console.error("Failed to like back", error);
    }
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }}>
      <div style={{ padding: "20px 20px 16px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>Likes</h1>
      </div>

      {matchMessage && (
        <div style={{ margin: "0 20px 16px", backgroundColor: "var(--primary)", color: "white", padding: "10px", borderRadius: "10px", textAlign: "center", fontWeight: 600 }}>
          {matchMessage}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "#666", padding: "24px" }}>Loading...</p>
      ) : profiles.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", padding: "24px" }}>No likes yet — check back later!</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", padding: "0 20px 20px" }}>
          {profiles.map((profile) => (
            <div
              key={profile.id}
              style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "0.8", backgroundColor: "#ddd" }}
            >
              {profile.photoUrl && (
                <img src={profile.photoUrl} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}

              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                <p style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>{profile.name}</p>
              </div>

              <button
                onClick={() => handleLikeBack(profile.id, profile.name)}
                className="like-btn"
                style={{ position: "absolute", top: "10px", right: "10px", width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.9)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Heart size={19} color="var(--primary)" fill="var(--primary)" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}