import { NavLink } from "react-router-dom";
import { Flame, Heart, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const navItems = [
    { path: "/discover", label: "Discover", Icon: Flame },
    { path: "/likes", label: "Likes", Icon: Heart },
    { path: "/messages", label: "Messages", Icon: MessageCircle },
    { path: "/profile", label: "Profile", Icon: User },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #eee", padding: "10px 0", backgroundColor: "white" }}>
      {navItems.map(({ path, label, Icon }) => (
        <NavLink
          key={path}
          to={path}
          style={({ isActive }) => ({
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            color: isActive ? "var(--primary)" : "#888",
            fontWeight: isActive ? 600 : 400,
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive && label === "Likes" ? "var(--primary)" : "none"} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}