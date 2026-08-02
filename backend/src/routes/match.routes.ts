import { Router } from "express";
import { getProfiles, likeUser, passUser, getWhoLikedMe } from "../controllers/match.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profiles",protectRoute,getProfiles);
router.post("/like",protectRoute,likeUser);
router.post("/pass",protectRoute,passUser);
router.get("/liked-me",protectRoute,getWhoLikedMe)


export default router;
