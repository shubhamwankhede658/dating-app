import { Router } from "express";
import { updateProfile } from "../controllers/profile.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from '../middleware/upload.middleware.js';


const router = Router();

router.put('/me',protectRoute,upload.single('photo'),updateProfile)

export default router;


/**Multer (upload.single("photo")): Getting the photo out of the incoming request and into a usable format.
 * When a user submits a form with a photo attached, the photo doesn't arrive as normal JSON text — it arrives as a special format called multipart/form-data (raw binary photo data mixed with text fields like name and bio). Express's normal express.json() cannot read this format at all — it only understands plain JSON. So without Multer, req.file would simply not exist, and req.body might come back empty too.

Multer's job is just this: "read this messy raw request, pull out the photo, put it neatly into req.file, and put the text fields into req.body." That's it. Multer never talks to Cloudinary. It has no idea Cloudinary even exists.
 */