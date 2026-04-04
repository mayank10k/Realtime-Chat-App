import jwt from 'jsonwebtoken'

export const jwtAuthMiddleware=(req,res,next)=>{
    const authorization=req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token not found" });
    }

    const token=req.headers.authorization.split(' ')[1];
    
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded;
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({error:'invalid token'})
    }
}

export const generateToken=(userData)=>{
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' });
}

