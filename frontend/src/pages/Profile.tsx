import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Settings, Camera } from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, login, token } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user && !initialized) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAge(user.age?.toString() || "");
      setGender(user.gender || "");
      setGenderPreference(user.genderPreference || "");
      setPreviewUrl(user.photoUrl || null);
      setInitialized(true);
    }
  }, [user, initialized]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (age) formData.append("age", age);
      if (gender) formData.append("gender", gender);
      if (genderPreference) formData.append("genderPreference", genderPreference);
      if (photoFile) formData.append("photo", photoFile);

      const res = await api.put("/profile/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      login(res.data.user, token!);

      setName(res.data.user.name || "");
      setBio(res.data.user.bio || "");
      setAge(res.data.user.age?.toString() || "");
      setGender(res.data.user.gender || "");
      setGenderPreference(res.data.user.genderPreference || "");
      setPreviewUrl(res.data.user.photoUrl || null);

      setMessage("Profile updated!");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const selectStyle = {
    width: "100%",
    padding: "14px 18px",
    border: "1.5px solid #333",
    borderRadius: "28px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "white",
    color: "#1a1a1a",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>Profile</h1>
        <Link to="/settings" style={{ color: "#1a1a1a" }}>
          <Settings size={22} />
        </Link>
      </div>

      {!previewUrl && (
        <div style={{ margin: "0 24px", backgroundColor: "var(--primary)", color: "white", padding: "12px 16px", borderRadius: "12px", fontSize: "13px", textAlign: "center", fontWeight: 600 }}>
          Add a photo and bio to start matching!
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <label style={{ position: "relative", cursor: "pointer" }}>
          <div style={{ width: "110px", height: "110px", borderRadius: "50%", backgroundColor: "white", overflow: "hidden", border: "3px solid white", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "12px" }}>
                No photo
              </div>
            )}
          </div>
          <div style={{ position: "absolute", bottom: "2px", right: "2px", backgroundColor: "var(--primary)", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
            <Camera size={16} color="white" />
          </div>
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
        </label>
      </div>

      <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={selectStyle} />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={18}
              max={100}
              style={selectStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} style={selectStyle}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Show me</label>
          <select value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)} style={selectStyle}>
            <option value="">Select</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
            <option value="everyone">Everyone</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "13px", color: "#444", marginBottom: "6px", display: "block" }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            style={{ ...selectStyle, borderRadius: "20px", resize: "none" }}
          />
        </div>

        {message && (
          <p style={{ color: message.includes("updated") ? "var(--primary)" : "#e63946", fontSize: "13px", textAlign: "center", fontWeight: 600 }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: "100%", padding: "16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "28px", fontSize: "16px", fontWeight: 600, marginTop: "8px" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}