import express from 'express'
const router=express.Router();

import User from '../models/user.js'


router.post('/register',async(req,res)=>{
    try{
        const data=req.body;
        console.log(data);
        const newUser=new User(data);

        const response=await newUser.save();
        console.log("User data saved");
        res.status(200).json({response:response})

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

        const user=await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"invalid email id or password"})
        }
        res.status(200).json({response:"login successful"})

    }catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})

    }
    
})

export default router;

