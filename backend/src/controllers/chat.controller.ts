import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export async function getMyMatches(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const blocks = await prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    });
    const blockedUserIds = blocks.map((block) =>
      block.blockerId === userId ? block.blockedId : block.blockerId
    );

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        NOT: [
          { user1Id: { in: blockedUserIds } },
          { user2Id: { in: blockedUserIds } },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, photoUrl: true } },
        user2: { select: { id: true, name: true, photoUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const formattedMatches = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.user1Id === userId ? match.user2 : match.user1;
        const lastMessage = match.messages[0] || null;

        return {
          matchId: match.id,
          otherUser,
          lastMessage: lastMessage
            ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId, seen: lastMessage.seen }
            : null,
        };
      })
    );

    res.status(200).json({ matches: formattedMatches });
  } catch (error) {
    console.error("Get matches error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getMessages(req:Request, res:Response){
    try{
        
        const userId = (req as any).userId;
        const {matchId} = req.params as {matchId:string};
        

        //security check: make sure im actually part of this match
        const match = await prisma.match.findUnique({ where: { id: matchId } });
       
        if(!match || (match.user1Id!=userId && match.user2Id!=userId)){
            return res.status(403).json({error:"you are not part of this match"});
        }
        const messages = await prisma.message.findMany({
            where:{matchId},
            orderBy:{createdAt:"asc"},
        });

        res.status(200).json({ messages });

    }catch(error){
        console.error("Get messages error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}