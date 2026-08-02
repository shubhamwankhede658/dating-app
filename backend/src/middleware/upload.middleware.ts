
import multer from "multer";

const storage = multer.memoryStorage();
/**
 * multer.memoryStorage() — tells Multer: "don't save the uploaded file on our own server's hard disk, just hold it briefly in memory (RAM)." This makes sense for us because we're just going to forward it straight to Cloudinary anyway, not keep it ourselves.
 */


const upload = multer({
    storage,
    limits:{fileSize: 5* 1024*1024},//5mb max
})

export default upload;