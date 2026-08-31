import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { useSocket } from "../context/SocketContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const [matchMessage, setMatchMessage] = useState("");

  useEffect(() => {
    if (!socket) return;

    function handleNewMatch(data: { matchId: string; otherUser: { name: string } }) {
      setMatchMessage(`You matched with ${data.otherUser.name}!`);
      setTimeout(() => setMatchMessage(""), 3000);
    }

    socket.on("newMatch", handleNewMatch);

    return () => {
      socket.off("newMatch", handleNewMatch);
    };
  }, [socket]);

  return (
    <div className="app-container">
      {matchMessage && (
        <div style={{ position: "fixed", top: "16px", left: "16px", right: "16px", zIndex: 100, backgroundColor: "var(--primary)", color: "white", padding: "12px", borderRadius: "12px", textAlign: "center", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {matchMessage}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</div>
      <BottomNav />
    </div>
  );
}