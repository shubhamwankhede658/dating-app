import { Router } from "express";
import { getMyMatches, getMessages } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/matches",protectRoute,getMyMatches);
router.get("/:matchId/messages",protectRoute,getMessages);

export default router;