import db from '../config/db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
export async function registerUser(req,res){
    try{
        const {username,email,pass}=req.body;
        const result=await db.query('select * from users where email=$1',[email]);
        if(result.rows.length>0){
            return res.status(400).json({message:'user already exist'});
        }
        const hashedPassword=await bcrypt.hash(pass,10);
        const insertResult=await db.query('insert into users (user_name,email,password) values($1,$2,$3) RETURNING id',[username,email,hashedPassword]);
        const userId=insertResult.rows[0].id;
        const token=jwt.sign({id:userId,role:'user'},process.env.JWT_SECRET,{expiresIn:'24h'});
        res.status(201).json({token,message:'registered successfully'});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function loginUser(req,res){
    try{
        const {email,pass}=req.body;
        const result=await db.query('select * from users where email=$1',[email]);
        if(result.rows.length===0){
            return res.status(400).json({message:'user does not exist'});
        }
        const user=result.rows[0];
        const isPasswordValid=bcrypt.compare(pass,user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:'Invalid incredentials'});
        }
        const token=jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'24h'});
        res.status(200).json({token,message:'Login successful'});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function getPackages(req,res){
    try{
        const result=await db.query("select * from packages");
        res.status(200).json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function viewPackage(req,res){
    try{
        const {package_id}=req.params;
        const result=await db.query("select * from packages where id=$1",[package_id]);
        if(result.rows.length==0){
            return res.status(404).json({message:'no package found'});
        }
        res.status(200).json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function deletePackage(req,res){
    try{
        const {package_id}=req.params;
        const result=await db.query("delete from packages where id=$1 RETURNING *",[package_id]);
        if(result.rows.length==0){
            return res.status(404).json({message:'package not found'});
        }
        res.status(204).json({message:'package deleted successfully'});
    }catch(err){
        console.log(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function deleteBookedPackage(req,res){
    try{
        const {package_id}=req.params;
        const result=await db.query("delete from bookedpackages where package_id=$1 RETURNING *",[package_id]);
        if(result.rows.length==0){
            return res.status(404).json({message:'package not found'});
        }
        res.status(204).json({message:'package deleted successfully'});
    }catch(err){
        console.log(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function getAllPackages(req,res){
    try{
        const result=await db.query("select * from bookedpackages");
        res.status(200).json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function getUserPackage(req,res){
    try{
        const {user_id}=req.params;
        const result=await db.query("select * from bookedpackages where user_id=$1",[user_id]);
        res.status(200).json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function Search(req,res){
    try{
        const Term=req.query.term;
        const searchTerm=`%${Term.toLowerCase()}%`;
        const result=await db.query("select * from packages where LOWER(place) like $1",[searchTerm]);
        console.log("result rows",result.rows);
        res.status(200).json({success:true,data:result.rows});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function updatePackage(req,res){
    try{
        const id=req.params.package_id;
        const {name,place,image_url,people,amount,month}=req.body;
        await db.query("update packages set place=$1,image_url=$2,people=$3,amount=$4,month=$5 where id=$6",[place,image_url,people,amount,month,id]);
        res.status(200).json({message:'package updated successfully'});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function bookPackage(req,res){
    try{
        const[user_id,id,email,startDate,EndDate,people,place,tripType,image_url,amount]=req.body;
        const result=await db.query("Insert into bookedpackages (user_id,package_id,people,start_date,end_date,email,place,image_url,name,amount) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",[user_id,id,people,startDate,EndDate,email,place,image_url,tripType,amount]);
        console.log('Query parameters:', { user_id, id, email, startDate, EndDate, people, place, tripType, image_url, amount });
        if(result.rows.length>0){
            res.status(201).json(result.rows);
        }else{
            return res.status(400).json({message:'Cannot create the data'});
        }
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function getAllQueries(req,res){
    try{
        const result=await db.query('select * from answer');
        const result2=await db.query('select id,question from question');
        res.status(200).json({answer:result.rows,question:result2.rows});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server.error'});
    }
}
export async function getUserQueries(req,res){
    try{
        const {user_id}=req.params;
        const result=await db.query('select * from answer');
        const result2=await db.query('select id,question from question where user_id=$1',[user_id]);
        res.status(200).json({answer:result.rows,question:result2.rows});
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function postQuestion(req,res){
    try{
        const {message}=req.body;
        const {user_id}=req.params;
        const result=await db.query('Insert into question (question,user_id) values($1,$2) RETURNING id,question',[message,user_id]);
        res.status(201).json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function postAnswer(req,res){
    try{
        console.log(req.body);
        const {question_id,answer}=req.body;
        const result=await db.query('Insert into answer (answer,question_id) values($1,$2) RETURNING *',[answer,question_id]);
        res.status(201).json(result.rows[0]);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
export async function deleteQuestion(req,res){
    try{
        const {question_id}=req.params;
        const result=await db.query('delete from question where id=$1 RETURNING *',[question_id]);
        if(result.rows.length===0){
            res.status(404).json({message:'query not found'});
        }
        res.status(200).json(result.rows);
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:'server error'});
    }
}
