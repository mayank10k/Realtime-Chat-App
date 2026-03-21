import express from 'express'
const router=express.Router();

import User from '../models/user.js'
import {jwtAuthMiddleware,generateToken} from './../jwt.js';


router.post('/register',async(req,res)=>{
    try{
        const data=req.body;
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // console.log(data);
        const newUser=new User(data);

        const response=await newUser.save();
        console.log("User data saved");

        const payload={
            id:response._id
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload);
        // console.log("Token is:",token);
        // res.status(200).json({response:response,token:token})
        return res.status(201).json({message: "User registered successfully",
        token,
        user: {
            id: response._id,
            name: response.name,
            email: response.email
        }
        });

    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})

    }
    
})

router.post('/login',async(req,res)=>{
    try{
        const data=req.body;
        // console.log(data);
        const {email,password}=req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user=await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            // return res.status(401).json({error:"invalid email id or password"})
            res.status(200).json({
                message: "login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        }

        //generate token
        const payload={
            id:user._id
        }
        const token=generateToken(payload);
        res.status(200).json({message:"login successful",token:token});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})

    }
    
})

//profile route
router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
  try{
    const userData=req.user;    //req.user == token form jwt.js(given by middle ware)
    // console.log("user data",userData);

    const userId=userData.id;
    const user=await User.findById(userId);
    // return res.status(200).json({user});
    return res.status(200).json({
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
});

  }catch(err){
    console.log(err);
    return res.status(500).json({error:"internal server error"})
  }
})

export default router;

