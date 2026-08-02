import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
//io is the actual function we call to create a connection to our Socket.io server from the browser. Socket is just a TypeScript type describing "what a socket connection object looks like" — used only for type-checking, not at runtime.
import { useAuth } from "./AuthContext";

type SocketContextType = {
  socket: Socket | null;
  onlineUsers: string[];
  //A TypeScript type describing what this context will hold: the actual socket connection (or null if not connected), and onlineUsers — an array of user ID strings.
};

const SocketContext = createContext<SocketContextType>({ socket: null, onlineUsers: [] });
//Creates the context. Unlike our Auth Context (which defaulted to undefined), this one has a real default value: { socket: null, onlineUsers: [] } — meaning "not connected, nobody online" until we actually connect.


export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  //Creates a ref — think of it as a "storage box" that persists across re-renders, but changing its .current value does NOT trigger a re-render (unlike useState). We use this to hold the actual live socket connection object. Initial value: null (no connection yet).
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();//?. means "only call .disconnect() if socketRef.current actually exists
      socketRef.current = null;
      return;
    }

    const socket = io("http://localhost:5000", {
      auth: { token },
    });

    //If there IS a token: actually creates the connection. io(...) connects to our backend server's URL. { auth: { token } } — this is exactly what our backend's socket.handshake.auth.token reads on the other end, to verify who's connecting (remember our io.use(...) middleware).

    socketRef.current = socket;//Store this new connection in our ref, so we can access/manage it elsewhere (and disconnect it later).

    socket.on("onlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.disconnect();//alling it closes the connection to the server.
    };
  }, [token]);//only re-run this whole effect if token changes." So this effect runs once on login, and again if the user logs out (token becomes null) or logs in as someone new.

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

/**Scenario: User logs out

Step 1: User is logged in. token has a real value. Our effect already ran once, created a socket, and it's connected.

Step 2: User clicks a "Logout" button somewhere (we'll build this later), which calls our logout() function from AuthContext. Remember:

typescript
function logout() {
  setUser(null);
  setToken(null);
  ...
}

This sets token to null in our Auth Context.

Step 3: Since SocketProvider reads token from useAuth(), and token just changed, SocketProvider re-renders with the new value (token = null).

Step 4: React looks at our effect's dependency array: [token]. It compares the old value of token (some real string) to the new value (null) — they're different, so React knows: "this effect needs to run again."

Step 5 — this is where our cleanup function comes in: Before running the effect again with the new token value, React first calls whatever function we returned the previous time this effect ran. That's exactly our:

typescript
return () => {
  socket.disconnect();
};

So React calls this now — closing the old socket connection (the one created while the user was still logged in).

Step 6: Now that cleanup is done, React runs the effect body again, this time with token = null:

typescript
if (!token) {
  socketRef.current?.disconnect();
  socketRef.current = null;
  return;
}

Since token is now null, this if block runs — it tries disconnecting again (harmless, already disconnected) and clears our stored reference. No new connection gets created, since we return early here.

End result: the socket connection is fully, cleanly closed the moment the user logs out. */

export function useSocket() {
  return useContext(SocketContext);
}