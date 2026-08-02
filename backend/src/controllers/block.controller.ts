import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export async function blockUser(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    await prisma.block.create({
      data: { blockerId: userId, blockedId: targetUserId },
    });

    res.status(201).json({ message: "User blocked" });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function unblockUser(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    await prisma.block.deleteMany({
      where: { blockerId: userId, blockedId: targetUserId },
    });

    res.status(200).json({ message: "User unblocked" });
  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function getBlockedUsers(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const blocks = await prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: { select: { id: true, name: true, photoUrl: true } },
      },
    });

    const blockedUsers = blocks.map((block) => block.blocked);

    res.status(200).json({ blockedUsers });
  } catch (error) {
    console.error("Get blocked users error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}