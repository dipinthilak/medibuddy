const User = require('../models/userSchema');
const Category=require('../models/categorySchema')
const bcrypt = require('bcrypt')

const ecryptpassword = async(password)=> {
        try {
            const passwordHash = await bcrypt.hash(password,10);
            return passwordHash
        } catch (error) {
            console.log(error.message);
        }
}

const userhome=async (req,res)=>{
    const category =await Category.find();
    res.render('userHome',{category:category})  
    };

const loadSignup=async(req,res)=>{
    res.render('userSignup')
    };


const loadSignin=async(req,res)=>{
    res.render('userSignin')
    };


const newUser = async(req, res) => {
    try {
        const hashedpassword =await ecryptpassword(req.body.password);
        const user = new User({
           name : req.body.username,
           email : req.body.email,
           mobile : req.body.number,
           password : hashedpassword,
        });

        const userData = await user.save();
        console.log(userData);

        if(userData){
            return res.render('userSignin');
        }else {
            return res.render('userSignup')
        }
        
        }
    catch (error) 
    {
        console.log(error.message);
    }
}
const userSignin=async (req,res)=>{
    try{
        const email=req.body.email;
        console.log(req.body.email, req.body.password);
        const udetails=await User.findOne({email:email});
        console.log(udetails);
        const passwordMatch = await bcrypt.compare(req.body.password, udetails.password);
        console.log(passwordMatch);
        if(passwordMatch)
        {
            req.session.userlogin=true;
            req.session.userId=udetails._id;
            res.render('userDashboard')
        }
        else{
            res.redirect('/userSignin');
        }
    }
    catch(er){

    }
};

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
} 


module.exports = {userhome,loadSignup,loadSignin,newUser,userSignin,userLogout};
