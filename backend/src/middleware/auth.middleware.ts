import { Request, Response,NextFunction } from "express";
import jwt from "jsonwebtoken";


export function protectRoute(req: Request, res: Response, next: NextFunction){
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({error:"not authorized, no token"})
        }
        const token = authHeader.split(" ")[1];
        const decode = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        (req as any).userId = decode.userId;
        next();

    }catch(error){
        return res.status(401).json({error:'not authorized, invalid token'});
    }
}