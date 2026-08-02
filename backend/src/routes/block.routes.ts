import { Router } from "express";
import { blockUser, unblockUser, getBlockedUsers } from "../controllers/block.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protectRoute, getBlockedUsers);
router.post("/", protectRoute, blockUser);
router.delete("/", protectRoute, unblockUser);

export default router;