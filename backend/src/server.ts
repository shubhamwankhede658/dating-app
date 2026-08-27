import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import prisma from "./lib/prisma.js";
import cors from "cors";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import { createServer } from "node:http";// this creates a raw http server that listens for any incoming connections over internet
import { Server } from "socket.io";//this is actual socket.io tool that will let us use realtime two way communication





import authRoutes from './routes/auth.route.js'
import profileRoutes from './routes/profile.routes.js'
import matchRoutes from './routes/match.routes.js'
import chatRoutes from './routes/chat.routes.js'
import blockRoutes from './routes/block.routes.js'


dotenv.config();

const app = express();

const httpServer = createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: allowedOrigin }));


export const io = new Server(httpServer,{
    cors: { origin: allowedOrigin },//origin: "*" simply means "allow any website to connect to this socket server.
})

/**
 * new Server(httpServer, {...}) — this creates our Socket.io engine, and attaches it to that same raw server we just made. So now one single server handles two kinds of traffic: normal Express requests (/api/auth/login, etc.) AND live socket connections — both coming through the same door, just handled differently
 */

app.use(express.json());// to parse json bodies

app.use('/api/auth',authRoutes);
app.use('/api/profile',profileRoutes)
app.use("/api/match",matchRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/block", blockRoutes);

app.get("/",(req,res)=>{
    res.send("server is running");
});













io.use((socket, next)=>{
    try{

        const token = socket.handshake.auth.token;

        if(!token){
            return next(new Error('not authorized , no token'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {userId : string};
        (socket as any).userId = decoded.userId;

        next();

    }catch(error){
        next(new Error('not authorized , invalid token'));
    }
})

















//track online user for green dot 
// A simple in-memory map: userId -> socket.id
// "in-memory" means it lives only in the server's RAM - it resets if the server restart

export const onlineUsers = new Map<string, string>();

io.on("connection",(socket)=>{
    const userId = (socket as any).userId;
    console.log("a user is connected:", userId);
  
    onlineUsers.set(userId,socket.id);

    // now tell everyone the updated list of who is online// emit means send an event named online users 
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));//Array.from(...) converts that into a normal list/array, like ["id1", "id2", "id3"]
    //io is our server's socket engine. io.emit So this line means: "Server, send this event to every connected client (browser)." This is going server .emit() always means "send this event outward, from whichever side is calling it, to whoever is listening on the other end.
    //socket.emit(...) (server side, referring to one specific person's socket) → sends to just that one person
    socket.on("disconnect",()=>{
        console.log("a user is dissconnected:", userId)
        onlineUsers.delete(userId);
        io.emit("onlineUsers",Array.from(onlineUsers.keys()));
    });

    ////sending and receving chat msgs    
 socket.on("sendMessages", async (data) => {
  try {
    const { matchId, content } = data;
    const senderId = (socket as any).userId;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return;

    const receiverId = match.user1Id === senderId ? match.user2Id : match.user1Id;

    // Check if either person has blocked the other
    const blockExists = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: senderId, blockedId: receiverId },
          { blockerId: receiverId, blockedId: senderId },
        ],
      },
    });

    if (blockExists) {
      socket.emit("messageError", { error: "You can't message this user" });
      return;
    }

    const message = await prisma.message.create({
      data: { matchId, senderId, content },
    });

    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    socket.emit("newMessage", message);
  } catch (error) {
    console.error("send message error", error);
  }
});
    //When User B actually opens the chat and looks at User A's messages, we mark those messages as seen: true in the database, and tell User A's browser instantly, so their message changes from "Sent" to "Seen."
    socket.on("markAsSeen", async (data)=>{
        try{
            const {matchId} = data;
            const myUserId= (socket as any).userId;

            //mark all msg in this match not sent by me , as seen 
            await prisma.message.updateMany({
                where:{
                    matchId,
                    senderId: {not: myUserId},
                    seen:false,
                },
                data:{seen: true},
            });

            const match = await prisma.match.findUnique({where:{id:matchId}});

            if(!match) return;

            const otherUserId = match.user1Id===myUserId? match.user2Id: match.user1Id;
            const otherSocketId = onlineUsers.get(otherUserId);

            if(otherSocketId){
                io.to(otherSocketId).emit("messagesSeen",{matchId});
            }
            /**Then, same pattern as before: find the other person in the match, check if they're online, and if so, tell their browser: "messagesSeen" for this matchId — so their screen can update the "Sent" label to "Seen" on the messages they sent. */
            // Also tell MY OWN browser, so Messages page updates live without a refresh
            
        }catch(error){
            console.error("mark as seen error", error);
        }
    })
})




const PORT = process.env.PORT || 5000;

httpServer.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})
