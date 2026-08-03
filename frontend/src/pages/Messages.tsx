import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import api from "../lib/axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

type Match = {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    seen: boolean;
  } | null;
};

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Messages() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { onlineUsers, socket } = useSocket();

  async function fetchMatches() {
    try {
      const res = await api.get("/chat/matches");
      setMatches(res.data.matches);
    } catch (error) {
      console.error("Failed to fetch matches", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!socket) return;

  function handleNewMessage(message: { matchId: string; content: string; senderId: string; createdAt: string; seen: boolean }) {
  console.log("Received newMessage on Messages page:", message);
  setMatches((prev) =>
  prev.map((m) =>
    m.matchId === message.matchId
      ? { ...m, lastMessage: { content: message.content, senderId: message.senderId, createdAt: message.createdAt, seen: message.seen } }
      : m
  )
);
}

function handleMessagesSeen(data: { matchId: string }) {
  setMatches((prev) =>
    prev.map((m) =>
      m.matchId === data.matchId && m.lastMessage && m.lastMessage.senderId === user?.id
        ? { ...m, lastMessage: { ...m.lastMessage, seen: true } }
        : m
    )
  );
}

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket]);

  async function handleBlock(targetUserId: string, matchId: string) {
    try {
      await api.post("/block", { targetUserId });
      setMatches((prev) => prev.filter((m) => m.matchId !== matchId));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to block", error);
    }
  }

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }}>
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }} onClick={() => setOpenMenuId(null)}>
      <div style={{ padding: "20px 20px 28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>Messages</h1>
      </div>

      {matches.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: "24px" }}>No matches yet — go like some profiles!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {matches.map((match) => {
            const isOnline = onlineUsers.includes(match.otherUser.id);
            const isMine = match.lastMessage?.senderId === user?.id;
            const isNewMessage = match.lastMessage && !isMine && !match.lastMessage.seen;

            return (
              <div
                key={match.matchId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  position: "relative",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "16px",
                  margin: "0 20px 10px",
                  backgroundColor: "rgba(255,255,255,0.4)",
                }}
              >
                <Link
                  to={`/chat/${match.matchId}`}
                  state={{ otherUser: match.otherUser }}
                  style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#f0f0f0", overflow: "hidden" }}>
                      {match.otherUser.photoUrl && (
                        <img src={match.otherUser.photoUrl} alt={match.otherUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                    {isOnline && (
                      <div style={{ position: "absolute", bottom: "0", right: "0", width: "13px", height: "13px", backgroundColor: "#2ecc71", borderRadius: "50%", border: "2px solid white" }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a1a" }}>{match.otherUser.name}</p>
                    {match.lastMessage ? (
                      isNewMessage ? (
                        <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>New message</p>
                      ) : isMine ? (
                        <p style={{ fontSize: "13px", color: "#666" }}>{match.lastMessage.seen ? "Seen" : "Sent"}</p>
                      ) : (
                        <p style={{ fontSize: "13px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {match.lastMessage.content}
                        </p>
                      )
                    ) : (
                      <p style={{ fontSize: "13px", color: "#999" }}>Say hi to start the conversation</p>
                    )}
                  </div>
                </Link>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                  {match.lastMessage && <span style={{ fontSize: "11px", color: "#999" }}>{timeAgo(match.lastMessage.createdAt)}</span>}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((prev) => (prev === match.matchId ? null : match.matchId));
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#999" }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {openMenuId === match.matchId && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: "absolute", top: "44px", right: "20px", backgroundColor: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10 }}
                  >
                    <button
                      onClick={() => handleBlock(match.otherUser.id, match.matchId)}
                      style={{ padding: "10px 20px", background: "none", border: "none", color: "#e63946", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Block User
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}