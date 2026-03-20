import express from 'express'
const app=express();

import dotenv from 'dotenv'
import connectDB from './db.js'


dotenv.config();
connectDB();

app.use(express.json());

import userRoutes from './routes/userRoutes.js'
app.use('/user',userRoutes);


const PORT=process.env.PORT || 3000;


app.listen(PORT,()=>{
    console.log('server is running on http://localhost:3000');
})