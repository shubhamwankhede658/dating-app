// import { NavLink } from "react-router-dom";
// import { Flame, Heart, MessageCircle, User } from "lucide-react";

// export default function BottomNav() {
//   const navItems = [
//     { path: "/discover", label: "Discover", Icon: Flame },
//     { path: "/likes", label: "Likes", Icon: Heart },
//     { path: "/messages", label: "Messages", Icon: MessageCircle },
//     { path: "/profile", label: "Profile", Icon: User },
//   ];

//   return (
//     <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #eee", padding: "10px 0", backgroundColor: "white" }}>
//       {navItems.map(({ path, label, Icon }) => (
//         <NavLink //It automatically knows whether the link matches the current URL (whether it's "active").
//           key={path}
//           to={path}
//           style={({ isActive }) => ({//this si a function iske andar isactice pass hoga
//             textDecoration: "none",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: "4px",
//             fontSize: "11px",
//             color: isActive ? "#e63946" : "#888",
//             fontWeight: isActive ? 600 : 400,
//           })}
//         >
//           {({ isActive }) => (
//             <>
//               <Icon size={22} strokeWidth={isActive ? 2.5 : 2} fill={isActive && label === "Likes" ? "#e63946" : "none"} />
//               <span>{label}</span>
//             </>
//           )}
//         </NavLink>
//       ))}
//     </div>
//   );
// }


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