import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";


export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password and name are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, bio: user.bio, photoUrl: user.photoUrl, age: user.age, gender: user.gender, genderPreference: user.genderPreference },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function login(req:Request, res:Response){
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(401).json({error:'email and password is required'});
        }

        const user = await prisma.user.findUnique({where:{email}});

        if(!user){
            return res.status(401).json({error: 'invalid email or password'});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({error: 'invalid email or password'});
        }

        const token = jwt.sign({userId:user.id},  process.env.JWT_SECRET as string,{
            expiresIn: '7d',
        })

        res.status(200).json({
            token,
            user:{
                id: user.id,
                email: user.email,
                name: user.name,
                bio: user.bio,
                photoUrl: user.photoUrl,
                age: user.age,
                gender: user.gender,
                genderPreference: user.genderPreference,
            }
        })

    }catch(error){
        console.error("Login error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
}

export async function getMe(req:Request, res:Response){
  try{
    const userId = (req as any).userId;

    const user= await prisma.user.findUnique({
      where:{id:userId},
      select: { id: true, email: true, name: true, bio: true, photoUrl: true, age: true, gender: true, genderPreference: true },
    })

    if(!user){
      return res.status(404).json({error:'user not found'})
    }

    res.status(200).json({user});

    

  }catch(error){
    console.log('getme error',error);
    res.status(500).json({error:"something went wrong"});
  }
}