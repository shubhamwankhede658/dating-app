import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register',register);
router.post('/login',login);
router.get('/me',protectRoute,getMe)
export default router;


/**When we write TypeScript with "module": "NodeNext" (like we set in tsconfig.json), Node.js requires import paths to use the final compiled extension — .js — even though the actual file on your disk is .ts.

Why: TypeScript is just a "helper" language. When your code actually runs, it gets converted (compiled) into plain JavaScript first. So auth.controller.ts becomes auth.controller.js behind the scenes. Node.js only understands .js at runtime, so it expects the import path to already say .js, even while you're still writing the .ts file. */