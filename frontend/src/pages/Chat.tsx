import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { MoreVertical, ArrowLeft, Send } from "lucide-react";
import api from "../lib/axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

type Message = {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  seen: boolean;
  createdAt: string;
};

type OtherUser = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, onlineUsers } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState<OtherUser | null>(location.state?.otherUser || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;

  useEffect(() => {
    async function fetchMessages() {
      const res = await api.get(`/chat/${matchId}/messages`);
      setMessages(res.data.messages);
    }
    fetchMessages();
  }, [matchId]);

  useEffect(() => {
    if (otherUser) return;
    async function fetchOtherUser() {
      const res = await api.get("/chat/matches");
      const match = res.data.matches.find((m: any) => m.matchId === matchId);
      if (match) setOtherUser(match.otherUser);
    }
    fetchOtherUser();
  }, [matchId, otherUser]);

  useEffect(() => {
    if (!socket) return;

    function handleNewMessage(message: Message) {
      if (message.matchId === matchId) {
        setMessages((prev) => [...prev, message]);
      }
    }

    function handleMessagesSeen(data: { matchId: string }) {
      if (data.matchId === matchId) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, seen: true })));
      }
    }

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, matchId]);

  // This is the piece that was missing - tells the server "I'm looking at this chat now"
  useEffect(() => {
    if (!socket || !matchId) return;
    socket.emit("markAsSeen", { matchId });
  }, [socket, matchId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!text.trim() || !socket) return;
    socket.emit("sendMessages", { matchId, content: text });
    setText("");
  }

  async function handleBlock() {
    if (!otherUser) return;
    try {
      await api.post("/block", { targetUserId: otherUser.id });
      navigate("/messages");
    } catch (error) {
      console.error("Failed to block", error);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(180deg, #eafaf1 0%, #d4f4e2 100%)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", position: "relative", flexShrink: 0 }}>
        <button onClick={() => navigate("/messages")} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
          <ArrowLeft size={20} color="#1a1a1a" />
        </button>

        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f0f0f0", overflow: "hidden", flexShrink: 0 }}>
          {otherUser?.photoUrl && (
            <img src={otherUser.photoUrl} alt={otherUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: "15px", color: "#1a1a1a" }}>{otherUser?.name || "Chat"}</p>
          <p style={{ fontSize: "12px", color: isOnline ? "var(--primary)" : "#999" }}>{isOnline ? "Available" : "Offline"}</p>
        </div>

        <button onClick={() => setMenuOpen((prev) => !prev)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
          <MoreVertical size={20} color="#1a1a1a" />
        </button>

        {menuOpen && (
          <div style={{ position: "absolute", top: "50px", right: "12px", backgroundColor: "white", border: "1px solid #eee", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10 }}>
            <button onClick={handleBlock} style={{ padding: "10px 20px", background: "none", border: "none", color: "#e63946", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              Block User
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isMine ? "flex-end" : "flex-start",
                backgroundColor: isMine ? "var(--primary)" : "white",
                color: isMine ? "white" : "#333",
                padding: "10px 16px",
                borderRadius: "18px",
                borderBottomRightRadius: isMine ? "4px" : "18px",
                borderBottomLeftRadius: isMine ? "18px" : "4px",
                maxWidth: "75%",
                boxShadow: isMine ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ fontSize: "14px" }}>{msg.content}</p>
              {isMine && <span style={{ fontSize: "10px", opacity: 0.85 }}>{msg.seen ? "Seen" : "Sent"}</span>}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", flexShrink: 0 }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder='Say "Hi!"'
          style={{ flex: 1, padding: "12px 18px", border: "none", borderRadius: "24px", outline: "none", backgroundColor: "rgba(255,255,255,0.6)", fontSize: "14px" }}
        />
        <button
          onClick={handleSend}
          style={{ width: "44px", height: "44px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}