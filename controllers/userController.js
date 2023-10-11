const User = require('../models/userSchema');
const Category=require('../models/categorySchema');
const Product=require("../models/productSchema")
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');



//generate otp
const generateOtp = () => {
    return Math.floor(Math.random() * 90000 + 10000);
};

//send mail
const sendMail = async (name, email) => {
    try {
        const otp = generateOtp();
        console.log(otp);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: 'medibuddycc@gmail.com',
            to: email,
            subject: 'OTP || Medibuddy',
            text: `Thank you ,${name} for choosing Medibuddy. Use this otp to finish your signup: ${otp}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent', info.response);
            }
        });

        return otp;
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

const ecryptpassword = async(password)=> {
        try {
            const passwordHash = await bcrypt.hash(password,10);
            return passwordHash
        } catch (error) {
            console.log(error.message);
        }
    };

const userhome=async (req,res)=>{
    const category =await Category.find();
    const product=await Product.find();
    console.log(product[0].image);
    if(req.session.user_id)
    {
        const user=await User.findById(req.session.user_id);
        res.render('userHome',{category:category,
            user:user,product:product})  
    }
    else{
        res.render('userHome',{category:category,product:product,user:null})  
        }
    };

const usersignupOtp=async (req,res)=>{
        // const hashedpassword =await ecryptpassword(req.body.password);

    return res.render('userSignin')
    };

const userContact=async(req,res)=>{
    res.render("contact");
    };

const userAbout=async(req,res)=>{
    res.render("about");
    };

const loadSignup=async(req,res)=>{
    res.render('userSignup')
    };

const userDashboard =async (req,res)=>{
    const user = await User.findById(req.session.user_id)
    res.render('userDashboard',{user:user})
    };

const loadSignin=async(req,res)=>{
    res.render('userSignin')
    };

const newUser = async(req, res) => {
    try {
        // const hashedpassword =await ecryptpassword(req.body.password);
        const user ={
            name : req.body.username,
            email : req.body.email,
            mobile : req.body.number,
            password : req.body.password,
         };     
         const otp=sendMail(user.name,user.email);
         req.session.otp=otp;
         console.log(otp);

        //  const user = new User({
        //     name : req.body.username,
        //     email : req.body.email,
        //     mobile : req.body.number,
        //     password : req.body.password,
        //  });

        // const userData = await user.save();
        // console.log(userData);
            return res.render('usersignupwithOtp',{user});
        }
    catch (error) 
    {
        console.log(error.message);
    }
    };

const userSignin=async (req,res)=>{
    try{
        const email=req.body.email;
        const udetails=await User.findOne({email:email});
        const passwordMatch = await bcrypt.compare(req.body.password, udetails.password);
        if(passwordMatch)
        {
            req.session.user_id=udetails._id;
            req.session.user=udetails.name;
            console.log(req.session.user_id, req.session.user);
            res.render('userDashboard',{user : udetails})
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
    };
    
const productShop=async (req,res)=>{
    const id=req.query.pid;
    const category =await Category.find();
    const user = await User.findById(req.session.user_id);
    const product=await Product.findById(id);
    res.render("userProduct",{product,user,category});
    };

const categoryShop=async (req,res)=>{
    const cid=req.query.cid;
    const category =await Category.find();
    const categoryname =await Category.findOne({_id:cid},{name:1});
    console.log(categoryname.name);
    const user = await User.findById(req.session.user_id);
    const product=await Product.find({category:categoryname.name});
    console.log("--------------------------------------------------------------------");
    console.log(product);
    res.render("userCategoryproducts",{product,user,category});
    };




const userCart=async (req,res)=>{

try {
    const category =await Category.find();
    const product=await Product.find(); 
    if(req.session.user_id)
    {
        const user=await User.findById(req.session.user_id);
        res.render('userCart',{category:category,user:user,product:product})  
    }
    else

    {    
    res.redirect("userSignin");
    }
} catch (error) {
    console.error(error);
}

    };

const addtoCart=async (req,res)=>{
    try {
        const productId = req.body.productid;
        console.log(productId);
        if (!req.session.user_id) 
        {
            res.status(200).json({notlogin:true});
        }
        const user = await User.findById(req.session.user_id);
        const quantity=1;
        if(user)
        {
            const cartItem=await User.findByIdAndUpdate({_id:req.session.user_id    },{$push:{cart:{productId:productId,quantity:quantity}}});
            if (cartItem) {
                res.status(200).json({toCart:true});
              } else {
                res.status(404).json({toCart:false});
              }
        }

    } 
    catch (error) {
        
    }
    };
    
module.exports = {
                userhome,
                userAbout,
                userContact,
                loadSignup,
                loadSignin,
                newUser,
                userSignin,
                userDashboard,
                userLogout,
                productShop,
                categoryShop,
                userCart,
                addtoCart,
                usersignupOtp,                
            };
