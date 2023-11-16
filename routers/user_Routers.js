const express = require("express");
const user_routers = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const userauth=require('../authentication/userAuth')
const userController = require("../controllers/userController");
const User=require("../models/userSchema");
const Category=require("../models/categorySchema");
user_routers.use(session({
    secret: "firstprkey",
    resave: false, 
    saveUninitialized: false, 
  }));

  user_routers.set('view engine','ejs');
  user_routers.set('views','./views/user');
  user_routers.use(bodyParser.json());
  user_routers.use(bodyParser.urlencoded({extended: true}));


  user_routers.get('/',userController.userhome);
  user_routers.get('/userHome',(req,res)=>{   res.redirect('/');  });
  user_routers.get("/userShopproduct",userController.productShop);
  user_routers.get("/userCategoryproduct",userController.categoryShop);
  user_routers.get("/allProducts",userController.allProduct);
  user_routers.get("/searchproduct",userController.searchResult);


  user_routers.get("/userCart",userController.userCart);
  user_routers.get("/cartOpen",userController.cartOpen);
  user_routers.post("/addtoCart",userController.addtoCart);
  user_routers.post("/removecartitem",userController.removecartitem);
  user_routers.post("/changequantity",userController.updatequantity);
  user_routers.get('/checkoutitems',userauth.isLogin,userauth.isActive,userController.checkoutCart);
  user_routers.post('/codcheckout',userController.checkout);
  user_routers.get('/orderdetails',userauth.isLogin,userauth.isActive,userController.orderdetails);
  user_routers.get('/ordersuccess',userauth.isLogin,userauth.isActive,userController.ordersuccess);
  user_routers.post('/verifypayment',userController.verifypayment);
  user_routers.get('/downloadInvoice',userauth.isLogin,userauth.isActive,userController.downloadInvoice);
  user_routers.get('/cancelOrder',userauth.isLogin,userauth.isActive,userController.cancelOrder);
  user_routers.get('/returnOrder',userauth.isLogin,userauth.isActive,userController.returnOrder);


  user_routers.post("/addtowishlist",userController.addtoWishlist);
  user_routers.get("/userWishlist",userauth.isLogin,userController.userWishlist);
  user_routers.post("/removewishitem",userController.removeWishitem);



  user_routers.get("/addaddress",userauth.isLogin,userController.addaddressload);
  user_routers.post("/addaddress",userController.addAddress);
  user_routers.get("/updateaddressload",userauth.isLogin,userController.updateaddressload);
  user_routers.post("/updateaddress",userController.updateaddress);


  
  user_routers.get("/about",userController.userAbout);
  user_routers.get("/contact",userController.userContact);

    
  user_routers.get("/userSignin",userauth.isLogout,userController.loadSignin);
  user_routers.get("/userSignup",userauth.isLogout,userController.loadSignup);
  user_routers.get("/forgotpassword",userauth.isLogout,userController.loadForgot);
  user_routers.post("/forgotpassword",userauth.isLogout,userController.passwordForgot);
  user_routers.post("/updatepw",userController.updatepw);
  user_routers.post("/forgotpasswordotp",userauth.isLogout,userController.passwordForgototp);
  user_routers.post("/userSignup",userController.newUser);
  user_routers.post("/usersignupOtp",userController.usersignupOtp);
  user_routers.post("/userSignin",userController.userSignin);



  user_routers.get("/userDashboard",userauth.isLogin,userController.userDashboard);
  user_routers.get("/userlogout",userauth.isLogin,userController.userLogout);
  // user_routers.use('*',(req,res)=>{res.render('error',{message:''})})

//   user_routers.get("/postman",(req,res)=>{
//     const id='651ec5873ec49e4550745496';
// const userPromise = User.findById(id);
// const userDataPromise = User.findById(id);
// const userCartPromise = User.findOne({_id: id}).populate('cart.productId');
// const categoriesPromise = Category.find();

// Promise.all([userPromise, userDataPromise, userCartPromise, categoriesPromise])
//   .then(([user, userData, userCart, categories]) => {
//    res.send({user:user});
//   })
//   .catch(error => {
//     // Handle any errors that might occur during the Promise.all
//   });

//   }
//   );


  module.exports = user_routers;