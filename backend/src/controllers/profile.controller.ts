import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";

export async function updateProfile(req:Request, res:Response){
    try{
        const userId= (req as any).userId;
        const {name, bio, age, gender,genderPreference} = req.body;
        
        let photoUrl : string | undefined;
        
        // req.file exists only if the user actually uploaded a photo
        if(req.file){
           const uploadResult = await new Promise<any>((resolve, reject) =>{
            /**Uploading a photo to Cloudinary doesn't happen instantly — it takes some time (photo has to travel over the internet to Cloudinary's servers). Cloudinary's upload function is written in an "old style" that doesn't naturally work with await. So we wrap it inside a Promise ourselves — think of a Promise as a "waiting ticket": "I'll give you the result later, once I'm done." */
             const stream = cloudinary.uploader.upload_stream(// stream is just an empty pipe that is just ready to rcv data 
                /**upload_stream — means we're sending the photo's raw data directly, without saving it as a file on our own computer first (remember, Multer kept it in memory, not on disk) */
                {folder: 'dating app profiles'},
                (error, result)=>{
                    if(error) reject(error);
                    else resolve(result);
                }
             )
             //stream.end(...) — pushes that data into the upload stream we just created, which sends it off to Cloudinary.
             stream.end(req.file!.buffer);// this is the line taht actually send the photot datat ot cloudninaryreq.file.buffer — remember, Multer stored the uploaded photo temporarily as raw data (called a "buffer") in memory. This is literally the photo's bytes.
           }) 
           photoUrl  = uploadResult.secure_url;
           /**Once Cloudinary finishes uploading, it sends back a bunch of information about the photo — its size, format, etc. — and importantly, a link to view it, called secure_url. We grab just that link and save it in our photoUrl variable. */
        };

        const updatedUser= await prisma.user.update({
            where:{id:userId},
            data:{
                ...(name && {name}),
                ...(bio && {bio}),
                ...(photoUrl && {photoUrl}),
                ...(age && { age: parseInt(age) }),
                ...(gender && { gender }),
                ...(genderPreference && { genderPreference }),
            },
            /**name = undefined (nothing sent)
            bio = "I love hiking"
            photoUrl = undefined (no new photo)

            Now let's check each line one at a time:

            Line 1: ...(name && { name })

            name is undefined, which JavaScript treats as "falsy" (basically means "nothing/empty").
            undefined && { name } → since the first part is falsy, JavaScript stops immediately and the whole thing becomes undefined. It doesn't even bother checking the second part.
            So this line becomes: ...undefined
            Spreading undefined into an object adds nothing at all. It's like it's not even there.

            Line 2: ...(bio && { bio })

            bio is "I love hiking", which is "truthy" (it has actual content).
            "I love hiking" && { bio } → since the first part is truthy, JavaScript moves to the second part and returns it: { bio: "I love hiking" }
            So this line becomes: ...{ bio: "I love hiking" }
            Spreading this does add bio: "I love hiking" into our data. */
            select: { id: true, email: true, name: true, bio: true, photoUrl: true, age: true, gender: true, genderPreference: true },
        })

        res.status(200).json({user:updatedUser});

    }catch(error){

        console.error("Update profile error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

/** */