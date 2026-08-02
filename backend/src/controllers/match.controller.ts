import type { Request,Response } from "express";
import { io, onlineUsers } from "../server.js";
import prisma from "../lib/prisma.js";


export async function getProfiles(req:Request,res:Response){
    try{
        const userId = (req as any).userId;

        const me = await prisma.user.findUnique({ where: { id: userId } });
        if (!me) return res.status(404).json({ error: "User not found" });

        //people i already liked or passed on 
        const likes = await prisma.like.findMany({
            where:{fromUserId:userId},
            select:{toUserId:true}
        });

        const likedUserIds= likes.map((like)=>like.toUserId);

        //people who blocked me or i blocked 
        const blocks = await prisma.block.findMany({
            where:{
                OR: [{blockerId:userId}, {blockedId:userId}],
            }
        })

        const blockedUserIds = blocks.map((block)=>{
            block.blockerId===userId ? block.blockedId : block.blockerId;// simple if the blocker is ne then give me blockedid means whom i blcoked and if not blockerid means the one who blocked me 
        })

        const profiles = await prisma.user.findMany({
            where: {
              id: { notIn: [userId, ...likedUserIds, ...blockedUserIds].filter(Boolean) },
              ...(me.genderPreference && me.genderPreference !== "everyone"
                ? { gender: me.genderPreference }
                : {}),
              ...(me.gender ? { genderPreference: { in: [me.gender, "everyone"] } } : {}),
            },
            select: { id: true, name: true, bio: true, photoUrl: true, age: true, gender: true },
        });

        res.status(200).json({profiles});

    }catch(error){
        console.error("Get profiles error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

export async function likeUser(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    await prisma.like.create({
      data: { fromUserId: userId, toUserId: targetUserId, status: "liked" },
    });

    const mutualLike = await prisma.like.findFirst({
      where: { fromUserId: targetUserId, toUserId: userId, status: "liked" },
    });

    if (mutualLike) {
      const match = await prisma.match.create({
        data: { user1Id: userId, user2Id: targetUserId },
      });

      const me = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, photoUrl: true },
      });

      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId && me) {
        io.to(targetSocketId).emit("newMatch", { matchId: match.id, otherUser: me });
      }

      return res.status(201).json({ matched: true, match });
    }

    res.status(201).json({ matched: false });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "You've already responded to this profile" });
    }
    console.error("Like user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}


export async function passUser(req:Request, res:Response){
    try{
        const userId = (req as any).userId;
        const {targetUserId} = req.body;

        if(!targetUserId){
            return res.status(400).json({error:"targetUserId is required"})
        }
        await prisma.like.create({
            data:{fromUserId:userId, toUserId:targetUserId, status:"passed"}
        })

        res.status(200).json({message:"Passed"});

    }catch(error){
        console.error("Pass user error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

export async function getWhoLikedMe(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    // People I've already swiped on (liked or passed) - I've made my decision already
    const mySwipes = await prisma.like.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
    });
    const alreadySwipedIds = mySwipes.map((swipe) => swipe.toUserId);

    // People who blocked me, or I blocked
    const blocks = await prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    });
    const blockedUserIds = blocks.map((block) =>
      block.blockerId === userId ? block.blockedId : block.blockerId
    );

    const likes = await prisma.like.findMany({
      where: {
        toUserId: userId,
        status: "liked",
        fromUserId: {
          notIn: [...alreadySwipedIds, ...blockedUserIds],
        },
      },
      include: {
        fromUser: { select: { id: true, name: true, bio: true, photoUrl: true } },
      },
    });

    const profiles = likes.map((like) => like.fromUser);

    res.status(200).json({ profiles });
  } catch (error) {
    console.error("Get who liked me error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}