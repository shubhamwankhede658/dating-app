import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

//This file just "logs in" to your Cloudinary account using the 3 keys from your .env file. Once configured here, any other file in our project can import this and use it to upload images — we only set up this login once.