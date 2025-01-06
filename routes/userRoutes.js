import express from "express";
import {getPackages,loginUser,registerUser,viewPackage,deletePackage,getAllPackages,getUserPackage,Search,updatePackage,bookPackage,deleteBookedPackage,getAllQueries,getUserQueries,postQuestion,postAnswer,deleteQuestion} from "../controllers/userController.js";
const router=express.Router();
router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/everyPackage',getPackages);
router.get('/packagedetail/:package_id',viewPackage);
router.delete('/deletePackage/:package_id',deletePackage);
router.delete('/deleteBookedPackage/:package_id',deleteBookedPackage);
router.get('/getallpackages',getAllPackages);
router.get('/getuserpackage/:user_id',getUserPackage);
router.get('/search',Search);
router.put('/updatepackage/:package_id',updatePackage);
router.post('/booking',bookPackage);
router.get('/getAllQueries',getAllQueries);
router.get('/getUserQueries/:user_id',getUserQueries);
router.post('/postQuestion/:user_id',postQuestion);
router.post('/postAnswer',postAnswer);
router.delete('/deleteQuestion/:question_id',deleteQuestion);
export default router;